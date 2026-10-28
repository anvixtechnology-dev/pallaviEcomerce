import WhatsAppIcon from "./WhatsAppIcon";
import { openWhatsApp } from "../lib/whatsapp";

/** Floating WhatsApp button, visible on all public-facing pages.
 * Sits below the mobile navigation drawer (z-40) and clears the iOS home indicator. */
export default function WhatsAppButton() {
  return (
    <div className="group fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 sm:right-6 sm:bottom-6">
      <span className="animate-ring absolute inset-0 rounded-full bg-whatsapp" aria-hidden="true" />
      <button
        type="button"
        onClick={() => openWhatsApp()}
        aria-label="Enquire on WhatsApp"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-[0_10px_25px_-8px_rgba(18,140,126,0.7)] transition duration-300 hover:scale-105 hover:bg-whatsapp-dark focus-visible:ring-2 focus-visible:ring-whatsapp-dark focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </button>
      <span className="pointer-events-none absolute top-1/2 right-full mr-3 hidden -translate-y-1/2 rounded-md bg-steel-900 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition duration-200 group-hover:opacity-100 sm:block">
        Chat with us on WhatsApp
      </span>
    </div>
  );
}
