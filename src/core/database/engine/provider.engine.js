import providerManager from "./manager/provider.manager.js";

class ProviderEngine {

  register(name, provider) {
    providerManager.register(name, provider);
  }

  unregister(name) {
    providerManager.unregister(name);
  }

  has(name) {
    return providerManager.has(name);
  }

  get(name) {
    return providerManager.get(name);
  }

  list() {
    return providerManager.list();
  }

  clear() {
    providerManager.clear();
  }

}

export const providerEngine = new ProviderEngine();
export default providerEngine;