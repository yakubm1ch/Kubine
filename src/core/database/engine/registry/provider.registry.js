class ProviderRegistry {

  constructor() {
    this.providers = new Map();
  }

  register(name, provider) {
    this.providers.set(name, provider);
  }

  unregister(name) {
    this.providers.delete(name);
  }

  has(name) {
    return this.providers.has(name);
  }

  get(name) {
    return this.providers.get(name);
  }

  list() {
    return [...this.providers.keys()];
  }

  clear() {
    this.providers.clear();
  }

}

export const providerRegistry = new ProviderRegistry();
export default providerRegistry;