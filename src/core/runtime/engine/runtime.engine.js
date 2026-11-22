import { providerEngine } from "../database/engine/provider.engine.js";
import { databaseProviderName } from "../../config/database.config";

export const databaseRuntime = {

    provider: databaseProviderName,

    getProvider() {
        return providerEngine.get(this.provider);
    }

};