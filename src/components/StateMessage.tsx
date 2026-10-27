import { AlertTriangle, RotateCcw, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  to?: string;
  actionLabel?: string;
  align?: "left" | "center";
}

export function SectionHeader({ eyebrow, title, description, to, actionLabel, align = "left" }: SectionHeaderProps) {
  const centered = align === "center";

  return (
    <div className={cn("mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", centered && "sm:flex-col sm:items-center sm:text-center")}>
      <div className={cn(centered && "text-center")}>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-brand-orange uppercase">{eyebrow}</p>
        ) : null}
        <h2 className="font-display text-3xl leading-tight font-bold text-charcoal uppercase sm:text-4xl">
          {title}
        </h2>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-steel-600 sm:text-base">{description}</p> : null}
      </div>
      {to && actionLabel ? (
        <Link
          to={to}
          className="btn-glass-secondary shrink-0 !py-2 !px-4 text-sm"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "We could not load this content. Please try again.", onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-6 text-center" role="alert">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden="true" />
      </div>
      <p className="mt-3 text-sm font-medium text-red-800">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </button>
      ) : null}
    </div>
  );
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-border-grey bg-warm-white px-6 py-12 text-center">
      {Icon ? (
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white">
          <Icon className="h-6 w-6 text-steel-grey" aria-hidden="true" />
        </div>
      ) : null}
      <h3 className="mt-4 font-display text-xl font-bold text-charcoal uppercase">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-steel-600">{description}</p> : null}
      {children ? <div className="mt-5 flex flex-wrap justify-center gap-3">{children}</div> : null}
    </div>
  );
}
