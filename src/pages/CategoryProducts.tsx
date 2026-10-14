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
      <div className="bg-steel-50">
        <PageLoader label="Loading category…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={Boxes}
          title="Category not found"
          description="This category may have been removed. Browse all categories to find the material you need."
        >
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 rounded-md bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
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
      <section className="relative overflow-hidden border-b border-navy-700 bg-navy-950 text-white">
        <div className="blueprint-grid absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <nav className="text-xs text-steel-400" aria-label="Breadcrumb">
              <Link to="/" className="transition hover:text-white">
                Home
              </Link>
              <span className="mx-2" aria-hidden="true">
                /
              </span>
              <Link to="/categories" className="transition hover:text-white">
                Categories
              </Link>
              <span className="mx-2" aria-hidden="true">
                /
              </span>
              <span className="text-steel-200">{category.name}</span>
            </nav>
            <h1 className="mt-3 font-display text-4xl font-bold uppercase sm:text-5xl">{category.name}</h1>
            {category.description ? (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-steel-400 sm:text-base">
                {category.description}
              </p>
            ) : null}
          </div>

          <div className="hidden h-32 w-44 shrink-0 overflow-hidden rounded-lg border border-navy-700 md:block">
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
      <div className="border-b border-steel-200 bg-white">
        <div className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
          {categories.map((item) => (
            <Link
              key={item.id}
              to={`/categories/${item.id}`}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide transition",
                item.id === category.id
                  ? "border-navy-800 bg-navy-900 text-white"
                  : "border-steel-300 bg-white text-steel-600 hover:border-navy-700 hover:text-navy-800",
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      <section className="bg-steel-50 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-bold text-steel-900 uppercase sm:text-3xl">
              {products.length} {products.length === 1 ? "Product" : "Products"}
            </h2>
            <button
              type="button"
              onClick={() => openWhatsApp(category.name)}
              className="inline-flex items-center gap-2 rounded-md bg-whatsapp px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-whatsapp-dark"
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
                className="inline-flex items-center gap-2 rounded-md border border-steel-300 bg-white px-5 py-2.5 text-sm font-semibold text-navy-800 transition hover:border-navy-700"
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
