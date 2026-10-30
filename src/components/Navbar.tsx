import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { openWhatsApp } from "../lib/whatsapp";
import WhatsAppIcon from "./WhatsAppIcon";

const DESKTOP_NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const MOBILE_NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About" },
];

function BrandMark() {
  return (
    <span className="flex items-center">
      <img
        src="/images/pallavi-logo.jpg"
        alt="Pallavi Iron Traders"
        className="h-10 w-auto object-contain"
        loading="eager"
      />
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
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pb-2 pointer-events-none">
        <nav className="pointer-events-auto flex w-full max-w-5xl items-center justify-between px-5 py-3 rounded-full text-sm border border-border-light bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md">
          <Link to="/" aria-label="PallaviTraders home" className="shrink-0">
            <BrandMark />
          </Link>

          <nav className="hidden md:flex items-center gap-6 ml-7" aria-label="Main navigation">
            {DESKTOP_NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "relative overflow-hidden h-6 group text-sm font-medium transition-colors",
                    isActive ? "text-brand-orange" : "text-charcoal/70 hover:text-charcoal",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-brand-orange" aria-hidden="true" />
                    )}
                    <span className="block group-hover:-translate-y-full transition-transform duration-300">{link.label}</span>
                    <span className="block absolute top-full left-0 group-hover:-translate-y-full transition-transform duration-300 text-charcoal">{link.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/contact"
              className="hidden md:inline-flex items-center justify-center rounded-full border border-border-light bg-white px-4 py-2 text-sm font-semibold text-charcoal transition hover:border-brand-orange/50 hover:text-brand-orange"
            >
              Contact
            </Link>
            <button
              type="button"
              onClick={() => openWhatsApp()}
              className="hidden md:inline-flex btn-glass-whatsapp !py-2 !px-4 text-sm"
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="md:hidden inline-flex items-center justify-center h-11 w-11 rounded-full border border-border-light text-charcoal hover:bg-surface-cream transition"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </header>

      <div
        className={cn("fixed inset-0 z-40 md:hidden", mobileOpen ? "pointer-events-auto" : "pointer-events-none")}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          tabIndex={mobileOpen ? 0 : -1}
          onClick={() => setMobileOpen(false)}
          className={cn(
            "absolute inset-0 bg-charcoal/40 transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          aria-label="Close navigation menu"
        />
        <nav
          id="mobile-nav-drawer"
          className={cn(
            "absolute top-0 right-0 flex h-full w-72 max-w-[80vw] flex-col gap-1 overflow-y-auto border-l border-border-light bg-white p-5 pt-20 shadow-2xl transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "translate-x-full",
          )}
          aria-label="Mobile navigation"
        >
          {MOBILE_NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-4 py-3 text-base font-medium transition",
                  isActive ? "bg-brand-orange text-white" : "text-charcoal hover:bg-surface-cream",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          <p className="mt-auto px-4 pt-6 text-xs leading-relaxed text-text-secondary">
            Quality Iron &amp; Steel Materials for Every Construction Need.
          </p>
        </nav>
      </div>
    </>
  );
}