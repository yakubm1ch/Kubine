/**

* Single authoritative source for the database provider name.
*
* Resolves the provider name from the Vite environment variable
* with a documented default. Both DatabaseAdapter and runtime.engine
* import from this module to guarantee consistent configuration.
*
* Missing configuration falls back to the documented default
* ("supabase") rather than throwing, since a valid default exists.
  */

export const databaseProviderName =
  import.meta.env?.VITE_DATABASE_PROVIDER || "supabase";

export function getDatabaseProviderName() {
  return databaseProviderName;
}
