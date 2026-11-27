import { Layers, MessageCircle, Ruler } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { openWhatsApp } from "../lib/whatsapp";
import { AVAILABILITY_LABELS, type Product } from "../types/product";
import SmartImage from "./SmartImage";

const AVAILABILITY_STYLES: Record<Product["availability"], string> = {
  "in-stock": "bg-emerald-50 text-emerald-700 border-emerald-200",
  limited: "bg-amber-50 text-amber-700 border-amber-200",
  "out-of-stock": "bg-gray-100 text-gray-500 border-gray-200",
};

export default function ProductCard({ product }: { product: Product }) {
  const detailsUrl = `/products/${product.slug || product.id}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border-light bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-orange/40 hover:shadow-[0_18px_35px_-18px_rgba(243,107,18,0.2)]">
      <Link to={detailsUrl} className="relative block aspect-[4/3] overflow-hidden bg-surface-cream" tabIndex={-1}>
        <SmartImage
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full transition duration-500 group-hover:scale-105"
        />
        <span
          className={cn(
            "absolute top-2 left-2 rounded border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase sm:top-3 sm:left-3 sm:px-2 sm:text-[11px]",
            AVAILABILITY_STYLES[product.availability],
          )}
        >
          {AVAILABILITY_LABELS[product.availability]}
        </span>
        <span className="absolute top-2 right-2 flex flex-col items-end gap-1 sm:top-3 sm:right-3">
          {product.newArrival ? (
            <span className="rounded bg-brand-orange-dark px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-white sm:px-2 sm:text-[11px]">New Arrival</span>
          ) : null}
          {product.bestSeller ? (
            <span className="rounded bg-brand-orange-dark px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-white sm:px-2 sm:text-[11px]">Best Seller</span>
          ) : null}
        </span>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-brand-orange uppercase sm:text-[11px]">
          Iron &amp; Steel
        </p>
        <h3 className="mt-1 font-display text-base leading-tight font-bold break-words text-charcoal uppercase sm:text-xl">
          <Link to={detailsUrl} className="transition group-hover:text-brand-orange">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-text-secondary sm:mt-2 sm:text-sm">
          {product.shortDescription || product.description}
        </p>

        <dl className="mt-2 mb-3 space-y-1 text-[11px] text-text-secondary sm:mt-3 sm:mb-4 sm:space-y-1.5 sm:text-xs">
          {product.material ? (
            <div className="flex gap-1.5 sm:gap-2">
              <dt className="flex shrink-0 items-center gap-1 font-semibold text-text-secondary/80">
                <Layers className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Material:</span>
              </dt>
              <dd className="min-w-0 truncate">{product.material}</dd>
            </div>
          ) : null}
          {product.sizes ? (
            <div className="flex gap-1.5 sm:gap-2">
              <dt className="flex shrink-0 items-center gap-1 font-semibold text-text-secondary/80">
                <Ruler className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Available Sizes:</span>
              </dt>
              <dd className="min-w-0 truncate">{product.sizes}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-auto space-y-1.5 sm:space-y-2">
          <Link to={detailsUrl} className="btn-glass-secondary w-full !px-3 !py-2 !text-xs sm:!px-5 sm:!py-2.5 sm:!text-sm">
            View Product
          </Link>
          <button
            type="button"
            onClick={() => openWhatsApp(product.name)}
            className="btn-glass-whatsapp w-full !px-3 !py-2 !text-xs sm:!px-5 sm:!py-2.5 sm:!text-sm"
          >
            <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
            <span className="sm:hidden">WhatsApp</span>
            <span className="hidden sm:inline">Enquire on WhatsApp</span>
          </button>
        </div>
      </div>
    </article>
  );
}
