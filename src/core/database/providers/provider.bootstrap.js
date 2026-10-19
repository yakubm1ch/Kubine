import providerManager from "../engine/manager/provider.manager.js";

const ProviderBootstrapState = Object.freeze({
  IDLE: "idle",
  INITIALIZING: "initializing",
  READY: "ready",
  ROLLING_BACK: "rolling_back",
  ROLLED_BACK: "rolled_back",
  FAILED: "failed",
  ROLLBACK_FAILED: "rollback_failed",
});

function validateProviderName(name) {
  if (typeof name !== "string" || name.trim() === "") {
    throw new TypeError(
      "Provider name must be a non-empty string."
    );
  }

  return name.trim();
}

function validateProvider(name, provider) {
  if (!provider) {
    throw new TypeError(
      `Provider "${name}" is not defined.`
    );
  }

  return provider;
}

export class ProviderBootstrap {
  constructor({
    manager = providerManager,
    providers = {},
  } = {}) {
    if (!manager) {
      throw new TypeError(
        "ProviderBootstrap requires a provider manager."
      );
    }

    if (
      typeof manager.register !== "function" ||
      typeof manager.unregister !== "function" ||
      typeof manager.has !== "function" ||
      typeof manager.get !== "function" ||
      typeof manager.list !== "function"
    ) {
      throw new TypeError(
        "ProviderBootstrap requires a valid provider manager."
      );
    }

    if (
      providers === null ||
      typeof providers !== "object" ||
      Array.isArray(providers)
    ) {
      throw new TypeError(
        "ProviderBootstrap providers must be an object."
      );
    }

    this.manager = manager;

    this.providers = new Map();

    this.registeredProviders = [];
    this.failedProvider = null;

    this.state = ProviderBootstrapState.IDLE;
    this.error = null;

    this._registerDefinitions(providers);
  }

  _registerDefinitions(providers) {
    for (const [name, provider] of Object.entries(providers)) {
      this.add(name, provider);
    }
  }

  add(name, provider) {
    const normalizedName = validateProviderName(name);

    validateProvider(normalizedName, provider);

    if (this.providers.has(normalizedName)) {
      throw new Error(
        `Provider "${normalizedName}" is already defined.`
      );
    }

    this.providers.set(
      normalizedName,
      provider
    );

    return this;
  }

  remove(name) {
    const normalizedName = validateProviderName(name);

    this.providers.delete(normalizedName);

    return this;
  }

  has(name) {
    const normalizedName = validateProviderName(name);

    return this.providers.has(normalizedName);
  }

  get(name) {
    const normalizedName = validateProviderName(name);

    return this.providers.get(normalizedName) ?? null;
  }

  list() {
    return [...this.providers.keys()];
  }

  getState() {
    return {
      state: this.state,
      providers: this.list(),
      registeredProviders: [
        ...this.registeredProviders,
      ],
      failedProvider: this.failedProvider,
      error: this.error,
    };
  }

  isIdle() {
    return this.state === ProviderBootstrapState.IDLE;
  }

  isInitializing() {
    return (
      this.state ===
      ProviderBootstrapState.INITIALIZING
    );
  }

  isReady() {
    return this.state === ProviderBootstrapState.READY;
  }

  isFailed() {
    return this.state === ProviderBootstrapState.FAILED;
  }

  isRollingBack() {
    return (
      this.state ===
      ProviderBootstrapState.ROLLING_BACK
    );
  }

  isRolledBack() {
    return (
      this.state ===
      ProviderBootstrapState.ROLLED_BACK
    );
  }

  hasRollbackFailed() {
    return (
      this.state ===
      ProviderBootstrapState.ROLLBACK_FAILED
    );
  }

  async initialize(context = {}) {
    if (
      this.state !== ProviderBootstrapState.IDLE &&
      this.state !== ProviderBootstrapState.ROLLED_BACK
    ) {
      throw new Error(
        `ProviderBootstrap cannot initialize from state "${this.state}".`
      );
    }

    this.state =
      ProviderBootstrapState.INITIALIZING;

    this.error = null;
    this.failedProvider = null;
    this.registeredProviders = [];

    console.log(
      `[Database] Provider bootstrap starting (${this.providers.size} providers).`
    );

    try {
      for (const [
        name,
        providerDefinition,
      ] of this.providers) {
        console.log(
          `[Database] → Registering provider: ${name}`
        );

        try {
          this.manager.register(
            name,
            providerDefinition
          );
        } catch (error) {
          this.failedProvider = name;
          throw error;
        }

        this.registeredProviders.push(name);

        console.log(
          `[Database] ✓ Provider registered: ${name}`
        );
      }

      this.state =
        ProviderBootstrapState.READY;

      console.log(
        "[Database] Provider bootstrap completed."
      );

      return {
        success: true,
        providers: [
          ...this.registeredProviders,
        ],
      };
    } catch (error) {
      this.error = error;
      this.state =
        ProviderBootstrapState.FAILED;

      console.error(
        `[Database] Provider bootstrap failed at provider: ${
          this.failedProvider ?? "unknown"
        }`,
        error
      );

      try {
        await this.rollback(context);
      } catch (rollbackError) {
        return {
          success: false,
          error: rollbackError,
          originalError: error,
          providers: [
            ...this.registeredProviders,
          ],
        };
      }

      throw error;
    }
  }

  async rollback(context = {}) {
    if (
      this.state !== ProviderBootstrapState.FAILED &&
      this.state !== ProviderBootstrapState.INITIALIZING &&
      this.state !== ProviderBootstrapState.READY
    ) {
      return {
        success: true,
        providers: [],
      };
    }

    this.state =
      ProviderBootstrapState.ROLLING_BACK;

    const rollbackErrors = [];

    /*
     * Providers are removed in reverse registration order.
     *
     * This mirrors BootstrapPipeline semantics:
     * the last initialized resource is the first resource
     * to be rolled back.
     */
    for (
      let index =
        this.registeredProviders.length - 1;
      index >= 0;
      index--
    ) {
      const name =
        this.registeredProviders[index];

      try {
        console.log(
          `[Database] ← Unregistering provider: ${name}`
        );

        if (this.manager.has(name)) {
          this.manager.unregister(name);
        }

        console.log(
          `[Database] ✓ Provider unregistered: ${name}`
        );
      } catch (error) {
        rollbackErrors.push({
          provider: name,
          error,
        });

        console.error(
          `[Database] ✗ Provider rollback failed: ${name}`,
          error
        );
      }
    }

    if (rollbackErrors.length > 0) {
      const rollbackError = new Error(
        "Provider bootstrap rollback failed."
      );

      rollbackError.cause = {
        originalError: this.error,
        rollbackErrors,
      };

      this.error = rollbackError;
      this.state =
        ProviderBootstrapState.ROLLBACK_FAILED;

      throw rollbackError;
    }

    this.registeredProviders = [];
    this.failedProvider = null;

    this.state =
      ProviderBootstrapState.ROLLED_BACK;

    console.log(
      "[Database] Provider bootstrap rollback completed."
    );

    return {
      success: true,
      providers: [],
    };
  }

  async shutdown(context = {}) {
    if (
      this.state !== ProviderBootstrapState.READY &&
      this.state !== ProviderBootstrapState.FAILED &&
      this.state !== ProviderBootstrapState.ROLLBACK_FAILED
    ) {
      return {
        success: true,
        providers: [],
      };
    }

    return this.rollback(context);
  }
}

export default ProviderBootstrap;