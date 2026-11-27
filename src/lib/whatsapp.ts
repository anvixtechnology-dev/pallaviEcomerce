import { createWhatsAppEnquiry } from "../services/enquiryService";

/**
 * Central WhatsApp configuration.
 * Update WHATSAPP_NUMBER once here — it is used across the whole application.
 * Format: country code + number, no "+" and no spaces (e.g. "919876543210").
 */
export const WHATSAPP_NUMBER = "919963522888";

export const BUSINESS_NAME = "PallaviTraders";

export function buildProductMessage(productName: string): string {
  return `Hello PallaviTraders, I am interested in ${productName}.\nPlease provide the price, availability and specifications.`;
}

export function buildGeneralMessage(): string {
  return "Hello PallaviTraders, I would like to know more about your iron and steel materials.";
}

export function buildWhatsAppUrl(message?: string): string {
  const text = message ?? buildGeneralMessage();
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

// Same message tapped again within this window (double taps, coming back and
// tapping again) is logged only once.
const DUPLICATE_WINDOW_MS = 60_000;
const recentlyLogged = new Map<string, number>();

/**
 * Saves a WhatsApp button tap as an enquiry in the admin panel.
 * Runs in the background and never blocks or breaks opening WhatsApp.
 */
export function logWhatsAppEnquiry(details: {
  message?: string;
  productId?: string;
  productName?: string;
  quantity?: string;
} = {}): void {
  const message = details.message ?? buildGeneralMessage();
  const now = Date.now();
  const last = recentlyLogged.get(message);
  if (last && now - last < DUPLICATE_WINDOW_MS) return;
  recentlyLogged.set(message, now);

  createWhatsAppEnquiry({
    message,
    productId: details.productId,
    productName: details.productName,
    quantity: details.quantity,
    page: typeof window === "undefined" ? "" : window.location.pathname + window.location.search,
  }).catch((error) => {
    console.warn("Could not record WhatsApp enquiry", error);
  });
}

export function openWhatsApp(productName?: string): void {
  const message = productName ? buildProductMessage(productName) : buildGeneralMessage();
  window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
  logWhatsAppEnquiry({ message, productName });
}

/** Opens WhatsApp with a message about the product and the customer's selection. */
export function openProductEnquiry(details: {
  productId?: string;
  name: string;
  action: string;
  quantity?: string;
  size?: string;
}): void {
  const lines = [
    `Hello PallaviTraders, ${details.action}: ${details.name}.`,
    details.size ? `Size: ${details.size}` : "",
    details.quantity ? `Quantity: ${details.quantity}` : "",
  ].filter(Boolean);
  const message = lines.join("\n");
  window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
  logWhatsAppEnquiry({
    message,
    productId: details.productId,
    productName: details.name,
    quantity: details.quantity,
  });
}

/** Admin side: opens a chat with a customer. Not logged as an enquiry. */
export function openWhatsAppChat(phoneNumber: string, message: string): void {
  let digits = phoneNumber.replace(/[^\d]/g, "");
  // Customers usually type a local Indian number ("98765 43210" or "098765 43210").
  // wa.me needs the country code, otherwise it opens a chat with the wrong number.
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 10) digits = `91${digits}`;
  const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
