import { ArrowRight, Boxes } from "lucide-react";
import { Link } from "react-router-dom";
import type { Category } from "../types/category";
import SmartImage from "./SmartImage";

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      to={`/categories/${category.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border-light bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-orange/40 hover:shadow-[0_18px_35px_-18px_rgba(243,107,18,0.2)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-cream">
        <SmartImage
          src={category.imageUrl}
          alt={category.name}
          icon={<Boxes className="h-7 w-7" aria-hidden="true" />}
          className="h-full w-full transition duration-500 group-hover:scale-105"
        />
        <span className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/20 to-transparent" aria-hidden="true" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        <h3 className="font-display text-base leading-tight font-bold break-words text-charcoal uppercase transition group-hover:text-brand-orange sm:text-lg">
          {category.name}
        </h3>
        {category.description ? (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-text-secondary sm:text-sm">{category.description}</p>
        ) : null}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-xs font-semibold tracking-wide text-brand-orange uppercase">
          View products
          <ArrowRight className="h-3.5 w-3.5 transition duration-300 group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
