import {
  BootstrapStageDefinition,
} from "../contracts/bootstrap-stage.definition.js";

export const runtimeStageDefinition =
  new BootstrapStageDefinition({
    name: "runtime",
    order: 10,
    dependencies: [],
    required: true,
  });

export const configStageDefinition =
  new BootstrapStageDefinition({
    name: "config",
    order: 20,
    dependencies: ["runtime"],
    required: true,
  });

export const providersStageDefinition =
  new BootstrapStageDefinition({
    name: "providers",
    order: 30,
    dependencies: ["runtime", "config"],
    required: true,
  });

export const databaseStageDefinition =
  new BootstrapStageDefinition({
    name: "database",
    order: 40,
    dependencies: ["runtime", "config", "providers"],
    required: true,
  });

export const modulesStageDefinition =
  new BootstrapStageDefinition({
    name: "modules",
    order: 50,
    dependencies: ["runtime", "config", "database"],
    required: true,
  });

export const themeStageDefinition =
  new BootstrapStageDefinition({
    name: "theme",
    order: 60,
    dependencies: ["runtime", "config"],
    required: true,
  });

export const routerStageDefinition =
  new BootstrapStageDefinition({
    name: "router",
    order: 70,
    dependencies: ["runtime", "config"],
    required: true,
  });

export const authStageDefinition =
  new BootstrapStageDefinition({
    name: "auth",
    order: 80,
    dependencies: ["runtime", "config", "providers"],
    required: true,
  });

export const bootstrapStageDefinitions = Object.freeze([
  runtimeStageDefinition,
  configStageDefinition,
  providersStageDefinition,
  databaseStageDefinition,
  modulesStageDefinition,
  themeStageDefinition,
  routerStageDefinition,
  authStageDefinition,
]);