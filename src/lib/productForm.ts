import {
  EMPTY_PRODUCT_INPUT,
  type Availability,
  type CustomSpec,
  type Product,
  type ProductInput,
  type ProductStatus,
  type SpecTemplateId,
  type Unit,
} from "../types/product";
import { deriveAvailability } from "./productAvailability";
import { deriveSummaryFields, legacySpecsToForm, pickTemplateSpecs } from "./productSpecs";
import { slugify } from "./utils";

/** What the product form edits. Numbers stay as strings so a half-typed value
 * is not rewritten while the admin is typing. */
export interface ProductFormValues {
  name: string;
  slug: string;
  specTemplate: SpecTemplateId;
  brand: string;
  shortDescription: string;
  description: string;
  status: ProductStatus;
  newArrival: boolean;
  bestSeller: boolean;
  categorySpecs: Record<string, string>;
  customSpecs: CustomSpec[];
  specifications: string;
  applications: string;
  trackInventory: boolean;
  availableQuantity: string;
  inventoryUnit: Unit;
  lowStockThreshold: string;
  availability: Availability;
  allowBackorders: boolean;
  warehouseLocation: string;
  seoTitle: string;
  seoDescription: string;
  searchKeywords: string;
}

function numberToField(value: number): string {
  return value ? String(value) : "";
}

export function productToFormValues(product: ProductInput | Product): ProductFormValues {
  const { specs, customSpecs } = legacySpecsToForm(product as Product);

  return {
    name: product.name,
    slug: product.slug,
    specTemplate: product.specTemplate,
    brand: product.brand,
    shortDescription: product.shortDescription,
    description: product.description,
    status: product.status,
    newArrival: product.newArrival,
    bestSeller: product.bestSeller,
    categorySpecs: specs,
    customSpecs,
    specifications: product.specifications,
    applications: product.applications,
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
  };
}

export function emptyFormValues(): ProductFormValues {
  return productToFormValues(EMPTY_PRODUCT_INPUT);
}

function fieldToNumber(value: string): number {
  return value.trim() === "" ? 0 : Number(value);
}

/** Builds the record to store, excluding images and documents (added on save). */
export function formValuesToInput(values: ProductFormValues, status: ProductStatus): ProductInput {
  const specTemplate = values.specTemplate;
  const categorySpecs = pickTemplateSpecs(specTemplate, values.categorySpecs);
  const customSpecs = values.customSpecs
    .map((spec) => ({ name: spec.name.trim(), value: spec.value.trim() }))
    .filter((spec) => spec.name || spec.value);

  const trackInventory = values.trackInventory;
  const availableQuantity = fieldToNumber(values.availableQuantity);
  const lowStockThreshold = fieldToNumber(values.lowStockThreshold);

  return {
    ...EMPTY_PRODUCT_INPUT,
    name: values.name.trim(),
    slug: slugify(values.slug || values.name),
    brand: values.brand.trim(),
    shortDescription: values.shortDescription.trim(),
    description: values.description.trim(),
    status,
    newArrival: values.newArrival,
    bestSeller: values.bestSeller,
    specTemplate,
    categorySpecs,
    customSpecs,
    ...deriveSummaryFields(categorySpecs, customSpecs),
    specifications: values.specifications.trim(),
    applications: values.applications.trim(),
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
  };
}
