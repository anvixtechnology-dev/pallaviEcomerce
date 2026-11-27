import { ArrowLeft, ChevronRight, FileText, Layers, MessageCircle, Package, Ruler, Tag } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { canOrder } from "../lib/productAvailability";
import { getSizeOptions, getSpecRows } from "../lib/productSpecs";
import { cn } from "../lib/utils";
import { openProductEnquiry } from "../lib/whatsapp";
import { AVAILABILITY_LABELS, DOCUMENT_KIND_LABELS, UNIT_LABELS, type Product } from "../types/product";
import SmartImage from "./SmartImage";

const AVAILABILITY_STYLES = {
  "in-stock": "bg-emerald-100 text-emerald-800 border-emerald-200",
  limited: "bg-amber-100 text-amber-800 border-amber-200",
  "out-of-stock": "bg-steel-200 text-steel-600 border-steel-300",
} as const;

const PRIMARY_ACTION =
  "inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-orange px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-orange-dark focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60";
const SECONDARY_ACTION =
  "inline-flex w-full items-center justify-center gap-2 rounded-md border border-border-grey bg-white px-6 py-3 text-sm font-semibold text-charcoal transition hover:border-brand-orange";
const INPUT =
  "w-full rounded-md border border-border-grey bg-white px-3 py-2.5 text-sm text-charcoal focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/15 focus:outline-none";

/** Lets a customer choose a size and quantity, then enquire about the product. */
function ProductPurchasePanel({ product, preview }: { product: Product; preview: boolean }) {
  const sizeOptions = getSizeOptions(product.sizes);
  const [quantity, setQuantity] = useState("1");
  const [size, setSize] = useState("");

  const quantityValue = Number(quantity);
  const invalidQuantity = !Number.isFinite(quantityValue) || quantityValue <= 0;
  const aboveStock = product.trackInventory && !product.allowBackorders && quantityValue > product.availableQuantity;
  const orderable = canOrder(product);
  const unit = UNIT_LABELS[product.inventoryUnit];
  const quantityLabel = `${quantity} ${unit}`;

  const enquiry = new URLSearchParams({
    productId: product.id,
    product: product.name,
    ...(size ? { size } : {}),
    quantity: quantityLabel,
  });

  return (
    <div className="mt-6 rounded-lg border border-border-grey bg-white p-4 sm:p-5">
      <p className="font-display text-2xl font-bold text-charcoal uppercase">Enquire for Price &amp; Availability</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {sizeOptions.length > 1 ? (
          <div>
            <label htmlFor="purchase-size" className="mb-1.5 block text-xs font-semibold tracking-wide text-steel-grey uppercase">Size</label>
            <select id="purchase-size" value={size} onChange={(event) => setSize(event.target.value)} className={INPUT}>
              <option value="">Select a size</option>
              {sizeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        ) : null}
        <div>
          <label htmlFor="purchase-quantity" className="mb-1.5 block text-xs font-semibold tracking-wide text-steel-grey uppercase">
            Quantity ({unit})
          </label>
          <input id="purchase-quantity" type="number" min={1} step="any" value={quantity} onChange={(event) => setQuantity(event.target.value)} className={INPUT} />
        </div>
      </div>

      {invalidQuantity ? <p className="mt-2 text-xs text-red-600">Enter a quantity greater than zero.</p> : null}
      {aboveStock ? <p className="mt-2 text-xs text-red-600">Only {product.availableQuantity} {unit} available.</p> : null}
      {!orderable ? <p className="mt-2 text-sm font-semibold text-steel-600">Currently out of stock — you can still enquire.</p> : null}

      <div className="mt-4 space-y-3">
        <button
          type="button"
          disabled={preview || invalidQuantity || aboveStock}
          onClick={() =>
            openProductEnquiry({
              productId: product.id,
              name: product.name,
              action: "please share the price and availability for",
              size,
              quantity: quantityLabel,
            })
          }
          className={PRIMARY_ACTION}
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Enquire on WhatsApp
        </button>

        {preview ? (
          <span className={cn(SECONDARY_ACTION, "cursor-not-allowed opacity-60")}>Request a Quote</span>
        ) : (
          <Link to={`/contact?${enquiry.toString()}`} className={SECONDARY_ACTION}>
            Request a Quote
          </Link>
        )}
      </div>
    </div>
  );
}

/** The customer-facing product page, also used for admin previews. */
export default function ProductDetailsView({
  product,
  preview = false,
}: {
  product: Product;
  preview?: boolean;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const images = [product.imageUrl, ...product.additionalImages].filter(Boolean);

  const summary = [
    { icon: Tag, label: "Category", value: product.categoryName },
    { icon: Tag, label: "Subcategory", value: product.subcategory },
    { icon: Tag, label: "Brand", value: product.brand },
    { icon: Package, label: "Availability", value: AVAILABILITY_LABELS[product.availability] },
  ].filter((row) => Boolean(row.value));

  const specRows = getSpecRows(product).map((row) => ({
    ...row,
    icon: /material/i.test(row.label) ? Layers : Ruler,
  }));

  return (
    <section className={cn("bg-warm-white pb-10 sm:pb-14", preview ? "pt-8" : "pt-below-nav")}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {!preview ? (
          <>
            {/* Breadcrumb */}
            <nav className="mb-6 flex flex-wrap items-center gap-1 text-xs text-steel-grey" aria-label="Breadcrumb">
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
              <span className="min-w-0 max-w-[160px] truncate font-medium text-charcoal sm:max-w-xs">{product.name}</span>
            </nav>

            {/* Back link */}
            <Link
              to="/products"
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-steel-grey transition hover:text-charcoal"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Products
            </Link>
          </>
        ) : null}

        <div className="grid gap-8 md:grid-cols-2 md:gap-8 lg:gap-12">
          {/* Images */}
          <div className="min-w-0">
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
                    key={src}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded border-2 transition sm:h-20 sm:w-20 ${
                      index === activeImage ? "border-brand-orange" : "border-border-grey hover:border-brand-orange"
                    }`}
                    aria-label={`View image ${index + 1}`}
                    aria-pressed={index === activeImage}
                  >
                    <SmartImage src={src} alt={`${product.name} image ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Info */}
          <div className="min-w-0">
            {product.categoryName ? (
              <span className="inline-block rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-0.5 text-xs font-semibold tracking-wide text-brand-orange uppercase">
                {product.categoryName}
              </span>
            ) : null}

            <h1 className="mt-2 font-display text-3xl font-bold break-words uppercase text-charcoal sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className={`rounded border px-2.5 py-1 text-xs font-semibold tracking-wide uppercase ${AVAILABILITY_STYLES[product.availability]}`}>
                {AVAILABILITY_LABELS[product.availability]}
              </span>
              {product.featured ? (
                <span className="rounded bg-brand-orange-dark px-2.5 py-1 text-xs font-semibold tracking-wide uppercase text-white">Featured</span>
              ) : null}
              {product.newArrival ? (
                <span className="rounded bg-brand-orange-dark px-2.5 py-1 text-xs font-semibold tracking-wide uppercase text-white">New Arrival</span>
              ) : null}
              {product.bestSeller ? (
                <span className="rounded bg-brand-orange-dark px-2.5 py-1 text-xs font-semibold tracking-wide uppercase text-white">Best Seller</span>
              ) : null}
            </div>

            {product.shortDescription && product.shortDescription !== product.description ? (
              <p className="mt-4 text-sm leading-relaxed font-medium break-words whitespace-pre-line text-charcoal sm:text-base">{product.shortDescription}</p>
            ) : null}
            {product.description ? (
              <p className="mt-4 text-sm leading-relaxed break-words whitespace-pre-line text-steel-600 sm:text-base">{product.description}</p>
            ) : null}

            <ProductPurchasePanel key={product.id} product={product} preview={preview} />

            {[...summary, ...specRows].length > 0 ? (
              <dl className="mt-6 space-y-3 rounded-lg border border-border-grey bg-white p-4 sm:p-5">
                {[...summary, ...specRows].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" aria-hidden="true" />
                    <div className="flex min-w-0 flex-wrap gap-x-3 gap-y-0.5 text-sm">
                      <dt className="font-semibold text-charcoal">{label}:</dt>
                      <dd className="min-w-0 break-words whitespace-pre-line text-steel-600">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            ) : null}

            {product.documents.length > 0 ? (
              <ul className="mt-6 space-y-2">
                {product.documents.map((document) => (
                  <li key={document.url}>
                    <a
                      href={document.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-md border border-border-grey bg-white px-4 py-2.5 text-sm font-medium text-charcoal transition hover:border-brand-orange"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-brand-orange" aria-hidden="true" />
                      <span className="min-w-0 truncate">
                        {DOCUMENT_KIND_LABELS[document.kind]} — {document.name}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
