/**
 * Validates database provider implementations against
 * the generic DatabaseProvider contract.
 *
 * ProviderValidator is responsible only for contract validation.
 * It does not instantiate, register, resolve or manage providers.
 */

export class ProviderValidator {
  /**
   * Methods that every database provider must implement.
   *
   * These methods define the minimum provider lifecycle and
   * database operation contract required by Database Engine.
   */
  static requiredMethods = [
    "connect",
    "disconnect",
    "health",

    "createTable",
    "updateTable",
    "deleteTable",

    "insert",
    "update",
    "delete",
    "select",

    "transaction",
  ];

  /**
   * Validate a database provider.
   *
   * @param {object} provider
   * @returns {true}
   *
   * @throws {TypeError}
   * @throws {Error}
   */
  static validate(provider) {
    if (!provider) {
      throw new TypeError(
        "Database provider is undefined."
      );
    }

    for (const method of this.requiredMethods) {
      if (typeof provider[method] !== "function") {
        throw new Error(
          `Database provider "${provider.constructor?.name ?? "unknown"}" ` +
          `is missing required method: ${method}.`
        );
      }
    }

    return true;
  }

  /**
   * Check whether a provider satisfies the contract
   * without throwing.
   *
   * @param {object} provider
   * @returns {boolean}
   */
  static isValid(provider) {
    try {
      this.validate(provider);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Return all missing required methods.
   *
   * This is useful for diagnostics and provider registration
   * errors where callers need structured information instead
   * of parsing an exception message.
   *
   * @param {object} provider
   * @returns {string[]}
   */
  static getMissingMethods(provider) {
    if (!provider) {
      return [...this.requiredMethods];
    }

    return this.requiredMethods.filter(
      (method) =>
        typeof provider[method] !== "function"
    );
  }
}

export default ProviderValidator;