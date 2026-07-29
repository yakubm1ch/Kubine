import { SupabaseProvider } from "./providers/supabase.provider.js";

let provider = null;

export function getProvider() {

    if (!provider) {

        provider = new SupabaseProvider();

    }

    return provider;

}