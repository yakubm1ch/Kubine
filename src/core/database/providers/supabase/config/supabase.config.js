export const supabaseConfig = {

  url: import.meta.env?.VITE_ENGINE_SUPABASE_URL ?? null,

  anonKey: import.meta.env?.VITE_ENGINE_SUPABASE_ANON_KEY ?? null,

};

export default supabaseConfig;
