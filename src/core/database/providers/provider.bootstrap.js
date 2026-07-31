import providerManager from "../engine/manager/provider.manager.js";
import supabaseProvider from "./supabase/engine/supabase.provider.js";

export function bootstrapProviders() {

  providerManager.register(
    "supabase",
    supabaseProvider
  );

  console.log(
    "Database providers initialized:",
    providerManager.providers
  );

}