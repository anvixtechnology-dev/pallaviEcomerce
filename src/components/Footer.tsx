import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { BUSINESS } from "../lib/contact";
import { buildWhatsAppUrl } from "../lib/whatsapp";
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
    <footer className="border-t border-navy-700/50 bg-navy-950 text-steel-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <p className="font-display text-3xl leading-none font-bold tracking-wide text-white uppercase">
              Pallavi<span className="text-accent-500">Traders</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-steel-400">
              Quality Iron &amp; Steel Materials for Every Construction Need.
            </p>
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-whatsapp px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-whatsapp-dark"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Enquire on WhatsApp
            </a>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold tracking-wide text-white uppercase">Quick Links</h2>
            <ul className="mt-4 space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-steel-400 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold tracking-wide text-white uppercase">Products</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-steel-400">
              <li>TMT Bars</li>
              <li>MS Angles, Channels &amp; Beams</li>
              <li>MS Plates, Flats &amp; Rods</li>
              <li>MS &amp; GI Pipes and Sheets</li>
              <li>Binding Wire &amp; Steel Sections</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold tracking-wide text-white uppercase">Contact</h2>
            <ul className="mt-4 space-y-3 text-sm text-steel-400">
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" aria-hidden="true" />
                <a href={`tel:${BUSINESS.phoneDial}`} className="transition hover:text-white">
                  {BUSINESS.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-whatsapp" />
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-white"
                >
                  {BUSINESS.whatsappDisplay}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" aria-hidden="true" />
                <a href={`mailto:${BUSINESS.email}`} className="break-all transition hover:text-white">
                  {BUSINESS.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" aria-hidden="true" />
                <span>{BUSINESS.address}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" aria-hidden="true" />
                <span>{BUSINESS.hours}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-navy-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-steel-500 sm:flex-row sm:px-6 lg:px-8">
          <p>© 2026 PallaviTraders. All rights reserved.</p>
          <p>Iron &amp; Steel Materials Catalogue — Enquire on WhatsApp for quotations.</p>
        </div>
      </div>
    </footer>
  );
}
