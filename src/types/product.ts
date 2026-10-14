import type { Timestamp } from "firebase/firestore";

export type Availability = "in-stock" | "limited" | "out-of-stock";

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  "in-stock": "In Stock",
  limited: "Limited Stock",
  "out-of-stock": "Out of Stock",
};

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  description: string;
  material: string;
  type: string;
  specifications: string;
  sizes: string;
  applications: string;
  imageUrl: string;
  additionalImages: string[];
  availability: Availability;
  featured: boolean;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

export type ProductPatch = Partial<ProductInput>;

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  availability?: Availability | "all";
  featuredOnly?: boolean;
  sort?: "newest" | "name-asc" | "name-desc";
}
