import { auth } from "../lib/firebase";
import { UserFacingError } from "../lib/utils";

/** All app images live under this Cloudinary folder. */
export const CLOUDINARY_ROOT = "pallavi";

const API_ENDPOINT = "/api/cloudinary";

interface SignedUpload {
  cloudName: string;
  apiKey: string;
  params: Record<string, string>;
  signature: string;
}

export class CloudinaryError extends UserFacingError {
  constructor(message: string) {
    super(message);
    this.name = "CloudinaryError";
  }
}

async function callApi<T>(body: Record<string, unknown>): Promise<T> {
  const user = auth.currentUser;
  if (!user) throw new CloudinaryError("Please sign in again to manage images.");
  const token = await user.getIdToken();

  let response: Response;
  try {
    response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  } catch {
    throw new CloudinaryError("Could not reach the image server. Check your connection and try again.");
  }

  const data = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!response.ok || !data) {
    throw new CloudinaryError(data?.error ?? "The image server is unavailable. Please try again.");
  }
  return data;
}

/** Uploads an image straight from the browser to Cloudinary using a
 * server-issued signature, and resolves to its HTTPS URL. */
export async function uploadToCloudinary(
  file: Blob,
  folder: string,
  options: { publicId?: string; onProgress?: (bytesTransferred: number) => void } = {},
): Promise<string> {
  const signed = await callApi<SignedUpload>({ action: "sign", folder, publicId: options.publicId });

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signed.apiKey);
  form.append("signature", signed.signature);
  for (const [key, value] of Object.entries(signed.params)) form.append(key, value);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`);
    xhr.upload.onprogress = (event) => options.onProgress?.(event.loaded);
    xhr.onerror = () => reject(new CloudinaryError("The upload failed. Check your connection and try again."));
    xhr.onload = () => {
      let result: { secure_url?: string; error?: { message?: string } } = {};
      try {
        result = JSON.parse(xhr.responseText);
      } catch {
        // Handled below.
      }
      if (xhr.status >= 200 && xhr.status < 300 && result.secure_url) {
        options.onProgress?.(file.size);
        resolve(result.secure_url);
      } else {
        reject(new CloudinaryError(result.error?.message ?? "The image could not be uploaded. Please try again."));
      }
    };
    xhr.send(form);
  });
}

export function isCloudinaryUrl(url: string): boolean {
  return /^https:\/\/res\.cloudinary\.com\//.test(url);
}

/** https://res.cloudinary.com/<cloud>/image/upload/v123/pallavi/products/abc/x.webp
 *  → pallavi/products/abc/x */
export function publicIdFromUrl(url: string): string | null {
  const match = url.match(/\/image\/upload\/(?:[^/]+\/)*?(?:v\d+\/)?(pallavi\/[^?#]+?)(?:\.[a-z0-9]+)?(?:[?#].*)?$/i);
  return match ? decodeURIComponent(match[1]) : null;
}

/** Deletes every image inside a folder such as `pallavi/products/{id}`. */
export async function deleteCloudinaryFolder(folder: string): Promise<void> {
  await callApi({ action: "delete", folder });
}

export async function deleteCloudinaryImageByUrl(url: string): Promise<void> {
  const publicId = publicIdFromUrl(url);
  if (!publicId) return;
  await callApi({ action: "delete", publicIds: [publicId] });
}
