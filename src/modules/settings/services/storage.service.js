import { providerEngine } from "@/core/database/engine/provider.engine.js";

let storage = null;

function resolveStorage() {
  if (storage === null) {
    const provider = providerEngine.get("supabase");
    storage = provider.getStorage();
  }

  return storage;
}

const PRODUCT_BUCKET = "product-images";
const MEDIA_BUCKET = "media";


export async function uploadImage(file) {

  const storageClient = resolveStorage();

  const ext = file.name.split(".").pop();

  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${ext}`;

  const { error } = await storageClient
    .from(PRODUCT_BUCKET)
    .upload(fileName, file);

  if (error) throw error;

  const { data } = storageClient
    .from(PRODUCT_BUCKET)
    .getPublicUrl(fileName);

  return data.publicUrl;

}


export async function deleteImage(url) {

  const storageClient = resolveStorage();

  const fileName = url.split("/").pop();

  const { error } = await storageClient
    .from(MEDIA_BUCKET)
    .remove([fileName]);

  if (error) throw error;

}


export function getStorageUrl(path) {

  if (!path) return "";

  const storageClient = resolveStorage();

  const { data } = storageClient
    .from(MEDIA_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;

}