import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Enquiry, EnquiryInput, EnquiryStatus } from "../types/enquiry";

const enquiriesCollection = collection(db, "enquiries");

function toEnquiry(id: string, data: Record<string, unknown>): Enquiry {
  return {
    id,
    name: (data.name as string) ?? "",
    phone: (data.phone as string) ?? "",
    productId: (data.productId as string) ?? "",
    productName: (data.productName as string) ?? "",
    quantity: (data.quantity as string) ?? "",
    message: (data.message as string) ?? "",
    status: ((data.status as EnquiryStatus) ?? "new") as EnquiryStatus,
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

export async function getEnquiries(): Promise<Enquiry[]> {
  const snapshot = await getDocs(enquiriesCollection);
  return snapshot.docs.map((item) => toEnquiry(item.id, item.data())).sort(byNewest);
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
