import assert from "node:assert/strict";

import {
  BootstrapEngine,
} from "../engine/bootstrap.engine.js";

import {
  BootstrapStage,
} from "../contracts/bootstrap-stage.js";

import {
  BootstrapStageDefinition,
} from "../contracts/bootstrap-stage.definition.js";

import {
  BootstrapStageFactory,
} from "../factory/bootstrap-stage.factory.js";

import {
  BootstrapStageRegistry,
} from "../registry/bootstrap-stage.registry.js";

import {
  BootstrapStageResolver,
} from "../resolver/bootstrap-stage.resolver.js";

import {
  BootstrapStageLoader,
} from "../loader/bootstrap-stage.loader.js";

import {
  BootstrapPipeline,
} from "../pipeline/bootstrap.pipeline.js";

import {
  BootstrapContext,
} from "../context/bootstrap.context.js";


const lifecycle = [];


class TestStage extends BootstrapStage {
  constructor(name, options = {}) {
    super(name, options);

    this.shouldFail =
      options.shouldFail ?? false;
  }

  async initialize(context) {
    lifecycle.push(
      `${this.name}:initialize`
    );

    context.set(
      this.name,
      {
        name: this.name,
        initializedAt: Date.now(),
      }
    );

    if (this.shouldFail) {
      throw new Error(
        `${this.name} initialization failed`
      );
    }
  }

  async rollback(context) {
    lifecycle.push(
      `${this.name}:rollback`
    );

    context.delete(
      this.name
    );
  }
}


/*
 * --------------------------------------------------
 * Test stage definitions
 * --------------------------------------------------
 */

const definitions = [
  new BootstrapStageDefinition({
    name: "runtime",
    order: 10,
    required: true,
  }),

  new BootstrapStageDefinition({
    name: "config",
    order: 20,
    dependencies: [
      "runtime",
    ],
    required: true,
  }),

  new BootstrapStageDefinition({
    name: "database",
    order: 30,
    dependencies: [
      "runtime",
      "config",
    ],
    required: true,
  }),
];


/*
 * --------------------------------------------------
 * Test registry initializer
 *
 * The Engine owns initialization of the registry.
 * The test only supplies the definitions that should
 * participate in this isolated integration test.
 * --------------------------------------------------
 */

const registryInitializer =
  (registry) => {

    for (const definition of definitions) {
      registry.register(
        definition
      );
    }

    console.log(
      "[Test] Test stage registry initialized:",
      registry
        .getOrdered()
        .map(
          (definition) =>
            definition.name
        )
    );

    return registry;
  };


/*
 * --------------------------------------------------
 * Test factory initializer
 *
 * The Engine owns initialization of the factory.
 * The test supplies builders for its isolated stages.
 * --------------------------------------------------
 */

const factoryInitializer =
  (factory) => {

    factory.register(
      "runtime",
      ({ definition }) =>
        new TestStage(
          definition.name
        )
    );


    factory.register(
      "config",
      ({ definition }) =>
        new TestStage(
          definition.name
        )
    );


    factory.register(
      "database",
      ({ definition }) =>
        new TestStage(
          definition.name,
          {
            shouldFail: true,
          }
        )
    );


    console.log(
      "[Test] Test stage factory initialized:",
      [
        "runtime",
        "config",
        "database",
      ]
    );

    return factory;
  };


/*
 * --------------------------------------------------
 * Isolated bootstrap infrastructure
 * --------------------------------------------------
 */

const registry =
  new BootstrapStageRegistry();


const factory =
  new BootstrapStageFactory();


const resolver =
  new BootstrapStageResolver(
    registry
  );


const loader =
  new BootstrapStageLoader(
    factory
  );


const pipeline =
  new BootstrapPipeline();


/*
 * --------------------------------------------------
 * Bootstrap Engine
 * --------------------------------------------------
 */

const engine =
  new BootstrapEngine({
    registry,
    registryInitializer,
    resolver,
    factory,
    factoryInitializer,
    loader,
    pipeline,
  });


/*
 * --------------------------------------------------
 * Bootstrap context
 * --------------------------------------------------
 */

const context =
  new BootstrapContext();


/*
 * --------------------------------------------------
 * Test
 * --------------------------------------------------
 */

console.log(
  "[Test] Starting BootstrapEngine failure test."
);


await assert.rejects(
  () =>
    engine.initialize(
      context
    ),

  /database initialization failed/,

  "BootstrapEngine should reject when a stage fails."
);


console.log(
  "[Test] ✓ Engine rejected the failed bootstrap."
);


/*
 * --------------------------------------------------
 * Engine state
 * --------------------------------------------------
 */

assert.equal(
  engine.initialized,
  false,

  "BootstrapEngine must remain uninitialized after failure."
);


const state =
  engine.getState();


assert.equal(
  state.initialized,
  false,

  "BootstrapEngine state must report initialized=false."
);


assert.equal(
  state.state,
  "failed",

  "BootstrapEngine state must report failed."
);


/*
 * --------------------------------------------------
 * Lifecycle verification
 * --------------------------------------------------
 */

assert.deepEqual(
  lifecycle,

  [
    "runtime:initialize",
    "config:initialize",
    "database:initialize",

    "database:rollback",
    "config:rollback",
    "runtime:rollback",
  ],

  "Failed bootstrap must roll back the failed stage and all previously completed stages in reverse order."
);


/*
 * --------------------------------------------------
 * Context cleanup verification
 * --------------------------------------------------
 */

assert.deepEqual(
  context.getKeys(),
  [],

  "BootstrapContext must be empty after failed bootstrap rollback."
);


console.log(
  "[Test] ✓ Failed stage was rolled back."
);


console.log(
  "[Test] ✓ Previously initialized stages were rolled back."
);


console.log(
  "[Test] ✓ BootstrapContext was completely cleaned."
);


console.log(
  "[Test] ✓ BootstrapEngine state is failed."
);


console.log(
  "[Test] ✓ BootstrapEngine failure test passed."
);