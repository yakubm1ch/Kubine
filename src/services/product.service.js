import { supabase } from "../lib/supabase";

const TABLE = "products";

export async function getProducts() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("create_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function getProduct(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

export async function createProduct(product) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(product)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateProduct(id, product) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(product)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteProduct(id) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
}