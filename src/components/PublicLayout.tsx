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
      {/* No top padding here — the Home hero bleeds behind the fixed navbar
          using negative margin-top, and all other page sections have their
          own py-12/py-14 top spacing that clears the navbar naturally. */}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
