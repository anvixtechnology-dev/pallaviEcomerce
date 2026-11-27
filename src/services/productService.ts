import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit as limitTo,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { inferSpecTemplate } from "../lib/productSpecs";
import { slugify } from "../lib/utils";
import {
  EMPTY_PRODUCT_INPUT,
  type Product,
  type ProductFilters,
  type ProductInput,
  type ProductPatch,
} from "../types/product";

const productsCollection = collection(db, "products");

/** Customers may only read active products. Every customer-facing list must
 * include this filter or firestore.rules rejects the whole query. */
const isPublished = where("status", "==", "active");

const BATCH_LIMIT = 400;

interface LegacyProductFields {
  categoryId?: string;
  categoryName?: string;
  subcategory?: string;
  showOnCategoryPage?: boolean;
  featured?: boolean;
  showOnHomepage?: boolean;
}

function toProduct(snapshot: DocumentSnapshot): Product {
  const raw = (snapshot.data() ?? {}) as Partial<Product> & LegacyProductFields;
  const {
    categoryId: _categoryId,
    categoryName,
    subcategory: _subcategory,
    showOnCategoryPage: _showOnCategoryPage,
    featured: _featured,
    showOnHomepage: _showOnHomepage,
    ...data
  } = raw;
  const name = data.name ?? "";
  const description = data.description ?? "";

  return {
    ...EMPTY_PRODUCT_INPUT,
    ...data,
    id: snapshot.id,
    name,
    description,
    // Records saved before the pricing module were live and enquiry based.
    status: data.status ?? "active",
    specTemplate: data.specTemplate ?? inferSpecTemplate(categoryName ?? name),
    categorySpecs: data.categorySpecs ?? {},
    customSpecs: Array.isArray(data.customSpecs) ? data.customSpecs : [],
    additionalImages: Array.isArray(data.additionalImages) ? data.additionalImages : [],
    documents: Array.isArray(data.documents) ? data.documents : [],
    searchKeywords: Array.isArray(data.searchKeywords) ? data.searchKeywords : [],
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

function byNewest(a: Product, b: Product): number {
  const aTime = a.createdAt?.toMillis?.() ?? 0;
  const bTime = b.createdAt?.toMillis?.() ?? 0;
  return bTime - aTime;
}

/** Every product regardless of status. Admin only — denied for customers. */
export async function getProducts(): Promise<Product[]> {
  const snapshot = await getDocs(productsCollection);
  return snapshot.docs.map(toProduct).sort(byNewest);
}

/** Any product regardless of status. Admin only for unpublished products. */
export async function getProduct(productId: string): Promise<Product | null> {
  const snapshot = await getDoc(doc(db, "products", productId));
  if (!snapshot.exists()) return null;
  return toProduct(snapshot);
}

export async function getPublishedProducts(): Promise<Product[]> {
  const snapshot = await getDocs(query(productsCollection, isPublished));
  return snapshot.docs.map(toProduct).sort(byNewest);
}

/** Resolves a product page URL, which holds either a slug or a document id.
 * Returns null for anything customers may not see. */
export async function getPublishedProduct(slugOrId: string): Promise<Product | null> {
  if (!slugOrId) return null;

  const bySlug = await getDocs(query(productsCollection, isPublished, where("slug", "==", slugOrId), limitTo(1)));
  if (!bySlug.empty) return toProduct(bySlug.docs[0]);

  try {
    const product = await getProduct(slugOrId);
    return product?.status === "active" ? product : null;
  } catch (caught) {
    if ((caught as { code?: string }).code === "permission-denied") return null;
    throw caught;
  }
}

/** Reserves a document id, so files can be uploaded before the record exists. */
export function newProductId(): string {
  return doc(productsCollection).id;
}

export async function createProduct(productId: string, input: ProductInput): Promise<void> {
  await setDoc(doc(db, "products", productId), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
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

/** Adds a numeric suffix if another product already uses the slug. */
export async function resolveUniqueSlug(slug: string, excludeProductId?: string): Promise<string> {
  let candidate = slug;
  let suffix = 2;

  while (true) {
    const snapshot = await getDocs(query(productsCollection, where("slug", "==", candidate)));
    if (!snapshot.docs.some((item) => item.id !== excludeProductId)) return candidate;
    candidate = `${slug}-${suffix}`;
    suffix += 1;
  }
}

/** Gives records created before the pricing module their new fields. Their
 * existing content is left as it is. Returns how many records were updated. */
export async function migrateLegacyProducts(): Promise<number> {
  const snapshot = await getDocs(productsCollection);
  const legacy = snapshot.docs.filter((item) => item.data().status === undefined);
  const usedSlugs = new Set(snapshot.docs.map((item) => item.data().slug as string | undefined));

  for (let start = 0; start < legacy.length; start += BATCH_LIMIT) {
    const batch = writeBatch(db);

    for (const item of legacy.slice(start, start + BATCH_LIMIT)) {
      const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...product } = toProduct(item);

      const base = slugify(product.name) || item.id.toLowerCase();
      let slug = base;
      for (let suffix = 2; usedSlugs.has(slug); suffix += 1) slug = `${base}-${suffix}`;
      usedSlugs.add(slug);

      batch.update(item.ref, {
        ...product,
        slug,
        shortDescription: product.description.slice(0, 1000),
      });
    }

    await batch.commit();
  }

  return legacy.length;
}

/** Case-insensitive match across the fields a customer or admin might search by. */
export function matchesSearch(product: Product, term: string): boolean {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;

  const haystack = [
    product.name,
    product.brand,
    product.material,
    product.type,
    product.shortDescription,
    product.description,
    product.specifications,
    product.sizes,
    product.applications,
    ...Object.values(product.categorySpecs),
    ...product.customSpecs.flatMap((spec) => [spec.name, spec.value]),
    ...product.searchKeywords,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(needle);
}

export function filterProducts(products: Product[], filters: ProductFilters = {}): Product[] {
  const { search, availability, status, sort = "newest" } = filters;

  const result = products.filter((product) => {
    if (search && !matchesSearch(product, search)) return false;
    if (availability && availability !== "all" && product.availability !== availability) return false;
    if (status && status !== "all" && product.status !== status) return false;
    return true;
  });

  switch (sort) {
    case "name-asc":
      return result.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return result.sort((a, b) => b.name.localeCompare(a.name));
    case "oldest":
      return result.sort((a, b) => byNewest(b, a));
    default:
      return result.sort(byNewest);
  }
}
