import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Enquiry, EnquiryInput, EnquiryStatus, WhatsAppEnquiryInput } from "../types/enquiry";

const enquiriesCollection = collection(db, "enquiries");

const VALID_STATUSES: EnquiryStatus[] = ["new", "contacted", "completed"];

function toEnquiry(id: string, data: Record<string, unknown>): Enquiry {
  return {
    id,
    source: data.source === "whatsapp" ? "whatsapp" : "form",
    page: (data.page as string) ?? "",
    name: (data.name as string) ?? "",
    phone: (data.phone as string) ?? "",
    productId: (data.productId as string) ?? "",
    productName: (data.productName as string) ?? "",
    quantity: (data.quantity as string) ?? "",
    message: (data.message as string) ?? "",
    status: VALID_STATUSES.includes(data.status as EnquiryStatus) ? (data.status as EnquiryStatus) : "new",
    createdAt: (data.createdAt as Enquiry["createdAt"]) ?? null,
  };
}

function byNewest(a: Enquiry, b: Enquiry): number {
  return (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0);
}

export async function createEnquiry(input: EnquiryInput): Promise<string> {
  const reference = await addDoc(enquiriesCollection, {
    name: input.name.trim(),
    phone: input.phone.trim(),
    productId: input.productId ?? "",
    productName: input.productName ?? "",
    quantity: input.quantity ?? "",
    message: input.message.trim(),
    status: "new" satisfies EnquiryStatus,
    createdAt: serverTimestamp(),
  });
  return reference.id;
}

/** Records a tap on a WhatsApp button. The customer's name and phone are unknown at this point. */
export async function createWhatsAppEnquiry(input: WhatsAppEnquiryInput): Promise<void> {
  await addDoc(enquiriesCollection, {
    source: "whatsapp",
    page: input.page.slice(0, 300),
    name: "",
    phone: "",
    productId: input.productId ?? "",
    productName: (input.productName ?? "").slice(0, 200),
    quantity: (input.quantity ?? "").slice(0, 100),
    message: input.message.slice(0, 2000),
    status: "new" satisfies EnquiryStatus,
    createdAt: serverTimestamp(),
  });
}

export async function getEnquiries(): Promise<Enquiry[]> {
  const snapshot = await getDocs(enquiriesCollection);
  return snapshot.docs.map((item) => toEnquiry(item.id, item.data())).sort(byNewest);
}

/** Live list of enquiries, newest first. Returns a function that stops listening. */
export function subscribeEnquiries(
  onChange: (enquiries: Enquiry[]) => void,
  onError: (error: Error) => void,
): () => void {
  return onSnapshot(
    enquiriesCollection,
    (snapshot) => onChange(snapshot.docs.map((item) => toEnquiry(item.id, item.data())).sort(byNewest)),
    onError,
  );
}

export async function getNewEnquiryCount(): Promise<number> {
  const snapshot = await getDocs(query(enquiriesCollection, where("status", "==", "new")));
  return snapshot.size;
}

export async function updateEnquiryStatus(enquiryId: string, status: EnquiryStatus): Promise<void> {
  await updateDoc(doc(db, "enquiries", enquiryId), { status });
}

export async function deleteEnquiry(enquiryId: string): Promise<void> {
  await deleteDoc(doc(db, "enquiries", enquiryId));
}
