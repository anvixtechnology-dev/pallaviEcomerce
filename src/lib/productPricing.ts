import {
  PRICING_UNIT_LABELS,
  type Availability,
  type DiscountType,
  type Product,
} from "../types/product";

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Selling price after discount, never below zero. */
export function computeDiscountedPrice(mrp: number, discountType: DiscountType, discountValue: number): number {
  const discount = discountType === "percentage" ? (mrp * discountValue) / 100 : discountType === "fixed" ? discountValue : 0;
  return Math.max(0, roundMoney(mrp - discount));
}

export function formatPrice(value: number): string {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

type PricedProduct = Pick<Product, "mrp" | "sellingPrice" | "pricingMode" | "pricingUnit">;

/** What a customer sees for a product's price. `price` is null when the
 * selling price must stay hidden. */
export function getPriceDisplay(product: PricedProduct): {
  price: string | null;
  prefix: string;
  unit: string;
  mrp: string | null;
  discountPercent: number;
} {
  const unit = PRICING_UNIT_LABELS[product.pricingUnit];

  if (product.pricingMode === "contact" || product.sellingPrice <= 0) {
    return { price: null, prefix: "", unit, mrp: null, discountPercent: 0 };
  }

  const hasDiscount = product.mrp > product.sellingPrice;

  return {
    price: formatPrice(product.sellingPrice),
    prefix: product.pricingMode === "starting-from" ? "Starting from" : "",
    unit,
    mrp: hasDiscount ? formatPrice(product.mrp) : null,
    discountPercent: hasDiscount ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100) : 0,
  };
}

/** The only place GST is added to a price. Selling prices exclude GST, so any
 * order flow should call this once per line and never add GST again. */
export function computeOrderTotals(unitPrice: number, quantity: number, gstRate: number) {
  const subtotal = roundMoney(unitPrice * quantity);
  const gst = roundMoney((subtotal * gstRate) / 100);
  return { subtotal, gst, total: roundMoney(subtotal + gst) };
}

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
