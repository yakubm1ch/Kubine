import { providerRegistry } from "../registry/provider.registry.js";
import { providerFactory } from "../factory/provider.factory.js";

class ProviderManager {

  register(name, provider) {
    providerRegistry.register(name, provider);
  }

  unregister(name) {
    providerRegistry.unregister(name);
  }

  has(name) {
    return providerRegistry.has(name);
  }

  get(name) {

    if (!this.has(name)) {
      throw new Error(`Database provider "${name}" is not registered.`);
    }

    let provider = providerRegistry.get(name);

    if (typeof provider === "function") {
      provider = providerFactory.create(provider);
      providerRegistry.register(name, provider);
    }

    return provider;

  }

  list() {
    return providerRegistry.list();
  }

  clear() {
    providerRegistry.clear();
  }

}

export const providerManager = new ProviderManager();
export default providerManager;