import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useSeo } from "../hooks/useSeo";
import { BUSINESS } from "../lib/contact";
import { openWhatsApp } from "../lib/whatsapp";

export default function Contact() {
  useSeo(
    "Contact | PallaviTraders — Iron & Steel, Bhimavaram",
    "Contact Pallavi Iron Traders for pricing, availability or orders. WhatsApp, phone, or email — we respond quickly.",
  );

  return (
    <>
      <section className="relative overflow-hidden border-b border-border-light bg-white pt-below-nav pb-16 sm:pb-20">
        <div className="blueprint-grid absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <nav className="text-xs text-text-secondary" aria-label="Breadcrumb">
            <Link to="/" className="transition hover:text-charcoal">
              Home
            </Link>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <span className="text-charcoal">Contact</span>
          </nav>
          <div className="mt-4">
            <p className="text-xs font-semibold tracking-[0.2em] text-brand-orange uppercase">Get in Touch</p>
            <h1 className="mt-2 font-display text-[2rem] font-bold uppercase text-charcoal xs:text-4xl sm:text-5xl">Contact Us</h1>
            <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">
              Share your material requirements on WhatsApp for the fastest response, or call us directly — we're here
              to help.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface-cream py-14 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold uppercase text-charcoal">Find Us</h2>
            <p className="mt-1 text-sm text-text-secondary">
              We are open Monday to Saturday, 9 AM – 7 PM. Drop by the yard or reach us on WhatsApp.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            {[
              {
                icon: MessageCircle,
                label: "WhatsApp (Fastest)",
                value: BUSINESS.phone,
                action: () => openWhatsApp(),
                actionLabel: "Open WhatsApp",
              },
              {
                icon: Phone,
                label: "Phone",
                value: BUSINESS.phone,
                href: `tel:${BUSINESS.phone.replace(/\s/g, "")}`,
              },
              {
                icon: Phone,
                label: "Phone (Alternate)",
                value: BUSINESS.phone2,
                href: `tel:${BUSINESS.phone2Dial}`,
              },
              {
                icon: Mail,
                label: "Email",
                value: BUSINESS.email,
                href: `mailto:${BUSINESS.email}`,
              },
              {
                icon: MapPin,
                label: "Address",
                value: BUSINESS.address,
              },
              {
                icon: Clock,
                label: "Working Hours",
                value: "Monday – Saturday: 9:00 AM – 7:00 PM",
              },
            ].map(({ icon: Icon, label, value, href, action, actionLabel }: {
              icon: React.ElementType;
              label: string;
              value: string;
              href?: string;
              action?: () => void;
              actionLabel?: string;
            }) => (
              <div
                key={label}
                className="flex gap-3 rounded-lg border border-border-light bg-white p-4 shadow-sm sm:gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-light-orange text-brand-orange">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold tracking-wide text-text-secondary uppercase">{label}</p>
                  {href ? (
                    <a
                      href={href}
                      className="mt-0.5 block break-words text-sm font-medium text-charcoal transition hover:text-brand-orange"
                    >
                      {value}
                    </a>
                  ) : action ? (
                    <div className="mt-0.5 flex flex-wrap items-center gap-3">
                      <span className="text-sm font-medium text-charcoal">{value}</span>
                      <button
                        type="button"
                        onClick={action}
                        className="inline-flex min-h-8 items-center text-xs font-semibold text-brand-orange transition hover:text-brand-orange-dark"
                      >
                        {actionLabel} →
                      </button>
                    </div>
                  ) : (
                    <p className="mt-0.5 break-words text-sm text-charcoal/80">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => openWhatsApp()}
            className="btn-glass-whatsapp mx-auto mt-8 flex w-full max-w-xs"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Open WhatsApp Chat
          </button>
        </div>
      </section>
    </>
  );
}
