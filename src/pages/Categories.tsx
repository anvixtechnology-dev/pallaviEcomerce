import { Boxes } from "lucide-react";
import { Link } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import { CategoryGridSkeleton } from "../components/Loading";
import { EmptyState, ErrorState } from "../components/StateMessage";
import WhatsAppIcon from "../components/WhatsAppIcon";
import { useSeo } from "../hooks/useSeo";
import { useCategories } from "../hooks/useCategories";
import { openWhatsApp } from "../lib/whatsapp";

export default function Categories() {
  useSeo(
    "Categories | PallaviTraders — Iron & Steel Materials",
    "Browse all iron and steel material categories: TMT bars, MS angles, channels, beams, plates, pipes, sheets and more.",
  );

  const { categories, loading, error, reload } = useCategories();

  return (
    <>
      <section className="relative overflow-hidden border-b border-navy-700 bg-navy-950 py-12 text-white sm:py-14">
        <div className="blueprint-grid absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="text-xs text-steel-400" aria-label="Breadcrumb">
            <Link to="/" className="transition hover:text-white">
              Home
            </Link>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <span className="text-steel-200">Categories</span>
          </nav>
          <h1 className="mt-3 font-display text-4xl font-bold uppercase sm:text-5xl">Product Categories</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-steel-400 sm:text-base">
            Find the right iron and steel material for your project. Select a category to view all products under it.
          </p>
        </div>
      </section>

      <section className="bg-steel-50 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <CategoryGridSkeleton count={8} />
          ) : error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Boxes}
              title="No categories yet"
              description="Our categories are being updated. Contact us on WhatsApp and we will help you find the material you need."
            >
              <button
                type="button"
                onClick={() => openWhatsApp()}
                className="inline-flex items-center gap-2 rounded-md bg-whatsapp px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-whatsapp-dark"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Contact on WhatsApp
              </button>
            </EmptyState>
          )}
        </div>
      </section>
    </>
  );
}
