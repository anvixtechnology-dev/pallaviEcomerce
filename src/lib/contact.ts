import { WHATSAPP_NUMBER } from "./whatsapp";

/**
 * Business contact details.
 * Placeholders are used where real information has not been provided yet —
 * replace them with the actual business details before going live.
 */
export const BUSINESS = {
  name: "PallaviTraders",
  tagline: "Quality Iron & Steel Materials for Every Construction Need",
  phone: "+91 XXXXX XXXXX",
  phoneDial: "+910000000000",
  whatsappNumber: WHATSAPP_NUMBER,
  whatsappDisplay: "+91 XXXXX XXXXX",
  email: "info@pallavitraders.com",
  address: "[Business Address Line], [City], [State] — [PIN Code]",
  hours: "Monday – Saturday | 9:00 AM – 6:00 PM",
  hoursShort: "Mon – Sat, 9 AM – 6 PM",
} as const;
