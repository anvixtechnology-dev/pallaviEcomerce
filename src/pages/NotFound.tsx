import { ArrowLeft, SearchX } from "lucide-react";
import { Link } from "react-router-dom";
import { useSeo } from "../hooks/useSeo";
import { openWhatsApp } from "../lib/whatsapp";

export default function NotFound() {
  useSeo("Page Not Found | PallaviTraders");

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 pt-below-nav pb-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
        <SearchX className="h-8 w-8 text-steel-grey" aria-hidden="true" />
      </div>
      <p className="mt-6 font-display text-7xl font-bold text-brand-orange">404</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-white uppercase">Page not found</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-steel-grey">
        The page you are looking for does not exist or may have been moved. Browse our catalogue or get in touch on
        WhatsApp.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 rounded-md bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Browse products
        </Link>
        <button
          type="button"
          onClick={() => openWhatsApp()}
          className="inline-flex items-center gap-2 rounded-md bg-whatsapp px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-whatsapp-dark"
        >
          Contact on WhatsApp
        </button>
      </div>
    </section>
  );
}
