import { BootstrapStageDefinition } from "../contracts/bootstrap-stage.definition.js";

export class BootstrapStageResolver {
  constructor(registry) {
    if (!registry || typeof registry.getOrdered !== "function") {
      throw new TypeError(
        "BootstrapStageResolver requires a valid stage registry."
      );
    }

    this.registry = registry;
  }

  resolve() {
    const definitions = this.registry.getOrdered();

    this.#validateDefinitions(definitions);

    const resolved = this.#resolveDependencies(definitions);

    return Object.freeze([...resolved]);
  }

  #validateDefinitions(definitions) {
    const names = new Set(
      definitions.map((definition) => definition.name)
    );

    for (const definition of definitions) {
      if (!(definition instanceof BootstrapStageDefinition)) {
        throw new TypeError(
          `Invalid bootstrap stage definition "${definition?.name ?? "unknown"}".`
        );
      }

      if (definition.dependencies.includes(definition.name)) {
        throw new Error(
          `Bootstrap stage "${definition.name}" cannot depend on itself.`
        );
      }

      for (const dependency of definition.dependencies) {
        if (!names.has(dependency)) {
          throw new Error(
            `Bootstrap stage "${definition.name}" depends on unknown stage "${dependency}".`
          );
        }
      }
    }
  }

  #resolveDependencies(definitions) {
    const byName = new Map(
      definitions.map((definition) => [
        definition.name,
        definition,
      ])
    );

    const resolved = [];
    const visiting = new Set();
    const visited = new Set();

    const visit = (name) => {
      if (visited.has(name)) {
        return;
      }

      if (visiting.has(name)) {
        throw new Error(
          `Circular bootstrap stage dependency detected at "${name}".`
        );
      }

      const definition = byName.get(name);

      if (!definition) {
        throw new Error(
          `Cannot resolve unknown bootstrap stage "${name}".`
        );
      }

      visiting.add(name);

      for (const dependency of definition.dependencies) {
        visit(dependency);
      }

      visiting.delete(name);
      visited.add(name);

      resolved.push(definition);
    };

    for (const definition of definitions) {
      visit(definition.name);
    }

    return resolved;
  }
}

export default BootstrapStageResolver;