import { supabase } from "../lib/supabase";

const PRODUCT_BUCKET = "product-images";
const MEDIA_BUCKET = "media";

/*
 * Завантаження файлу
 */

export async function uploadImage(file) {

  const ext = file.name.split(".").pop();

  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(PRODUCT_BUCKET)
    .upload(fileName, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from(PRODUCT_BUCKET)
    .getPublicUrl(fileName);

  return data.publicUrl;

}

/*
 * Видалення файлу
 */

export async function deleteImage(url) {

  const fileName = url.split("/").pop();

  const { error } = await supabase.storage
    .from(PRODUCT_BUCKET)
    .remove([fileName]);

  if (error) throw error;

}

/*
 * Отримати Public URL для будь-якого файлу
 * із bucket "media"
 */

export function getStorageUrl(path) {

  if (!path) return "";

  const { data } = supabase.storage
    .from(MEDIA_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;

}