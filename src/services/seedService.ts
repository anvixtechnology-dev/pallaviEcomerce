import { inferSpecTemplate } from "../lib/productSpecs";
import { slugify } from "../lib/utils";
import { EMPTY_PRODUCT_INPUT } from "../types/product";
import { addProduct, getProducts } from "./productService";

interface SampleProduct {
  name: string;
  description: string;
  material: string;
  type: string;
  specifications: string;
  sizes: string;
  applications: string;
  availability: "in-stock" | "limited" | "out-of-stock";
}

export const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    name: "Fe 500 TMT Bar",
    description: "Fe 500 grade TMT reinforcement bar with uniform rib pattern for strong bonding with concrete.",
    material: "TMT Steel",
    type: "TMT Bar",
    specifications: "Fe 500 grade, high tensile strength, corrosion resistant coating, uniform ribs",
    sizes: "8mm, 10mm, 12mm, 16mm, 20mm, 25mm",
    applications: "RCC columns, beams, slabs, foundations and general concrete reinforcement",
    availability: "in-stock",
  },
  {
    name: "Fe 500D TMT Bar",
    description: "Fe 500D ductile TMT bar designed for earthquake resistant structures with higher elongation.",
    material: "TMT Steel",
    type: "TMT Bar",
    specifications: "Fe 500D grade, superior ductility, high elongation, bend and re-bend test compliant",
    sizes: "8mm, 10mm, 12mm, 16mm, 20mm, 25mm",
    applications: "High rise buildings, bridges, seismic zones and critical RCC work",
    availability: "in-stock",
  },
  {
    name: "MS Angle 25x25",
    description: "Equal leg mild steel angle for light fabrication, supports and brackets.",
    material: "Mild Steel",
    type: "Equal Angle",
    specifications: "25 x 25 mm legs, hot rolled, standard length",
    sizes: "25x25x3mm, 25x25x4mm, 25x25x5mm",
    applications: "Light fabrication, window frames, supports and brackets",
    availability: "in-stock",
  },
  {
    name: "MS Angle 40x40",
    description: "Equal leg mild steel angle widely used for frames, gates and structural supports.",
    material: "Mild Steel",
    type: "Equal Angle",
    specifications: "40 x 40 mm legs, hot rolled, standard length",
    sizes: "40x40x3mm, 40x40x4mm, 40x40x5mm, 40x40x6mm",
    applications: "Frames, gates, shelving, standees and general fabrication",
    availability: "in-stock",
  },
  {
    name: "MS Angle 50x50",
    description: "High quality mild steel angle suitable for construction and fabrication work.",
    material: "Mild Steel",
    type: "Equal Angle",
    specifications: "50 x 50 mm legs, hot rolled, IS:2062 grade",
    sizes: "50x50x4mm, 50x50x5mm, 50x50x6mm, 50x50x8mm",
    applications: "Structural supports, trusses, fabrication and industrial frames",
    availability: "in-stock",
  },
  {
    name: "MS Angle 65x65",
    description: "Heavy duty equal leg mild steel angle for structural and industrial applications.",
    material: "Mild Steel",
    type: "Equal Angle",
    specifications: "65 x 65 mm legs, hot rolled, IS:2062 grade",
    sizes: "65x65x5mm, 65x65x6mm, 65x65x8mm",
    applications: "Industrial structures, towers, heavy supports and fabrication",
    availability: "limited",
  },
  {
    name: "MS Channel 75",
    description: "Mild steel channel for framing, panel supports and light structural work.",
    material: "Mild Steel",
    type: "ISMC Channel",
    specifications: "75 mm depth, hot rolled, ISMC profile",
    sizes: "ISMC 75",
    applications: "Framing, panel supports, shutters and light structural work",
    availability: "in-stock",
  },
  {
    name: "MS Channel 100",
    description: "Mild steel channel commonly used in construction and fabrication projects.",
    material: "Mild Steel",
    type: "ISMC Channel",
    specifications: "100 mm depth, hot rolled, ISMC profile",
    sizes: "ISMC 100",
    applications: "Construction framing, equipment stands and fabrication",
    availability: "in-stock",
  },
  {
    name: "MS Channel 125",
    description: "Heavy mild steel channel for structural framing and industrial applications.",
    material: "Mild Steel",
    type: "ISMC Channel",
    specifications: "125 mm depth, hot rolled, ISMC profile",
    sizes: "ISMC 125",
    applications: "Structural framing, platforms and heavy fabrication",
    availability: "in-stock",
  },
  {
    name: "MS Plate 3mm",
    description: "Mild steel plate for sheet metal work, covers and light fabrication.",
    material: "Mild Steel",
    type: "Hot Rolled Plate",
    specifications: "3 mm thickness, IS:2062 grade, sheet sizes available",
    sizes: "1250 x 2500 mm, 1220 x 2440 mm",
    applications: "Sheet metal work, covers, ducts and light fabrication",
    availability: "in-stock",
  },
  {
    name: "MS Plate 5mm",
    description: "Mild steel plate for general fabrication, base plates and engineering work.",
    material: "Mild Steel",
    type: "Hot Rolled Plate",
    specifications: "5 mm thickness, IS:2062 grade",
    sizes: "1250 x 2500 mm, 1500 x 3000 mm",
    applications: "Base plates, general fabrication and engineering components",
    availability: "in-stock",
  },
  {
    name: "MS Plate 6mm",
    description: "Mild steel plate for heavy fabrication, machinery bases and structural use.",
    material: "Mild Steel",
    type: "Hot Rolled Plate",
    specifications: "6 mm thickness, IS:2062 grade",
    sizes: "1250 x 2500 mm, 1500 x 3000 mm",
    applications: "Machinery bases, heavy fabrication and structural use",
    availability: "limited",
  },
  {
    name: "Round MS Pipe",
    description: "Circular mild steel pipe for fencing, railings, plumbing and fabrication.",
    material: "Mild Steel",
    type: "Round Pipe",
    specifications: "ERW, black finish, standard lengths",
    sizes: "1/2 inch, 3/4 inch, 1 inch, 1.25 inch, 1.5 inch, 2 inch",
    applications: "Fencing, railings, plumbing lines and fabrication",
    availability: "in-stock",
  },
  {
    name: "Square MS Pipe",
    description: "Square mild steel hollow section for frames, guards and structures.",
    material: "Mild Steel",
    type: "Square Hollow Section",
    specifications: "ERW, black finish, square profile",
    sizes: "20x20x1.6mm, 25x25x1.6mm, 40x40x2mm, 50x50x2mm",
    applications: "Furniture frames, guards, canopies and structures",
    availability: "in-stock",
  },
  {
    name: "Rectangular MS Pipe",
    description: "Rectangular mild steel hollow section for frames, shutters and fabrication.",
    material: "Mild Steel",
    type: "Rectangular Hollow Section",
    specifications: "ERW, black finish, rectangular profile",
    sizes: "40x20x1.6mm, 60x40x2mm, 80x40x2mm, 100x50x3mm",
    applications: "Shutters, frames, partitions and fabrication",
    availability: "in-stock",
  },
  {
    name: "GI Sheet",
    description: "Galvanised iron sheet for roofing, cladding and weather protected fabrication.",
    material: "Galvanised Iron",
    type: "GI Sheet",
    specifications: "Zinc coated, corrugated and plain options",
    sizes: "8x4 ft, 8x3 ft, custom sizes",
    applications: "Roofing, cladding, ducting and protective covers",
    availability: "in-stock",
  },
  {
    name: "GI Pipe",
    description: "Galvanised iron pipe with corrosion resistant coating for water and outdoor use.",
    material: "Galvanised Iron",
    type: "GI Pipe",
    specifications: "Galvanised, threaded and unthreaded options",
    sizes: "1/2 inch, 3/4 inch, 1 inch, 1.25 inch, 1.5 inch, 2 inch",
    applications: "Water lines, outdoor fencing, gas lines and gardening",
    availability: "in-stock",
  },
  {
    name: "MS Flat",
    description: "Mild steel flat bar for brackets, strips, keys and general fabrication.",
    material: "Mild Steel",
    type: "Flat Bar",
    specifications: "Hot rolled, IS:2062 grade, cut to length",
    sizes: "25x6mm, 30x6mm, 40x8mm, 50x8mm, 50x10mm",
    applications: "Brackets, strips, gate fittings and general fabrication",
    availability: "in-stock",
  },
  {
    name: "MS Rod",
    description: "Mild steel round rod for machining, pins, studs and manufacturing use.",
    material: "Mild Steel",
    type: "Round Bar",
    specifications: "Bright and black finish options, cut to length",
    sizes: "6mm, 8mm, 10mm, 12mm, 16mm, 20mm, 25mm",
    applications: "Machining, pins, studs, axles and manufacturing",
    availability: "in-stock",
  },
  {
    name: "Binding Wire",
    description: "Annealed soft binding wire for tying reinforcement bars on construction sites.",
    material: "Mild Steel",
    type: "Annealed Binding Wire",
    specifications: "Soft annealed, bright finish, 1 kg coils",
    sizes: "0.71mm, 0.9mm, 1.0mm, 1.2mm",
    applications: "Tying reinforcement steel, baling and general binding",
    availability: "in-stock",
  },
];

export interface SeedResult {
  productsAdded: number;
  skipped: number;
}

/** Loads the sample products into Firestore.
 * Runs from admin settings (authenticated admin only). */
export async function seedSampleData(): Promise<SeedResult> {
  const existingProducts = await getProducts();
  const existingNames = new Set(existingProducts.map((product) => product.name.toLowerCase()));
  let productsAdded = 0;
  let skipped = 0;

  for (const product of SAMPLE_PRODUCTS) {
    if (existingNames.has(product.name.toLowerCase())) {
      skipped += 1;
      continue;
    }

    await addProduct({
      ...EMPTY_PRODUCT_INPUT,
      name: product.name,
      slug: slugify(product.name),
      status: "active",
      specTemplate: inferSpecTemplate(product.type),
      shortDescription: product.description,
      description: product.description,
      material: product.material,
      type: product.type,
      specifications: product.specifications,
      sizes: product.sizes,
      applications: product.applications,
      availability: product.availability,
    });

    productsAdded += 1;
  }

  return { productsAdded, skipped };
}
