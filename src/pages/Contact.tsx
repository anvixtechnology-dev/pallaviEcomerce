import { Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ButtonSpinner } from "../components/Loading";
import { useSeo } from "../hooks/useSeo";
import { BUSINESS } from "../lib/contact";
import { openWhatsApp } from "../lib/whatsapp";
import { createEnquiry } from "../services/enquiryService";

const INPUT_BASE =
  "w-full rounded-md border border-border-light bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-text-secondary transition focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/15 focus:outline-none";

export default function Contact() {
  useSeo(
    "Contact | PallaviTraders — Iron & Steel, Bhimavaram",
    "Contact Pallavi Iron Traders for pricing, availability or orders. WhatsApp, phone, or email — we respond quickly.",
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setError(null);
    try {
      await createEnquiry({ name: name.trim(), phone: phone.trim(), message: message.trim() });
      setSent(true);
      setName("");
      setPhone("");
      setMessage("");
    } catch {
      setError("Something went wrong. Please try again or WhatsApp us directly.");
    } finally {
      setSending(false);
    }
  }

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
            <span className="text-charcoal">Contact</span>
          </nav>
          <div className="mt-4 max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.2em] text-brand-orange uppercase">Get in Touch</p>
            <h1 className="mt-2 font-display text-[2rem] font-bold uppercase text-charcoal xs:text-4xl sm:text-5xl">Contact Us</h1>
            <p className="mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">
              Share your material requirements on WhatsApp for the fastest response, or use the form below and we'll
              get back to you within the day.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface-cream py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
            {/* Contact info */}
            <div className="min-w-0 space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold uppercase text-charcoal">Find Us</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  We are open Monday to Saturday, 9 AM – 7 PM. Drop by the yard or reach us on WhatsApp.
                </p>
              </div>

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
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        className="mt-0.5 block text-sm font-medium break-words text-charcoal transition hover:text-brand-orange"
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
                      <p className="mt-0.5 text-sm break-words text-charcoal/80">{value}</p>
                    )}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => openWhatsApp()}
                className="btn-glass-whatsapp w-full"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Open WhatsApp Chat
              </button>
            </div>

            {/* Contact form */}
            <div className="min-w-0 rounded-xl border border-border-light bg-white p-5 shadow-sm sm:p-8">
              {sent ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
                    <Send className="h-6 w-6 text-emerald-600" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-bold uppercase text-charcoal">Message Sent!</h3>
                  <p className="mt-2 text-sm text-text-secondary">
                    Thank you for reaching out. We'll get back to you shortly. For faster response, WhatsApp us
                    directly.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSent(false)}
                      className="btn-glass-secondary"
                    >
                      Send another
                    </button>
                    <button
                      type="button"
                      onClick={() => openWhatsApp()}
                      className="btn-glass-whatsapp"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      WhatsApp Us
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-2xl font-bold uppercase text-charcoal">Send a Message</h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    Fill in your details and material requirements. We'll respond within the day.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                    <div>
                      <label htmlFor="contact-name" className="mb-1.5 block text-sm font-semibold text-charcoal">
                        Name <span className="text-brand-orange">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="name"
                        placeholder="Your name"
                        className={INPUT_BASE}
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-phone" className="mb-1.5 block text-sm font-semibold text-charcoal">
                        Phone / WhatsApp <span className="text-brand-orange">*</span>
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        autoComplete="tel"
                        placeholder="+91 98765 43210"
                        className={INPUT_BASE}
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="mb-1.5 block text-sm font-semibold text-charcoal">
                        Message / Requirements <span className="text-brand-orange">*</span>
                      </label>
                      <textarea
                        id="contact-message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={5}
                        placeholder="Describe your material requirements (product type, quantity, size, delivery location…)"
                        className={INPUT_BASE + " resize-none"}
                      />
                    </div>

                    {error ? (
                      <p className="rounded-md bg-red-50 border border-red-200 px-4 py-2.5 text-sm break-words text-red-700" role="alert">
                        {error}
                      </p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={sending || !name.trim() || !phone.trim() || !message.trim()}
                      className="btn-glass-primary w-full"
                    >
                      {sending ? (
                        <ButtonSpinner label="Sending…" />
                      ) : (
                        <>
                          <Send className="h-4 w-4" aria-hidden="true" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
