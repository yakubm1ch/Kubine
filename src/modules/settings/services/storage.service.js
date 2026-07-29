import { getProvider } from "@/core/database/provider.engine";

const provider = getProvider();
const storage = provider.getStorage();

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

  const { error } = await storage
    .from(PRODUCT_BUCKET)
    .upload(fileName, file);

  if (error) throw error;

  const { data } = storage
    .from(PRODUCT_BUCKET)
    .getPublicUrl(fileName);

  return data.publicUrl;

}

/*
 * Видалення файлу
 */

export async function deleteImage(url) {

  const fileName = url.split("/").pop();

  const { error } = await storage
    .from(PRODUCT_BUCKET)
    .remove([fileName]);

  if (error) throw error;

}

/*
 * Public URL
 */

export function getStorageUrl(path) {

  if (!path) return "";

  const { data } = storage
    .from(MEDIA_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;

}