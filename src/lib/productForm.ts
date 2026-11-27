import {
  EMPTY_PRODUCT_INPUT,
  type Availability,
  type CustomSpec,
  type DiscountType,
  type PricingMode,
  type PricingUnit,
  type Product,
  type ProductInput,
  type ProductStatus,
  type SpecTemplateId,
} from "../types/product";
import { computeDiscountedPrice, deriveAvailability } from "./productPricing";
import { deriveSummaryFields, legacySpecsToForm, pickTemplateSpecs } from "./productSpecs";
import { slugify } from "./utils";

/** What the product form edits. Numbers stay as strings so a half-typed value
 * is not rewritten while the admin is typing. */
export interface ProductFormValues {
  name: string;
  slug: string;
  categoryId: string;
  subcategory: string;
  brand: string;
  shortDescription: string;
  description: string;
  status: ProductStatus;
  featured: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  categorySpecs: Record<string, string>;
  customSpecs: CustomSpec[];
  specifications: string;
  applications: string;
  mrp: string;
  sellingPrice: string;
  discountType: DiscountType;
  discountValue: string;
  pricingUnit: PricingUnit;
  minOrderQuantity: string;
  gstRate: string;
  pricingMode: PricingMode;
  trackInventory: boolean;
  availableQuantity: string;
  inventoryUnit: PricingUnit;
  lowStockThreshold: string;
  availability: Availability;
  allowBackorders: boolean;
  warehouseLocation: string;
  seoTitle: string;
  seoDescription: string;
  searchKeywords: string;
  showOnHomepage: boolean;
  showOnCategoryPage: boolean;
}

function numberToField(value: number): string {
  return value ? String(value) : "";
}

export function productToFormValues(product: ProductInput | Product): ProductFormValues {
  const { specs, customSpecs } = legacySpecsToForm(product as Product);

  return {
    name: product.name,
    slug: product.slug,
    categoryId: product.categoryId,
    subcategory: product.subcategory,
    brand: product.brand,
    shortDescription: product.shortDescription,
    description: product.description,
    status: product.status,
    featured: product.featured,
    newArrival: product.newArrival,
    bestSeller: product.bestSeller,
    categorySpecs: specs,
    customSpecs,
    specifications: product.specifications,
    applications: product.applications,
    mrp: numberToField(product.mrp),
    sellingPrice: numberToField(product.sellingPrice),
    discountType: product.discountType,
    discountValue: numberToField(product.discountValue),
    pricingUnit: product.pricingUnit,
    minOrderQuantity: String(product.minOrderQuantity),
    gstRate: String(product.gstRate),
    pricingMode: product.pricingMode,
    trackInventory: product.trackInventory,
    availableQuantity: numberToField(product.availableQuantity),
    inventoryUnit: product.inventoryUnit,
    lowStockThreshold: numberToField(product.lowStockThreshold),
    availability: product.availability,
    allowBackorders: product.allowBackorders,
    warehouseLocation: product.warehouseLocation,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    searchKeywords: product.searchKeywords.join(", "),
    showOnHomepage: product.showOnHomepage,
    showOnCategoryPage: product.showOnCategoryPage,
  };
}

export function emptyFormValues(): ProductFormValues {
  return productToFormValues(EMPTY_PRODUCT_INPUT);
}

function fieldToNumber(value: string): number {
  return value.trim() === "" ? 0 : Number(value);
}

/** Builds the record to store, excluding images and documents (added on save). */
export function formValuesToInput(
  values: ProductFormValues,
  category: { name: string; specTemplate: SpecTemplateId } | undefined,
  status: ProductStatus,
  fallbackTemplate: SpecTemplateId,
): ProductInput {
  const specTemplate = category?.specTemplate ?? fallbackTemplate;
  const categorySpecs = pickTemplateSpecs(specTemplate, values.categorySpecs);
  const customSpecs = values.customSpecs
    .map((spec) => ({ name: spec.name.trim(), value: spec.value.trim() }))
    .filter((spec) => spec.name || spec.value);

  const mrp = fieldToNumber(values.mrp);
  const discountValue = values.discountType === "none" ? 0 : fieldToNumber(values.discountValue);
  const sellingPrice =
    values.discountType === "none"
      ? fieldToNumber(values.sellingPrice)
      : computeDiscountedPrice(mrp, values.discountType, discountValue);

  const trackInventory = values.trackInventory;
  const availableQuantity = fieldToNumber(values.availableQuantity);
  const lowStockThreshold = fieldToNumber(values.lowStockThreshold);

  return {
    ...EMPTY_PRODUCT_INPUT,
    name: values.name.trim(),
    slug: slugify(values.slug || values.name),
    categoryId: values.categoryId,
    categoryName: category?.name ?? "",
    subcategory: values.subcategory,
    brand: values.brand.trim(),
    shortDescription: values.shortDescription.trim(),
    description: values.description.trim(),
    status,
    featured: values.featured,
    newArrival: values.newArrival,
    bestSeller: values.bestSeller,
    specTemplate,
    categorySpecs,
    customSpecs,
    ...deriveSummaryFields(categorySpecs, customSpecs),
    specifications: values.specifications.trim(),
    applications: values.applications.trim(),
    mrp,
    sellingPrice,
    discountType: values.discountType,
    discountValue,
    pricingUnit: values.pricingUnit,
    minOrderQuantity: fieldToNumber(values.minOrderQuantity),
    gstRate: fieldToNumber(values.gstRate),
    pricingMode: values.pricingMode,
    trackInventory,
    availableQuantity,
    inventoryUnit: values.inventoryUnit,
    lowStockThreshold,
    availability: deriveAvailability({
      trackInventory,
      availableQuantity,
      lowStockThreshold,
      availability: values.availability,
    }),
    allowBackorders: values.allowBackorders,
    warehouseLocation: values.warehouseLocation.trim(),
    seoTitle: values.seoTitle.trim(),
    seoDescription: values.seoDescription.trim(),
    searchKeywords: values.searchKeywords
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean),
    showOnHomepage: values.showOnHomepage,
    showOnCategoryPage: values.showOnCategoryPage,
  };
}
