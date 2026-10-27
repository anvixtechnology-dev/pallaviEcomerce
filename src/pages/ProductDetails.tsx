import { ArrowLeft, ChevronRight, Layers, MessageCircle, Package, Ruler, Tag } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { PageLoader } from "../components/Loading";
import { ErrorState, SectionHeader } from "../components/StateMessage";
import { useSeo } from "../hooks/useSeo";
import { useProduct, useProductsByCategory } from "../hooks/useProducts";
import { openWhatsApp } from "../lib/whatsapp";
import SmartImage from "../components/SmartImage";
import { AVAILABILITY_LABELS } from "../types/product";

const AVAILABILITY_STYLES = {
  "in-stock": "bg-emerald-100 text-emerald-800 border-emerald-200",
  limited: "bg-amber-100 text-amber-800 border-amber-200",
  "out-of-stock": "bg-steel-200 text-steel-600 border-steel-300",
} as const;

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: product, loading, error } = useProduct(id);
  const { products: categoryProducts } = useProductsByCategory(product?.categoryId);
  const related = categoryProducts.filter((p) => p.id !== id).slice(0, 4);
  const [activeImage, setActiveImage] = useState(0);

  useSeo(
    product ? `${product.name} | PallaviTraders` : "Product Details | PallaviTraders",
    product?.description ?? "Iron and steel product details — Pallavi Iron Traders, Bhimavaram.",
  );

  if (loading) return <PageLoader label="Loading product…" />;
  if (error || !product) return <ErrorState message={error ?? "Product not found."} />;

  const images = product.imageUrl ? [product.imageUrl, ...(product.additionalImages ?? [])] : [];

  const specs = [
    { icon: Layers, label: "Material", value: product.material },
    { icon: Ruler, label: "Available Sizes", value: product.sizes },
    { icon: Tag, label: "Category", value: product.categoryName },
    { icon: Package, label: "Availability", value: AVAILABILITY_LABELS[product.availability] },
  ].filter((s) => Boolean(s.value));

  return (
    <>
      <section className="bg-warm-white py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-1 text-xs text-steel-grey" aria-label="Breadcrumb">
            <Link to="/" className="transition hover:text-brand-orange">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <Link to="/products" className="transition hover:text-brand-orange">
              Products
            </Link>
            {product.categoryName ? (
              <>
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                <Link to={`/categories/${product.categoryId}`} className="transition hover:text-brand-orange">
                  {product.categoryName}
                </Link>
              </>
            ) : null}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-charcoal font-medium truncate max-w-[160px]">{product.name}</span>
          </nav>

          {/* Back link */}
          <Link
            to="/products"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-steel-grey transition hover:text-charcoal"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Products
          </Link>

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Images */}
            <div>
              <div className="overflow-hidden rounded-lg border border-border-grey bg-white aspect-[4/3]">
                <SmartImage
                  src={images[activeImage]}
                  alt={product.name}
                  icon={<Package className="h-10 w-10" />}
                  className="h-full w-full object-contain"
                />
              </div>
              {images.length > 1 ? (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {images.map((src, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded border-2 transition ${
                        index === activeImage
                          ? "border-brand-orange"
                          : "border-border-grey hover:border-charcoal"
                      }`}
                      aria-label={`View image ${index + 1}`}
                      aria-pressed={index === activeImage}
                    >
                      <SmartImage
                        src={src}
                        alt={`${product.name} image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Info */}
            <div>
              {product.categoryName ? (
                <span className="inline-block rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-0.5 text-xs font-semibold tracking-wide text-brand-orange uppercase">
                  {product.categoryName}
                </span>
              ) : null}

              <h1 className="mt-2 font-display text-3xl font-bold uppercase text-charcoal sm:text-4xl">
                {product.name}
              </h1>

              <div className="mt-3 flex items-center gap-3">
                <span
                  className={`rounded border px-2.5 py-1 text-xs font-semibold tracking-wide uppercase ${AVAILABILITY_STYLES[product.availability]}`}
                >
                  {AVAILABILITY_LABELS[product.availability]}
                </span>
                {product.featured ? (
                  <span className="rounded bg-charcoal px-2.5 py-1 text-xs font-semibold tracking-wide uppercase text-white">
                    Featured
                  </span>
                ) : null}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-steel-600 sm:text-base">{product.description}</p>

              {specs.length > 0 ? (
                <dl className="mt-6 space-y-3 rounded-lg border border-border-grey bg-white p-5">
                  {specs.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" aria-hidden="true" />
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-sm">
                        <dt className="font-semibold text-charcoal">{label}:</dt>
                        <dd className="text-steel-600">{value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              ) : null}

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => openWhatsApp(product.name)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-orange px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-orange-dark focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Enquire on WhatsApp
                </button>
                <Link
                  to="/contact"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border-grey bg-white px-6 py-3 text-sm font-semibold text-charcoal transition hover:border-charcoal"
                >
                  Send a Written Enquiry
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 ? (
        <section className="bg-white py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="More Products"
              title="Related Products"
              to="/products"
              actionLabel="View all products"
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
