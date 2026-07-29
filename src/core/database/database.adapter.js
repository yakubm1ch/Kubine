import SupabaseProvider from "@/core/database/providers/supabase.provider";

const supabase = SupabaseProvider.getClient();

class DatabaseAdapter {
  async select(table, columns = "*", options = {}) {
    let request = supabase
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
    let request = supabase
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
    let request = supabase
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
    let request = supabase
      .from(table)
      .delete();

    for (const [key, value] of Object.entries(filters)) {
      request = request.eq(key, value);
    }

    return request;
  }

  getStorage() {
    return SupabaseProvider.getStorage();
  }
}

export default new DatabaseAdapter();