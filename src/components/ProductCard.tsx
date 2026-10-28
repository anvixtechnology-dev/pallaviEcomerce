import { Layers, MessageCircle, Ruler, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { openWhatsApp } from "../lib/whatsapp";
import { AVAILABILITY_LABELS, type Product } from "../types/product";
import SmartImage from "./SmartImage";

const AVAILABILITY_STYLES: Record<Product["availability"], string> = {
  "in-stock": "bg-emerald-900/60 text-emerald-400 border-emerald-700/50",
  limited: "bg-amber-900/60 text-amber-400 border-amber-700/50",
  "out-of-stock": "bg-white/5 text-steel-grey border-white/15",
};

export default function ProductCard({ product }: { product: Product }) {
  const detailsUrl = `/products/${product.id}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-charcoal transition duration-300 hover:-translate-y-1 hover:border-brand-orange/40 hover:shadow-[0_18px_35px_-18px_rgba(243,107,18,0.2)]">
      <Link to={detailsUrl} className="relative block aspect-[4/3] overflow-hidden bg-navy-800" tabIndex={-1}>
        <SmartImage
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full transition duration-500 group-hover:scale-105"
        />
        <span
          className={cn(
            "absolute top-3 left-3 rounded border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
            AVAILABILITY_STYLES[product.availability],
          )}
        >
          {AVAILABILITY_LABELS[product.availability]}
        </span>
        {product.featured ? (
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded bg-brand-orange/90 px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase text-white">
            <Star className="h-3 w-3 fill-white text-white" aria-hidden="true" />
            Featured
          </span>
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-brand-orange uppercase">
          {product.categoryName || "Iron & Steel"}
        </p>
        <h3 className="mt-1 font-display text-xl leading-tight font-bold break-words text-white uppercase">
          <Link to={detailsUrl} className="transition group-hover:text-brand-orange">
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-steel-grey">{product.description}</p>

        <dl className="mt-3 mb-4 space-y-1.5 text-xs text-steel-grey">
          {product.material ? (
            <div className="flex gap-2">
              <dt className="flex shrink-0 items-center gap-1 font-semibold text-steel-grey/80">
                <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                Material:
              </dt>
              <dd className="min-w-0 truncate">{product.material}</dd>
            </div>
          ) : null}
          {product.sizes ? (
            <div className="flex gap-2">
              <dt className="flex shrink-0 items-center gap-1 font-semibold text-steel-grey/80">
                <Ruler className="h-3.5 w-3.5" aria-hidden="true" />
                Available Sizes:
              </dt>
              <dd className="min-w-0 truncate">{product.sizes}</dd>
            </div>
          ) : null}
        </dl>

        <button
          type="button"
          onClick={() => openWhatsApp(product.name)}
          className="btn-glass-whatsapp mt-auto w-full"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Enquire on WhatsApp
        </button>
      </div>
    </article>
  );
}
