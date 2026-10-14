import { Layers, MessageCircle, Ruler, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { openWhatsApp } from "../lib/whatsapp";
import { AVAILABILITY_LABELS, type Product } from "../types/product";
import SmartImage from "./SmartImage";

const AVAILABILITY_STYLES: Record<Product["availability"], string> = {
  "in-stock": "bg-emerald-100 text-emerald-800 border-emerald-200",
  limited: "bg-amber-100 text-amber-800 border-amber-200",
  "out-of-stock": "bg-steel-200 text-steel-600 border-steel-300",
};

export default function ProductCard({ product }: { product: Product }) {
  const detailsUrl = `/products/${product.id}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-steel-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-steel-300 hover:shadow-[0_18px_35px_-18px_rgba(12,21,38,0.4)]">
      <Link to={detailsUrl} className="relative block aspect-[4/3] overflow-hidden bg-steel-100" tabIndex={-1}>
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
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded bg-navy-900/90 px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase text-white">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
            Featured
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-navy-600 uppercase">
          {product.categoryName || "Iron & Steel"}
        </p>
        <h3 className="mt-1 font-display text-xl leading-tight font-bold text-steel-900 uppercase">
          <Link to={detailsUrl} className="transition group-hover:text-navy-700">
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-steel-600">{product.description}</p>

        <dl className="mt-3 space-y-1.5 text-xs text-steel-600">
          {product.material ? (
            <div className="flex gap-2">
              <dt className="flex shrink-0 items-center gap-1 font-semibold text-steel-700">
                <Layers className="h-3.5 w-3.5 text-steel-400" aria-hidden="true" />
                Material:
              </dt>
              <dd className="truncate">{product.material}</dd>
            </div>
          ) : null}
          {product.sizes ? (
            <div className="flex gap-2">
              <dt className="flex shrink-0 items-center gap-1 font-semibold text-steel-700">
                <Ruler className="h-3.5 w-3.5 text-steel-400" aria-hidden="true" />
                Available Sizes:
              </dt>
              <dd className="truncate">{product.sizes}</dd>
            </div>
          ) : null}
        </dl>

        <button
          type="button"
          onClick={() => openWhatsApp(product.name)}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-navy-700 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Enquire on WhatsApp
        </button>
      </div>
    </article>
  );
}
