import { Award, Building2, MapPin, MessageCircle, Package, ShieldCheck, Truck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useSeo } from "../hooks/useSeo";
import { BUSINESS } from "../lib/contact";
import { openWhatsApp } from "../lib/whatsapp";

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Quality Assurance",
    description:
      "Every product we stock meets IS/BIS standards. We source from reputed mills and maintain rigorous quality checks before supply.",
  },
  {
    icon: Truck,
    title: "Reliable Supply",
    description:
      "Years of relationships with leading steel manufacturers mean we maintain consistent stock and can fulfil bulk orders without delays.",
  },
  {
    icon: Users,
    title: "Customer First",
    description:
      "We understand the urgency of construction projects. Our team responds fast, provides accurate quotes, and coordinates delivery to your site.",
  },
  {
    icon: Award,
    title: "Trusted Since 2003",
    description:
      "Over two decades in Bhimavaram's iron trade has earned us the trust of contractors, builders, and fabricators across the Krishna-Godavari delta.",
  },
];

const PRODUCT_CATEGORIES = [
  "TMT Bars",
  "MS Angles",
  "MS Channels",
  "MS Flat Bars",
  "MS Round Bars",
  "MS Square Bars",
  "Hollow Sections",
  "Steel Plates",
  "Chequered Plates",
  "Steel Pipes & Tubes",
  "Wire Rods",
  "Binding Wire",
];

export default function About() {
  useSeo(
    "About Us | PallaviTraders — Iron & Steel, Bhimavaram",
    "Learn about Pallavi Iron Traders — Bhimavaram's trusted iron and steel supplier since 2003. Quality materials, fair pricing, and reliable delivery.",
  );

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border-light bg-white pt-below-nav pb-16 sm:pb-20">
        <div className="blueprint-grid absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="text-xs text-text-secondary" aria-label="Breadcrumb">
            <Link to="/" className="transition hover:text-charcoal">
              Home
            </Link>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <span className="text-charcoal">About Us</span>
          </nav>
          <div className="mt-4 max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.2em] text-brand-orange uppercase">Our Story</p>
            <h1 className="mt-2 font-display text-[2rem] font-bold break-words text-charcoal uppercase xs:text-4xl sm:text-5xl">
              Bhimavaram's Trusted Iron Traders
            </h1>
            <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">
              Pallavi Iron Traders has been supplying quality iron and steel materials to construction professionals,
              fabricators, and infrastructure projects across the Krishna-Godavari delta since 2003.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 xs:flex-row xs:flex-wrap sm:gap-4">
            <button
              type="button"
              onClick={() => openWhatsApp()}
              className="btn-glass-whatsapp"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp Us
            </button>
            <Link
              to="/products"
              className="btn-glass-secondary"
            >
              <Package className="h-4 w-4" aria-hidden="true" />
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="bg-surface-cream py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-brand-orange uppercase">Who We Are</p>
              <h2 className="font-display text-3xl font-bold uppercase text-charcoal sm:text-4xl">
                Two Decades of Steel
              </h2>
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-text-secondary sm:text-base">
                <p>
                  Founded in 2003, Pallavi Iron Traders started as a small stockist serving local construction needs in
                  Bhimavaram. Over two decades, we have grown into one of the region's most dependable iron and steel
                  suppliers — expanding our product range, deepening our mill partnerships, and building long-term
                  relationships with thousands of customers.
                </p>
                <p>
                  Our yard in Bhimavaram stocks an extensive inventory of structural steel, reinforcement bars, hollow
                  sections, and steel plates sourced from leading mills. We serve contractors, civil engineers,
                  fabricators, and project managers who need reliable material supply without compromises on quality or
                  timelines.
                </p>
                <p>
                  At Pallavi Iron Traders, we believe every construction milestone is built on the quality of materials
                  beneath it. That belief drives every procurement decision, every quality check, and every customer
                  interaction we have.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 content-start sm:gap-4">
              {[
                { icon: Building2, stat: "20+", label: "Years in Business" },
                { icon: Users, stat: "5,000+", label: "Customers Served" },
                { icon: Package, stat: "100+", label: "Products in Stock" },
                { icon: MapPin, stat: "Bhimavaram", label: "West Godavari" },
              ].map(({ icon: Icon, stat, label }) => (
                <div
                  key={label}
                  className="flex min-w-0 flex-col items-start gap-3 rounded-lg border border-border-light bg-white p-4 shadow-sm sm:p-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-light-orange text-brand-orange">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-display text-xl font-bold break-words text-charcoal xs:text-2xl">{stat}</p>
                    <p className="text-xs text-text-secondary">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-brand-orange uppercase">Why Choose Us</p>
            <h2 className="font-display text-3xl font-bold uppercase text-charcoal sm:text-4xl">Our Commitments</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-lg border border-border-light bg-surface-cream p-6 shadow-sm">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-light-orange text-brand-orange">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-display text-lg font-bold uppercase text-charcoal">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products we carry */}
      <section className="bg-surface-cream py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-brand-orange uppercase">Our Range</p>
            <h2 className="font-display text-3xl font-bold uppercase text-charcoal sm:text-4xl">What We Stock</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
              We maintain a wide inventory to serve diverse construction and fabrication needs.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRODUCT_CATEGORIES.map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-border-light bg-white px-4 py-1.5 text-sm font-medium text-text-secondary shadow-sm transition hover:border-brand-orange hover:bg-brand-orange hover:text-white"
              >
                {cat}
              </span>
            ))}
          </div>
          <div className="mt-8">
            <Link
              to="/products"
              className="btn-glass-primary"
            >
              <Package className="h-4 w-4" aria-hidden="true" />
              View Full Catalogue
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-orange py-14 text-white sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-xs font-semibold tracking-[0.2em] text-white/70 uppercase">Get in Touch</p>
          <h2 className="mt-2 font-display text-3xl font-bold uppercase sm:text-4xl">Ready to Order?</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
            Share your material list on WhatsApp for a quick quote, or visit our yard in Bhimavaram. We're here Monday
            to Saturday, 9 AM – 7 PM.
          </p>
          <div className="mt-6 flex flex-col items-stretch gap-3 xs:flex-row xs:flex-wrap xs:justify-center sm:gap-4">
            <button
              type="button"
              onClick={() => openWhatsApp()}
              className="btn-glass-whatsapp"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp: {BUSINESS.phone}
            </button>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/60 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Contact Page
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
