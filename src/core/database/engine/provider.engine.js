import providerManager from "./manager/provider.manager.js";

class ProviderEngine {
  register(name, provider) {
    providerManager.register(name, provider);

    return this;
  }

  unregister(name) {
    providerManager.unregister(name);

    return this;
  }

  has(name) {
    return providerManager.has(name);
  }

  get(name) {
    return providerManager.get(name);
  }

  resolve(name) {
    return providerManager.resolve(name);
  }

  find(name) {
    return providerManager.find(name);
  }

  require(name) {
    providerManager.require(name);

    return this;
  }

  list() {
    return providerManager.list();
  }

  getNames() {
    return providerManager.getNames();
  }

  size() {
    return providerManager.size();
  }

  isEmpty() {
    return providerManager.isEmpty();
  }

  clear() {
    providerManager.clear();

    return this;
  }
}

export const providerEngine =
  new ProviderEngine();

export default providerEngine;