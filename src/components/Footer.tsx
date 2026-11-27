import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { BUSINESS } from "../lib/contact";
import { buildWhatsAppUrl, logWhatsAppEnquiry } from "../lib/whatsapp";
import WhatsAppIcon from "./WhatsAppIcon";

const QUICK_LINKS = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border-light bg-white text-charcoal/70">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <img
              src="/images/Pallavi%20Logo.jpeg"
              alt="Pallavi Iron Traders"
              width={795}
              height={348}
              loading="lazy"
              className="h-14 w-auto max-w-full object-contain sm:h-16 lg:h-20"
            />
            <p className="mt-3 text-sm leading-relaxed text-charcoal/60">
              Pipes &amp; Roofing Sheets for Every Construction Need.
            </p>
            <a
              href={buildWhatsAppUrl()}
              onClick={() => logWhatsAppEnquiry()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-whatsapp-dark"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Enquire on WhatsApp
            </a>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold tracking-wide text-charcoal uppercase">Quick Links</h2>
            <ul className="mt-4 space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-charcoal/60 transition hover:text-brand-orange">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold tracking-wide text-charcoal uppercase">Products</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-charcoal/60">
              <li>Pipes</li>
              <li>MS Angles, Channels &amp; Beams</li>
              <li>MS Plates, Flats &amp; Rods</li>
              <li>MS &amp; GI Pipes and Sheets</li>
              <li>TATA Pipes,M.S Pipes,G.P Pipes,Z+ Pipes</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold tracking-wide text-charcoal uppercase">Contact</h2>
            <ul className="mt-4 space-y-3 text-sm text-charcoal/60">
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" aria-hidden="true" />
                <a href={`tel:${BUSINESS.phoneDial}`} className="transition hover:text-brand-orange">
                  {BUSINESS.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-whatsapp" />
                <a
                  href={buildWhatsAppUrl()}
                  onClick={() => logWhatsAppEnquiry()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-brand-orange"
                >
                  {BUSINESS.whatsappDisplay}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" aria-hidden="true" />
                <a href={`mailto:${BUSINESS.email}`} className="break-all transition hover:text-brand-orange">
                  {BUSINESS.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" aria-hidden="true" />
                <span>{BUSINESS.address}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" aria-hidden="true" />
                <span>{BUSINESS.hours}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border-light">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-charcoal/50 sm:flex-row sm:px-6 lg:px-8">
          <p>© 2026 PallaviTraders. All rights reserved.</p>
          <p>Iron &amp; Steel Materials Catalogue — Enquire on WhatsApp for quotations.</p>
        </div>
      </div>
    </footer>
  );
}
