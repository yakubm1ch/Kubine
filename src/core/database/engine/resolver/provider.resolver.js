/**
 * Resolves database providers from the provider registry.
 *
 * ProviderResolver is responsible only for resolving registered
 * provider registrations into provider instances.
 *
 * It does not:
 * - register providers;
 * - unregister providers;
 * - manage provider lifecycle;
 * - validate provider capabilities.
 *
 * Those responsibilities belong to the registry, manager and
 * validator layers respectively.
 */
export class ProviderResolver {
  constructor(registry, factory) {
    if (!registry) {
      throw new TypeError(
        "ProviderResolver requires a provider registry."
      );
    }

    if (!factory) {
      throw new TypeError(
        "ProviderResolver requires a provider factory."
      );
    }

    if (typeof registry.has !== "function" ||
        typeof registry.get !== "function" ||
        typeof registry.list !== "function") {
      throw new TypeError(
        "ProviderResolver received an invalid provider registry."
      );
    }

    if (typeof factory.create !== "function") {
      throw new TypeError(
        "ProviderResolver received an invalid provider factory."
      );
    }

    this.registry = registry;
    this.factory = factory;
  }

  /**
   * Resolve a single provider by name.
   *
   * Registered providers may be:
   * - an already-created provider instance;
   * - a provider constructor/factory accepted by ProviderFactory.
   *
   * The resolver does not cache the result itself. Caching/instance
   * management belongs to the manager layer.
   */
  resolve(name) {
    if (!name || typeof name !== "string") {
      throw new TypeError(
        "Provider name must be a non-empty string."
      );
    }

    if (!this.registry.has(name)) {
      throw new Error(
        `Database provider "${name}" is not registered.`
      );
    }

    const registration = this.registry.get(name);

    return this.factory.create(registration);
  }

  /**
   * Resolve all registered providers.
   *
   * Returns a Map where:
   *   key   = provider name
   *   value = resolved provider instance
   */
  resolveAll() {
    const providers = new Map();

    for (const name of this.registry.list()) {
      providers.set(name, this.resolve(name));
    }

    return providers;
  }
}

export default ProviderResolver;