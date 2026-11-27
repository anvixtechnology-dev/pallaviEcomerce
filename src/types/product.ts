import type { Timestamp } from "firebase/firestore";

export type Availability = "in-stock" | "limited" | "out-of-stock";

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  "in-stock": "In Stock",
  limited: "Low Stock",
  "out-of-stock": "Out of Stock",
};

/** Only "active" products are readable by customers (enforced in firestore.rules). */
export type ProductStatus = "draft" | "active" | "inactive";

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  draft: "Draft",
  active: "Active",
  inactive: "Inactive",
};

export type Unit = "piece" | "kg" | "ton" | "ft" | "meter" | "sheet" | "box" | "set";

export const UNIT_LABELS: Record<Unit, string> = {
  piece: "Piece",
  kg: "Kg",
  ton: "Ton",
  ft: "Ft",
  meter: "Meter",
  sheet: "Sheet",
  box: "Box",
  set: "Set",
};

/** Which group of specification fields a product uses. See lib/productSpecs.ts. */
export type SpecTemplateId = "pipes" | "roofing" | "reveting" | "hardware" | "scrap" | "custom";

export interface CustomSpec {
  name: string;
  value: string;
}

export type ProductDocumentKind = "specification" | "catalogue" | "technical";

export const DOCUMENT_KIND_LABELS: Record<ProductDocumentKind, string> = {
  specification: "Product Specification",
  catalogue: "Product Catalogue",
  technical: "Technical Document",
};

export interface ProductDocument {
  kind: ProductDocumentKind;
  name: string;
  url: string;
  size: number;
}

export interface Product {
  id: string;

  // Basic information
  name: string;
  slug: string;
  brand: string;
  shortDescription: string;
  /** Full description. */
  description: string;
  status: ProductStatus;
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;

  // Specifications
  specTemplate: SpecTemplateId;
  /** Values of the product's specification fields, keyed by field key. */
  categorySpecs: Record<string, string>;
  customSpecs: CustomSpec[];
  /** Summary fields derived from the specs, used by cards and search. */
  material: string;
  type: string;
  sizes: string;
  /** "Additional Specifications" free text. */
  specifications: string;
  applications: string;

  // Media. `imageUrl` is the main display image; the rest are in gallery order.
  imageUrl: string;
  additionalImages: string[];
  documents: ProductDocument[];

  // Inventory. `availability` is the stock status.
  trackInventory: boolean;
  availableQuantity: number;
  inventoryUnit: Unit;
  lowStockThreshold: number;
  availability: Availability;
  allowBackorders: boolean;
  warehouseLocation: string;

  // SEO and visibility
  seoTitle: string;
  seoDescription: string;
  searchKeywords: string[];
  showOnHomepage: boolean;

  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

export type ProductPatch = Partial<ProductInput>;

export type ProductSort = "newest" | "oldest" | "name-asc" | "name-desc";

export interface ProductFilters {
  search?: string;
  availability?: Availability | "all";
  status?: ProductStatus | "all";
  featuredOnly?: boolean;
  sort?: ProductSort;
}

/** Field values for a product before the admin has filled anything in. */
export const EMPTY_PRODUCT_INPUT: ProductInput = {
  name: "",
  slug: "",
  brand: "",
  shortDescription: "",
  description: "",
  status: "draft",
  featured: false,
  newArrival: false,
  bestSeller: false,
  specTemplate: "custom",
  categorySpecs: {},
  customSpecs: [],
  material: "",
  type: "",
  sizes: "",
  specifications: "",
  applications: "",
  imageUrl: "",
  additionalImages: [],
  documents: [],
  trackInventory: false,
  availableQuantity: 0,
  inventoryUnit: "piece",
  lowStockThreshold: 0,
  availability: "in-stock",
  allowBackorders: false,
  warehouseLocation: "",
  seoTitle: "",
  seoDescription: "",
  searchKeywords: [],
  showOnHomepage: true,
};
