import type { Timestamp } from "firebase/firestore";

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export type CategoryInput = Pick<Category, "name" | "description" | "imageUrl">;

export type CategoryPatch = Partial<CategoryInput>;
