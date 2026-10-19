import {
  BootstrapStage,
} from "../contracts/bootstrap-stage.js";

import {
  BootstrapStageDefinition,
} from "../contracts/bootstrap-stage.definition.js";

export class ConfigStage extends BootstrapStage {
  constructor(definition) {
    if (!(definition instanceof BootstrapStageDefinition)) {
      throw new TypeError(
        "ConfigStage requires a BootstrapStageDefinition."
      );
    }

    super(definition.name, {
      required: definition.required,
    });

    this.definition = definition;
    this.config = null;
  }

  async initialize(context) {
    console.log(
      `[Bootstrap] Initializing stage: ${this.name}`
    );

    /*
     * The real Config Engine will be connected here later.
     *
     * Runtime is already available through the shared context.
     * The stage does not import or directly control RuntimeStage.
     */

    const runtime = context.get("runtime");

    if (!runtime) {
      throw new Error(
        'ConfigStage requires the "runtime" bootstrap context.'
      );
    }

    this.config = {
      name: "config",
      initializedAt: Date.now(),
      runtime: runtime.name,
    };

    context.set("config", this.config);

    console.log(
      `[Bootstrap] Stage ready: ${this.name}`
    );
  }

  async rollback(context) {
    console.log(
      `[Bootstrap] Rolling back stage: ${this.name}`
    );

    this.config = null;

    if (context.has("config")) {
      context.delete("config");
    }

    console.log(
      `[Bootstrap] Stage rolled back: ${this.name}`
    );
  }
}

export default ConfigStage;