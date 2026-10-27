import { ArrowRight, Boxes, HardHat, MessageCircle, PackageSearch, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import ProductCard from "../components/ProductCard";
import { CategoryGridSkeleton, ProductGridSkeleton } from "../components/Loading";
import { EmptyState, ErrorState, SectionHeader } from "../components/StateMessage";
import WhatsAppIcon from "../components/WhatsAppIcon";
import { useSeo } from "../hooks/useSeo";
import { useCategories } from "../hooks/useCategories";
import { useFeaturedProducts } from "../hooks/useProducts";
import { openWhatsApp } from "../lib/whatsapp";

/* ─── Value props ────────────────────────────────────────────────────────────*/
const VALUE_PROPS = [
  {
    icon: PackageSearch,
    title: "Wide Material Range",
    description: "TMT bars, angles, channels, plates, pipes, sheets and more — all in one catalogue.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Iron & Steel",
    description: "Materials selected for construction, fabrication and industrial requirements.",
  },
  {
    icon: MessageCircle,
    title: "Quick WhatsApp Response",
    description: "Ask for price, availability and quotation directly on WhatsApp — no waiting.",
  },
  {
    icon: HardHat,
    title: "Built for Every Project",
    description: "Suitable for buildings, infrastructure, workshops and general engineering work.",
  },
];

/* ─── Page ───────────────────────────────────────────────────────────────────*/
export default function Home() {
  useSeo(
    "PallaviTraders | Iron & Steel Materials",
    "PallaviTraders offers a wide range of iron, steel and construction materials. Browse our product catalogue and contact us for availability and quotations.",
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReduced || !videoRef.current) return;
    videoRef.current.play().catch(() => setVideoFailed(true));
  }, [prefersReduced]);

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    reload: reloadCategories,
  } = useCategories();

  const {
    products: featured,
    loading: featuredLoading,
    error: featuredError,
    reload: reloadFeatured,
  } = useFeaturedProducts(8);

  const visibleCategories = categories.slice(0, 8);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────────
          Layout:
            • Outer section fills full viewport height so the video extends
              seamlessly behind the fixed transparent navbar above.
            • Video is absolutely positioned to fill the entire section.
            • A dark gradient overlay aids text readability.
            • Content is vertically centred with top padding that clears the
              fixed navbar (~72px pill + 16px gap = 88px).
            • Bottom fade blends into the dark sections below.
      ─────────────────────────────────────────────────────────────────────── */}
      <section
        className="relative w-full overflow-hidden"
        style={{ minHeight: "100svh", background: "#0B0D10", marginTop: "-72px" }}
      >
        {/* ── Background: fallback image ── */}
        {(prefersReduced || videoFailed) && (
          <img
            src="/images/pallavi-hero.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
            style={{ objectFit: "cover", objectPosition: "center 15%" }}
            draggable={false}
          />
        )}

        {/* ── Background: looping video — single element, never duplicated ── */}
        {!prefersReduced && (
          <video
            ref={videoRef}
            src="/videos/pallavi-hero-bg.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setVideoFailed(true)}
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
            style={{
              display: videoFailed ? "none" : "block",
              objectFit: "cover",
              objectPosition: "center center",
            }}
          />
        )}

        {/* ── Dark overlay — improves readability over bright video frames ── */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: "rgba(11,13,16,0.45)" }}
        />

        {/* ── Bottom fade into dark sections below ── */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 w-full"
          style={{
            height: "120px",
            background: "linear-gradient(to bottom, transparent 0%, #0B0D10 100%)",
          }}
        />

        {/* ── Foreground content — clears fixed navbar + vertically centred ── */}
        
      </section>

      {/* ── PRODUCT TICKER ──────────────────────────────────────────────────── */}
      <div className="border-b border-white/8 bg-charcoal/60 py-3">
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-1.5 px-4 text-[11px] font-semibold tracking-widest text-steel-grey uppercase select-none">
          <li>TMT Bars</li>
          <li aria-hidden="true" className="text-white/20">/</li>
          <li>Angles &amp; Channels</li>
          <li aria-hidden="true" className="text-white/20">/</li>
          <li>Plates &amp; Flats</li>
          <li aria-hidden="true" className="text-white/20">/</li>
          <li>MS &amp; GI Pipes</li>
          <li aria-hidden="true" className="text-white/20">/</li>
          <li>Structural Steel</li>
          <li aria-hidden="true" className="text-white/20">/</li>
          <li>Binding Wire</li>
        </ul>
      </div>

      {/* ── CATEGORIES ──────────────────────────────────────────────────────── */}
      <section className="bg-near-black py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Product Catalogue"
            title="Shop by Category"
            description="Browse iron and steel materials by category. Select a category to view the full range."
            to="/categories"
            actionLabel="View all categories"
          />
          {categoriesLoading ? (
            <CategoryGridSkeleton count={8} />
          ) : categoriesError ? (
            <ErrorState message={categoriesError} onRetry={reloadCategories} />
          ) : visibleCategories.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {visibleCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Boxes}
              title="Categories coming soon"
              description="Our catalogue is being updated. Contact us on WhatsApp for the materials you need."
            >
              <button
                type="button"
                onClick={() => openWhatsApp()}
                className="btn-glass-whatsapp"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Contact on WhatsApp
              </button>
            </EmptyState>
          )}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ───────────────────────────────────────────────── */}
      <section className="bg-charcoal py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Handpicked"
            title="Featured Products"
            description="Popular materials frequently requested by our customers. Contact us for price and availability."
            to="/products"
            actionLabel="Browse all products"
          />
          {featuredLoading ? (
            <ProductGridSkeleton count={8} />
          ) : featuredError ? (
            <ErrorState message={featuredError} onRetry={reloadFeatured} />
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No featured products yet"
              description="Featured items will appear here once they are marked from the admin dashboard. Browse the full catalogue in the meantime."
            >
              <Link
                to="/products"
                className="btn-glass-primary"
              >
                Browse all products
              </Link>
            </EmptyState>
          )}
        </div>
      </section>

      {/* ── VALUE PROPS ─────────────────────────────────────────────────────── */}
      <section className="border-y border-white/8 bg-near-black py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            align="center"
            eyebrow="Why PallaviTraders"
            title="Materials You Can Rely On"
            description="A straightforward catalogue for buyers who need iron and steel materials quickly — with quotations on WhatsApp."
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_PROPS.map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-white/8 bg-charcoal p-6 transition duration-300 hover:border-brand-orange/40 hover:shadow-[0_16px_30px_-18px_rgba(243,107,18,0.2)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-orange/15 text-brand-orange">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-white uppercase">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-steel-grey">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-charcoal py-14 text-white sm:py-16">
        <div className="blueprint-grid absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl font-bold leading-tight uppercase sm:text-4xl">
            Need a quotation for iron &amp; steel materials?
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-steel-grey sm:text-base">
            Tell us the material, size and quantity you need. We will share the
            price, availability and details on WhatsApp.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => openWhatsApp()}
              className="btn-glass-whatsapp"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Request a Quote
            </button>
            <Link
              to="/contact"
              className="btn-glass-secondary"
            >
              Send an Enquiry
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
