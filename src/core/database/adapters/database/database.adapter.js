import { providerEngine } from "../../engine/provider.engine.js";

class DatabaseAdapter {
  /**
   * @param {string|null} providerName - Name of the registered database provider.
   *   Lazy resolution happens on first use. If null, the adapter throws a clear
   *   error when any database method is called.
   */
  constructor(providerName = null) {
    this.providerName = providerName;
  }

  /**
   * Configure the provider name for this adapter instance.
   *
   * Validates the name and stores it for lazy resolution on first use.
   * Changing the provider name after construction does not retain any stale
   * provider instance, because the adapter does not cache providers itself —
   * instance caching is owned exclusively by ProviderManager.
   *
   * @param {string} providerName
   * @returns {DatabaseAdapter}
   * @throws {TypeError} When the name is not a non-empty string.
   */
  configure(providerName) {
    if (
      typeof providerName !== "string" ||
      providerName.trim().length === 0
    ) {
      throw new TypeError(
        "Database provider name must be a non-empty string."
      );
    }

    this.providerName = providerName.trim();
    return this;
  }

  /**
   * Clear the configured provider name.
   *
   * Resets the adapter to an unconfigured state so it cannot resolve a
   * stale provider after rollback. Safe to call multiple times; does not
   * touch ProviderEngine, ProviderManager, or any provider registrations.
   *
   * @returns {DatabaseAdapter}
   */
  clearConfiguration() {
    this.providerName = null;
    return this;
  }

  /**
   * Resolve the database provider from ProviderEngine on every call.
   *
   * The adapter does not cache provider instances. ProviderManager is the
   * single owner of instance caching, so a provider that is unregistered and
   * replaced under the same name is always resolved to the current instance.
   *
   * @returns {object} The registered DatabaseProvider instance.
   * @throws {Error} When no provider name is configured or the provider is not registered.
   */
  _resolveProvider() {
    if (!this.providerName) {
      throw new Error(
        "No database provider configured. Provide a provider name to DatabaseAdapter."
      );
    }

    return providerEngine.get(this.providerName);
  }

  /**
   * Normalize a backend error into a consistent { message, code, details } shape.
   * @param {unknown} error
   * @returns {object}
   */
  _normalizeError(error) {
    if (error && typeof error === "object") {
      return {
        message: error.message || String(error),
        code: error.code || null,
        details: error.details || null,
      };
    }
    return { message: String(error), code: null, details: null };
  }

  /**
   * Select records.
   *
   * @param {string} table
   * @param {object} query - { columns, filters, order, limit, single }
   * @param {object} context
   * @returns {Promise<{ data: unknown, error: object|null }>}
   */
  async select(table, query = {}, context = {}) {
    const provider = this._resolveProvider();
    try {
      const data = await provider.select(table, query, context);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this._normalizeError(error) };
    }
  }

  /**
   * Insert records.
   *
   * @param {string} table
   * @param {object|object[]} records
   * @param {object} context
   * @returns {Promise<{ data: unknown, error: object|null }>}
   */
  async insert(table, records, context = {}) {
    const provider = this._resolveProvider();
    try {
      const data = await provider.insert(table, records, context);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this._normalizeError(error) };
    }
  }

  /**
   * Update records.
   *
   * @param {string} table
   * @param {object} values
   * @param {object} filters
   * @param {object} context
   * @returns {Promise<{ data: unknown, error: object|null }>}
   */
  async update(table, values, filters = {}, context = {}) {
    const provider = this._resolveProvider();
    try {
      const data = await provider.update(table, values, filters, context);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this._normalizeError(error) };
    }
  }

  /**
   * Delete records.
   *
   * @param {string} table
   * @param {object} filters
   * @param {object} context
   * @returns {Promise<{ data: unknown, error: object|null }>}
   */
  async delete(table, filters = {}, context = {}) {
    const provider = this._resolveProvider();
    try {
      const data = await provider.delete(table, filters, context);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this._normalizeError(error) };
    }
  }

  /**
   * Establish connection.
   *
   * @param {object} context
   * @returns {Promise<{ data: null, error: object|null }>}
   */
  async connect(context = {}) {
    const provider = this._resolveProvider();
    try {
      await provider.connect(context);
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: this._normalizeError(error) };
    }
  }

  /**
   * Close connection.
   *
   * @param {object} context
   * @returns {Promise<{ data: null, error: object|null }>}
   */
  async disconnect(context = {}) {
    const provider = this._resolveProvider();
    try {
      await provider.disconnect(context);
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: this._normalizeError(error) };
    }
  }

  /**
   * Check provider health.
   *
   * @param {object} context
   * @returns {Promise<{ data: unknown, error: object|null }>}
   */
  async health(context = {}) {
    const provider = this._resolveProvider();
    try {
      const data = await provider.health(context);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: this._normalizeError(error) };
    }
  }
}

export { DatabaseAdapter };

export default new DatabaseAdapter();
