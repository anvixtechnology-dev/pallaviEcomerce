import { useId, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";

interface SmartImageProps {
  src?: string;
  alt: string;
  className?: string;
  icon?: ReactNode;
}

function ImagePlaceholder({ alt, icon }: { alt: string; icon?: ReactNode }) {
  const patternId = useId();
  const initial = alt.trim().charAt(0).toUpperCase() || "S";

  return (
    <div
      role="img"
      aria-label={alt}
      className="flex h-full w-full items-center justify-center bg-gradient-to-br from-steel-100 via-steel-200 to-steel-300"
    >
      <svg className="absolute h-full w-full opacity-40" aria-hidden="true">
        <defs>
          <pattern id={patternId} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="14" stroke="#97a6b8" strokeWidth="6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
      {icon ? (
        <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-md border border-steel-300 bg-white/70 text-steel-500">
          {icon}
        </span>
      ) : (
        <span className="relative z-10 flex h-16 w-16 items-center justify-center rounded-md border border-steel-400 bg-white/70 font-display text-4xl font-bold text-steel-500">
          {initial}
        </span>
      )}
    </div>
  );
}

/** Renders an image from Firebase Storage with a graceful industrial placeholder
 * when the file is missing or fails to load. */
export default function SmartImage({ src, alt, className, icon }: SmartImageProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  if (showImage) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  return <div className={cn("relative overflow-hidden", className)}>{<ImagePlaceholder alt={alt} icon={icon} />}</div>;
}
