import type { ProductInput } from "../types/product";

export type ProductErrors = Partial<Record<keyof ProductInput, string>>;

/** "draft" allows incomplete products; "publish" also requires what customers need to see. */
export type ValidationIntent = "draft" | "publish";

const SKU_PATTERN = /^[A-Z0-9][A-Z0-9_-]{1,63}$/;
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function isNonNegative(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

export function validateProduct(product: ProductInput, intent: ValidationIntent): ProductErrors {
  const errors: ProductErrors = {};

  const name = product.name.trim();
  if (name.length < 3) errors.name = "Product name must be at least 3 characters.";
  else if (name.length > 200) errors.name = "Product name must be 200 characters or fewer.";

  if (!SKU_PATTERN.test(product.sku)) {
    errors.sku = "SKU must be 2–64 characters: letters, numbers, hyphens or underscores.";
  }
  if (product.slug && !SLUG_PATTERN.test(product.slug)) {
    errors.slug = "Slug may only contain lowercase letters, numbers and single hyphens.";
  }
  if (product.shortDescription.length > 1000) errors.shortDescription = "Short description must be 1000 characters or fewer.";
  if (product.description.length > 20000) errors.description = "Description must be 20,000 characters or fewer.";

  if (!isNonNegative(product.mrp)) errors.mrp = "MRP cannot be negative.";
  if (!isNonNegative(product.sellingPrice)) errors.sellingPrice = "Selling price cannot be negative.";
  if (!isNonNegative(product.discountValue)) errors.discountValue = "Discount cannot be negative.";
  if (!Number.isFinite(product.gstRate) || product.gstRate < 0 || product.gstRate > 100) {
    errors.gstRate = "GST rate must be between 0 and 100.";
  }
  if (!Number.isFinite(product.minOrderQuantity) || product.minOrderQuantity <= 0) {
    errors.minOrderQuantity = "Minimum order quantity must be greater than zero.";
  }

  if (product.discountType !== "none" && !errors.discountValue && !errors.mrp) {
    if (product.mrp <= 0) errors.mrp = "Enter the MRP to apply a discount.";
    else if (product.discountType === "percentage" && product.discountValue > 100) {
      errors.discountValue = "Percentage discount cannot exceed 100.";
    } else if (product.discountType === "fixed" && product.discountValue > product.mrp) {
      errors.discountValue = "Discount cannot exceed the MRP.";
    }
  }
  if (!errors.mrp && !errors.sellingPrice && product.mrp > 0 && product.sellingPrice > product.mrp) {
    errors.sellingPrice = "Selling price cannot exceed the MRP.";
  }

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
    if (product.pricingMode !== "contact" && !errors.sellingPrice && product.sellingPrice <= 0) {
      errors.sellingPrice = "Enter a selling price, or set the display mode to Contact for Price.";
    }
  }

  return errors;
}
