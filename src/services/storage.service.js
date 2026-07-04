import { supabase } from "../lib/supabase";

const BUCKET = "product-images";

export async function uploadImage(file) {
  const ext = file.name.split(".").pop();

  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function deleteImage(url) {
  const fileName = url.split("/").pop();

  await supabase.storage
    .from(BUCKET)
    .remove([fileName]);
}