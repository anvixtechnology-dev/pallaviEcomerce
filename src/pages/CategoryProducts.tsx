import { ArrowLeft, Boxes, MessageCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { PageLoader, ProductGridSkeleton } from "../components/Loading";
import { EmptyState, ErrorState } from "../components/StateMessage";
import SmartImage from "../components/SmartImage";
import WhatsAppIcon from "../components/WhatsAppIcon";
import { useSeo } from "../hooks/useSeo";
import { useCategories, useCategory } from "../hooks/useCategories";
import { useProductsByCategory } from "../hooks/useProducts";
import { cn } from "../lib/utils";
import { openWhatsApp } from "../lib/whatsapp";

export default function CategoryProducts() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { data: category, loading, error, reload } = useCategory(categoryId);
  const { products, loading: productsLoading, error: productsError, reload: reloadProducts } = useProductsByCategory(categoryId);
  const { categories } = useCategories();

  useSeo(
    category ? `${category.name} | PallaviTraders` : "Category | PallaviTraders",
    category?.description || "Browse iron and steel materials in this category and enquire on WhatsApp.",
  );

  if (loading) {
    return (
      <div className="bg-surface-cream pt-below-nav">
        <PageLoader label="Loading category…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-below-nav pb-16">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-below-nav pb-16">
        <EmptyState
          icon={Boxes}
          title="Category not found"
          description="This category may have been removed. Browse all categories to find the material you need."
        >
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 rounded-md bg-charcoal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-charcoal/80"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All categories
          </Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <>
      {/* Category banner */}
      <section className="relative overflow-hidden border-b border-border-light bg-white text-charcoal">
        <div className="blueprint-grid absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 pt-below-nav pb-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="min-w-0">
            <nav className="text-xs text-text-secondary" aria-label="Breadcrumb">
              <Link to="/" className="transition hover:text-charcoal">
                Home
              </Link>
              <span className="mx-2" aria-hidden="true">
                /
              </span>
              <Link to="/categories" className="transition hover:text-charcoal">
                Categories
              </Link>
              <span className="mx-2" aria-hidden="true">
                /
              </span>
              <span className="text-charcoal">{category.name}</span>
            </nav>
            <h1 className="mt-3 font-display text-[2rem] font-bold break-words text-charcoal uppercase xs:text-4xl sm:text-5xl">{category.name}</h1>
            {category.description ? (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
                {category.description}
              </p>
            ) : null}
          </div>

          <div className="hidden h-32 w-44 shrink-0 overflow-hidden rounded-lg border border-border-light md:block">
            <SmartImage
              src={category.imageUrl}
              alt={category.name}
              icon={<Boxes className="h-7 w-7" aria-hidden="true" />}
              className="h-full w-full"
            />
          </div>
        </div>
      </section>

      {/* Category switcher */}
      <div className="border-b border-border-light bg-white">
        <div className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
          {categories.map((item) => (
            <Link
              key={item.id}
              to={`/categories/${item.id}`}
              className={cn(
                "inline-flex min-h-9 shrink-0 items-center rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition",
                item.id === category.id
                  ? "border-charcoal bg-charcoal text-white"
                  : "border-border-light bg-white text-text-secondary hover:border-charcoal/50 hover:text-charcoal",
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      <section className="bg-surface-cream py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-bold text-charcoal uppercase sm:text-3xl">
              {products.length} {products.length === 1 ? "Product" : "Products"}
            </h2>
            <button
              type="button"
              onClick={() => openWhatsApp(category.name)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-whatsapp px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-whatsapp-dark sm:w-auto sm:justify-start"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Enquire about this category
            </button>
          </div>

          {productsLoading ? (
            <ProductGridSkeleton count={8} />
          ) : productsError ? (
            <ErrorState message={productsError} onRetry={reloadProducts} />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No products in this category yet"
              description="This category has been added, but products are still being uploaded. Send us a WhatsApp message with your requirement."
            >
              <button
                type="button"
                onClick={() => openWhatsApp(category.name)}
                className="inline-flex items-center gap-2 rounded-md bg-whatsapp px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-whatsapp-dark"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Enquire on WhatsApp
              </button>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-md border border-border-light bg-white px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:border-charcoal"
              >
                Browse all products
              </Link>
            </EmptyState>
          )}
        </div>
      </section>
    </>
  );
}
