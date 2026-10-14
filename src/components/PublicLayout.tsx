import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";
import ScrollToTop from "./ScrollToTop";
import WhatsAppButton from "./WhatsAppButton";

/** Layout for all customer facing pages: sticky navbar, content, footer and
 * the floating WhatsApp button. */
export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
