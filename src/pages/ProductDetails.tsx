import { ArrowLeft, ArrowRight, Box, CheckCircle2, Clock3, MessageCircle, Ruler, Tag, Layers, Wrench, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { ProductGridSkeleton, PageLoader } from "../components/Loading";
import { EmptyState, ErrorState } from "../components/StateMessage";
import SmartImage from "../components/SmartImage";
import WhatsAppIcon from "../components/WhatsAppIcon";
import { useSeo } from "../hooks/useSeo";
import { useProduct, useProductsByCategory } from "../hooks/useProducts";
import { cn } from "../lib/utils";
import { openWhatsApp } from "../lib/whatsapp";
import { AVAILABILITY_LABELS } from "../types/product";

const AVAILABILITY_BADGE: Record<string, string> = {
  "in-stock": "border-emerald-200 bg-emerald-50 text-emerald-700",
  limited: "border-amber-200 bg-amber-50 text-amber-700",
  "out-of-stock": "border-steel-300 bg-steel-100 text-steel-600",
};

export default function ProductDetails() {
  const { productId } = useParams<{ productId: string }>();
  const { data: product, loading, error, reload } = useProduct(productId);
  const { products: related, loading: relatedLoading } = useProductsByCategory(product?.categoryId);

  const gallery = product ? [product.imageUrl, ...product.additionalImages].filter(Boolean) : [];
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setActiveImage(0);
  }, [productId, product?.imageUrl]);

  useSeo(
    product ? `${product.name} | PallaviTraders` : "Product | PallaviTraders",
    product?.description || "View product details and enquire on WhatsApp for price and availability.",
  );

  if (loading) {
    return (
      <div className="bg-steel-50">
        <PageLoader label="Loading product…" />
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

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={Box}
          title="Product not found"
          description="This product may have been removed or the link is incorrect. Browse the full catalogue to find what you need."
        >
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
            <WhatsAppIcon className="h-4 w-4" />
            Contact on WhatsApp
          </button>
        </EmptyState>
      </div>
    );
  }

  const relatedProducts = related.filter((item) => item.id !== product.id).slice(0, 4);
  const enquiryLink = `/contact?product=${encodeURIComponent(product.name)}`;

  const specs: Array<{ icon: LucideIcon; label: string; value: string }> = [
    { icon: Layers, label: "Material", value: product.material },
    { icon: Tag, label: "Type", value: product.type },
    { icon: CheckCircle2, label: "Specifications", value: product.specifications },
    { icon: Ruler, label: "Available Sizes", value: product.sizes },
    { icon: Wrench, label: "Applications", value: product.applications },
  ].filter((row) => row.value);

  return (
    <>
      <div className="border-b border-steel-200 bg-steel-50">
        <nav className="mx-auto max-w-7xl px-4 py-4 text-xs text-steel-500 sm:px-6 lg:px-8" aria-label="Breadcrumb">
          <Link to="/" className="transition hover:text-navy-700">
            Home
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <Link to="/products" className="transition hover:text-navy-700">
            Products
          </Link>
          {product.categoryId ? (
            <>
              <span className="mx-2" aria-hidden="true">
                /
              </span>
              <Link to={`/categories/${product.categoryId}`} className="transition hover:text-navy-700">
                {product.categoryName || "Category"}
              </Link>
            </>
          ) : null}
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-steel-800">{product.name}</span>
        </nav>
      </div>

      <section className="bg-white py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Gallery */}
            <div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-steel-200 bg-steel-100">
                <SmartImage
                  src={gallery[activeImage] ?? ""}
                  alt={`${product.name} — image ${activeImage + 1}`}
                  className="h-full w-full"
                />
                {product.featured ? (
                  <span className="absolute top-4 left-4 flex items-center gap-1.5 rounded bg-navy-900/90 px-3 py-1 text-[11px] font-semibold tracking-wider text-white uppercase">
                    Featured
                  </span>
                ) : null}
              </div>

              {gallery.length > 1 ? (
                <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                  {gallery.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={cn(
                        "relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 transition",
                        index === activeImage ? "border-navy-700" : "border-steel-200 opacity-70 hover:opacity-100",
                      )}
                      aria-label={`View image ${index + 1}`}
                      aria-pressed={index === activeImage}
                    >
                      <SmartImage src={image} alt={`${product.name} thumbnail ${index + 1}`} className="h-full w-full" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Details */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {product.categoryId ? (
                  <Link
                    to={`/categories/${product.categoryId}`}
                    className="rounded border border-navy-200 bg-navy-50 px-2.5 py-1 text-[11px] font-semibold tracking-wider text-navy-700 uppercase transition hover:bg-navy-100"
                  >
                    {product.categoryName || "Category"}
                  </Link>
                ) : null}
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase",
                    AVAILABILITY_BADGE[product.availability] ?? AVAILABILITY_BADGE["in-stock"],
                  )}
                >
                  {product.availability === "in-stock" ? (
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {AVAILABILITY_LABELS[product.availability]}
                </span>
              </div>

              <h1 className="mt-4 font-display text-4xl leading-tight font-bold text-steel-900 uppercase sm:text-5xl">
                {product.name}
              </h1>

              <p className="mt-4 text-sm leading-relaxed text-steel-600 sm:text-base">{product.description}</p>

              <div className="mt-6 overflow-hidden rounded-lg border border-steel-200">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Product specifications</caption>
                  <tbody className="divide-y divide-steel-100">
                    {specs.map((row) => (
                      <tr key={row.label} className="bg-white">
                        <th
                          scope="row"
                          className="w-44 bg-steel-50 px-4 py-3 align-top text-xs font-semibold tracking-wide text-steel-600 uppercase"
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <row.icon className="h-3.5 w-3.5 text-navy-600" aria-hidden="true" />
                            {row.label}
                          </span>
                        </th>
                        <td className="px-4 py-3 leading-relaxed whitespace-pre-line text-steel-800">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => openWhatsApp(product.name)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-whatsapp px-6 py-3.5 text-sm font-semibold text-white transition duration-200 hover:bg-whatsapp-dark focus-visible:ring-2 focus-visible:ring-whatsapp focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  Enquire on WhatsApp
                </button>
                <Link
                  to={enquiryLink}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-steel-300 px-6 py-3.5 text-sm font-semibold text-navy-900 transition hover:border-navy-700 hover:bg-navy-900 hover:text-white"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Request a Quote
                </Link>
              </div>

              <p className="mt-4 rounded-md bg-steel-50 px-4 py-3 text-xs leading-relaxed text-steel-600">
                Price, stock and delivery details are shared on request. Send us a WhatsApp message with the product
                name and quantity for an instant response.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related products */}
      <section className="border-t border-steel-200 bg-steel-50 py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-accent-600 uppercase">More like this</p>
              <h2 className="mt-1.5 font-display text-2xl font-bold text-steel-900 uppercase sm:text-3xl">
                Related Products
              </h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 transition hover:text-navy-900"
            >
              View all
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {relatedLoading ? (
            <ProductGridSkeleton count={4} />
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No related products"
              description="Browse the full catalogue for other iron and steel materials."
            >
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-md bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
              >
                Browse products
              </Link>
            </EmptyState>
          )}
        </div>
      </section>
    </>
  );
}
