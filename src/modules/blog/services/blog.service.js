import { supabase } from "../lib/supabase";

const TABLE = "blog_posts";

export async function getBlogPosts() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function getBlogPost(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

export async function createBlogPost(post) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(post)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateBlogPost(id, post) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(post)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteBlogPost(id) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
}