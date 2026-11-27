import type { Availability, Product } from "../types/product";

/** Stock status when inventory is tracked; otherwise the admin's manual choice. */
export function deriveAvailability(
  product: Pick<Product, "trackInventory" | "availableQuantity" | "lowStockThreshold" | "availability">,
): Availability {
  if (!product.trackInventory) return product.availability;
  if (product.availableQuantity <= 0) return "out-of-stock";
  if (product.availableQuantity <= product.lowStockThreshold) return "limited";
  return "in-stock";
}

export function canOrder(product: Pick<Product, "availability" | "allowBackorders">): boolean {
  return product.availability !== "out-of-stock" || product.allowBackorders;
}
