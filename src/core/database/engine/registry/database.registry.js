// provider.registry.js

class ProviderRegistry {

  constructor() {
    this.providers = new Map();
  }

  register(name, provider) {
    this.providers.set(name, provider);
  }

  get(name) {
    return this.providers.get(name);
  }

  has(name) {
    return this.providers.has(name);
  }

  list() {
    return [...this.providers.keys()];
  }

}

export const providerRegistry = new ProviderRegistry();