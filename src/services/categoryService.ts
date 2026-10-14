import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { slugify } from "../lib/utils";
import type { Category, CategoryInput, CategoryPatch } from "../types/category";

const categoriesCollection = collection(db, "categories");

function toCategory(id: string, data: Record<string, unknown>): Category {
  return {
    id,
    name: (data.name as string) ?? "",
    description: (data.description as string) ?? "",
    imageUrl: (data.imageUrl as string) ?? "",
    createdAt: (data.createdAt as Category["createdAt"]) ?? null,
    updatedAt: (data.updatedAt as Category["updatedAt"]) ?? null,
  };
}

function byName(a: Category, b: Category): number {
  return a.name.localeCompare(b.name);
}

export async function getCategories(): Promise<Category[]> {
  const snapshot = await getDocs(categoriesCollection);
  return snapshot.docs.map((item) => toCategory(item.id, item.data())).sort(byName);
}

export async function getCategory(categoryId: string): Promise<Category | null> {
  const snapshot = await getDoc(doc(db, "categories", categoryId));
  if (!snapshot.exists()) return null;
  return toCategory(snapshot.id, snapshot.data());
}

/** Creates a category with a SEO friendly id derived from its name. */
export async function createCategory(input: CategoryInput): Promise<string> {
  const base = slugify(input.name) || "category";
  let candidate = base;
  let suffix = 2;

  // Avoid overwriting an existing category with the same name.
  while (true) {
    const existing = await getDoc(doc(db, "categories", candidate));
    if (!existing.exists()) break;
    candidate = `${base}-${suffix}`;
    suffix += 1;
    if (suffix > 50) {
      candidate = `${base}-${Date.now()}`;
      break;
    }
  }

  await setDoc(doc(db, "categories", candidate), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return candidate;
}

export async function updateCategory(categoryId: string, patch: CategoryPatch): Promise<void> {
  await updateDoc(doc(db, "categories", categoryId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await deleteDoc(doc(db, "categories", categoryId));
}
