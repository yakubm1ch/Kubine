export class ProviderRegistry {
  constructor() {
    this.providers = new Map();
  }

  register(name, provider) {
    const normalizedName = this.#validateName(name);

    this.#validateProvider(provider);

    if (this.providers.has(normalizedName)) {
      throw new Error(
        `Database provider "${normalizedName}" is already registered.`
      );
    }

    this.providers.set(normalizedName, provider);

    return this;
  }

  unregister(name) {
    const normalizedName = this.#validateName(name);

    this.providers.delete(normalizedName);

    return this;
  }

  has(name) {
    const normalizedName = this.#validateName(name);

    return this.providers.has(normalizedName);
  }

  get(name) {
    const normalizedName = this.#validateName(name);

    return this.providers.get(normalizedName) ?? null;
  }

  list() {
    return [...this.providers.keys()];
  }

  values() {
    return [...this.providers.values()];
  }

  entries() {
    return [...this.providers.entries()];
  }

  size() {
    return this.providers.size;
  }

  clear() {
    this.providers.clear();

    return this;
  }

  isEmpty() {
    return this.providers.size === 0;
  }

  #validateName(name) {
    if (
      typeof name !== "string" ||
      name.trim() === ""
    ) {
      throw new TypeError(
        "Database provider name must be a non-empty string."
      );
    }

    return name.trim();
  }

  #validateProvider(provider) {
    if (
      provider === undefined ||
      provider === null
    ) {
      throw new TypeError(
        "Database provider must be defined."
      );
    }

    const valid =
      typeof provider === "function" ||
      typeof provider === "object";

    if (!valid) {
      throw new TypeError(
        "Database provider must be an object or constructor."
      );
    }
  }
}

export const providerRegistry =
  new ProviderRegistry();

export default providerRegistry;