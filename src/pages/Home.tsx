import { ArrowRight, Boxes, HardHat, MessageCircle, PackageSearch, ShieldCheck } from "lucide-react";
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
      <section
        className="relative isolate w-full overflow-hidden bg-white"
        style={{ minHeight: "100svh", paddingTop: "var(--nav-h)" }}
      >
        {/* Background video — full cover behind all content */}
        <video
          src="/videos/pallavi-logo-reveal.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/pallavi-logo.jpg"
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
            zIndex: -2,
          }}
        />

        {/* White overlay — keeps text readable without hiding the video */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,255,255,0.35)",
            zIndex: -1,
          }}
        />

        {/* Hero content — centred vertically over the video */}
        <div className="relative z-10 flex min-h-[calc(100svh-var(--nav-h))] flex-col items-center justify-center px-4 py-14 text-center sm:px-6 sm:py-20 lg:px-8">
          {/* Eyebrow badge */}
          <span className="mb-5 inline-block rounded-full border border-brand-orange/40 bg-white/70 px-4 py-1.5 text-xs font-semibold tracking-widest text-brand-orange uppercase backdrop-blur-sm">
            Iron &amp; Steel Specialists
          </span>

          {/* Heading */}
          <h1 className="max-w-full font-display text-[2.125rem] font-bold leading-tight break-words text-charcoal uppercase xs:text-4xl sm:text-5xl md:text-6xl">
            Quality Iron &amp;{" "}
            <span className="text-brand-orange">Steel</span>
            <br className="hidden sm:block" />
            {" "}Materials
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-charcoal/70 sm:text-base md:text-lg">
            TMT bars, angles, channels, plates, pipes and more. Browse our catalogue and get a
            quotation on WhatsApp instantly.
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center">
            <button type="button" onClick={() => openWhatsApp()} className="btn-glass-whatsapp">
              <WhatsAppIcon className="h-5 w-5" />
              Get a Quote on WhatsApp
            </button>
            <Link to="/products" className="btn-glass-secondary">
              Browse Catalogue
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-4 sm:mt-12 sm:gap-14">
            {[
              { value: "500+", label: "Products" },
              { value: "10+", label: "Categories" },
              { value: "Fast", label: "WhatsApp Response" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl font-bold text-brand-orange sm:text-3xl">{stat.value}</div>
                <div className="mt-0.5 text-xs font-semibold text-charcoal/60 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCT TICKER ── */}
      <div className="border-y border-border-light bg-surface-cream py-3">
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-1.5 px-4 text-[11px] font-semibold tracking-widest text-text-secondary uppercase select-none">
          <li>TMT Bars</li><li aria-hidden="true" className="text-border-light">/</li>
          <li>Angles &amp; Channels</li><li aria-hidden="true" className="text-border-light">/</li>
          <li>Plates &amp; Flats</li><li aria-hidden="true" className="text-border-light">/</li>
          <li>MS &amp; GI Pipes</li><li aria-hidden="true" className="text-border-light">/</li>
          <li>Structural Steel</li><li aria-hidden="true" className="text-border-light">/</li>
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
                className="rounded-lg border border-border-light bg-white p-6 shadow-sm transition duration-300 hover:border-brand-orange/40 hover:shadow-[0_16px_30px_-18px_rgba(243,107,18,0.2)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-light-orange text-brand-orange">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-charcoal uppercase">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section className="relative overflow-hidden bg-light-orange py-14 text-near-black sm:py-16">
        <div className="blueprint-grid absolute inset-0 opacity-10" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 text-center sm:px-6">
          <h2 className="font-display text-[1.75rem] font-bold leading-tight uppercase xs:text-3xl sm:text-4xl">
            Need a quotation for iron &amp; steel materials?
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-steel-grey sm:text-base">
            Tell us the material, size and quantity you need. We will share the price, availability and details on WhatsApp.
          </p>
          <div className="mt-7 flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center">
            <button type="button" onClick={() => openWhatsApp()} className="btn-glass-whatsapp">
              <WhatsAppIcon className="h-5 w-5" />Request a Quote
            </button>
            <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-near-black/20 bg-white px-7 py-3 text-sm font-semibold text-near-black transition hover:border-brand-orange hover:text-brand-orange">
              Send an Enquiry<ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
