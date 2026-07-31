class ProviderFactory {

  create(provider) {

    if (!provider) {
      throw new Error("Provider is not defined.");
    }

    if (typeof provider === "function") {
      return new provider();
    }

    return provider;

  }

}

export const providerFactory = new ProviderFactory();
export default providerFactory;