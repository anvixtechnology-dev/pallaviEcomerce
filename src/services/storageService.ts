import { deleteObject, getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import { storage } from "../lib/firebase";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export class StorageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageUploadError";
  }
}

function assertValidImage(file: File): void {
  if (!file.type.startsWith("image/")) {
    throw new StorageUploadError("Please select a valid image file (JPG, PNG or WebP).");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new StorageUploadError("Image must be 5 MB or smaller.");
  }
}

async function uploadImage(path: string, file: File): Promise<string> {
  assertValidImage(file);
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(snapshot.ref);
}

/** products/{productId}/main-image.jpg */
export function uploadProductMainImage(productId: string, file: File): Promise<string> {
  return uploadImage(`products/${productId}/main-image.jpg`, file);
}

/** products/{productId}/image-{index}.jpg */
export function uploadProductAdditionalImage(productId: string, file: File, index: number): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  return uploadImage(`products/${productId}/image-${index}.${extension}`, file);
}

/** categories/{categoryId}/main-image.jpg */
export function uploadCategoryImage(categoryId: string, file: File): Promise<string> {
  return uploadImage(`categories/${categoryId}/main-image.jpg`, file);
}

export async function deleteStorageFolder(folderPath: string): Promise<void> {
  try {
    const folderRef = ref(storage, folderPath);
    const result = await listAll(folderRef);
    await Promise.all(result.items.map((item) => deleteObject(item)));
  } catch {
    // Folder may not exist yet — safe to ignore.
  }
}

export function deleteProductImages(productId: string): Promise<void> {
  return deleteStorageFolder(`products/${productId}`);
}

export function deleteCategoryImages(categoryId: string): Promise<void> {
  return deleteStorageFolder(`categories/${categoryId}`);
}

/** Extracts the storage object path from a Firebase download URL. */
export function storagePathFromUrl(url: string): string | null {
  try {
    const match = url.match(/\/o\/([^?]+)/);
    if (!match) return null;
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export async function deleteStorageFileByUrl(url: string): Promise<void> {
  const path = storagePathFromUrl(url);
  if (!path) return;
  try {
    await deleteObject(ref(storage, path));
  } catch {
    // The file may already be gone.
  }
}
