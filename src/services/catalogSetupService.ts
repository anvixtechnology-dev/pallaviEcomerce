import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { inferSpecTemplate, normalizeCategoryName } from "../lib/productSpecs";
import { ensureCategory, getCategories } from "./categoryService";
import { migrateLegacyProducts } from "./productService";

export const DEFAULT_GST_RATES = [0, 5, 18, 40];

export const INITIAL_CATEGORIES: Array<{ name: string; description: string }> = [
  { name: "G.I. Pipes", description: "Galvanised iron round and box pipes." },
  { name: "M.S. Pipes", description: "Mild steel round and box pipes." },
  { name: "Roofing Sheets", description: "Roofing sheets in a range of profiles, thicknesses and finishes." },
  { name: "Tata Reveting Sheets", description: "Tata reveting sheets for roofing and cladding." },
  { name: "Hardware", description: "Hardware and fittings for construction and fabrication." },
  { name: "Iron Scrap", description: "Iron scrap by type, grade and weight." },
  { name: "Other Iron Materials", description: "Additional iron materials and custom requirements." },
];

interface CatalogSettings {
  gstRates: number[];
  initialCategoriesAdded: boolean;
  legacyProductsMigrated: boolean;
}

const settingsRef = doc(db, "settings", "catalog");

async function readSettings(): Promise<CatalogSettings> {
  const snapshot = await getDoc(settingsRef);
  const data = snapshot.data() ?? {};
  return {
    gstRates: Array.isArray(data.gstRates) && data.gstRates.length > 0 ? data.gstRates : DEFAULT_GST_RATES,
    initialCategoriesAdded: Boolean(data.initialCategoriesAdded),
    legacyProductsMigrated: Boolean(data.legacyProductsMigrated),
  };
}

export async function getGstRates(): Promise<number[]> {
  return (await readSettings()).gstRates;
}

export async function saveGstRates(gstRates: number[]): Promise<void> {
  await setDoc(settingsRef, { gstRates }, { merge: true });
}

/** Adds any initial category that is missing, matching "GI Pipes" to "G.I. Pipes". */
async function addInitialCategories(): Promise<void> {
  const existing = new Set((await getCategories()).map((category) => normalizeCategoryName(category.name)));

  for (const category of INITIAL_CATEGORIES) {
    if (existing.has(normalizeCategoryName(category.name))) continue;
    await ensureCategory({
      ...category,
      imageUrl: "",
      subcategories: [],
      specTemplate: inferSpecTemplate(category.name),
    });
  }
}

let setupRun: Promise<void> | null = null;

/** One-time catalogue setup, run when an admin opens the panel. Each step is
 * recorded once it succeeds, so a category an admin later deletes stays deleted.
 * Runs at most once per page load; a failed run can be retried. */
export function runCatalogSetup(): Promise<void> {
  setupRun ??= performCatalogSetup().catch((caught) => {
    setupRun = null;
    throw caught;
  });
  return setupRun;
}

async function performCatalogSetup(): Promise<void> {
  const settings = await readSettings();

  if (!settings.initialCategoriesAdded) {
    await addInitialCategories();
    await setDoc(settingsRef, { initialCategoriesAdded: true }, { merge: true });
  }

  if (!settings.legacyProductsMigrated) {
    await migrateLegacyProducts();
    await setDoc(settingsRef, { legacyProductsMigrated: true }, { merge: true });
  }
}
