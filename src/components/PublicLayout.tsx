import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";
import ScrollToTop from "./ScrollToTop";
import WhatsAppButton from "./WhatsAppButton";

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-near-black">
      <ScrollToTop />
      <Navbar />
      {/* No top padding here — the Home hero starts at the top of the page behind
          the fixed navbar, and every other page's first section uses the
          `pt-below-nav` utility (see index.css) to clear the navbar. */}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
