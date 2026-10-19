import {
  BootstrapStage,
} from "../contracts/bootstrap-stage.js";

import {
  BootstrapStageDefinition,
} from "../contracts/bootstrap-stage.definition.js";

export class ProvidersStage extends BootstrapStage {
  constructor(definition) {
    if (!(definition instanceof BootstrapStageDefinition)) {
      throw new TypeError(
        "ProvidersStage requires a BootstrapStageDefinition."
      );
    }

    super(definition.name, {
      required: definition.required,
    });

    this.definition = definition;
    this.providers = null;
  }

  async initialize(context) {
    console.log(
      `[Bootstrap] Initializing stage: ${this.name}`
    );

    const runtime = context.get("runtime");
    const config = context.get("config");

    if (!runtime) {
      throw new Error(
        'ProvidersStage requires the "runtime" bootstrap context.'
      );
    }

    if (!config) {
      throw new Error(
        'ProvidersStage requires the "config" bootstrap context.'
      );
    }

    /*
     * The provider engine will be connected here.
     *
     * Provider discovery, registration and initialization belong
     * to the provider subsystem itself, not to the bootstrap stage.
     */

    this.providers = {
      name: "providers",
      initializedAt: Date.now(),
      runtime: runtime.name,
      config: config.name,
    };

    context.set("providers", this.providers);

    console.log(
      `[Bootstrap] Stage ready: ${this.name}`
    );
  }

  async rollback(context) {
    console.log(
      `[Bootstrap] Rolling back stage: ${this.name}`
    );

    this.providers = null;

    if (context.has("providers")) {
      context.delete("providers");
    }

    console.log(
      `[Bootstrap] Stage rolled back: ${this.name}`
    );
  }
}

export default ProvidersStage;