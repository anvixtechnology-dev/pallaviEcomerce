import { CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import WhatsAppIcon from "../components/WhatsAppIcon";
import { ButtonSpinner } from "../components/Loading";
import { useSeo } from "../hooks/useSeo";
import { BUSINESS } from "../lib/contact";
import { cn, getErrorMessage } from "../lib/utils";
import { buildWhatsAppUrl, openWhatsApp } from "../lib/whatsapp";
import { createEnquiry } from "../services/enquiryService";

interface FormState {
  name: string;
  phone: string;
  product: string;
  quantity: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const INITIAL: FormState = { name: "", phone: "", product: "", quantity: "", message: "" };

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (form.name.trim().length < 2) {
    errors.name = "Please enter your name.";
  }

  const phone = form.phone.replace(/[^\d+]/g, "");
  if (!/^\+?\d{7,15}$/.test(phone)) {
    errors.phone = "Please enter a valid phone number (7–15 digits).";
  }

  if (form.message.trim().length < 5) {
    errors.message = "Please tell us what you need (at least 5 characters).";
  }

  return errors;
}

const inputClasses = (hasError: boolean) =>
  cn(
    "w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-steel-800 placeholder:text-steel-400 focus:ring-2 focus:outline-none",
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
      : "border-steel-300 focus:border-navy-600 focus:ring-navy-600/15",
  );

export default function Contact() {
  useSeo(
    "Contact Us | PallaviTraders — Request a Quotation",
    "Contact PallaviTraders for iron and steel material prices, availability and quotations. Call, WhatsApp or submit an enquiry.",
  );

  const [searchParams] = useSearchParams();
  const prefillProduct = searchParams.get("product") ?? "";

  const [form, setForm] = useState<FormState>({ ...INITIAL, product: prefillProduct });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (prefillProduct) {
      setForm((current) => ({ ...current, product: prefillProduct }));
    }
  }, [prefillProduct]);

  const update = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validate(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    try {
      await createEnquiry({
        name: form.name.trim(),
        phone: form.phone.trim(),
        productName: form.product.trim(),
        quantity: form.quantity.trim(),
        message: form.message.trim(),
      });
      setSubmitted(true);
      setForm({ ...INITIAL, product: form.product });
      setErrors({});
    } catch (caught) {
      setErrors({ message: getErrorMessage(caught) });
    } finally {
      setSubmitting(false);
    }
  };

  const contactCards = [
    {
      icon: Phone,
      label: "Phone",
      value: BUSINESS.phone,
      href: `tel:${BUSINESS.phoneDial}`,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: BUSINESS.whatsappDisplay,
      href: buildWhatsAppUrl(),
      external: true,
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
      label: "Business Hours",
      value: BUSINESS.hours,
    },
  ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-navy-700 bg-navy-950 py-12 text-white sm:py-14">
        <div className="blueprint-grid absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="text-xs text-steel-400" aria-label="Breadcrumb">
            <Link to="/" className="transition hover:text-white">
              Home
            </Link>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <span className="text-steel-200">Contact</span>
          </nav>
          <h1 className="mt-3 font-display text-4xl font-bold uppercase sm:text-5xl">Contact Us</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-steel-400 sm:text-base">
            Looking for price, availability or a quotation? Call us, send a WhatsApp message or fill in the enquiry
            form below.
          </p>
        </div>
      </section>

      <section className="bg-steel-50 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            {/* Contact details */}
            <div>
              <h2 className="font-display text-2xl font-bold text-steel-900 uppercase sm:text-3xl">Get in Touch</h2>
              <p className="mt-2 text-sm leading-relaxed text-steel-600">
                PallaviTraders — {BUSINESS.tagline}.
              </p>

              <ul className="mt-6 space-y-3">
                {contactCards.map((card) => {
                  const content = (
                    <>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-navy-900 text-accent-500">
                        <card.icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold tracking-wider text-steel-500 uppercase">
                          {card.label}
                        </span>
                        <span className="block text-sm font-medium break-words text-steel-800">{card.value}</span>
                      </span>
                    </>
                  );

                  return (
                    <li key={card.label}>
                      {card.href ? (
                        <a
                          href={card.href}
                          target={card.external ? "_blank" : undefined}
                          rel={card.external ? "noopener noreferrer" : undefined}
                          className="flex items-start gap-3 rounded-lg border border-steel-200 bg-white p-4 transition hover:border-navy-600/50 hover:shadow-sm"
                        >
                          {content}
                        </a>
                      ) : (
                        <div className="flex items-start gap-3 rounded-lg border border-steel-200 bg-white p-4">
                          {content}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-whatsapp px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-whatsapp-dark"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Contact on WhatsApp
              </a>
            </div>

            {/* Enquiry form */}
            <div className="rounded-xl border border-steel-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="font-display text-2xl font-bold text-steel-900 uppercase sm:text-3xl">Send an Enquiry</h2>
              <p className="mt-2 text-sm leading-relaxed text-steel-600">
                Fill in your details and requirement. We will get back to you with price and availability.
              </p>

              {submitted ? (
                <div
                  className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center"
                  role="status"
                >
                  <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" aria-hidden="true" />
                  <h3 className="mt-3 font-display text-xl font-bold text-emerald-900 uppercase">Enquiry sent!</h3>
                  <p className="mt-2 text-sm leading-relaxed text-emerald-800">
                    Thank you. Your enquiry has been recorded and our team will contact you shortly.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="rounded-md border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                    >
                      Send another enquiry
                    </button>
                    <button
                      type="button"
                      onClick={() => openWhatsApp()}
                      className="inline-flex items-center gap-2 rounded-md bg-whatsapp px-4 py-2 text-sm font-semibold text-white transition hover:bg-whatsapp-dark"
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                      Chat on WhatsApp
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className="mb-1.5 block text-xs font-semibold tracking-wide text-steel-600 uppercase">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        value={form.name}
                        onChange={update("name")}
                        placeholder="Your full name"
                        className={inputClasses(Boolean(errors.name))}
                        aria-invalid={Boolean(errors.name)}
                      />
                      {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
                    </div>

                    <div>
                      <label htmlFor="contact-phone" className="mb-1.5 block text-xs font-semibold tracking-wide text-steel-600 uppercase">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        value={form.phone}
                        onChange={update("phone")}
                        placeholder="+91 98765 43210"
                        className={inputClasses(Boolean(errors.phone))}
                        aria-invalid={Boolean(errors.phone)}
                      />
                      {errors.phone ? <p className="mt-1 text-xs text-red-600">{errors.phone}</p> : null}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-product" className="mb-1.5 block text-xs font-semibold tracking-wide text-steel-600 uppercase">
                        Product
                      </label>
                      <input
                        id="contact-product"
                        type="text"
                        list="product-options"
                        value={form.product}
                        onChange={update("product")}
                        placeholder="e.g. MS Angle 50x50"
                        className={inputClasses(false)}
                      />
                      <datalist id="product-options">
                        <option value="Fe 500 TMT Bar" />
                        <option value="MS Angle 50x50" />
                        <option value="MS Channel 100" />
                        <option value="MS Plate 6mm" />
                        <option value="GI Pipe" />
                        <option value="Binding Wire" />
                      </datalist>
                    </div>

                    <div>
                      <label htmlFor="contact-quantity" className="mb-1.5 block text-xs font-semibold tracking-wide text-steel-600 uppercase">
                        Quantity
                      </label>
                      <input
                        id="contact-quantity"
                        type="text"
                        value={form.quantity}
                        onChange={update("quantity")}
                        placeholder="e.g. 500 kg / 100 pieces"
                        className={inputClasses(false)}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="mb-1.5 block text-xs font-semibold tracking-wide text-steel-600 uppercase">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      value={form.message}
                      onChange={update("message")}
                      placeholder="Tell us the material, size, grade and quantity you need…"
                      className={cn(inputClasses(Boolean(errors.message)), "resize-y")}
                      aria-invalid={Boolean(errors.message)}
                    />
                    {errors.message ? <p className="mt-1 text-xs text-red-600">{errors.message}</p> : null}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-navy-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-navy-700 focus-visible:ring-2 focus-visible:ring-navy-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting ? (
                      <ButtonSpinner label="Sending…" />
                    ) : (
                      <>
                        <Send className="h-4 w-4" aria-hidden="true" />
                        Send Enquiry
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-steel-500">
                    Prefer chat?{" "}
                    <button
                      type="button"
                      onClick={() => openWhatsApp()}
                      className="font-semibold text-whatsapp-dark underline-offset-2 hover:underline"
                    >
                      Message us on WhatsApp
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
