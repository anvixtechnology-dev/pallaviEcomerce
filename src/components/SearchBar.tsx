import { Search, X } from "lucide-react";
import { cn } from "../lib/utils";

interface SearchBarProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export default function SearchBar({
  id,
  value,
  onChange,
  placeholder = "Search products…",
  className,
  autoFocus = false,
}: SearchBarProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-steel-400"
        aria-hidden="true"
      />
      <input
        id={id}
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-md border border-steel-300 bg-white py-2.5 pr-10 pl-9 text-sm text-steel-800 placeholder:text-steel-400 focus:border-navy-600 focus:ring-2 focus:ring-navy-600/15 focus:outline-none"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-1 -translate-y-1/2 rounded p-2 text-steel-400 transition hover:bg-steel-100 hover:text-steel-700"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
