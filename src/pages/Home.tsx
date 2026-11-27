import { ArrowRight, Boxes, ChevronLeft, ChevronRight, HardHat, MessageCircle, PackageSearch, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
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

const VALUE_PROPS = [
  { icon: PackageSearch, title: "Wide Material Range", description: "TMT bars, angles, channels, plates, pipes, sheets and more — all in one catalogue." },
  { icon: ShieldCheck, title: "Quality Iron & Steel", description: "Materials selected for construction, fabrication and industrial requirements." },
  { icon: MessageCircle, title: "Quick WhatsApp Response", description: "Ask for price, availability and quotation directly on WhatsApp — no waiting." },
  { icon: HardHat, title: "Built for Every Project", description: "Suitable for buildings, infrastructure, workshops and general engineering work." },
];

const HERO_IMAGES = [
  { src: "/images/Add%201.jpg", alt: "Pallavi Traders advertisement 1" },
  { src: "/images/Add%202.png", alt: "Pallavi Traders advertisement 2" },
  { src: "/images/Add%203.jpg", alt: "Pallavi Traders advertisement 3" },
  { src: "/images/Add%204.jpg", alt: "Pallavi Traders advertisement 4" },
  { src: "/images/add%205.png", alt: "Pallavi Traders advertisement 5" },
  { src: "/images/Add%206.png", alt: "Pallavi Traders advertisement 6" },
  { src: "/images/add%207.jpg", alt: "Pallavi Traders advertisement 7" },
];

const SHOP_SLIDES = [
  { src: "/images/PallaviShop2.jpg", alt: "Pallavi Traders shop interior, second view" },
  { src: "/images/PallaviShop3.jpeg", alt: "Pallavi Traders shop interior, third view" },
  { src: "/images/PallaviShop5.jpeg", alt: "Pallavi Traders shop interior, fifth view" },
  { src: "/images/PallaviShop6.jpeg", alt: "Pallavi Traders shop interior, sixth view" },
  { src: "/images/PallaviShop7.jpeg", alt: "Pallavi Traders shop interior, seventh view" },
  { src: "/images/PallaviShop8.jpeg", alt: "Pallavi Traders shop interior, eighth view" },
  { src: "/images/PallaviShop9.jpeg", alt: "Pallavi Traders shop interior, ninth view" },
];

function ShopSlideshow() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % SHOP_SLIDES.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [isPaused]);

  const goTo = (index: number) => {
    setActiveIndex((index + SHOP_SLIDES.length) % SHOP_SLIDES.length);
  };

  return (
    <section className="bg-surface-cream py-12 sm:py-14" aria-label="Pallavi Traders shop photos">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Shop photo slideshow"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              goTo(activeIndex - 1);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              goTo(activeIndex + 1);
            }
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
          }}
          className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border-light bg-white shadow-[0_20px_45px_-25px_rgba(243,107,18,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 sm:aspect-[16/9]"
        >
          {SHOP_SLIDES.map((slide, index) => (
            <img
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              aria-hidden={index !== activeIndex}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${index === activeIndex ? "opacity-100" : "opacity-0"}`}
            />
          ))}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" aria-hidden="true" />

          <span className="absolute top-3 right-3 rounded-full bg-black/35 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {activeIndex + 1} / {SHOP_SLIDES.length}
          </span>

          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            aria-label="Previous photo"
            className="absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/85 text-charcoal shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-brand-orange-dark focus-visible:ring-2 focus-visible:ring-brand-orange sm:h-11 sm:w-11"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            aria-label="Next photo"
            className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/85 text-charcoal shadow-sm backdrop-blur-sm transition hover:bg-white hover:text-brand-orange-dark focus-visible:ring-2 focus-visible:ring-brand-orange sm:h-11 sm:w-11"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2">
            {SHOP_SLIDES.map((slide, index) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                className={`h-2 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 ${index === activeIndex ? "w-7 bg-white" : "w-2 bg-white/60 hover:bg-white"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  useSeo(
    "PallaviTraders | Iron & Steel Materials",
    "PallaviTraders offers a wide range of iron, steel and construction materials. Browse our product catalogue and contact us for availability and quotations.",
  );

  const { categories, loading: categoriesLoading, error: categoriesError, reload: reloadCategories } = useCategories();
  const { products: featured, loading: featuredLoading, error: featuredError, reload: reloadFeatured } = useFeaturedProducts(8);
  const visibleCategories = categories.slice(0, 8);

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative isolate min-h-[100svh] w-full overflow-hidden bg-surface-cream pt-[var(--nav-h)]">
        {/* Background video — full cover behind all content */}
        <video
          src="/videos/Logo_reveal_animation_for_company_20261027131025-clean.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/Pallavi%20Logo.jpeg"
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-20 h-[70%] w-full object-cover object-[50%_30%] sm:h-full sm:object-center"
        />

        {/* Light overlay — keeps text readable without hiding the video */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-b from-white/55 via-white/50 to-surface-cream/75 sm:from-white/45 sm:via-white/50 sm:to-surface-cream/70"
        />

        {/* Hero content — centred vertically over the video */}
        <div className="relative z-10 flex min-h-[calc(100svh-var(--nav-h))] flex-col items-center justify-center px-3 py-8 text-center sm:px-6 sm:py-20 lg:px-8">
          {/* Eyebrow badge */}
          <span className="mb-3 inline-block rounded-full border border-brand-orange/40 bg-white/80 px-3 py-1 text-[10px] font-semibold tracking-wide text-brand-orange-dark uppercase backdrop-blur-sm sm:mb-5 sm:px-4 sm:py-1.5 sm:text-xs sm:tracking-widest">
            PIPES &amp; ROOFING SHEETS
          </span>

          {/* Heading */}
          <h1 className="max-w-full font-display text-[1.75rem] font-bold leading-[1.1] break-words text-charcoal uppercase xs:text-3xl sm:text-5xl md:text-6xl">
            Quality{" "}
            <span className="text-brand-orange">Pipes</span>
            <br className="hidden sm:block" />
            {" "}and Roofing Sheets
          </h1>

          {/* Advertisement thumbnails */}
          <div className="mt-4 flex max-w-3xl flex-wrap items-center justify-center gap-2 sm:mt-6 sm:gap-3">
            {HERO_IMAGES.map((image) => (
              <img
                key={image.src}
                src={image.src}
                alt={image.alt}
                loading="eager"
                decoding="async"
                className="h-12 w-20 rounded-md border border-border-light bg-white/90 object-contain p-1 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-brand-orange/60 hover:shadow-md sm:h-14 sm:w-24"
              />
            ))}
          </div>

          {/* CTA buttons */}
          <div className="mt-5 flex w-full max-w-xs flex-col gap-2 sm:mt-8 sm:w-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
            <button type="button" onClick={() => openWhatsApp()} className="btn-glass-whatsapp !px-4 !py-2 text-xs sm:!px-5 sm:!py-3 sm:text-sm">
              <WhatsAppIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              Get a Quote on WhatsApp
            </button>
            <Link to="/products" className="btn-glass-secondary !px-4 !py-2 text-xs sm:!px-5 sm:!py-3 sm:text-sm">
              Browse Catalogue
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-6 grid w-full max-w-sm grid-cols-3 gap-2 sm:mt-12 sm:max-w-none sm:gap-14">
            {[
              { value: "500+", label: "Products" },
              { value: "10+", label: "Categories" },
              { value: "Fast", label: "WhatsApp Response" },
            ].map((stat) => (
              <div key={stat.label} className="min-w-0 text-center">
                <div className="font-display text-xl font-bold text-brand-orange sm:text-3xl">{stat.value}</div>
                <div className="mt-0.5 text-[9px] font-semibold leading-tight text-charcoal/60 uppercase tracking-wide sm:text-xs sm:tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCT TICKER ── */}
      <div className="border-y border-border-light bg-white py-3">
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-1.5 px-4 text-[11px] font-semibold tracking-widest text-charcoal/55 uppercase select-none">
          <li>Pipes</li><li aria-hidden="true" className="text-brand-orange/40">/</li>
          <li>Angles &amp; Channels</li><li aria-hidden="true" className="text-brand-orange/40">/</li>
          <li>Plates &amp; Flats</li><li aria-hidden="true" className="text-brand-orange/40">/</li>
          <li>MS &amp; GI Pipes</li><li aria-hidden="true" className="text-brand-orange/40">/</li>
          <li>Structural Steel</li><li aria-hidden="true" className="text-brand-orange/40">/</li>
          <li>Binding Wire</li>
        </ul>
      </div>

      {/* ── CATEGORIES ── */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Product Catalogue"
            title="Shop by Category"
            description="Browse iron and steel materials by category. Select a category to view the full range."
            to="/categories"
            actionLabel="View all categories"
            tone="light"
          />
          {categoriesLoading ? <CategoryGridSkeleton count={8} />
            : categoriesError ? <ErrorState message={categoriesError} onRetry={reloadCategories} />
            : visibleCategories.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {visibleCategories.map((category) => <CategoryCard key={category.id} category={category} />)}
              </div>
            ) : (
              <EmptyState icon={Boxes} title="Categories coming soon"
                description="Our catalogue is being updated. Contact us on WhatsApp for the materials you need.">
                <button type="button" onClick={() => openWhatsApp()} className="btn-glass-whatsapp">
                  <WhatsAppIcon className="h-4 w-4" />Contact on WhatsApp
                </button>
              </EmptyState>
            )}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="bg-surface-cream py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Handpicked"
            title="Featured Products"
            description="Popular materials frequently requested by our customers. Contact us for price and availability."
            to="/products"
            actionLabel="Browse all products"
            tone="light"
          />
          {featuredLoading ? <ProductGridSkeleton count={8} />
            : featuredError ? <ErrorState message={featuredError} onRetry={reloadFeatured} />
            : featured.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {featured.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            ) : (
              <EmptyState title="No featured products yet"
                description="Featured items will appear here once they are marked from the admin dashboard. Browse the full catalogue in the meantime.">
                <Link to="/products" className="btn-glass-primary">Browse all products</Link>
              </EmptyState>
            )}
        </div>
      </section>

      {/* ── VALUE PROPS ── */}
      <section className="border-y border-border-light bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            align="center"
            eyebrow="Why PallaviTraders"
            title="Materials You Can Rely On"
            description="A straightforward catalogue for buyers who need iron and steel materials quickly — with quotations on WhatsApp."
            tone="light"
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_PROPS.map((item) => (
              <div key={item.title}
                className="rounded-lg border border-border-light bg-surface-cream p-6 shadow-sm transition duration-300 hover:border-brand-orange/60 hover:shadow-[0_16px_30px_-18px_rgba(243,107,18,0.3)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-orange/10 text-brand-orange-dark">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-charcoal uppercase">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/70">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ShopSlideshow />

      {/* ── CTA STRIP ── */}
      <section className="relative overflow-hidden bg-brand-orange py-14 text-white sm:py-16">
        <div className="blueprint-grid absolute inset-0 opacity-10" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 text-center sm:px-6">
          <h2 className="font-display text-[1.75rem] font-bold leading-tight uppercase xs:text-3xl sm:text-4xl">
            Need a quotation for iron &amp; steel materials?
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
            Tell us the material, size and quantity you need. We will share the price, availability and details on WhatsApp.
          </p>
          <div className="mt-7 flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center">
            <button type="button" onClick={() => openWhatsApp()} className="btn-glass-whatsapp">
              <WhatsAppIcon className="h-5 w-5" />Request a Quote
            </button>
            <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/60 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">
              Send an Enquiry<ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
