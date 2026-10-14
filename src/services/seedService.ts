import { createCategory, getCategories } from "./categoryService";
import { addProduct, getProducts } from "./productService";

interface SampleProduct {
  name: string;
  category: string;
  description: string;
  material: string;
  type: string;
  specifications: string;
  sizes: string;
  applications: string;
  availability: "in-stock" | "limited" | "out-of-stock";
  featured: boolean;
}

export const SAMPLE_CATEGORIES: Array<{ name: string; description: string }> = [
  { name: "TMT Bars", description: "High strength TMT reinforcement bars for concrete structures." },
  { name: "MS Angles", description: "Mild steel angles for fabrication, framing and general construction." },
  { name: "MS Channels", description: "Mild steel channels for structural and support applications." },
  { name: "MS Beams", description: "Mild steel beams for heavy structural and industrial work." },
  { name: "MS Plates", description: "Mild steel plates for machining, fabrication and engineering." },
  { name: "MS Flats", description: "Mild steel flat bars for brackets, strips and general fabrication." },
  { name: "MS Rods", description: "Mild steel round rods for machining and manufacturing." },
  { name: "MS Pipes", description: "Mild steel pipes for plumbing, fencing and structural use." },
  { name: "GI Pipes", description: "Galvanised iron pipes with corrosion resistant zinc coating." },
  { name: "GI Sheets", description: "Galvanised iron sheets for roofing, cladding and fabrication." },
  { name: "Binding Wire", description: "Annealed binding wire for concrete reinforcement fixing." },
  { name: "Steel Sections", description: "Standard steel sections for engineering and construction." },
  { name: "Structural Steel", description: "Structural steel members for buildings and infrastructure." },
  { name: "Other Iron & Steel Materials", description: "Additional iron and steel material requirements." },
];

export const SAMPLE_PRODUCTS: SampleProduct[] = [
  {
    name: "Fe 500 TMT Bar",
    category: "TMT Bars",
    description: "Fe 500 grade TMT reinforcement bar with uniform rib pattern for strong bonding with concrete.",
    material: "TMT Steel",
    type: "TMT Bar",
    specifications: "Fe 500 grade, high tensile strength, corrosion resistant coating, uniform ribs",
    sizes: "8mm, 10mm, 12mm, 16mm, 20mm, 25mm",
    applications: "RCC columns, beams, slabs, foundations and general concrete reinforcement",
    availability: "in-stock",
    featured: true,
  },
  {
    name: "Fe 500D TMT Bar",
    category: "TMT Bars",
    description: "Fe 500D ductile TMT bar designed for earthquake resistant structures with higher elongation.",
    material: "TMT Steel",
    type: "TMT Bar",
    specifications: "Fe 500D grade, superior ductility, high elongation, bend and re-bend test compliant",
    sizes: "8mm, 10mm, 12mm, 16mm, 20mm, 25mm",
    applications: "High rise buildings, bridges, seismic zones and critical RCC work",
    availability: "in-stock",
    featured: true,
  },
  {
    name: "MS Angle 25x25",
    category: "MS Angles",
    description: "Equal leg mild steel angle for light fabrication, supports and brackets.",
    material: "Mild Steel",
    type: "Equal Angle",
    specifications: "25 x 25 mm legs, hot rolled, standard length",
    sizes: "25x25x3mm, 25x25x4mm, 25x25x5mm",
    applications: "Light fabrication, window frames, supports and brackets",
    availability: "in-stock",
    featured: false,
  },
  {
    name: "MS Angle 40x40",
    category: "MS Angles",
    description: "Equal leg mild steel angle widely used for frames, gates and structural supports.",
    material: "Mild Steel",
    type: "Equal Angle",
    specifications: "40 x 40 mm legs, hot rolled, standard length",
    sizes: "40x40x3mm, 40x40x4mm, 40x40x5mm, 40x40x6mm",
    applications: "Frames, gates, shelving, standees and general fabrication",
    availability: "in-stock",
    featured: false,
  },
  {
    name: "MS Angle 50x50",
    category: "MS Angles",
    description: "High quality mild steel angle suitable for construction and fabrication work.",
    material: "Mild Steel",
    type: "Equal Angle",
    specifications: "50 x 50 mm legs, hot rolled, IS:2062 grade",
    sizes: "50x50x4mm, 50x50x5mm, 50x50x6mm, 50x50x8mm",
    applications: "Structural supports, trusses, fabrication and industrial frames",
    availability: "in-stock",
    featured: true,
  },
  {
    name: "MS Angle 65x65",
    category: "MS Angles",
    description: "Heavy duty equal leg mild steel angle for structural and industrial applications.",
    material: "Mild Steel",
    type: "Equal Angle",
    specifications: "65 x 65 mm legs, hot rolled, IS:2062 grade",
    sizes: "65x65x5mm, 65x65x6mm, 65x65x8mm",
    applications: "Industrial structures, towers, heavy supports and fabrication",
    availability: "limited",
    featured: false,
  },
  {
    name: "MS Channel 75",
    category: "MS Channels",
    description: "Mild steel channel for framing, panel supports and light structural work.",
    material: "Mild Steel",
    type: "ISMC Channel",
    specifications: "75 mm depth, hot rolled, ISMC profile",
    sizes: "ISMC 75",
    applications: "Framing, panel supports, shutters and light structural work",
    availability: "in-stock",
    featured: false,
  },
  {
    name: "MS Channel 100",
    category: "MS Channels",
    description: "Mild steel channel commonly used in construction and fabrication projects.",
    material: "Mild Steel",
    type: "ISMC Channel",
    specifications: "100 mm depth, hot rolled, ISMC profile",
    sizes: "ISMC 100",
    applications: "Construction framing, equipment stands and fabrication",
    availability: "in-stock",
    featured: true,
  },
  {
    name: "MS Channel 125",
    category: "MS Channels",
    description: "Heavy mild steel channel for structural framing and industrial applications.",
    material: "Mild Steel",
    type: "ISMC Channel",
    specifications: "125 mm depth, hot rolled, ISMC profile",
    sizes: "ISMC 125",
    applications: "Structural framing, platforms and heavy fabrication",
    availability: "in-stock",
    featured: false,
  },
  {
    name: "MS Plate 3mm",
    category: "MS Plates",
    description: "Mild steel plate for sheet metal work, covers and light fabrication.",
    material: "Mild Steel",
    type: "Hot Rolled Plate",
    specifications: "3 mm thickness, IS:2062 grade, sheet sizes available",
    sizes: "1250 x 2500 mm, 1220 x 2440 mm",
    applications: "Sheet metal work, covers, ducts and light fabrication",
    availability: "in-stock",
    featured: false,
  },
  {
    name: "MS Plate 5mm",
    category: "MS Plates",
    description: "Mild steel plate for general fabrication, base plates and engineering work.",
    material: "Mild Steel",
    type: "Hot Rolled Plate",
    specifications: "5 mm thickness, IS:2062 grade",
    sizes: "1250 x 2500 mm, 1500 x 3000 mm",
    applications: "Base plates, general fabrication and engineering components",
    availability: "in-stock",
    featured: false,
  },
  {
    name: "MS Plate 6mm",
    category: "MS Plates",
    description: "Mild steel plate for heavy fabrication, machinery bases and structural use.",
    material: "Mild Steel",
    type: "Hot Rolled Plate",
    specifications: "6 mm thickness, IS:2062 grade",
    sizes: "1250 x 2500 mm, 1500 x 3000 mm",
    applications: "Machinery bases, heavy fabrication and structural use",
    availability: "limited",
    featured: false,
  },
  {
    name: "Round MS Pipe",
    category: "MS Pipes",
    description: "Circular mild steel pipe for fencing, railings, plumbing and fabrication.",
    material: "Mild Steel",
    type: "Round Pipe",
    specifications: "ERW, black finish, standard lengths",
    sizes: "1/2 inch, 3/4 inch, 1 inch, 1.25 inch, 1.5 inch, 2 inch",
    applications: "Fencing, railings, plumbing lines and fabrication",
    availability: "in-stock",
    featured: false,
  },
  {
    name: "Square MS Pipe",
    category: "MS Pipes",
    description: "Square mild steel hollow section for frames, guards and structures.",
    material: "Mild Steel",
    type: "Square Hollow Section",
    specifications: "ERW, black finish, square profile",
    sizes: "20x20x1.6mm, 25x25x1.6mm, 40x40x2mm, 50x50x2mm",
    applications: "Furniture frames, guards, canopies and structures",
    availability: "in-stock",
    featured: true,
  },
  {
    name: "Rectangular MS Pipe",
    category: "MS Pipes",
    description: "Rectangular mild steel hollow section for frames, shutters and fabrication.",
    material: "Mild Steel",
    type: "Rectangular Hollow Section",
    specifications: "ERW, black finish, rectangular profile",
    sizes: "40x20x1.6mm, 60x40x2mm, 80x40x2mm, 100x50x3mm",
    applications: "Shutters, frames, partitions and fabrication",
    availability: "in-stock",
    featured: false,
  },
  {
    name: "GI Sheet",
    category: "GI Sheets",
    description: "Galvanised iron sheet for roofing, cladding and weather protected fabrication.",
    material: "Galvanised Iron",
    type: "GI Sheet",
    specifications: "Zinc coated, corrugated and plain options",
    sizes: "8x4 ft, 8x3 ft, custom sizes",
    applications: "Roofing, cladding, ducting and protective covers",
    availability: "in-stock",
    featured: false,
  },
  {
    name: "GI Pipe",
    category: "GI Pipes",
    description: "Galvanised iron pipe with corrosion resistant coating for water and outdoor use.",
    material: "Galvanised Iron",
    type: "GI Pipe",
    specifications: "Galvanised, threaded and unthreaded options",
    sizes: "1/2 inch, 3/4 inch, 1 inch, 1.25 inch, 1.5 inch, 2 inch",
    applications: "Water lines, outdoor fencing, gas lines and gardening",
    availability: "in-stock",
    featured: false,
  },
  {
    name: "MS Flat",
    category: "MS Flats",
    description: "Mild steel flat bar for brackets, strips, keys and general fabrication.",
    material: "Mild Steel",
    type: "Flat Bar",
    specifications: "Hot rolled, IS:2062 grade, cut to length",
    sizes: "25x6mm, 30x6mm, 40x8mm, 50x8mm, 50x10mm",
    applications: "Brackets, strips, gate fittings and general fabrication",
    availability: "in-stock",
    featured: false,
  },
  {
    name: "MS Rod",
    category: "MS Rods",
    description: "Mild steel round rod for machining, pins, studs and manufacturing use.",
    material: "Mild Steel",
    type: "Round Bar",
    specifications: "Bright and black finish options, cut to length",
    sizes: "6mm, 8mm, 10mm, 12mm, 16mm, 20mm, 25mm",
    applications: "Machining, pins, studs, axles and manufacturing",
    availability: "in-stock",
    featured: false,
  },
  {
    name: "Binding Wire",
    category: "Binding Wire",
    description: "Annealed soft binding wire for tying reinforcement bars on construction sites.",
    material: "Mild Steel",
    type: "Annealed Binding Wire",
    specifications: "Soft annealed, bright finish, 1 kg coils",
    sizes: "0.71mm, 0.9mm, 1.0mm, 1.2mm",
    applications: "Tying reinforcement steel, baling and general binding",
    availability: "in-stock",
    featured: true,
  },
];

export interface SeedResult {
  categoriesAdded: number;
  productsAdded: number;
  skipped: number;
}

/** Loads the initial sample categories and products into Firestore.
 * Runs from the admin dashboard (authenticated admin only). */
export async function seedSampleData(): Promise<SeedResult> {
  const [existingCategories, existingProducts] = await Promise.all([getCategories(), getProducts()]);

  const categoryIdByName = new Map(existingCategories.map((category) => [category.name, category.id]));
  let categoriesAdded = 0;

  for (const category of SAMPLE_CATEGORIES) {
    if (categoryIdByName.has(category.name)) continue;
    const id = await createCategory({ ...category, imageUrl: "" });
    categoryIdByName.set(category.name, id);
    categoriesAdded += 1;
  }

  const existingNames = new Set(existingProducts.map((product) => product.name.toLowerCase()));
  let productsAdded = 0;
  let skipped = 0;

  for (const product of SAMPLE_PRODUCTS) {
    if (existingNames.has(product.name.toLowerCase())) {
      skipped += 1;
      continue;
    }

    const categoryId = categoryIdByName.get(product.category) ?? "";
    if (!categoryId) {
      skipped += 1;
      continue;
    }

    await addProduct({
      name: product.name,
      categoryId,
      categoryName: product.category,
      description: product.description,
      material: product.material,
      type: product.type,
      specifications: product.specifications,
      sizes: product.sizes,
      applications: product.applications,
      imageUrl: "",
      additionalImages: [],
      availability: product.availability,
      featured: product.featured,
    });

    productsAdded += 1;
  }

  return { categoriesAdded, productsAdded, skipped };
}
