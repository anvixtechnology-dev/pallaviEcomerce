/**
 * Central WhatsApp configuration.
 * Update WHATSAPP_NUMBER once here — it is used across the whole application.
 * Format: country code + number, no "+" and no spaces (e.g. "919876543210").
 */
export const WHATSAPP_NUMBER = "91XXXXXXXXXX";

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

export function openWhatsApp(productName?: string): void {
  const message = productName ? buildProductMessage(productName) : buildGeneralMessage();
  window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
}

/** Opens WhatsApp with a message about the product and the customer's selection. */
export function openProductEnquiry(details: {
  name: string;
  sku: string;
  action: string;
  quantity?: string;
  size?: string;
}): void {
  const lines = [
    `Hello PallaviTraders, ${details.action}: ${details.name}${details.sku ? ` (SKU: ${details.sku})` : ""}.`,
    details.size ? `Size: ${details.size}` : "",
    details.quantity ? `Quantity: ${details.quantity}` : "",
  ].filter(Boolean);
  window.open(buildWhatsAppUrl(lines.join("\n")), "_blank", "noopener,noreferrer");
}

export function openWhatsAppChat(phoneNumber: string, message: string): void {
  const digits = phoneNumber.replace(/[^\d]/g, "");
  const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
