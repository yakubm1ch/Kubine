import { createClient } from "@supabase/supabase-js";

import supabaseConfig from "../config/supabase.config.js";

const {

  url,

  anonKey

} = supabaseConfig;

if (!url) {

  throw new Error("Supabase URL is missing.");

}

if (!anonKey) {

  throw new Error("Supabase anonymous key is missing.");

}

export const supabaseClient = createClient(

  url,

  anonKey

);

export default supabaseClient;