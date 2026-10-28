import { Filter, PackageSearch, RotateCcw, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import { ProductGridSkeleton } from "../components/Loading";
import { EmptyState, ErrorState } from "../components/StateMessage";
import { useSeo } from "../hooks/useSeo";
import { useCategories } from "../hooks/useCategories";
import { useProducts } from "../hooks/useProducts";
import { cn } from "../lib/utils";
import { filterProducts } from "../services/productService";
import { AVAILABILITY_LABELS, type Availability } from "../types/product";

type SortOption = "newest" | "name-asc" | "name-desc";

const AVAILABILITY_OPTIONS: Array<{ value: Availability | "all"; label: string }> = [
  { value: "all", label: "All availability" },
  { value: "in-stock", label: AVAILABILITY_LABELS["in-stock"] },
  { value: "limited", label: AVAILABILITY_LABELS.limited },
  { value: "out-of-stock", label: AVAILABILITY_LABELS["out-of-stock"] },
];

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "newest", label: "Newest first" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

const SELECT_CLASSES =
  "w-full min-w-0 rounded-md border border-white/10 bg-navy-800 px-3 py-2.5 text-sm text-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/15 focus:outline-none";

export default function Products() {
  useSeo(
    "Products | PallaviTraders — Iron & Steel Materials",
    "Browse iron and steel materials including TMT bars, MS angles, channels, plates, pipes and more. Contact us on WhatsApp for price and availability.",
  );

  const { products, loading, error, reload } = useProducts();
  const { categories } = useCategories();

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [availability, setAvailability] = useState<Availability | "all">("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>("newest");

  const filtered = useMemo(
    () => filterProducts(products, { search, categoryId, availability, featuredOnly, sort }),
    [products, search, categoryId, availability, featuredOnly, sort],
  );

  const hasActiveFilters =
    Boolean(search.trim()) || categoryId !== "all" || availability !== "all" || featuredOnly || sort !== "newest";

  const resetFilters = () => {
    setSearch("");
    setCategoryId("all");
    setAvailability("all");
    setFeaturedOnly(false);
    setSort("newest");
  };

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10 bg-charcoal pt-below-nav pb-12 text-white sm:pb-14">
        <div className="blueprint-grid absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="text-xs text-steel-grey" aria-label="Breadcrumb">
            <Link to="/" className="transition hover:text-white">
              Home
            </Link>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <span className="text-steel-300">Products</span>
          </nav>
          <h1 className="mt-3 font-display text-[2rem] font-bold uppercase xs:text-4xl sm:text-5xl">Our Products</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-steel-grey sm:text-base">
            Browse the full iron and steel catalogue. Prices are shared on request — enquire on WhatsApp for
            availability and quotation.
          </p>
        </div>
      </section>

      <section className="bg-near-black py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="rounded-lg border border-white/10 bg-charcoal p-4 shadow-sm sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
              <div className="min-w-0 sm:col-span-2 lg:col-span-1">
                <label htmlFor="product-search" className="mb-1.5 block text-xs font-semibold tracking-wide text-steel-grey uppercase">
                  Search
                </label>
                <SearchBar
                  id="product-search"
                  value={search}
                  onChange={setSearch}
                  placeholder="Search by name, material, size (e.g. 50x50)…"
                />
              </div>

              <div className="min-w-0">
                <label htmlFor="category-filter" className="mb-1.5 block text-xs font-semibold tracking-wide text-steel-grey uppercase">
                  Category
                </label>
                <select
                  id="category-filter"
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className={SELECT_CLASSES}
                >
                  <option value="all">All categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <label htmlFor="availability-filter" className="mb-1.5 block text-xs font-semibold tracking-wide text-steel-grey uppercase">
                  Availability
                </label>
                <select
                  id="availability-filter"
                  value={availability}
                  onChange={(event) => setAvailability(event.target.value as Availability | "all")}
                  className={SELECT_CLASSES}
                >
                  {AVAILABILITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0 sm:col-span-2 lg:col-span-1">
                <label htmlFor="sort-filter" className="mb-1.5 block text-xs font-semibold tracking-wide text-steel-grey uppercase">
                  Sort by
                </label>
                <select
                  id="sort-filter"
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortOption)}
                  className={SELECT_CLASSES}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFeaturedOnly((value) => !value)}
                  aria-pressed={featuredOnly}
                  className={cn(
                    "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide uppercase transition",
                    featuredOnly
                      ? "border-brand-orange bg-brand-orange text-white"
                      : "border-white/15 bg-white/5 text-steel-grey hover:border-brand-orange/50 hover:text-white",
                  )}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                  Featured only
                </button>

                <p className="text-xs text-steel-grey" role="status">
                  Showing <span className="font-semibold text-white">{filtered.length}</span> of{" "}
                  <span className="font-semibold text-white">{products.length}</span> products
                </p>
              </div>

              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex min-h-10 items-center gap-1.5 text-xs font-semibold text-brand-orange transition hover:text-brand-orange-dark"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Clear filters
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs text-steel-grey">
                  <Filter className="h-3.5 w-3.5" aria-hidden="true" />
                  Use search and filters to narrow the catalogue
                </span>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="mt-8">
            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : error ? (
              <ErrorState message={error} onRetry={reload} />
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={PackageSearch}
                title="No products found"
                description={
                  hasActiveFilters
                    ? "No products match your current search and filters. Try different keywords or clear the filters."
                    : "The catalogue is being populated. Contact us on WhatsApp for your material requirements."
                }
              >
                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-2 rounded-md bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-orange-dark"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Clear filters
                  </button>
                ) : null}
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
                >
                  Send an enquiry
                </Link>
              </EmptyState>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
