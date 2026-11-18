import { Database, Info, Percent, ShieldCheck, Sparkles, UploadCloud, UserRound, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { ButtonSpinner } from "../../components/Loading";
import { useToast } from "../../components/Toast";
import { useSeo } from "../../hooks/useSeo";
import { useAuth } from "../../hooks/useAuth";
import { BUSINESS } from "../../lib/contact";
import { auth } from "../../lib/firebase";
import { cn, getErrorMessage } from "../../lib/utils";
import { WHATSAPP_NUMBER } from "../../lib/whatsapp";
import { DEFAULT_GST_RATES, getGstRates, saveGstRates } from "../../services/catalogSetupService";
import { seedSampleData, type SeedResult } from "../../services/seedService";

export default function Settings() {
  useSeo("Settings | PallaviTraders Admin");

  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<SeedResult | null>(null);
  const [gstRates, setGstRates] = useState<number[]>(DEFAULT_GST_RATES);
  const [newGstRate, setNewGstRate] = useState("");

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const result = await seedSampleData();
      setSeedResult(result);
      showToast(
        `Sample data ready — ${result.categoriesAdded} categor${result.categoriesAdded === 1 ? "y" : "ies"} and ${result.productsAdded} product${result.productsAdded === 1 ? "" : "s"} added.`,
        "success",
      );
    } catch (caught) {
      showToast(getErrorMessage(caught), "error");
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    getGstRates()
      .then(setGstRates)
      .catch((caught) => showToast(getErrorMessage(caught), "error"));
  }, [showToast]);

  const persistGstRates = async (rates: number[]) => {
    try {
      await saveGstRates(rates);
      setGstRates(rates);
      showToast("GST rates updated.", "success");
    } catch (caught) {
      showToast(getErrorMessage(caught), "error");
    }
  };

  const handleAddGstRate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const rate = Number(newGstRate);
    if (newGstRate.trim() === "" || !Number.isFinite(rate) || rate < 0 || rate > 100) {
      showToast("GST rate must be between 0 and 100.", "error");
      return;
    }
    setNewGstRate("");
    if (!gstRates.includes(rate)) void persistGstRates([...gstRates, rate].sort((a, b) => a - b));
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin/login", { replace: true });
  };

  const details = [
    { label: "Business name", value: BUSINESS.name },
    { label: "Tagline", value: BUSINESS.tagline },
    { label: "Phone", value: BUSINESS.phone },
    { label: "WhatsApp number", value: WHATSAPP_NUMBER },
    { label: "Email", value: BUSINESS.email },
    { label: "Address", value: BUSINESS.address },
    { label: "Business hours", value: BUSINESS.hours },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-steel-900 uppercase sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-steel-600">Account information, sample data and configuration details.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account */}
        <section className="rounded-lg border border-steel-200 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-navy-900 text-accent-500">
              <UserRound className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <h2 className="font-display text-lg font-bold text-steel-900 uppercase">Admin Account</h2>
          </div>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-start justify-between gap-4 rounded-md bg-steel-50 px-4 py-3">
              <dt className="text-xs font-semibold tracking-wide text-steel-500 uppercase">Email</dt>
              <dd className="break-all text-right font-medium text-steel-800">{user?.email ?? "—"}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 rounded-md bg-steel-50 px-4 py-3">
              <dt className="text-xs font-semibold tracking-wide text-steel-500 uppercase">UID</dt>
              <dd className="break-all text-right font-mono text-xs text-steel-600">{user?.uid ?? "—"}</dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-steel-300 px-4 py-2.5 text-sm font-semibold text-steel-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            >
              Logout
            </button>
          </div>
        </section>

        {/* Sample data */}
        <section className="rounded-lg border border-steel-200 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-navy-900 text-accent-500">
              <Sparkles className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <h2 className="font-display text-lg font-bold text-steel-900 uppercase">Sample Data</h2>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-steel-600">
            Load the initial catalogue — 14 iron &amp; steel categories and 20 sample products — into Firestore.
            Existing records are never overwritten.
          </p>

          <button
            type="button"
            onClick={handleSeed}
            disabled={seeding}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {seeding ? (
              <ButtonSpinner label="Loading sample data…" />
            ) : (
              <>
                <UploadCloud className="h-4 w-4" aria-hidden="true" />
                Load sample categories &amp; products
              </>
            )}
          </button>

          {seedResult ? (
            <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-relaxed text-emerald-800">
              Added {seedResult.categoriesAdded} new categories and {seedResult.productsAdded} new products
              {seedResult.skipped ? ` (${seedResult.skipped} already existed and were skipped)` : ""}.
            </p>
          ) : null}
        </section>

        {/* GST rates */}
        <section className="rounded-lg border border-steel-200 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-navy-900 text-accent-500">
              <Percent className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <h2 className="font-display text-lg font-bold text-steel-900 uppercase">GST Rates</h2>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-steel-600">
            The rates offered in the product form&apos;s GST dropdown. Removing a rate does not change products already
            using it.
          </p>

          <ul className="mt-4 flex flex-wrap gap-2">
            {gstRates.map((rate) => (
              <li key={rate} className="inline-flex items-center gap-1.5 rounded-md bg-steel-50 px-3 py-1.5 text-sm font-medium text-steel-800">
                {rate}%
                <button
                  type="button"
                  disabled={gstRates.length === 1}
                  onClick={() => persistGstRates(gstRates.filter((other) => other !== rate))}
                  className="rounded p-0.5 text-steel-500 transition hover:text-red-600 disabled:opacity-40"
                  aria-label={`Remove ${rate}% GST rate`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>

          <form onSubmit={handleAddGstRate} className="mt-4 flex gap-2">
            <input
              type="number"
              min={0}
              max={100}
              step="any"
              value={newGstRate}
              onChange={(event) => setNewGstRate(event.target.value)}
              placeholder="New rate (%)"
              aria-label="New GST rate"
              className="w-full min-w-0 rounded-md border border-steel-300 bg-white px-3.5 py-2.5 text-sm text-steel-800 placeholder:text-steel-400 focus:border-navy-600 focus:ring-2 focus:ring-navy-600/15 focus:outline-none"
            />
            <button type="submit" className="shrink-0 rounded-md border border-steel-300 px-4 py-2.5 text-sm font-semibold text-steel-700 transition hover:border-navy-700 hover:text-navy-900">
              Add
            </button>
          </form>
        </section>

        {/* Business details */}
        <section className="rounded-lg border border-steel-200 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-navy-900 text-accent-500">
              <Info className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <h2 className="font-display text-lg font-bold text-steel-900 uppercase">Business Contact Details</h2>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-steel-600">
            These details are shown across the website footer and contact page. Edit{" "}
            <code className="rounded bg-steel-100 px-1.5 py-0.5 text-xs font-mono">src/lib/contact.ts</code> and{" "}
            <code className="rounded bg-steel-100 px-1.5 py-0.5 text-xs font-mono">src/lib/whatsapp.ts</code> to update
            them.
          </p>

          <dl className="mt-4 space-y-2.5 text-sm">
            {details.map((detail) => (
              <div key={detail.label} className="flex flex-wrap items-start justify-between gap-2 border-b border-steel-100 pb-2.5 last:border-0">
                <dt className="text-xs font-semibold tracking-wide text-steel-500 uppercase">{detail.label}</dt>
                <dd className="text-right font-medium break-words text-steel-800">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Security */}
        <section className="rounded-lg border border-steel-200 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-navy-900 text-accent-500">
              <ShieldCheck className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <h2 className="font-display text-lg font-bold text-steel-900 uppercase">Security Rules</h2>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-steel-600">
            Firestore and Storage rules live in the project root as{" "}
            <code className="rounded bg-steel-100 px-1.5 py-0.5 text-xs font-mono">firestore.rules</code> and{" "}
            <code className="rounded bg-steel-100 px-1.5 py-0.5 text-xs font-mono">storage.rules</code>. Deploy them
            with:
          </p>

          <pre className={cn("mt-3 overflow-x-auto rounded-md bg-steel-950 px-4 py-3 text-xs text-steel-300")}>
            <code>firebase deploy --only firestore:rules,storage</code>
          </pre>

          <ul className="mt-4 space-y-2 text-xs leading-relaxed text-steel-600">
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" aria-hidden="true" />
              Public visitors can only read categories and published products.
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" aria-hidden="true" />
              Only users listed in the Firestore <code className="font-mono">admins</code> collection can write data.
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" aria-hidden="true" />
              New admin accounts must be added to the{" "}
              <code className="font-mono">admins</code> collection using their Firebase UID.
            </li>
          </ul>
        </section>
      </div>

      <div className="flex items-center gap-2.5 rounded-lg border border-navy-200 bg-navy-50 px-5 py-4 text-sm text-navy-800">
        <Database className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
        <p>
          All products, categories and enquiries are stored in <strong>Cloud Firestore</strong>; images are stored in{" "}
          <strong>Firebase Storage</strong>.
        </p>
      </div>
    </div>
  );
}
