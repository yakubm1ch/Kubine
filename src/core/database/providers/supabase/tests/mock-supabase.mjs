// Mock for @supabase/supabase-js used in SupabaseProvider tests.

export function createClient() {
  return mockClient;
}

const mockClient = {
  from() {
    return mockQueryBuilder;
  },

  get storage() {
    return mockStorage;
  },

  get functions() {
    return mockFunctions;
  },
};

const mockQueryBuilder = {
  select() {
    return mockQueryBuilder;
  },

  insert() {
    return mockQueryBuilder;
  },

  update() {
    return mockQueryBuilder;
  },

  delete() {
    return mockQueryBuilder;
  },

  eq() {
    return mockQueryBuilder;
  },

  order() {
    return mockQueryBuilder;
  },

  limit() {
    return mockQueryBuilder;
  },

  single() {
    return mockQueryBuilder;
  },

  async then(resolve) {
    resolve({ data: null, error: null });
  },
};

const mockStorage = {
  from() {
    return {
      async upload() {
        return { data: null, error: null };
      },
      async remove() {
        return { data: null, error: null };
      },
      async getPublicUrl() {
        return { data: { publicUrl: "" }, error: null };
      },
    };
  },
};

const mockFunctions = {};

export { mockClient, mockQueryBuilder };
