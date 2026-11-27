import type { CustomSpec, Product, SpecTemplateId } from "../types/product";

export interface SpecField {
  key: string;
  label: string;
  /** "combo" is a dropdown that also accepts a typed custom value. */
  input: "text" | "number" | "select" | "combo";
  options?: string[];
  unit?: string;
  /** Stored on the product itself rather than in categorySpecs, so the field
   * stays in sync with the matching field elsewhere on the form. */
  linkedTo?: "brand";
}

const PIPE_SIZES = [
  "1/2 inch",
  "3/4 inch",
  "1 inch",
  "1.25 inch",
  "1.5 inch",
  "2 inch",
  "2.5 inch",
  "3 inch",
  "4 inch",
  "20x20 mm",
  "25x25 mm",
  "40x40 mm",
  "50x50 mm",
  "40x20 mm",
  "60x40 mm",
  "80x40 mm",
  "100x50 mm",
];

const thickness: SpecField = { key: "thickness", label: "Thickness", input: "number", unit: "mm" };
const lengthFt: SpecField = { key: "length", label: "Length", input: "number", unit: "Ft" };
const widthFt: SpecField = { key: "width", label: "Width", input: "number", unit: "Ft" };
const weightKg: SpecField = { key: "weight", label: "Weight", input: "number", unit: "Kg" };
const material: SpecField = { key: "material", label: "Material", input: "text" };
const coating: SpecField = { key: "coating", label: "Coating / Finish", input: "text" };
const brand: SpecField = { key: "brand", label: "Brand", input: "text", linkedTo: "brand" };

export const SPEC_TEMPLATES: Record<SpecTemplateId, { label: string; fields: SpecField[] }> = {
  pipes: {
    label: "Pipes (G.I. / M.S.)",
    fields: [
      { key: "pipeType", label: "Pipe Type", input: "select", options: ["Round Pipe", "Box Pipe"] },
      { key: "size", label: "Size", input: "combo", options: PIPE_SIZES },
      thickness,
      lengthFt,
      { key: "weight", label: "Weight per Piece", input: "number", unit: "Kg" },
      { key: "material", label: "Material", input: "select", options: ["GI", "MS"] },
      { key: "coating", label: "Finish / Coating", input: "text" },
    ],
  },
  roofing: {
    label: "Roofing Sheets",
    fields: [
      { key: "sheetType", label: "Sheet Type", input: "text" },
      { key: "sheetProfile", label: "Sheet Profile", input: "text" },
      material,
      thickness,
      lengthFt,
      widthFt,
      weightKg,
      { key: "colour", label: "Colour", input: "text" },
      coating,
    ],
  },
  reveting: {
    label: "Tata Reveting Sheets",
    fields: [
      { key: "productType", label: "Product Type", input: "text" },
      brand,
      thickness,
      lengthFt,
      widthFt,
      weightKg,
      material,
      coating,
    ],
  },
  hardware: {
    label: "Hardware",
    fields: [
      { key: "hardwareType", label: "Hardware Type", input: "text" },
      { key: "productSize", label: "Product Size", input: "text" },
      material,
      brand,
      { key: "weight", label: "Weight (if applicable)", input: "number", unit: "Kg" },
      { key: "unit", label: "Unit of Measurement", input: "select", options: ["Piece", "Kg", "Box", "Set"] },
    ],
  },
  scrap: {
    label: "Iron Scrap",
    fields: [
      { key: "scrapType", label: "Scrap Type", input: "text" },
      material,
      { key: "grade", label: "Grade / Quality", input: "text" },
      { key: "weight", label: "Weight", input: "number" },
      { key: "unit", label: "Unit", input: "select", options: ["Kg", "Ton"] },
    ],
  },
  custom: {
    label: "Custom specifications only",
    fields: [],
  },
};

export const SPEC_TEMPLATE_IDS = Object.keys(SPEC_TEMPLATES) as SpecTemplateId[];

/** Picks the spec template for a category from its name, e.g. for categories
 * that existed before templates were introduced. */
export function inferSpecTemplate(categoryName: string): SpecTemplateId {
  const name = categoryName.toLowerCase();
  if (name.includes("pipe")) return "pipes";
  if (name.includes("roof")) return "roofing";
  if (name.includes("revet") || name.includes("rivet")) return "reveting";
  if (name.includes("hardware")) return "hardware";
  if (name.includes("scrap")) return "scrap";
  return "custom";
}

/** "G.I. Pipes" and "GI Pipes" are the same category. */
export function normalizeCategoryName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Pre-selects GI or MS when a pipe category is chosen. */
export function defaultPipeMaterial(categoryName: string): string {
  const name = normalizeCategoryName(categoryName);
  if (name.startsWith("gi")) return "GI";
  if (name.startsWith("ms")) return "MS";
  return "";
}

/** Keeps only the values belonging to the template, so switching category
 * does not leave stale attributes behind. */
export function pickTemplateSpecs(template: SpecTemplateId, specs: Record<string, string>): Record<string, string> {
  const picked: Record<string, string> = {};
  for (const field of SPEC_TEMPLATES[template].fields) {
    const value = specs[field.key]?.trim();
    if (value && !field.linkedTo) picked[field.key] = value;
  }
  return picked;
}

function findCustomSpec(specs: CustomSpec[], ...names: string[]): string {
  const match = specs.find((spec) => names.includes(spec.name.trim().toLowerCase()));
  return match?.value.trim() ?? "";
}

/** Fills the summary fields shown on product cards and matched by search. */
export function deriveSummaryFields(
  specs: Record<string, string>,
  customSpecs: CustomSpec[],
): Pick<Product, "material" | "type" | "sizes"> {
  return {
    material: specs.material || findCustomSpec(customSpecs, "material"),
    type:
      specs.pipeType ||
      specs.sheetType ||
      specs.productType ||
      specs.hardwareType ||
      specs.scrapType ||
      findCustomSpec(customSpecs, "type"),
    sizes: specs.size || specs.productSize || findCustomSpec(customSpecs, "size", "sizes", "available sizes"),
  };
}

/** Maps a product's specs onto the form. Products created before templates
 * existed only have the summary fields, so those are carried across. */
export function legacySpecsToForm(product: Product): { specs: Record<string, string>; customSpecs: CustomSpec[] } {
  const hasNewSpecs = Object.keys(product.categorySpecs).length > 0 || product.customSpecs.length > 0;
  if (hasNewSpecs) return { specs: { ...product.categorySpecs }, customSpecs: product.customSpecs.map((spec) => ({ ...spec })) };

  const keys = new Set(SPEC_TEMPLATES[product.specTemplate].fields.map((field) => field.key));
  const typeKey = ["pipeType", "sheetType", "productType", "hardwareType", "scrapType"].find((key) => keys.has(key));
  const sizeKey = ["size", "productSize"].find((key) => keys.has(key));

  const specs: Record<string, string> = {};
  const customSpecs: CustomSpec[] = [];

  const assign = (value: string, key: string | undefined, label: string) => {
    if (!value) return;
    if (key) specs[key] = value;
    else customSpecs.push({ name: label, value });
  };

  assign(product.material, keys.has("material") ? "material" : undefined, "Material");
  assign(product.type, typeKey, "Type");
  assign(product.sizes, sizeKey, "Available Sizes");

  return { specs, customSpecs };
}

export interface SpecRow {
  label: string;
  value: string;
}

/** The specification rows customers see on the product page. */
export function getSpecRows(product: Pick<Product, "specTemplate" | "categorySpecs" | "customSpecs" | "material" | "sizes" | "type" | "specifications" | "applications">): SpecRow[] {
  const rows: SpecRow[] = [];

  for (const field of SPEC_TEMPLATES[product.specTemplate].fields) {
    const value = product.categorySpecs[field.key];
    if (value) rows.push({ label: field.label, value: field.unit ? `${value} ${field.unit}` : value });
  }
  for (const spec of product.customSpecs) {
    rows.push({ label: spec.name, value: spec.value });
  }

  // Products saved before templates existed only have the summary fields.
  if (rows.length === 0) {
    if (product.type) rows.push({ label: "Type", value: product.type });
    if (product.material) rows.push({ label: "Material", value: product.material });
    if (product.sizes) rows.push({ label: "Available Sizes", value: product.sizes });
  }

  if (product.specifications) rows.push({ label: "Additional Specifications", value: product.specifications });
  if (product.applications) rows.push({ label: "Applications", value: product.applications });

  return rows;
}

/** Sizes a customer can choose from, when the product lists several. */
export function getSizeOptions(sizes: string): string[] {
  return sizes
    .split(",")
    .map((size) => size.trim())
    .filter(Boolean);
}
