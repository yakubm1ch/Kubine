import { supabase } from "../lib/supabase";

const TABLE = "site_settings";

export async function getSettings() {

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .limit(1)
    .single();

  if (error) throw error;

  return data;

}

export async function updateSettings(settings) {

  const { data, error } = await supabase
    .from(TABLE)
    .update(settings)
    .eq("id", settings.id)
    .select()
    .single();

  if (error) throw error;

  return data;

}