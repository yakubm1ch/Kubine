import { supabase } from "../lib/supabase";

const TABLE = "categories";

export async function getCategories() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;

  return data;
}

export async function getCategory(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

export async function createCategory(category) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(category)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateCategory(id, category) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(category)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteCategory(id) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
}