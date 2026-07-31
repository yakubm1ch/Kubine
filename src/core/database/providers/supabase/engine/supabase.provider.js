import client from "../client/supabase.client.js";

class SupabaseProvider {

  getClient() {
    return client;
  }

  getDatabase() {
    return client;
  }

  getStorage() {
    return client.storage;
  }

  getRealtime() {
    return client;
  }

  getFunctions() {
    return client.functions;
  }

}

export default new SupabaseProvider();