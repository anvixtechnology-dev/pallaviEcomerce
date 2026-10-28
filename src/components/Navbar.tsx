import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { openWhatsApp } from "../lib/whatsapp";
import WhatsAppIcon from "./WhatsAppIcon";

const LOGO_SRC = "data:image/jpeg;base64,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";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

// Contact and WhatsApp are desktop-only in the navbar; on mobile they stay
// reachable through the footer, page CTAs and the floating WhatsApp button.
const MOBILE_NAV_LINKS = NAV_LINKS.filter((link) => link.to !== "/contact");

function BrandMark() {
  return (
    <span className="flex items-center">
      <img
        src={LOGO_SRC}
        alt="Pallavi Iron Traders"
        className="h-10 w-auto object-contain"
        loading="eager"
      />
    </span>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Close on Escape (returning focus to the toggle) and when resizing up to the desktop layout.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        toggleRef.current?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 48rem)");
    const onBreakpoint = () => { if (desktop.matches) setMobileOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [mobileOpen]);

  const isHome = location.pathname === "/";
  const isTransparent = isHome && !scrolled && !mobileOpen;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 pt-3 pb-2 pointer-events-none sm:px-4 md:pt-4">
        <nav
          className={cn(
            "pointer-events-auto flex w-full max-w-5xl items-center justify-between rounded-full py-2 pr-2 pl-4 text-white text-sm transition-all duration-500 md:py-3 md:px-4 lg:px-5",
            isTransparent
              ? "border border-white/20 bg-white/5 backdrop-blur-sm shadow-none"
              : "border border-white/15 bg-charcoal/95 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.45)]",
          )}
        >
          <Link to="/" aria-label="PallaviTraders home" className="shrink-0">
            <BrandMark />
          </Link>

          <nav className="hidden md:flex items-center gap-4 ml-4 lg:gap-6 lg:ml-7" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "relative overflow-hidden h-6 group whitespace-nowrap text-sm font-medium transition-colors",
                    isActive ? "text-white" : isTransparent ? "text-white/75 hover:text-white" : "text-steel-grey hover:text-white",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-brand-orange" aria-hidden="true" />
                    )}
                    <span className="block group-hover:-translate-y-full transition-transform duration-300">{link.label}</span>
                    <span className="block absolute top-full left-0 group-hover:-translate-y-full transition-transform duration-300 text-white">{link.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* Hidden via a wrapper: the unlayered .btn-glass-* display rule overrides a `hidden` utility on the buttons themselves. */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/contact" className="btn-glass-secondary !py-2 !px-4 text-sm">Contact</Link>
              <button type="button" onClick={() => openWhatsApp()} className="btn-glass-whatsapp !py-2 !px-4 text-sm">
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp
              </button>
            </div>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="relative md:hidden inline-flex items-center justify-center h-11 w-11 rounded-full border border-white/20 text-white/85 hover:bg-white/10 hover:text-white transition"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
            >
              <Menu className={cn("absolute h-5 w-5 transition duration-200", mobileOpen ? "rotate-90 scale-50 opacity-0" : "opacity-100")} aria-hidden="true" />
              <X className={cn("absolute h-5 w-5 transition duration-200", mobileOpen ? "opacity-100" : "-rotate-90 scale-50 opacity-0")} aria-hidden="true" />
            </button>
          </div>
        </nav>
      </header>

      <div
        className={cn("fixed inset-0 z-40 md:hidden", mobileOpen ? "pointer-events-auto" : "pointer-events-none")}
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
      >
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setMobileOpen(false)}
          className={cn("absolute inset-0 bg-near-black/70 backdrop-blur-[2px] transition-opacity duration-300", mobileOpen ? "opacity-100" : "opacity-0")}
          aria-label="Close navigation menu"
        />
        <nav
          id="mobile-navigation"
          className={cn(
            "absolute top-0 right-0 flex h-full w-72 max-w-[85vw] flex-col gap-1 overflow-y-auto overscroll-contain border-l border-white/10 bg-charcoal px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[calc(var(--nav-h)+1rem)] shadow-2xl transition-transform duration-300 ease-out",
            mobileOpen ? "translate-x-0" : "translate-x-full",
          )}
          aria-label="Mobile navigation"
        >
          {MOBILE_NAV_LINKS.map((link, index) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={() => setMobileOpen(false)}
              style={{ transitionDelay: mobileOpen ? `${80 + index * 40}ms` : "0ms" }}
              className={({ isActive }) =>
                cn(
                  "flex min-h-12 items-center rounded-xl px-4 text-base font-medium transition duration-300",
                  mobileOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0",
                  isActive ? "bg-brand-orange text-white" : "text-steel-grey hover:bg-white/8 hover:text-white",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          <p className="mt-auto px-4 pt-6 text-xs leading-relaxed text-steel-grey">
            Quality Iron &amp; Steel Materials for Every Construction Need.
          </p>
        </nav>
      </div>
    </>
  );
}
