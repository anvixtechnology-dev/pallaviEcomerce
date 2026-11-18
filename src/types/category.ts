import type { Timestamp } from "firebase/firestore";
import type { SpecTemplateId } from "./product";

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  subcategories: string[];
  specTemplate: SpecTemplateId;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export type CategoryInput = Pick<Category, "name" | "description" | "imageUrl" | "subcategories" | "specTemplate">;

export type CategoryPatch = Partial<CategoryInput>;
