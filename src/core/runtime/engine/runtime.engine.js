import { providerEngine } from "../database/engine/provider.engine.js";

const providerName =
    import.meta.env.VITE_DATABASE_PROVIDER ||
    "supabase";

export const databaseRuntime = {

    provider: providerName,

    getProvider() {
        return providerEngine.getProvider(this.provider);
    }

};