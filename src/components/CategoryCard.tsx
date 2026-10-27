import { ArrowRight, Boxes } from "lucide-react";
import { Link } from "react-router-dom";
import type { Category } from "../types/category";
import SmartImage from "./SmartImage";

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      to={`/categories/${category.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-charcoal transition duration-300 hover:-translate-y-1 hover:border-brand-orange/40 hover:shadow-[0_18px_35px_-18px_rgba(243,107,18,0.2)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-navy-800">
        <SmartImage
          src={category.imageUrl}
          alt={category.name}
          icon={<Boxes className="h-7 w-7" aria-hidden="true" />}
          className="h-full w-full transition duration-500 group-hover:scale-105"
        />
        <span className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-near-black/80 to-transparent" aria-hidden="true" />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg leading-tight font-bold text-white uppercase transition group-hover:text-brand-orange">
          {category.name}
        </h3>
        {category.description ? (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-steel-grey">{category.description}</p>
        ) : null}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-xs font-semibold tracking-wide text-brand-orange uppercase">
          View products
          <ArrowRight className="h-3.5 w-3.5 transition duration-300 group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
