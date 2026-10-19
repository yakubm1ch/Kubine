import {
  BootstrapStage,
} from "../contracts/bootstrap-stage.js";

import {
  BootstrapStageDefinition,
} from "../contracts/bootstrap-stage.definition.js";

export class DatabaseStage extends BootstrapStage {
  constructor(definition) {
    if (!(definition instanceof BootstrapStageDefinition)) {
      throw new TypeError(
        "DatabaseStage requires a BootstrapStageDefinition."
      );
    }

    super(definition.name, {
      required: definition.required,
    });

    this.definition = definition;
    this.database = null;
  }

  async initialize(context) {
    console.log(
      `[Bootstrap] Initializing stage: ${this.name}`
    );

    const runtime = context.get("runtime");
    const config = context.get("config");
    const providers = context.get("providers");

    if (!runtime) {
      throw new Error(
        'DatabaseStage requires the "runtime" bootstrap context.'
      );
    }

    if (!config) {
      throw new Error(
        'DatabaseStage requires the "config" bootstrap context.'
      );
    }

    if (!providers) {
      throw new Error(
        'DatabaseStage requires the "providers" bootstrap context.'
      );
    }

    /*
     * The Database Engine will be connected here later.
     *
     * Provider selection, connection handling and database-specific
     * operations belong to the Database subsystem.
     *
     * This stage only establishes the bootstrap lifecycle boundary.
     */

    this.database = {
      name: "database",
      initializedAt: Date.now(),
      runtime: runtime.name,
      config: config.name,
      providers: providers.name,
    };

    context.set("database", this.database);

    console.log(
      `[Bootstrap] Stage ready: ${this.name}`
    );
  }

  async rollback(context) {
    console.log(
      `[Bootstrap] Rolling back stage: ${this.name}`
    );

    /*
     * The real Database Engine cleanup will be connected here later.
     */

    this.database = null;

    if (context.has("database")) {
      context.delete("database");
    }

    console.log(
      `[Bootstrap] Stage rolled back: ${this.name}`
    );
  }
}

export default DatabaseStage;
