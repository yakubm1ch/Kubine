import { BootstrapStage } from "../contracts/bootstrap-stage.js";

export class BootstrapStageFactory {
  constructor() {
    this.builders = new Map();
  }

  register(name, builder) {
    this.#assertName(name);

    if (typeof builder !== "function") {
      throw new TypeError(
        `Bootstrap stage builder for "${name}" must be a function.`
      );
    }

    if (this.builders.has(name)) {
      throw new Error(
        `Bootstrap stage builder "${name}" is already registered.`
      );
    }

    this.builders.set(name, builder);

    return this;
  }

  unregister(name) {
    this.#assertName(name);

    return this.builders.delete(name);
  }

  has(name) {
    this.#assertName(name);

    return this.builders.has(name);
  }

  create(definition, context = {}) {
    if (!definition || typeof definition.name !== "string") {
      throw new TypeError(
        "BootstrapStageFactory requires a valid stage definition."
      );
    }

    const builder = this.builders.get(definition.name);

    if (!builder) {
      throw new Error(
        `No bootstrap stage builder registered for "${definition.name}".`
      );
    }

    const stage = builder({
      definition,
      context,
    });

    if (!(stage instanceof BootstrapStage)) {
      throw new TypeError(
        `Bootstrap stage builder "${definition.name}" must return a BootstrapStage instance.`
      );
    }

    if (stage.name !== definition.name) {
      throw new Error(
        `Bootstrap stage "${definition.name}" produced an instance with mismatched name "${stage.name}".`
      );
    }

    return stage;
  }

  createMany(definitions, context = {}) {
    if (!Array.isArray(definitions)) {
      throw new TypeError(
        "BootstrapStageFactory.createMany() requires an array."
      );
    }

    return definitions.map((definition) =>
      this.create(definition, context)
    );
  }

  clear() {
    this.builders.clear();
  }

  #assertName(name) {
    if (typeof name !== "string" || name.trim() === "") {
      throw new TypeError(
        "Bootstrap stage name must be a non-empty string."
      );
    }
  }
}

export const bootstrapStageFactory =
  new BootstrapStageFactory();