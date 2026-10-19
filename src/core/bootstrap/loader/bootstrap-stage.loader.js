import { BootstrapStageFactory } from "../factory/bootstrap-stage.factory.js";

export class BootstrapStageLoader {
  constructor(factory) {
    if (!(factory instanceof BootstrapStageFactory)) {
      throw new TypeError(
        "BootstrapStageLoader requires a BootstrapStageFactory instance."
      );
    }

    this.factory = factory;
  }

  load(definitions, context = {}) {
    if (!Array.isArray(definitions)) {
      throw new TypeError(
        "BootstrapStageLoader.load() requires an array of definitions."
      );
    }

    return this.factory.createMany(
      definitions,
      context
    );
  }

  loadOne(definition, context = {}) {
    if (!definition) {
      throw new TypeError(
        "BootstrapStageLoader.loadOne() requires a stage definition."
      );
    }

    return this.factory.create(
      definition,
      context
    );
  }
}

export default BootstrapStageLoader;