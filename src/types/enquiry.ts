import type { Timestamp } from "firebase/firestore";

export type EnquiryStatus = "new" | "contacted" | "completed";

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  completed: "Completed",
};

/** "form" = website contact form, "whatsapp" = a tap on a WhatsApp button (no name/phone known). */
export type EnquirySource = "form" | "whatsapp";

export interface Enquiry {
  id: string;
  source: EnquirySource;
  /** Page the visitor was on when they tapped WhatsApp. */
  page?: string;
  name: string;
  phone: string;
  productId?: string;
  productName?: string;
  quantity?: string;
  message: string;
  status: EnquiryStatus;
  createdAt?: Timestamp | null;
}

export type EnquiryInput = Omit<Enquiry, "id" | "status" | "createdAt" | "source" | "page">;

export interface WhatsAppEnquiryInput {
  message: string;
  productId?: string;
  productName?: string;
  quantity?: string;
  page: string;
}

/** WhatsApp taps have no name — the visitor hasn't told us yet. */
export function displayName(enquiry: Enquiry): string {
  return enquiry.name || (enquiry.source === "whatsapp" ? "WhatsApp visitor" : "Unknown");
}
