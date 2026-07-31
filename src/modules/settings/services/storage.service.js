import { providerEngine } from "@/core/database/engine/provider.engine.js";

const provider = providerEngine.getProvider("supabase");

const storage = provider.getStorage();

const PRODUCT_BUCKET = "product-images";
const MEDIA_BUCKET = "media";


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


export async function deleteImage(url) {

  const fileName = url.split("/").pop();

  const { error } = await storage
    .from(PRODUCT_BUCKET)
    .remove([fileName]);

  if (error) throw error;

}


export function getStorageUrl(path) {

  if (!path) return "";

  const { data } = storage
    .from(MEDIA_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;

}