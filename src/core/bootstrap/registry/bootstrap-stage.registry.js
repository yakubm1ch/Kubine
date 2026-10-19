import { BootstrapStageDefinition } from "../contracts/bootstrap-stage.definition.js";

export class BootstrapStageRegistry {
  constructor() {
    this.definitions = new Map();
  }

  register(definition) {
    if (!(definition instanceof BootstrapStageDefinition)) {
      throw new TypeError(
        "BootstrapStageRegistry accepts only BootstrapStageDefinition instances."
      );
    }

    if (this.definitions.has(definition.name)) {
      throw new Error(
        `Bootstrap stage "${definition.name}" is already registered.`
      );
    }

    for (const existing of this.definitions.values()) {
      if (existing.order === definition.order) {
        throw new Error(
          `Bootstrap stage order "${definition.order}" is already used by stage "${existing.name}".`
        );
      }
    }

    this.definitions.set(definition.name, definition);

    return definition;
  }

  unregister(name) {
    this.#assertName(name);

    return this.definitions.delete(name);
  }

  has(name) {
    this.#assertName(name);

    return this.definitions.has(name);
  }

  get(name) {
    this.#assertName(name);

    return this.definitions.get(name) ?? null;
  }

  getAll() {
    return [...this.definitions.values()];
  }

  getOrdered() {
    return this.getAll().sort(
      (a, b) => a.order - b.order
    );
  }

  clear() {
    this.definitions.clear();
  }

  size() {
    return this.definitions.size;
  }

  #assertName(name) {
    if (typeof name !== "string" || name.trim() === "") {
      throw new TypeError(
        "Bootstrap stage name must be a non-empty string."
      );
    }
  }
}

export const bootstrapStageRegistry =
  new BootstrapStageRegistry();