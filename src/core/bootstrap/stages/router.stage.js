import {
  BootstrapStage,
} from "../contracts/bootstrap-stage.js";

import {
  BootstrapStageDefinition,
} from "../contracts/bootstrap-stage.definition.js";

export class RouterStage extends BootstrapStage {
  constructor(definition) {
    if (!(definition instanceof BootstrapStageDefinition)) {
      throw new TypeError(
        "RouterStage requires a BootstrapStageDefinition."
      );
    }

    super(definition.name, {
      required: definition.required,
    });

    this.definition = definition;
    this.router = null;
  }

  async initialize(context) {
    console.log(
      `[Bootstrap] Initializing stage: ${this.name}`
    );

    const runtime = context.get("runtime");
    const config = context.get("config");

    if (!runtime) {
      throw new Error(
        'RouterStage requires the "runtime" bootstrap context.'
      );
    }

    if (!config) {
      throw new Error(
        'RouterStage requires the "config" bootstrap context.'
      );
    }

    /*
     * The real Router Engine will be connected here later.
     *
     * Route registration, guards, middleware and navigation
     * resolution belong to the Router subsystem.
     */

    this.router = {
      name: "router",
      initializedAt: Date.now(),
      runtime: runtime.name,
      config: config.name,
    };

    context.set("router", this.router);

    console.log(
      `[Bootstrap] Stage ready: ${this.name}`
    );
  }

  async rollback(context) {
    console.log(
      `[Bootstrap] Rolling back stage: ${this.name}`
    );

    /*
     * The real Router Engine cleanup will be connected here later.
     */

    this.router = null;

    if (context.has("router")) {
      context.delete("router");
    }

    console.log(
      `[Bootstrap] Stage rolled back: ${this.name}`
    );
  }
}

export default RouterStage;