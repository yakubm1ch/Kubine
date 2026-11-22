import { providerRegistry } from "../registry/provider.registry.js";
import { providerFactory } from "../factory/provider.factory.js";
import { ProviderValidator } from "../validators/provider.validator.js";

class ProviderManager {
  constructor() {
    this.instances = new Map();
  }

  /**
   * Validate provider name.
   *
   * @param {string} name
   * @returns {string}
   */
  validateName(name) {
    if (
      typeof name !== "string" ||
      name.trim().length === 0
    ) {
      throw new TypeError(
        "Database provider name must be a non-empty string."
      );
    }

    return name;
  }

  /**
   * Validate provider definition.
   *
   * A provider may be:
   * - an already-created instance;
   * - a constructor;
   * - a factory function.
   *
   * @param {unknown} provider
   * @returns {void}
   */
  validateProvider(provider) {
    if (
      provider === undefined ||
      provider === null
    ) {
      throw new TypeError(
        "Database provider must be defined."
      );
    }

    const validObject =
      typeof provider === "object";

    const validFunction =
      typeof provider === "function";

    if (!validObject && !validFunction) {
      throw new TypeError(
        "Database provider must be an object instance or a constructor/factory function."
      );
    }
  }

  /**
   * Register a database provider.
   *
   * Registration is intentionally lazy when a constructor
   * or factory function is supplied.
   *
   * @param {string} name
   * @param {object|Function} provider
   * @returns {ProviderManager}
   */
  register(name, provider) {
    name = this.validateName(name);
    this.validateProvider(provider);

    if (this.has(name)) {
      throw new Error(
        `Database provider "${name}" is already registered.`
      );
    }

    providerRegistry.register(
      name,
      provider
    );

    return this;
  }

  /**
   * Unregister a provider.
   *
   * @param {string} name
   * @returns {ProviderManager}
   */
  unregister(name) {
    name = this.validateName(name);

    providerRegistry.unregister(name);

    this.instances.delete(name);

    return this;
  }

  /**
   * Check whether a provider is registered.
   *
   * @param {string} name
   * @returns {boolean}
   */
  has(name) {
    name = this.validateName(name);

    return providerRegistry.has(name);
  }

  /**
   * Resolve a registered provider.
   *
   * Constructors/factory functions are instantiated lazily
   * and the resulting instance is cached in the manager's
   * instance cache, separate from the provider definition.
   *
   * @param {string} name
   * @returns {object}
   */
  get(name) {
    name = this.validateName(name);

    if (this.instances.has(name)) {
      return this.instances.get(name);
    }

    if (!providerRegistry.has(name)) {
      throw new Error(
        `Database provider "${name}" is not registered.`
      );
    }

    const definition =
      providerRegistry.get(name);

    let provider;

    if (typeof definition === "function") {
      provider =
        providerFactory.create(definition);

      ProviderValidator.validate(provider);

      this.instances.set(
        name,
        provider
      );

      return provider;
    }

    provider = definition;

    ProviderValidator.validate(provider);

    this.instances.set(
      name,
      provider
    );

    return provider;
  }

  /**
   * Resolve a provider without exposing registry internals.
   *
   * Alias for get(), useful when the caller's intent is
   * explicitly resolution rather than lookup.
   *
   * @param {string} name
   * @returns {object}
   */
  resolve(name) {
    return this.get(name);
  }

  /**
   * Get all registered provider names.
   *
   * @returns {string[]}
   */
  list() {
    return providerRegistry.list();
  }

  /**
   * Get the number of registered providers.
   *
   * @returns {number}
   */
  size() {
    return this.list().length;
  }

  /**
   * Check whether no providers are registered.
   *
   * @returns {boolean}
   */
  isEmpty() {
    return this.size() === 0;
  }

  /**
   * Clear all registered providers.
   *
   * This only clears the manager registry.
   * Provider-specific cleanup belongs to the provider
   * lifecycle and must not be hidden inside this method.
   *
   * @returns {ProviderManager}
   */
  clear() {
    providerRegistry.clear();

    this.instances.clear();

    return this;
  }

  /**
   * Return all currently registered provider names.
   *
   * @returns {string[]}
   */
  getNames() {
    return this.list();
  }

  /**
   * Return a provider only when it exists.
   *
   * Unlike get(), this method does not throw for an
   * unknown provider.
   *
   * @param {string} name
   * @returns {object|null}
   */
  find(name) {
    name = this.validateName(name);

    if (!this.has(name)) {
      return null;
    }

    return this.get(name);
  }

  /**
   * Assert that a provider exists.
   *
   * @param {string} name
   * @returns {ProviderManager}
   */
  require(name) {
    this.get(name);

    return this;
  }
}

export const providerManager =
  new ProviderManager();

export default providerManager;