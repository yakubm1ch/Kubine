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
  }

  async initialize(context) {
    lifecycle.push(`${this.name}:initialize`);

    context.set(this.name, {
      name: this.name,
      initializedAt: Date.now(),
    });
  }

  async rollback(context) {
    lifecycle.push(`${this.name}:rollback`);

    if (context.has(this.name)) {
      context.delete(this.name);
    }
  }
}


const definitions = [
  new BootstrapStageDefinition({
    name: "runtime",
    order: 10,
  }),

  new BootstrapStageDefinition({
    name: "config",
    order: 20,
    dependencies: ["runtime"],
  }),

  new BootstrapStageDefinition({
    name: "database",
    order: 30,
    dependencies: [
      "runtime",
      "config",
    ],
  }),
];


const registry =
  new BootstrapStageRegistry();


for (const definition of definitions) {
  registry.register(definition);
}


const factory =
  new BootstrapStageFactory();


for (const definition of definitions) {
  factory.register(
    definition.name,
    ({ definition }) =>
      new TestStage(
        definition.name
      )
  );
}


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


const engine =
  new BootstrapEngine({
    registry,
    resolver,
    factory,
    loader,
    pipeline,

    registryInitializer: (
      targetRegistry
    ) => {
      console.log(
        "[Test] Reinitialize registry already prepared."
      );

      return targetRegistry;
    },

    factoryInitializer: (
      targetFactory
    ) => {
      console.log(
        "[Test] Reinitialize factory already prepared."
      );

      return targetFactory;
    },
  });


const context =
  new BootstrapContext();


console.log(
  "[Test] Starting BootstrapEngine reinitialize test."
);


/*
 * ============================================================
 * FIRST INITIALIZATION
 * ============================================================
 */

await engine.initialize(
  context
);


assert.equal(
  engine.initialized,
  true,
  "Engine must be initialized after first initialize()."
);


assert.equal(
  engine.getState().state,
  "ready",
  "Engine state must be ready after first initialization."
);


assert.deepEqual(
  context.getKeys(),
  [
    "runtime",
    "config",
    "database",
  ],
  "All bootstrap contexts must exist after first initialization."
);


console.log(
  "[Test] ✓ First initialization completed."
);


/*
 * ============================================================
 * FIRST SHUTDOWN / ROLLBACK
 * ============================================================
 */

await engine.shutdown(
  context
);


assert.equal(
  engine.initialized,
  false,
  "Engine must not remain initialized after shutdown."
);


assert.equal(
  engine.getState().state,
  "shutdown",
  "Engine state must be shutdown after first shutdown."
);


assert.deepEqual(
  context.getKeys(),
  [],
  "BootstrapContext must be empty after first shutdown."
);


console.log(
  "[Test] ✓ First shutdown completed."
);


/*
 * ============================================================
 * SECOND INITIALIZATION
 *
 * A complete shutdown must return the engine to a state
 * where a new bootstrap cycle can begin.
 * ============================================================
 */

await engine.initialize(
  context
);


assert.equal(
  engine.initialized,
  true,
  "Engine must be initialized after reinitialize()."
);


assert.equal(
  engine.getState().state,
  "ready",
  "Engine state must be ready after reinitialize()."
);


assert.deepEqual(
  context.getKeys(),
  [
    "runtime",
    "config",
    "database",
  ],
  "All bootstrap contexts must exist after reinitialize()."
);


console.log(
  "[Test] ✓ Reinitialization after complete shutdown completed."
);


/*
 * ============================================================
 * SECOND SHUTDOWN / ROLLBACK
 * ============================================================
 */

await engine.shutdown(
  context
);


assert.equal(
  engine.initialized,
  false,
  "Engine must not remain initialized after second shutdown."
);


assert.equal(
  engine.getState().state,
  "shutdown",
  "Engine state must be shutdown after second shutdown."
);


assert.deepEqual(
  context.getKeys(),
  [],
  "BootstrapContext must be empty after second shutdown."
);


console.log(
  "[Test] ✓ Second shutdown completed."
);


/*
 * ============================================================
 * LIFECYCLE ORDER
 * ============================================================
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

    "runtime:initialize",
    "config:initialize",
    "database:initialize",

    "database:rollback",
    "config:rollback",
    "runtime:rollback",
  ],
  "BootstrapEngine must support two complete initialize/shutdown cycles with correct lifecycle ordering."
);


console.log(
  "[Test] ✓ Lifecycle ordering verified for both bootstrap cycles."
);


console.log(
  "[Test] ✓ BootstrapContext completely cleaned after both cycles."
);


console.log(
  "[Test] ✓ BootstrapEngine reinitialize test passed."
);