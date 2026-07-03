import { supabase } from "../lib/supabase";

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}