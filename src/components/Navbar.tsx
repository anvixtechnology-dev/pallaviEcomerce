import { Menu, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
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
      <img
        src="/images/pallavi-traders-logo.png"
        alt="Pallavi Iron Traders logo"
        width={32}
        height={32}
        className="h-8 w-8 rounded-md object-contain bg-white/5"
        loading="eager"
      />
      <span className="font-display text-xl leading-none font-bold tracking-wide text-white uppercase">
        Pallavi<span className="text-brand-orange">Traders</span>
      </span>
    </span>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Detect scroll to toggle transparent ↔ charcoal background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll(); // run once on mount
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // On the home page the navbar starts transparent; on other pages always charcoal
  const isHome = location.pathname === "/";
  const isTransparent = isHome && !scrolled;

  return (
    <>
      {/* ── Floating pill navbar — fixed so it hovers above the hero video ── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pb-2 pointer-events-none">
        <nav
          className={cn(
            "pointer-events-auto flex w-full max-w-5xl items-center justify-between px-5 py-3 rounded-full text-white text-sm transition-all duration-500",
            isTransparent
              ? // Transparent mode — floats over the video
                "border border-white/20 bg-white/5 backdrop-blur-sm shadow-none"
              : // Scrolled / non-home mode — solid charcoal pill
                "border border-white/15 bg-charcoal/95 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.45)]",
          )}
        >

          {/* ── Logo (left) ── */}
          <Link to="/" aria-label="PallaviTraders home" className="shrink-0">
            <BrandMark />
          </Link>

          {/* ── Desktop nav links with slide-up hover effect (center) ── */}
          <nav className="hidden md:flex items-center gap-6 ml-7" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "relative overflow-hidden h-6 group text-sm font-medium transition-colors",
                    isActive
                      ? "text-white"
                      : isTransparent
                        ? "text-white/75 hover:text-white"
                        : "text-steel-grey hover:text-white",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Static orange dot for active link */}
                    {isActive && (
                      <span
                        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-brand-orange"
                        aria-hidden="true"
                      />
                    )}
                    {/* Slide-up hover animation */}
                    <span className="block group-hover:-translate-y-full transition-transform duration-300">
                      {link.label}
                    </span>
                    <span className="block absolute top-full left-0 group-hover:-translate-y-full transition-transform duration-300 text-white">
                      {link.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* ── Right side CTAs + hamburger ── */}
          <div className="flex items-center gap-3">
            {/* Contact link — desktop */}
            <Link
              to="/contact"
              className={cn(
                "hidden md:inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition duration-200",
                isTransparent
                  ? "border border-white/40 text-white hover:bg-white/15"
                  : "border border-white/25 text-white hover:bg-white/10",
              )}
            >
              Contact
            </Link>

            {/* WhatsApp CTA — desktop, glowing pill */}
            <button
              type="button"
              onClick={() => openWhatsApp()}
              className="hidden md:inline-flex items-center gap-2 bg-whatsapp hover:shadow-[0px_0px_24px_8px] shadow-[0px_0px_18px_5px] shadow-whatsapp/40 hover:shadow-whatsapp/60 text-white px-4 py-2 rounded-full text-sm font-semibold transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-whatsapp focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp
            </button>

            {/* Hamburger — mobile */}
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/20 text-steel-grey hover:bg-white/10 transition"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile drawer ── */}
      <div
        className={cn("fixed inset-0 z-40 md:hidden", mobileOpen ? "pointer-events-auto" : "pointer-events-none")}
        aria-hidden={!mobileOpen}
      >
        {/* Backdrop */}
        <button
          type="button"
          tabIndex={mobileOpen ? 0 : -1}
          onClick={() => setMobileOpen(false)}
          className={cn(
            "absolute inset-0 bg-near-black/70 transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          aria-label="Close navigation menu"
        />

        {/* Drawer panel */}
        <nav
          className={cn(
            "absolute top-0 right-0 flex h-full w-72 max-w-[80vw] flex-col gap-1 overflow-y-auto border-l border-white/10 bg-charcoal p-5 pt-20 shadow-2xl transition-transform duration-300",
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
                  "rounded-full px-4 py-3 text-base font-medium transition",
                  isActive
                    ? "bg-brand-orange text-white"
                    : "text-steel-grey hover:bg-white/8 hover:text-white",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}

          {/* Mobile CTAs */}
          <div className="mt-4 flex flex-col gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center border border-white/25 hover:bg-white/10 px-4 py-3 rounded-full text-base font-medium text-white transition"
            >
              Contact
            </Link>
            <button
              type="button"
              onClick={() => openWhatsApp()}
              className="inline-flex items-center justify-center gap-2 bg-whatsapp shadow-[0px_0px_18px_5px] shadow-whatsapp/40 px-4 py-3 rounded-full text-base font-semibold text-white transition hover:opacity-90"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Contact on WhatsApp
            </button>
          </div>

          <p className="mt-auto px-4 pt-6 text-xs leading-relaxed text-steel-grey">
            Quality Iron &amp; Steel Materials for Every Construction Need.
          </p>
        </nav>
      </div>
    </>
  );
}
