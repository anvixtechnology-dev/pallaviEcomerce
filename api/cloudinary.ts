/**
 * Vercel serverless function: POST /api/cloudinary
 *
 * Keeps the Cloudinary API secret on the server. The browser calls this to
 *   - { action: "sign", folder, publicId? }  → signed params for a direct upload
 *   - { action: "delete", folder }           → remove every image in a folder
 *   - { action: "delete", publicIds }        → remove specific images
 *
 * Every request must carry `Authorization: Bearer <Firebase ID token>` for a
 * user listed in the Firestore `admins` collection.
 *
 * Required environment variables (Vercel → Project → Settings → Environment
 * Variables, or `.env.local` for local development):
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */
import { createHash } from "node:crypto";

const FIREBASE_PROJECT_ID = "pallaviecomerce";
const ROOT_FOLDER = "pallavi";
const FOLDER_PATTERN = new RegExp(`^${ROOT_FOLDER}/(products|categories)/[A-Za-z0-9_-]{1,128}$`);
const PUBLIC_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
const MAX_DELETE_IDS = 100;

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function getConfig(): CloudinaryConfig {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new HttpError(500, "Image uploads are not configured on the server.");
  }
  return { cloudName, apiKey, apiSecret };
}

function decodeTokenUid(token: string): string {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8")) as {
      user_id?: unknown;
      aud?: unknown;
    };
    if (payload.aud !== FIREBASE_PROJECT_ID || typeof payload.user_id !== "string" || !payload.user_id) {
      throw new Error("bad token");
    }
    return payload.user_id;
  } catch {
    throw new HttpError(401, "Please sign in again.");
  }
}

/**
 * Confirms the caller is an admin by reading their own `admins/{uid}` document
 * through the Firestore REST API *with their ID token*. Firestore verifies the
 * token's signature and expiry itself, and the security rules only let a user
 * read their own admin record, so a forged or expired token is rejected there.
 */
async function assertAdmin(request: Request): Promise<void> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) throw new HttpError(401, "Please sign in again.");

  const uid = decodeTokenUid(token);
  const url =
    `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}` +
    `/databases/(default)/documents/admins/${encodeURIComponent(uid)}`;
  const response = await fetch(url, { headers: { authorization: `Bearer ${token}` } });

  if (response.status === 401) throw new HttpError(401, "Please sign in again.");
  if (!response.ok) throw new HttpError(403, "Only admins can manage images.");
}

function sign(params: Record<string, string>, apiSecret: string): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(toSign + apiSecret).digest("hex");
}

function assertFolder(folder: unknown): string {
  if (typeof folder !== "string" || !FOLDER_PATTERN.test(folder)) {
    throw new HttpError(400, "Invalid upload folder.");
  }
  return folder;
}

function signUpload(body: Record<string, unknown>, config: CloudinaryConfig) {
  const params: Record<string, string> = {
    folder: assertFolder(body.folder),
    timestamp: String(Math.floor(Date.now() / 1000)),
  };

  if (body.publicId !== undefined) {
    if (typeof body.publicId !== "string" || !PUBLIC_ID_PATTERN.test(body.publicId)) {
      throw new HttpError(400, "Invalid image name.");
    }
    params.public_id = body.publicId;
    params.overwrite = "true";
    params.invalidate = "true";
  }

  return {
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    params,
    signature: sign(params, config.apiSecret),
  };
}

async function deleteImages(body: Record<string, unknown>, config: CloudinaryConfig) {
  const query = new URLSearchParams();

  if (body.folder !== undefined) {
    query.set("prefix", `${assertFolder(body.folder)}/`);
  } else if (Array.isArray(body.publicIds) && body.publicIds.length > 0 && body.publicIds.length <= MAX_DELETE_IDS) {
    for (const id of body.publicIds) {
      if (typeof id !== "string" || !id.startsWith(`${ROOT_FOLDER}/`) || id.includes("..")) {
        throw new HttpError(400, "Invalid image id.");
      }
      query.append("public_ids[]", id);
    }
  } else {
    throw new HttpError(400, "Nothing to delete.");
  }

  query.set("invalidate", "true");
  const auth = Buffer.from(`${config.apiKey}:${config.apiSecret}`).toString("base64");
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/resources/image/upload?${query.toString()}`,
    { method: "DELETE", headers: { authorization: `Basic ${auth}` } },
  );
  if (!response.ok) throw new HttpError(502, "Images could not be deleted.");
  return { deleted: true };
}

export async function POST(request: Request): Promise<Response> {
  try {
    const config = getConfig();
    await assertAdmin(request);

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body || typeof body !== "object") throw new HttpError(400, "Invalid request.");

    if (body.action === "sign") return json(signUpload(body, config));
    if (body.action === "delete") return json(await deleteImages(body, config));
    throw new HttpError(400, "Unknown action.");
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    console.error("cloudinary function failed", error);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
}
