import { ArrowRight, ClipboardList, Factory, MessageCircle, PackageSearch, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState, ErrorState, SectionHeader } from "../components/StateMessage";
import WhatsAppIcon from "../components/WhatsAppIcon";
import { useSeo } from "../hooks/useSeo";
import { useCategories } from "../hooks/useCategories";
import { openWhatsApp } from "../lib/whatsapp";

const PROCESS = [
  {
    icon: PackageSearch,
    title: "Browse the Catalogue",
    description: "Explore categories and products, check sizes, specifications and applications.",
  },
  {
    icon: MessageCircle,
    title: "Enquire on WhatsApp",
    description: "Send us the product name, required size and quantity for price and availability.",
  },
  {
    icon: ClipboardList,
    title: "Get Your Quotation",
    description: "We respond with pricing, stock details and further requirements for your order.",
  },
];

const INDUSTRIES = [
  "Residential Construction",
  "Commercial Buildings",
  "Infrastructure Projects",
  "Fabrication Workshops",
  "Industrial Structures",
  "Interior & Fit-out Work",
];

export default function About() {
  useSeo(
    "About Us | PallaviTraders — Iron & Steel Materials",
    "Learn about PallaviTraders, a supplier of iron and steel materials for construction, fabrication, infrastructure and industrial requirements.",
  );

  const { categories, loading, error, reload } = useCategories();

  return (
    <>
      <section className="relative overflow-hidden border-b border-navy-700 bg-navy-950 py-14 text-white sm:py-16">
        <div className="blueprint-grid absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-navy-600/30 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent-500 uppercase">About Us</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight font-bold uppercase sm:text-5xl">
            Iron &amp; Steel Materials for Every Construction Need
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-steel-400 sm:text-base">
            PallaviTraders supplies iron and steel materials for construction, fabrication, infrastructure and
            industrial requirements — with a simple catalogue and quotations shared directly on WhatsApp.
          </p>
        </div>
      </section>

      {/* Who we are */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <SectionHeader
              eyebrow="Who We Are"
              title="A Reliable Source for Iron & Steel Materials"
            />
            <p className="text-sm leading-relaxed text-steel-600 sm:text-base">
              PallaviTraders is an iron and steel materials business serving builders, contractors, fabricators and
              industrial buyers. Our catalogue covers commonly used construction materials — from TMT bars and
              structural sections to plates, pipes, sheets and binding wire.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-steel-600 sm:text-base">
              Instead of online payments and checkout, we keep the process direct: you browse the materials, then
              contact us on WhatsApp for price, availability and a formal quotation for your requirement.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-md bg-navy-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy-700"
              >
                Explore Products
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <button
                type="button"
                onClick={() => openWhatsApp()}
                className="inline-flex items-center gap-2 rounded-md bg-whatsapp px-5 py-3 text-sm font-semibold text-white transition hover:bg-whatsapp-dark"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Contact on WhatsApp
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-steel-200 bg-steel-50 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-navy-900 text-accent-500">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-steel-900 uppercase">Quality Materials</h3>
              <p className="mt-2 text-sm leading-relaxed text-steel-600">
                Materials selected to meet construction, fabrication and industrial requirements.
              </p>
            </div>
            <div className="rounded-lg border border-steel-200 bg-steel-50 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-navy-900 text-accent-500">
                <Factory className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-steel-900 uppercase">Wide Range</h3>
              <p className="mt-2 text-sm leading-relaxed text-steel-600">
                Bars, angles, channels, beams, plates, pipes, sheets and more — organised by category.
              </p>
            </div>
            <div className="rounded-lg border border-steel-200 bg-steel-50 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-navy-900 text-accent-500">
                <UserRound className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-steel-900 uppercase">Direct Contact</h3>
              <p className="mt-2 text-sm leading-relaxed text-steel-600">
                Speak to us directly on WhatsApp or submit an enquiry — no account or payment needed.
              </p>
            </div>
            <div className="rounded-lg border border-steel-200 bg-steel-50 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-navy-900 text-accent-500">
                <ClipboardList className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-steel-900 uppercase">Quotations on Request</h3>
              <p className="mt-2 text-sm leading-relaxed text-steel-600">
                Prices are shared per requirement depending on material, size and quantity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="border-y border-steel-200 bg-steel-50 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            align="center"
            eyebrow="How It Works"
            title="From Catalogue to Quotation"
            description="A simple, three step enquiry process — no cart, no online payment."
          />
          <ol className="grid gap-5 sm:grid-cols-3">
            {PROCESS.map((step, index) => (
              <li key={step.title} className="relative rounded-lg border border-steel-200 bg-white p-6">
                <span className="absolute top-5 right-5 font-display text-4xl font-bold text-steel-200">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-navy-900 text-accent-500">
                  <step.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-steel-900 uppercase">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-steel-600">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Materials + industries */}
      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <SectionHeader eyebrow="What We Supply" title="Material Categories" />
              {loading ? (
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <span key={index} className="skeleton h-9 w-32 rounded-full" />
                  ))}
                </div>
              ) : error ? (
                <ErrorState message={error} onRetry={reload} />
              ) : categories.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        to={`/categories/${category.id}`}
                        className="inline-block rounded-full border border-steel-300 bg-white px-4 py-2 text-xs font-semibold tracking-wide text-steel-700 transition hover:border-navy-700 hover:bg-navy-900 hover:text-white"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="Categories coming soon" description="Contact us on WhatsApp for your requirement." />
              )}
            </div>

            <div>
              <SectionHeader eyebrow="Who It's For" title="Industries We Serve" />
              <ul className="grid gap-3 sm:grid-cols-2">
                {INDUSTRIES.map((industry) => (
                  <li
                    key={industry}
                    className="flex items-center gap-3 rounded-lg border border-steel-200 bg-steel-50 px-4 py-3.5 text-sm font-medium text-steel-700"
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full bg-accent-500" aria-hidden="true" />
                    {industry}
                  </li>
                ))}
              </ul>

              <div className="mt-6 rounded-lg bg-navy-900 p-6 text-white">
                <h3 className="font-display text-xl font-bold uppercase">Have a requirement?</h3>
                <p className="mt-2 text-sm leading-relaxed text-steel-400">
                  Tell us the material, size and quantity — we will respond with availability and quotation.
                </p>
                <button
                  type="button"
                  onClick={() => openWhatsApp()}
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-whatsapp px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-whatsapp-dark"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Contact on WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
