import { supabase } from "../lib/supabase";

const TABLE = "portfolio_projects";

export async function getPortfolioProjects() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function getPortfolioProject(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

export async function createPortfolioProject(project) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(project)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updatePortfolioProject(id, project) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(project)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deletePortfolioProject(id) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id);

  if (error) throw error;

  return true;
}