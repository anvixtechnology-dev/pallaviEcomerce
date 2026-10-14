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

function HeroIllustration() {
  return (
    <svg viewBox="0 0 520 420" className="h-auto w-full drop-shadow-2xl" role="img" aria-label="Illustration of stacked steel beams, angles, plates and bars">
      <defs>
        <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c3ceda" />
          <stop offset="55%" stopColor="#97a6b8" />
          <stop offset="100%" stopColor="#515f72" />
        </linearGradient>
        <linearGradient id="steelDark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#97a6b8" />
          <stop offset="100%" stopColor="#3c4757" />
        </linearGradient>
        <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="#1a3054" strokeWidth="1" />
        </pattern>
      </defs>

      <rect x="10" y="10" width="500" height="400" rx="20" fill="#0c1526" stroke="#1a3054" strokeWidth="2" />
      <rect x="10" y="10" width="500" height="400" rx="20" fill="url(#grid)" opacity="0.75" />

      {/* I-beams stacked on the right */}
      <g transform="translate(340,70)">
        <g transform="translate(0,0)">
          <path d="M0 0h96v16H64v48h32v16H0V64h32V16H0z" fill="url(#steel)" />
          <path d="M0 0h96v16H64v48h32v16H0V64h32V16H0z" fill="none" stroke="#3c4757" strokeWidth="2" />
        </g>
        <g transform="translate(0,96)">
          <path d="M0 0h96v16H64v48h32v16H0V64h32V16H0z" fill="url(#accent)" opacity="0.92" />
          <path d="M0 0h96v16H64v48h32v16H0V64h32V16H0z" fill="none" stroke="#7c2d12" strokeWidth="2" />
        </g>
        <g transform="translate(0,192)">
          <path d="M0 0h96v16H64v48h32v16H0V64h32V16H0z" fill="url(#steelDark)" />
          <path d="M0 0h96v16H64v48h32v16H0V64h32V16H0z" fill="none" stroke="#262e3a" strokeWidth="2" />
        </g>
      </g>

      {/* Angles (L sections) top-left */}
      <g transform="translate(60,60)">
        <g>
          <path d="M0 0h22v78h72v22H0z" fill="url(#steel)" stroke="#3c4757" strokeWidth="2" />
        </g>
        <g transform="translate(120,10)">
          <path d="M0 0h18v64h58v18H0z" fill="url(#steelDark)" stroke="#262e3a" strokeWidth="2" />
        </g>
      </g>

      {/* Stacked plates */}
      <g transform="translate(60,210)">
        {[0, 22, 44, 66].map((offset) => (
          <g key={offset} transform={`translate(0,${offset})`}>
            <rect width="200" height="16" rx="3" fill="url(#steel)" stroke="#3c4757" strokeWidth="1.5" />
          </g>
        ))}
        <rect y="88" width="200" height="16" rx="3" fill="url(#accent)" stroke="#7c2d12" strokeWidth="1.5" />
      </g>

      {/* Round bars / TMT pyramid */}
      <g transform="translate(250,320)">
        {[0, 1, 2, 3].map((row) =>
          Array.from({ length: 4 - row }).map((_, index) => (
            <circle
              key={`${row}-${index}`}
              cx={index * 34 + row * 17 + 17}
              cy={row * 30 + 15}
              r="15"
              fill="url(#steel)"
              stroke="#3c4757"
              strokeWidth="2"
            />
          )),
        )}
      </g>

      {/* Pipe ends bottom-left */}
      <g transform="translate(50,330)">
        {[0, 44, 88].map((offset) => (
          <g key={offset} transform={`translate(${offset},0)`}>
            <circle cx="20" cy="20" r="20" fill="url(#steelDark)" stroke="#262e3a" strokeWidth="2" />
            <circle cx="20" cy="20" r="10" fill="#0c1526" stroke="#3c4757" strokeWidth="2" />
          </g>
        ))}
      </g>
    </svg>
  );
}

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

export default function Home() {
  useSeo(
    "PallaviTraders | Iron & Steel Materials",
    "PallaviTraders offers a wide range of iron, steel and construction materials. Browse our product catalogue and contact us for availability and quotations.",
  );

  const { categories, loading: categoriesLoading, error: categoriesError, reload: reloadCategories } = useCategories();
  const {
    products: featured,
    loading: featuredLoading,
    error: featuredError,
    reload: reloadFeatured,
  } = useFeaturedProducts(8);

  const visibleCategories = categories.slice(0, 8);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="blueprint-grid absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/95 to-navy-900/60" aria-hidden="true" />
        <div className="absolute -top-32 -right-20 h-96 w-96 rounded-full bg-navy-600/30 blur-3xl" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-navy-600 bg-navy-900/80 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-steel-300 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500" aria-hidden="true" />
              Iron &amp; Steel Materials Catalogue
            </span>

            <h1 className="mt-5 font-display text-5xl leading-none font-bold tracking-tight text-white uppercase sm:text-6xl lg:text-7xl">
              Pallavi<span className="text-accent-500">Traders</span>
            </h1>

            <h2 className="mt-4 max-w-xl font-display text-xl leading-snug font-semibold tracking-wide text-steel-300 uppercase sm:text-2xl">
              Quality Iron &amp; Steel Materials for Every Construction Need
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-steel-400 sm:text-base">
              Explore our wide range of iron and steel materials for construction, fabrication, infrastructure, and
              industrial requirements.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-md bg-accent-600 px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-accent-500 focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 focus-visible:outline-none"
              >
                Explore Products
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={() => openWhatsApp()}
                className="inline-flex items-center gap-2 rounded-md bg-whatsapp px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-whatsapp-dark focus-visible:ring-2 focus-visible:ring-whatsapp focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 focus-visible:outline-none"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Contact on WhatsApp
              </button>
            </div>

            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-navy-700/70 pt-6 text-xs font-medium tracking-wide text-steel-400 uppercase">
              <li>TMT Bars</li>
              <li aria-hidden="true" className="text-navy-600">/</li>
              <li>Angles &amp; Channels</li>
              <li aria-hidden="true" className="text-navy-600">/</li>
              <li>Plates &amp; Flats</li>
              <li aria-hidden="true" className="text-navy-600">/</li>
              <li>MS &amp; GI Pipes</li>
              <li aria-hidden="true" className="text-navy-600">/</li>
              <li>Structural Steel</li>
            </ul>
          </div>

          <div className="hidden lg:block">
            <HeroIllustration />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-steel-50 py-14 sm:py-16">
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
                className="inline-flex items-center gap-2 rounded-md bg-whatsapp px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-whatsapp-dark"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Contact on WhatsApp
              </button>
            </EmptyState>
          )}
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-white py-14 sm:py-16">
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
                className="inline-flex items-center gap-2 rounded-md bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
              >
                Browse all products
              </Link>
            </EmptyState>
          )}
        </div>
      </section>

      {/* Value props */}
      <section className="border-y border-steel-200 bg-steel-50 py-14 sm:py-16">
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
                className="rounded-lg border border-steel-200 bg-white p-6 transition duration-300 hover:border-navy-600/40 hover:shadow-[0_16px_30px_-18px_rgba(12,21,38,0.45)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-navy-900 text-accent-500">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-steel-900 uppercase">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-steel-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-navy-900 py-14 text-white sm:py-16">
        <div className="blueprint-grid absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 text-center sm:px-6">
          <h2 className="font-display text-3xl leading-tight font-bold uppercase sm:text-4xl">
            Need a quotation for iron &amp; steel materials?
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-steel-400 sm:text-base">
            Tell us the material, size and quantity you need. We will share the price, availability and details on
            WhatsApp.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => openWhatsApp()}
              className="inline-flex items-center gap-2 rounded-md bg-whatsapp px-6 py-3 text-sm font-semibold text-white transition hover:bg-whatsapp-dark"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Request a Quote
            </button>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-md border border-steel-500 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
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
