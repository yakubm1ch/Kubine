import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_ENGINE_SUPABASE_URL;
const key = import.meta.env.VITE_ENGINE_SUPABASE_ANON_KEY;

if (!url) {
  throw new Error("VITE_ENGINE_SUPABASE_URL is not defined");
}

if (!key) {
  throw new Error("VITE_ENGINE_SUPABASE_ANON_KEY is not defined");
}

const client = createClient(url, key);

export class SupabaseProvider {

  getClient() {
    return client;
  }

  getStorage() {
    return client.storage;
  }

}

export default new SupabaseProvider();