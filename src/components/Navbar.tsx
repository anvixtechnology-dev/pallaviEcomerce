import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { openWhatsApp } from "../lib/whatsapp";
import WhatsAppIcon from "./WhatsAppIcon";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

function BrandMark() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-600 shadow-inner">
        <svg viewBox="0 0 64 64" className="h-5 w-5" aria-hidden="true">
          <path d="M16 14h32v8H36v20h12v8H16v-8h12V22H16z" fill="#ffffff" />
        </svg>
      </span>
      <span className="font-display text-2xl leading-none font-bold tracking-wide text-white uppercase">
        Pallavi<span className="text-accent-500">Traders</span>
      </span>
    </span>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-navy-700/60 bg-navy-950/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-[70px] lg:px-8">
        <Link to="/" aria-label="PallaviTraders home" className="shrink-0">
          <BrandMark />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                cn(
                  "relative px-3 py-2 text-sm font-medium tracking-wide transition",
                  isActive ? "text-white" : "text-steel-300 hover:text-white",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  <span
                    className={cn(
                      "absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent-500 transition-opacity",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                    aria-hidden="true"
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openWhatsApp()}
            className="hidden items-center gap-2 rounded-md bg-whatsapp px-4 py-2 text-sm font-semibold text-white transition hover:bg-whatsapp-dark focus-visible:ring-2 focus-visible:ring-whatsapp focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 focus-visible:outline-none sm:inline-flex"
          >
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-navy-700 text-steel-200 transition hover:bg-navy-800 lg:hidden"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn("fixed inset-0 z-40 lg:hidden", mobileOpen ? "pointer-events-auto" : "pointer-events-none")}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          tabIndex={mobileOpen ? 0 : -1}
          onClick={() => setMobileOpen(false)}
          className={cn(
            "absolute inset-0 bg-steel-950/70 transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          aria-label="Close navigation menu"
        />
        <nav
          className={cn(
            "absolute top-0 right-0 flex h-full w-72 max-w-[80vw] flex-col gap-1 overflow-y-auto border-l border-navy-700 bg-navy-900 p-5 pt-20 shadow-2xl transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "translate-x-full",
          )}
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-4 py-3 text-base font-medium transition",
                  isActive ? "bg-navy-800 text-white" : "text-steel-300 hover:bg-navy-800/60 hover:text-white",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={() => openWhatsApp()}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-md bg-whatsapp px-4 py-3 text-base font-semibold text-white transition hover:bg-whatsapp-dark"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Contact on WhatsApp
          </button>

          <p className="mt-auto px-4 pt-6 text-xs leading-relaxed text-steel-500">
            Quality Iron &amp; Steel Materials for Every Construction Need.
          </p>
        </nav>
      </div>
    </header>
  );
}
