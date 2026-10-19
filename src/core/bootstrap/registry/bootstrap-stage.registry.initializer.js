import {
  bootstrapStageDefinitions,
} from "../definitions/bootstrap-stage.definitions.js";

export function initializeBootstrapStageRegistry(registry) {
  if (!registry || typeof registry.register !== "function") {
    throw new TypeError(
      "A valid BootstrapStageRegistry is required."
    );
  }

  for (const definition of bootstrapStageDefinitions) {
    const existing =
      typeof registry.get === "function"
        ? registry.get(definition.name)
        : null;

    if (existing) {
      if (existing !== definition) {
        throw new Error(
          `Bootstrap stage "${definition.name}" is already registered with a different definition.`
        );
      }

      console.log(
        `[Bootstrap] Stage already registered: ${definition.name}`
      );

      continue;
    }

    registry.register(definition);

    console.log(
      `[Bootstrap] Stage registered: ${definition.name}`
    );
  }

  console.log(
    "[Bootstrap] Stage registry initialized:",
    registry
      .getOrdered()
      .map(
        (definition) => definition.name
      )
  );

  return registry;
}

export default initializeBootstrapStageRegistry;