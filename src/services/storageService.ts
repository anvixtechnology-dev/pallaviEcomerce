import { deleteObject, getDownloadURL, listAll, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../lib/firebase";
import { UserFacingError } from "../lib/utils";
import {
  CLOUDINARY_ROOT,
  deleteCloudinaryFolder,
  deleteCloudinaryImageByUrl,
  isCloudinaryUrl,
  uploadToCloudinary,
} from "./cloudinaryService";
import type { ProductDocumentKind } from "../types/product";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
/** Larger originals are accepted because they are compressed before upload. */
export const MAX_SOURCE_IMAGE_SIZE = 15 * 1024 * 1024;
export const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const MAX_IMAGE_DIMENSION = 1600;
const IMAGE_QUALITY = 0.82;

export class StorageUploadError extends UserFacingError {
  constructor(message: string) {
    super(message);
    this.name = "StorageUploadError";
  }
}

export type UploadProgress = (bytesTransferred: number) => void;

function assertValidImage(file: File | Blob): void {
  if (!file.type.startsWith("image/")) {
    throw new StorageUploadError("Please select a valid image file (JPG, PNG or WebP).");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new StorageUploadError("Image must be 5 MB or smaller.");
  }
}

/** Returns a message when a product image cannot be accepted. */
export function getImageFileError(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return `${file.name}: only JPG, PNG or WebP images are allowed.`;
  if (file.size > MAX_SOURCE_IMAGE_SIZE) return `${file.name}: images must be 15 MB or smaller.`;
  return null;
}

/** Returns a message when a product document cannot be accepted. */
export function getDocumentFileError(file: File): string | null {
  if (file.type !== "application/pdf") return `${file.name}: only PDF documents are allowed.`;
  if (file.size > MAX_DOCUMENT_SIZE) return `${file.name}: documents must be 20 MB or smaller.`;
  return null;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** Resizes and re-encodes an image for the web. Falls back to the original when
 * the browser cannot process it or the result would not be smaller. */
export async function compressImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    // Browsers that cannot encode WebP return a PNG, so JPEG is the fallback.
    let blob = await canvasToBlob(canvas, "image/webp", IMAGE_QUALITY);
    if (!blob || blob.type !== "image/webp") {
      context.globalCompositeOperation = "destination-over";
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      blob = await canvasToBlob(canvas, "image/jpeg", IMAGE_QUALITY);
    }

    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

function uploadWithProgress(path: string, file: Blob, onProgress?: UploadProgress): Promise<string> {
  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(ref(storage, path), file, { contentType: file.type });
    task.on(
      "state_changed",
      (snapshot) => onProgress?.(snapshot.bytesTransferred),
      reject,
      () => {
        getDownloadURL(task.snapshot.ref).then(resolve, reject);
      },
    );
  });
}

function uniqueName(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Cloudinary: pallavi/products/{productId}/{unique} — names are unique so
 * replacing an image never changes a file that a saved product still points to. */
export function uploadProductImage(productId: string, image: Blob, onProgress?: UploadProgress): Promise<string> {
  assertValidImage(image);
  return uploadToCloudinary(image, `${CLOUDINARY_ROOT}/products/${productId}`, { onProgress });
}

/** products/{productId}/documents/{kind}-{unique}.pdf */
export function uploadProductDocument(
  productId: string,
  file: File,
  kind: ProductDocumentKind,
  onProgress?: UploadProgress,
): Promise<string> {
  const error = getDocumentFileError(file);
  if (error) throw new StorageUploadError(error);
  return uploadWithProgress(`products/${productId}/documents/${kind}-${uniqueName()}.pdf`, file, onProgress);
}

async function deleteFolderContents(folderRef: ReturnType<typeof ref>): Promise<void> {
  const result = await listAll(folderRef);
  await Promise.all(result.items.map((item) => deleteObject(item)));
  await Promise.all(result.prefixes.map(deleteFolderContents));
}

export async function deleteStorageFolder(folderPath: string): Promise<void> {
  try {
    await deleteFolderContents(ref(storage, folderPath));
  } catch {
    // Folder may not exist yet — safe to ignore.
  }
}

async function deleteCloudinaryFolderQuietly(folder: string): Promise<void> {
  try {
    await deleteCloudinaryFolder(folder);
  } catch {
    // Leftover images are harmless; never block the delete itself.
  }
}

/** Removes product images from Cloudinary plus documents (and any images
 * uploaded before the Cloudinary switch) from Firebase Storage. */
export async function deleteProductImages(productId: string): Promise<void> {
  await Promise.all([
    deleteCloudinaryFolderQuietly(`${CLOUDINARY_ROOT}/products/${productId}`),
    deleteStorageFolder(`products/${productId}`),
  ]);
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
  if (isCloudinaryUrl(url)) {
    await deleteCloudinaryImageByUrl(url).catch(() => undefined);
    return;
  }
  const path = storagePathFromUrl(url);
  if (!path) return;
  try {
    await deleteObject(ref(storage, path));
  } catch {
    // The file may already be gone.
  }
}
