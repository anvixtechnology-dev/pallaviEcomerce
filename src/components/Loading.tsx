import { Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return <Loader2 className={cn("animate-spin", className)} aria-hidden="true" />;
}

export function ButtonSpinner({ label = "Please wait…" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Spinner className="h-4 w-4" />
      <span>{label}</span>
    </span>
  );
}

export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-steel-500" role="status">
      <Spinner className="h-8 w-8 text-navy-700" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-lg border border-steel-200 bg-white">
      <div className="skeleton aspect-[4/3] w-full" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-5/6 rounded" />
        <div className="skeleton h-9 w-full rounded" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

export function CategoryGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-lg border border-steel-200 bg-white">
          <div className="skeleton aspect-[16/10] w-full" />
          <div className="space-y-2 p-4">
            <div className="skeleton h-4 w-2/3 rounded" />
            <div className="skeleton h-3 w-full rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-steel-200 bg-white">
      <div className="border-b border-steel-200 bg-steel-50 px-4 py-3">
        <div className="skeleton h-4 w-1/3 rounded" />
      </div>
      <div className="divide-y divide-steel-100">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 px-4 py-4">
            <div className="skeleton h-9 w-9 shrink-0 rounded" />
            <div className="skeleton h-3 flex-1 rounded" />
            <div className="skeleton hidden h-3 w-24 rounded sm:block" />
            <div className="skeleton hidden h-3 w-20 rounded md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
