/**
 * Validates database provider implementations against
 * the generic DatabaseProvider contract.
 *
 * ProviderValidator is responsible only for contract validation.
 * It does not instantiate, register, resolve or manage providers.
 *
 * Core validation covers the seven mandatory methods:
 * connect, disconnect, health, insert, update, delete, select.
 *
 * Optional capabilities (schema management and transactions)
 * are validated independently through dedicated methods.
 * A provider missing an optional capability remains valid
 * as a core database provider.
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

    "insert",
    "update",
    "delete",
    "select",
  ];

  /**
   * Methods required by the SchemaCapability optional contract.
   */
  static requiredSchemaMethods = [
    "createTable",
    "updateTable",
    "deleteTable",
  ];

  /**
   * Methods required by the TransactionCapability optional contract.
   */
  static requiredTransactionMethods = [
    "transaction",
  ];

  /**
   * Validate a provider against the core DatabaseProvider contract.
   *
   * Only the seven mandatory methods are checked. Optional
   * capabilities (schema, transactions) are not required here.
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
          `is missing required core method: ${method}.`
        );
      }
    }

    return true;
  }

  /**
   * Validate a provider against the SchemaCapability optional contract.
   *
   * A provider claiming schema support must implement all three
   * schema methods. A provider without schema support is still
   * valid as a core database provider; this method simply reports
   * whether the capability contract is satisfied.
   *
   * @param {object} provider
   * @returns {true}
   *
   * @throws {TypeError}
   * @throws {Error}
   */
  static validateSchemaCapability(provider) {
    if (!provider) {
      throw new TypeError(
        "Database provider is undefined."
      );
    }

    for (const method of this.requiredSchemaMethods) {
      if (typeof provider[method] !== "function") {
        throw new Error(
          `Database provider "${provider.constructor?.name ?? "unknown"}" ` +
          `claims SchemaCapability but is missing required method: ${method}.`
        );
      }
    }

    return true;
  }

  /**
   * Validate a provider against the TransactionCapability optional contract.
   *
   * A provider claiming transaction support must implement the
   * transaction method. A provider without transaction support is
   * still valid as a core database provider.
   *
   * @param {object} provider
   * @returns {true}
   *
   * @throws {TypeError}
   * @throws {Error}
   */
  static validateTransactionCapability(provider) {
    if (!provider) {
      throw new TypeError(
        "Database provider is undefined."
      );
    }

    for (const method of this.requiredTransactionMethods) {
      if (typeof provider[method] !== "function") {
        throw new Error(
          `Database provider "${provider.constructor?.name ?? "unknown"}" ` +
          `claims TransactionCapability but is missing required method: ${method}.`
        );
      }
    }

    return true;
  }

  /**
   * Check whether a provider satisfies the core contract
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
   * Check whether a provider satisfies the SchemaCapability
   * contract without throwing.
   *
   * @param {object} provider
   * @returns {boolean}
   */
  static isSchemaCapable(provider) {
    try {
      this.validateSchemaCapability(provider);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check whether a provider satisfies the TransactionCapability
   * contract without throwing.
   *
   * @param {object} provider
   * @returns {boolean}
   */
  static isTransactionCapable(provider) {
    try {
      this.validateTransactionCapability(provider);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Return all missing core required methods.
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

  /**
   * Return all missing SchemaCapability methods.
   *
   * @param {object} provider
   * @returns {string[]}
   */
  static getMissingSchemaMethods(provider) {
    if (!provider) {
      return [...this.requiredSchemaMethods];
    }

    return this.requiredSchemaMethods.filter(
      (method) =>
        typeof provider[method] !== "function"
    );
  }

  /**
   * Return all missing TransactionCapability methods.
   *
   * @param {object} provider
   * @returns {string[]}
   */
  static getMissingTransactionMethods(provider) {
    if (!provider) {
      return [...this.requiredTransactionMethods];
    }

    return this.requiredTransactionMethods.filter(
      (method) =>
        typeof provider[method] !== "function"
    );
  }
}

export default ProviderValidator;
