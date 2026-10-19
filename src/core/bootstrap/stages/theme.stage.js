import {
  BootstrapStage,
} from "../contracts/bootstrap-stage.js";

import {
  BootstrapStageDefinition,
} from "../contracts/bootstrap-stage.definition.js";

export class ThemeStage extends BootstrapStage {
  constructor(definition) {
    if (!(definition instanceof BootstrapStageDefinition)) {
      throw new TypeError(
        "ThemeStage requires a BootstrapStageDefinition."
      );
    }

    super(definition.name, {
      required: definition.required,
    });

    this.definition = definition;
    this.theme = null;
  }

  async initialize(context) {
    console.log(
      `[Bootstrap] Initializing stage: ${this.name}`
    );

    const runtime = context.get("runtime");
    const config = context.get("config");

    if (!runtime) {
      throw new Error(
        'ThemeStage requires the "runtime" bootstrap context.'
      );
    }

    if (!config) {
      throw new Error(
        'ThemeStage requires the "config" bootstrap context.'
      );
    }

    /*
     * The real Theme Engine will be connected here later.
     *
     * Theme resolution, providers, persistence and caching belong
     * to the Theme subsystem itself.
     */

    this.theme = {
      name: "theme",
      initializedAt: Date.now(),
      runtime: runtime.name,
      config: config.name,
    };

    context.set("theme", this.theme);

    console.log(
      `[Bootstrap] Stage ready: ${this.name}`
    );
  }

  async rollback(context) {
    console.log(
      `[Bootstrap] Rolling back stage: ${this.name}`
    );

    /*
     * The real Theme Engine cleanup will be connected here later.
     */

    this.theme = null;

    if (context.has("theme")) {
      context.delete("theme");
    }

    console.log(
      `[Bootstrap] Stage rolled back: ${this.name}`
    );
  }
}

export default ThemeStage;