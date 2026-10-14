import type { Timestamp } from "firebase/firestore";

export type EnquiryStatus = "new" | "contacted" | "completed";

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  completed: "Completed",
};

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  productId?: string;
  productName?: string;
  quantity?: string;
  message: string;
  status: EnquiryStatus;
  createdAt?: Timestamp | null;
}

export type EnquiryInput = Omit<Enquiry, "id" | "status" | "createdAt">;
