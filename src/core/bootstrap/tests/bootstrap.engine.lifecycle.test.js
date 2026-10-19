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


class LifecycleTestStage extends BootstrapStage {
  constructor(name, options = {}) {
    super(name, options);
  }

  async initialize(context) {
    lifecycle.push(`${this.name}:initialize`);

    context.set(this.name, {
      name: this.name,
      initialized: true,
    });
  }

  async rollback(context) {
    lifecycle.push(`${this.name}:rollback`);

    context.delete(this.name);
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
    dependencies: ["runtime", "config"],
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
      new LifecycleTestStage(
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

    registryInitializer: (targetRegistry) => {
      console.log(
        "[Test] Lifecycle registry already prepared."
      );

      return targetRegistry;
    },

    factoryInitializer: (targetFactory) => {
      console.log(
        "[Test] Lifecycle factory already prepared."
      );

      return targetFactory;
    },
  });


const context =
  new BootstrapContext();


console.log(
  "[Test] Starting BootstrapEngine lifecycle test."
);


const result =
  await engine.initialize(
    context
  );


assert.equal(
  result.initialized,
  true,
  "Engine must initialize successfully."
);


assert.equal(
  engine.initialized,
  true,
  "Engine initialized flag must be true."
);


assert.deepEqual(
  context.getKeys(),
  [
    "runtime",
    "config",
    "database",
  ],
  "All initialized stages must be present in context."
);


assert.deepEqual(
  lifecycle,
  [
    "runtime:initialize",
    "config:initialize",
    "database:initialize",
  ],
  "Stages must initialize in dependency order."
);


console.log(
  "[Test] ✓ Initialization lifecycle is correct."
);


await engine.shutdown(
  context
);


assert.equal(
  engine.initialized,
  false,
  "Engine must be uninitialized after shutdown."
);


assert.deepEqual(
  context.getKeys(),
  [],
  "Context must be empty after shutdown."
);


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
  "Stages must roll back in reverse initialization order."
);


console.log(
  "[Test] ✓ Shutdown lifecycle is correct."
);


console.log(
  "[Test] ✓ BootstrapEngine lifecycle test passed."
);