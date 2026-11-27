import type { ProductInput } from "../types/product";

export type ProductErrors = Partial<Record<keyof ProductInput, string>>;

/** "draft" allows incomplete products; "publish" also requires what customers need to see. */
export type ValidationIntent = "draft" | "publish";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function isNonNegative(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

export function validateProduct(product: ProductInput, intent: ValidationIntent): ProductErrors {
  const errors: ProductErrors = {};

  const name = product.name.trim();
  if (name.length < 3) errors.name = "Product name must be at least 3 characters.";
  else if (name.length > 200) errors.name = "Product name must be 200 characters or fewer.";

  if (product.slug && !SLUG_PATTERN.test(product.slug)) {
    errors.slug = "Slug may only contain lowercase letters, numbers and single hyphens.";
  }
  if (product.shortDescription.length > 1000) errors.shortDescription = "Short description must be 1000 characters or fewer.";
  if (product.description.length > 20000) errors.description = "Description must be 20,000 characters or fewer.";

  if (!isNonNegative(product.availableQuantity)) errors.availableQuantity = "Quantity cannot be negative.";
  if (!isNonNegative(product.lowStockThreshold)) errors.lowStockThreshold = "Threshold cannot be negative.";

  if (product.customSpecs.some((spec) => !spec.name.trim() || !spec.value.trim())) {
    errors.customSpecs = "Every custom specification needs both a name and a value.";
  }

  if (intent === "publish") {
    if (!product.categoryId) errors.categoryId = "Please select a category.";

    if (product.description.trim().length < 10 && product.shortDescription.trim().length < 10) {
      errors.description = "Add a description of at least 10 characters.";
    }
  }

  return errors;
}
