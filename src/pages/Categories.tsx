import { Boxes } from "lucide-react";
import { Link } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import { CategoryGridSkeleton } from "../components/Loading";
import { EmptyState, ErrorState } from "../components/StateMessage";
import { useSeo } from "../hooks/useSeo";
import { useCategories } from "../hooks/useCategories";

export default function Categories() {
  useSeo(
    "Product Categories | PallaviTraders — Iron & Steel",
    "Browse all iron and steel product categories — TMT bars, MS angles, channels, plates, pipes and more. Bhimavaram's trusted iron traders.",
  );

  const { categories, loading, error, reload } = useCategories();

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10 bg-charcoal py-12 text-white sm:py-14">
        <div className="blueprint-grid absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="text-xs text-steel-grey" aria-label="Breadcrumb">
            <Link to="/" className="transition hover:text-white">
              Home
            </Link>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <span className="text-steel-300">Categories</span>
          </nav>
          <h1 className="mt-3 font-display text-4xl font-bold uppercase sm:text-5xl">Product Categories</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-steel-grey sm:text-base">
            Explore our full range of iron and steel product categories. Click any category to browse the available
            products and enquire on WhatsApp.
          </p>
        </div>
      </section>

      <section className="bg-near-black py-10 sm:py-14">
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
              description="Categories are being set up. Contact us directly to learn about available iron and steel products."
            >
              <Link
                to="/contact"
                className="btn-glass-primary"
              >
                Contact us
              </Link>
            </EmptyState>
          )}
        </div>
      </section>
    </>
  );
}
