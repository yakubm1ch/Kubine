import {
  BootstrapStage,
} from "../contracts/bootstrap-stage.js";

import {
  BootstrapStageDefinition,
} from "../contracts/bootstrap-stage.definition.js";

export class ModuleStage extends BootstrapStage {
  constructor(definition) {
    if (!(definition instanceof BootstrapStageDefinition)) {
      throw new TypeError(
        "ModuleStage requires a BootstrapStageDefinition."
      );
    }

    super(definition.name, {
      required: definition.required,
    });

    this.definition = definition;
    this.modules = null;
  }

  async initialize(context) {
    console.log(
      `[Bootstrap] Initializing stage: ${this.name}`
    );

    const runtime = context.get("runtime");
    const config = context.get("config");
    const database = context.get("database");

    if (!runtime) {
      throw new Error(
        'ModuleStage requires the "runtime" bootstrap context.'
      );
    }

    if (!config) {
      throw new Error(
        'ModuleStage requires the "config" bootstrap context.'
      );
    }

    if (!database) {
      throw new Error(
        'ModuleStage requires the "database" bootstrap context.'
      );
    }

    /*
     * The Module Engine will be connected here later.
     *
     * Module discovery, compatibility checks, dependency resolution,
     * installation and lifecycle management belong to the Module Engine.
     */

    this.modules = {
      name: "modules",
      initializedAt: Date.now(),
      runtime: runtime.name,
      config: config.name,
      database: database.name,
    };

    context.set("modules", this.modules);

    console.log(
      `[Bootstrap] Stage ready: ${this.name}`
    );
  }

  async rollback(context) {
    console.log(
      `[Bootstrap] Rolling back stage: ${this.name}`
    );

    /*
     * The real Module Engine cleanup will be connected here later.
     */

    this.modules = null;

    if (context.has("modules")) {
      context.delete("modules");
    }

    console.log(
      `[Bootstrap] Stage rolled back: ${this.name}`
    );
  }
}

export default ModuleStage;