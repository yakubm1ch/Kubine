import DatabaseProvider from "../../../contracts/DatabaseProvider.interface.js";
import { getSupabaseClient } from "../client/supabase.client.js";

class SupabaseProvider extends DatabaseProvider {

  /**
   * Initialize the lazy Supabase client.
   *
   * Client initialization means the SDK client is created from configured
   * credentials. This does not verify remote database connectivity — no
   * table is queried and no network request is made to the Supabase API.
   *
   * If the URL or anon key is missing, getSupabaseClient() throws and that
   * error propagates to the caller.
   *
   * @param {object} context
   * @returns {Promise<{ connected: boolean, context: object }>}
   */
  async connect(context = {}) {
    const client = getSupabaseClient();

    return { connected: true, context };
  }

  /**
   * Disconnect is a safe no-op.
   *
   * The Supabase JS client does not expose a conventional connection close
   * operation. The shared client instance is intentionally not destroyed or
   * reset, so subsequent operations continue to work without re-initialization.
   *
   * @param {object} context
   * @returns {Promise<{ disconnected: boolean, context: object }>}
   */
  async disconnect(context = {}) {
    return { disconnected: true, context };
  }

  /**
   * Check provider health.
   *
   * Verifies only that the Supabase client can be initialized from configured
   * credentials. Local client readiness is not described as verified remote
   * connectivity — no table is queried and no network request is made.
   *
   * @param {object} context
   * @returns {Promise<{ status: string, error: string|null, context: object }>}
   */
  async health(context = {}) {
    try {
      getSupabaseClient();

      return {
        status: "healthy",
        error: null,
        context,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message || String(error),
        context,
      };
    }
  }

  /**
   * Select records.
   *
   * Throws the SDK error when the query fails. Returns raw `data` on success.
   *
   * @param {string} table
   * @param {object|null|undefined} query - { columns, filters, order, limit, single }
   * @param {object} context
   * @returns {Promise<unknown>} Raw provider data.
   * @throws {Error} When the SDK query returns an error.
   */
  async select(table, query = {}, context = {}) {
    const normalizedQuery = this._normalizeQuery(query);
    const client = getSupabaseClient();
    let request = client.from(table).select(normalizedQuery.columns || "*");

    if (normalizedQuery.filters) {
      for (const [column, value] of Object.entries(normalizedQuery.filters)) {
        request = request.eq(column, value);
      }
    }

    if (normalizedQuery.order) {
      const column = normalizedQuery.order.column || "created_at";
      const ascending = normalizedQuery.order.ascending !== false;
      request = request.order(column, { ascending });
    }

    if (normalizedQuery.limit) {
      request = request.limit(normalizedQuery.limit);
    }

    if (normalizedQuery.single) {
      request = request.single();
    }

    const { data, error } = await request;

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Insert records.
   *
   * Throws the SDK error when the insert fails. Returns raw `data` on success.
   *
   * @param {string} table
   * @param {object|object[]} records
   * @param {object} context
   * @returns {Promise<unknown>} Raw provider data.
   * @throws {Error} When the SDK insert returns an error.
   */
  async insert(table, records, context = {}) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from(table)
      .insert(records)
      .select();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Update records.
   *
   * Throws the SDK error when the update fails. Returns raw `data` on success.
   *
   * @param {string} table
   * @param {object} values
   * @param {object|null|undefined} filters
   * @param {object} context
   * @returns {Promise<unknown>} Raw provider data.
   * @throws {Error} When the SDK update returns an error.
   */
  async update(table, values, filters = {}, context = {}) {
    const normalizedFilters = filters || {};
    const client = getSupabaseClient();
    let request = client.from(table).update(values);

    for (const [column, value] of Object.entries(normalizedFilters)) {
      request = request.eq(column, value);
    }

    const { data, error } = await request.select();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Delete records.
   *
   * Throws the SDK error when the delete fails. Returns raw `data` on success.
   *
   * @param {string} table
   * @param {object|null|undefined} filters
   * @param {object} context
   * @returns {Promise<unknown>} Raw provider data.
   * @throws {Error} When the SDK delete returns an error.
   */
  async delete(table, filters = {}, context = {}) {
    const normalizedFilters = filters || {};
    const client = getSupabaseClient();
    let request = client.from(table).delete();

    for (const [column, value] of Object.entries(normalizedFilters)) {
      request = request.eq(column, value);
    }

    const { data, error } = await request;

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Normalize a nullable query object into a safe defaults object.
   *
   * @param {object|null|undefined} query
   * @returns {object} A query object with all optional fields present.
   * @private
   */
  _normalizeQuery(query) {
    if (!query) {
      return {};
    }

    return {
      columns: query.columns || "*",
      filters: query.filters || {},
      order: query.order || null,
      limit: query.limit || null,
      single: query.single || false,
    };
  }

  getClient() {
    return getSupabaseClient();
  }

  getStorage() {
    return getSupabaseClient().storage;
  }

  getRealtime() {
    return getSupabaseClient();
  }

  getFunctions() {
    return getSupabaseClient().functions;
  }

}

export default new SupabaseProvider();
