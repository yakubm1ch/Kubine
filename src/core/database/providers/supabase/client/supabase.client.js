import { createClient } from "@supabase/supabase-js";

import supabaseConfig from "../config/supabase.config.js";

const { url, anonKey } = supabaseConfig;

let client = null;

export function getSupabaseClient() {
  if (client === null) {
    if (!url) {
      throw new Error("Supabase URL is missing.");
    }

    if (!anonKey) {
      throw new Error("Supabase anonymous key is missing.");
    }

    client = createClient(url, anonKey);
  }

  return client;
}

export function resetSupabaseClient() {
  client = null;
}

export function setSupabaseClient(mockClient) {
  client = mockClient;
}

export default {
  getClient: getSupabaseClient,
  reset: resetSupabaseClient,
};
