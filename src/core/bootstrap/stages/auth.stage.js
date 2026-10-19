import {
  BootstrapStage,
} from "../contracts/bootstrap-stage.js";

import {
  BootstrapStageDefinition,
} from "../contracts/bootstrap-stage.definition.js";

export class AuthStage extends BootstrapStage {
  constructor(definition) {
    if (!(definition instanceof BootstrapStageDefinition)) {
      throw new TypeError(
        "AuthStage requires a BootstrapStageDefinition."
      );
    }

    super(definition.name, {
      required: definition.required,
    });

    this.definition = definition;
    this.auth = null;
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
        'AuthStage requires the "runtime" bootstrap context.'
      );
    }

    if (!config) {
      throw new Error(
        'AuthStage requires the "config" bootstrap context.'
      );
    }

    if (!providers) {
      throw new Error(
        'AuthStage requires the "providers" bootstrap context.'
      );
    }

    /*
     * The real Auth Engine will be connected here later.
     *
     * Authentication providers, session handling, guards and
     * authorization integration belong to the Auth subsystem.
     *
     * This stage does not depend on a specific provider such as
     * Supabase Auth.
     */

    this.auth = {
      name: "auth",
      initializedAt: Date.now(),
      runtime: runtime.name,
      config: config.name,
      providers: providers.name,
    };

    context.set("auth", this.auth);

    console.log(
      `[Bootstrap] Stage ready: ${this.name}`
    );
  }

  async rollback(context) {
    console.log(
      `[Bootstrap] Rolling back stage: ${this.name}`
    );

    /*
     * The real Auth Engine cleanup will be connected here later.
     */

    this.auth = null;

    if (context.has("auth")) {
      context.delete("auth");
    }

    console.log(
      `[Bootstrap] Stage rolled back: ${this.name}`
    );
  }
}

export default AuthStage;