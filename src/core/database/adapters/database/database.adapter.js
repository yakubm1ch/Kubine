import { providerEngine } from "@/core/database/engine/provider.engine.js";

const provider = providerEngine.getProvider("supabase");
const client = provider.getClient();

class DatabaseAdapter {
  async select(table, columns = "*", options = {}) {
    let request = client
      .from(table)
      .select(columns);

    if (options.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        request = request.eq(key, value);
      }
    }

    if (options.order) {
      request = request.order(
        options.order.column,
        {
          ascending: options.order.ascending ?? true,
        }
      );
    }

    if (options.limit !== undefined) {
      request = request.limit(options.limit);
    }

    if (options.single) {
      request = request.single();
    }

    return request;
  }

  async insert(table, payload, options = {}) {
    let request = client
      .from(table)
      .insert(payload);

    if (options.select !== false) {
      request = request.select();
    }

    if (options.single) {
      request = request.single();
    }

    return request;
  }

  async update(table, payload, filters = {}, options = {}) {
    let request = client
      .from(table)
      .update(payload);

    for (const [key, value] of Object.entries(filters)) {
      request = request.eq(key, value);
    }

    if (options.select !== false) {
      request = request.select();
    }

    if (options.single) {
      request = request.single();
    }

    return request;
  }

  async delete(table, filters = {}) {
    let request = client
      .from(table)
      .delete();

    for (const [key, value] of Object.entries(filters)) {
      request = request.eq(key, value);
    }

    return request;
  }

  getStorage() {
    return provider.getStorage();
  }
}

export default new DatabaseAdapter();