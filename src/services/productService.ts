import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Product, ProductFilters, ProductInput, ProductPatch } from "../types/product";

const productsCollection = collection(db, "products");

function toProduct(snapshot: DocumentSnapshot): Product {
  const data = (snapshot.data() ?? {}) as Partial<Product>;

  return {
    id: snapshot.id,
    name: data.name ?? "",
    categoryId: data.categoryId ?? "",
    categoryName: data.categoryName ?? "",
    description: data.description ?? "",
    material: data.material ?? "",
    type: data.type ?? "",
    specifications: data.specifications ?? "",
    sizes: data.sizes ?? "",
    applications: data.applications ?? "",
    imageUrl: data.imageUrl ?? "",
    additionalImages: Array.isArray(data.additionalImages) ? data.additionalImages : [],
    availability: data.availability ?? "in-stock",
    featured: Boolean(data.featured),
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

function byNewest(a: Product, b: Product): number {
  const aTime = a.createdAt?.toMillis?.() ?? 0;
  const bTime = b.createdAt?.toMillis?.() ?? 0;
  return bTime - aTime;
}

export async function getProducts(): Promise<Product[]> {
  const snapshot = await getDocs(productsCollection);
  return snapshot.docs.map(toProduct).sort(byNewest);
}

export async function getProduct(productId: string): Promise<Product | null> {
  const snapshot = await getDoc(doc(db, "products", productId));
  if (!snapshot.exists()) return null;
  return toProduct(snapshot);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const snapshot = await getDocs(query(productsCollection, where("featured", "==", true)));
  return snapshot.docs
    .map(toProduct)
    .sort(byNewest)
    .slice(0, limit);
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const snapshot = await getDocs(query(productsCollection, where("categoryId", "==", categoryId)));
  return snapshot.docs.map(toProduct).sort(byNewest);
}

export async function addProduct(input: ProductInput): Promise<string> {
  const reference = await addDoc(productsCollection, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return reference.id;
}

export async function updateProduct(productId: string, patch: ProductPatch): Promise<void> {
  await updateDoc(doc(db, "products", productId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(productId: string): Promise<void> {
  await deleteDoc(doc(db, "products", productId));
}

/** Case-insensitive match across name, category, material, type, specs and sizes. */
export function matchesSearch(product: Product, term: string): boolean {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;

  const haystack = [
    product.name,
    product.categoryName,
    product.material,
    product.type,
    product.description,
    product.specifications,
    product.sizes,
    product.applications,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(needle);
}

export function filterProducts(products: Product[], filters: ProductFilters = {}): Product[] {
  const { search, categoryId, availability, featuredOnly, sort = "newest" } = filters;

  let result = products.filter((product) => {
    if (search && !matchesSearch(product, search)) return false;
    if (categoryId && product.categoryId !== categoryId) return false;
    if (availability && availability !== "all" && product.availability !== availability) return false;
    if (featuredOnly && !product.featured) return false;
    return true;
  });

  if (sort === "name-asc") {
    result = [...result].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "name-desc") {
    result = [...result].sort((a, b) => b.name.localeCompare(a.name));
  } else {
    result = [...result].sort(byNewest);
  }

  return result;
}
