export class ProviderValidator {

  static requiredMethods = [

    "getClient",

    "getDatabase",

    "getStorage",

    "getRealtime",

    "getFunctions"

  ];

  static validate(provider) {

    if (!provider) {

      throw new Error("Provider is undefined.");

    }

    for (const method of this.requiredMethods) {

      if (typeof provider[method] !== "function") {

        throw new Error(

          `Provider is missing required method: ${method}`

        );

      }

    }

    return true;

  }

}

export default ProviderValidator;