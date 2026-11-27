import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { migrateLegacyProducts } from "./productService";

interface CatalogSettings {
  legacyProductsMigrated: boolean;
}

const settingsRef = doc(db, "settings", "catalog");

async function readSettings(): Promise<CatalogSettings> {
  const snapshot = await getDoc(settingsRef);
  const data = snapshot.data() ?? {};
  return {
    legacyProductsMigrated: Boolean(data.legacyProductsMigrated),
  };
}

let setupRun: Promise<void> | null = null;

/** One-time catalogue setup, run when an admin opens the panel. Each step is
 * recorded once it succeeds. Runs at most once per page load; a failed run can
 * be retried. */
export function runCatalogSetup(): Promise<void> {
  setupRun ??= performCatalogSetup().catch((caught) => {
    setupRun = null;
    throw caught;
  });
  return setupRun;
}

/** Labels an error with the setup step that failed, so the admin sees what went wrong. */
async function step<T>(label: string, run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (caught) {
    const code = (caught as { code?: string })?.code;
    const reason = code ?? (caught instanceof Error ? caught.message : String(caught));
    console.error(`Catalogue setup failed while ${label}`, caught);
    throw new Error(`Catalogue setup failed while ${label} (${reason}).`, { cause: caught });
  }
}

async function performCatalogSetup(): Promise<void> {
  const settings = await step("reading catalogue settings", readSettings);

  if (!settings.legacyProductsMigrated) {
    await step("updating older products", migrateLegacyProducts);
    await step("saving catalogue settings", () =>
      setDoc(settingsRef, { legacyProductsMigrated: true }, { merge: true }),
    );
  }
}
