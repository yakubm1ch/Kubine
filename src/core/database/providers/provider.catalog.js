import SupabaseProvider from "./supabase/engine/supabase.provider.js";

const supportedProviderDefinitions = new Map([
  ["supabase", SupabaseProvider],
]);

export function resolveProviderDefinition(name) {
  if (typeof name !== "string" || name.trim() === "") {
    throw new TypeError("Provider name must be a non-empty string.");
  }

  const normalizedName = name.trim();
  const definition = supportedProviderDefinitions.get(normalizedName);

  if (!definition) {
    const supported = [...supportedProviderDefinitions.keys()].join(", ");
    throw new Error(
      `Unsupported database provider "${normalizedName}". Supported providers: ${supported}.`
    );
  }

  return definition;
}

export function getSupportedProviderNames() {
  return [...supportedProviderDefinitions.keys()];
}

export default {
  resolve: resolveProviderDefinition,
  names: getSupportedProviderNames,
};
