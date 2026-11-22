import {
  BootstrapStage,
} from "../contracts/bootstrap-stage.js";

import {
  BootstrapStageDefinition,
} from "../contracts/bootstrap-stage.definition.js";

import {
  providerEngine,
} from "../../database/engine/provider.engine.js";

import {
  providerManager,
} from "../../database/engine/manager/provider.manager.js";

import ProviderBootstrap from "../../database/providers/provider.bootstrap.js";

import {
  databaseProviderName,
} from "../../config/database.config.js";

import {
  resolveProviderDefinition,
} from "../../database/providers/provider.catalog.js";

import DatabaseAdapter from "../../database/adapters/database/database.adapter.js";

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
    this.providerBootstrap = null;
    this.registeredProviderName = null;
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

    const providerName = databaseProviderName;

    const providerDefinition =
      resolveProviderDefinition(providerName);

    this.providerBootstrap =
      new ProviderBootstrap({
        manager: providerManager,
        providers: {
          [providerName]: providerDefinition,
        },
      });

    await this.providerBootstrap.initialize(context);

    if (!providerEngine.has(providerName)) {
      throw new Error(
        `Provider "${providerName}" was not registered in ProviderEngine.`
      );
    }

    const resolvedProvider = providerEngine.get(providerName);

    if (!resolvedProvider) {
      throw new Error(
        `Provider "${providerName}" could not be resolved from ProviderEngine.`
      );
    }

    DatabaseAdapter.configure(providerName);

    this.registeredProviderName = providerName;

    const providerMetadata = {
      name: "providers",
      initializedAt: Date.now(),
      runtime: runtime.name,
      config: config.name,
      provider: providerName,
      providers: providerEngine.getNames(),
    };

    context.set("providers", providerMetadata);

    console.log(
      `[Bootstrap] Stage ready: ${this.name}`
    );
  }

  async rollback(context) {
    console.log(
      `[Bootstrap] Rolling back stage: ${this.name}`
    );

    let rollbackError = null;

    if (this.providerBootstrap) {
      try {
        await this.providerBootstrap.rollback(context);
      } catch (error) {
        rollbackError = error;
        console.error(
          `[Bootstrap] ✗ Provider bootstrap rollback failed: ${this.name}`,
          error
        );
      } finally {
        this.providerBootstrap = null;
      }
    }

    // Always clear adapter configuration so it cannot retain a stale
    // provider name after rollback, even when provider unregistration fails.
    DatabaseAdapter.clearConfiguration();

    this.registeredProviderName = null;

    if (context.has("providers")) {
      context.delete("providers");
    }

    if (rollbackError) {
      throw rollbackError;
    }

    console.log(
      `[Bootstrap] Stage rolled back: ${this.name}`
    );
  }
}

export default ProvidersStage;
