import { supabase } from "../lib/supabase";

const TABLE = "site_settings";

export async function getSettings() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*");

  if (error) throw error;

  return data;
}

export async function updateSetting(key, value) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ value })
    .eq("key", key)
    .select()
    .single();

  if (error) throw error;

  return data;
}