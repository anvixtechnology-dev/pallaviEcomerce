import { Timestamp } from "firebase/firestore";

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatTimestamp(value: Timestamp | null | undefined): string {
  if (!value) return "—";
  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value as unknown as string);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function truncate(text: string, max = 140): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const FIRESTORE_MESSAGES: Record<string, string> = {
  "permission-denied": "You do not have permission to perform this action.",
  unavailable: "Unable to reach the server. Please check your connection and try again.",
  "failed-precondition": "The operation could not be completed. Please refresh and try again.",
  "resource-exhausted": "Too many requests. Please wait a moment and try again.",
  deadline_exceeded: "The request timed out. Please check your connection and try again.",
  "not-found": "The requested record could not be found.",
  "already-exists": "This record already exists.",
  cancelled: "The request was cancelled. Please try again.",
  aborted: "The operation was aborted. Please try again.",
  internal: "Something went wrong on our side. Please try again.",
  "invalid-argument": "The provided information is not valid.",
  unauthenticated: "Please sign in to continue.",
  "too-many-requests": "Too many attempts. Please wait a while and try again.",
  "network-request-failed": "Network error. Please check your internet connection.",
  "storage/unknown": "The upload could not be completed. Please try again.",
  "storage/canceled": "The upload was cancelled.",
  "storage/unsupported": "This file type is not supported. Please upload an image.",
  "storage/quota-exceeded": "Storage limit reached. Please contact support.",
  "storage/retry-limit-exceeded": "The upload timed out. Please try again.",
  "storage/invalid-checksum": "The upload was corrupted. Please try again.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/missing-password": "Please enter your password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/too-many-requests": "Too many attempts. Please wait a while and try again.",
  "auth/user-disabled": "This account has been disabled. Please contact support.",
  "auth/network-request-failed": "Network error. Please check your internet connection.",
  "auth/internal-error": "Something went wrong. Please try again.",
};

function extractCode(error: unknown): string | null {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string") return code;
  }
  return null;
}

/** Converts any thrown error into a customer-friendly message. Raw Firebase
 * errors are never surfaced directly to end users. */
export function getErrorMessage(error: unknown): string {
  const code = extractCode(error);
  if (code && FIRESTORE_MESSAGES[code]) return FIRESTORE_MESSAGES[code];

  if (error instanceof Error && error.message) {
    const matched = Object.entries(FIRESTORE_MESSAGES).find(([key]) => error.message.includes(key));
    if (matched) return matched[1];
  }

  return "Something went wrong. Please try again.";
}

export function isLikelyImagePath(url: string): boolean {
  return typeof url === "string" && (url.startsWith("https://firebasestorage.googleapis.com") || url.startsWith("http"));
}
