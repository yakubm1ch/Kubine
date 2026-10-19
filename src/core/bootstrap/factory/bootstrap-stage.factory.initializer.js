import {
  RuntimeStage,
} from "../stages/runtime.stage.js";

import {
  ConfigStage,
} from "../stages/config.stage.js";

import {
  ProvidersStage,
} from "../stages/providers.stage.js";

import {
  DatabaseStage,
} from "../stages/database.stage.js";

import {
  ModuleStage,
} from "../stages/module.stage.js";

import {
  ThemeStage,
} from "../stages/theme.stage.js";

import {
  RouterStage,
} from "../stages/router.stage.js";

import {
  AuthStage,
} from "../stages/auth.stage.js";

const bootstrapStageBuilders = Object.freeze({
  runtime: ({ definition }) =>
    new RuntimeStage(definition),

  config: ({ definition }) =>
    new ConfigStage(definition),

  providers: ({ definition }) =>
    new ProvidersStage(definition),

  database: ({ definition }) =>
    new DatabaseStage(definition),

  modules: ({ definition }) =>
    new ModuleStage(definition),

  theme: ({ definition }) =>
    new ThemeStage(definition),

  router: ({ definition }) =>
    new RouterStage(definition),

  auth: ({ definition }) =>
    new AuthStage(definition),
});

export function initializeBootstrapStageFactory(factory) {
  if (!factory || typeof factory.register !== "function") {
    throw new TypeError(
      "A valid BootstrapStageFactory is required."
    );
  }

  for (const [name, builder] of Object.entries(
    bootstrapStageBuilders
  )) {
    if (factory.has(name)) {
      continue;
    }

    factory.register(name, builder);
  }

  console.log(
    "[Bootstrap] Stage factory initialized:",
    Object.keys(bootstrapStageBuilders)
  );

  return factory;
}

export default initializeBootstrapStageFactory;