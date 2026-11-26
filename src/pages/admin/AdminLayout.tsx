import {
  BarChart3,
  Boxes,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { PageLoader } from "../../components/Loading";
import { useToast } from "../../components/Toast";
import { useAuth } from "../../hooks/useAuth";
import { runCatalogSetup } from "../../services/catalogSetupService";

const NAV_ITEMS = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/categories", icon: Boxes, label: "Categories" },
  { to: "/admin/enquiries", icon: BarChart3, label: "Enquiries" },
];

const LOGO_SRC = "/images/pallavi-logo.png";

function AdminLogo({ className }: { className: string }) {
  return (
    <img
      src={LOGO_SRC}
      alt="Pallavi Iron Traders"
      loading="eager"
      className={`w-auto shrink-0 rounded-md object-contain ${className}`}
    />
  );
}

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [setupDone, setSetupDone] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Pages wait for this so they load the categories it may have just added.
  useEffect(() => {
    runCatalogSetup()
      .catch((caught) => {
        const detail = caught instanceof Error ? caught.message : "Catalogue setup could not finish.";
        const hint = String(caught?.cause?.code ?? caught?.message).includes("permission-denied")
          ? " Deploy the latest firestore.rules and make sure your account is in the admins collection."
          : "";
        showToast(detail + hint, "error");
      })
      .finally(() => setSetupDone(true));
  }, [showToast]);

  // Lock page scroll and close on Escape while the mobile drawer is open.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [drawerOpen]);

  async function handleSignOut() {
    await signOut();
    navigate("/admin/login", { replace: true });
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${
      isActive
        ? "bg-brand-orange text-white"
        : "text-charcoal/70 hover:bg-surface-cream hover:text-charcoal"
    }`;

  return (
    <div className="flex min-h-screen bg-warm-white">
      {/* Sidebar — desktop */}
      <aside className="hidden w-60 shrink-0 flex-col bg-white lg:flex">
        <div className="flex flex-col items-center gap-1.5 border-b border-border-light px-5 py-5">
          <Link to="/admin" className="flex items-center" aria-label="Admin dashboard">
            <AdminLogo className="h-20" />
          </Link>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal/60">Admin panel</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Admin navigation">
          {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} className={navLinkClass}>
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border-light p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-orange/10 text-sm font-bold text-brand-orange-dark uppercase">
              {user?.email?.[0] ?? "A"}
            </div>
            <p className="min-w-0 truncate text-xs text-charcoal/70">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-charcoal/70 transition hover:bg-surface-cream hover:text-charcoal"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile header + drawer */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border-grey bg-white px-4 lg:hidden">
          <Link to="/admin" className="flex items-center" aria-label="Admin dashboard">
            <AdminLogo className="h-10" />
          </Link>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            className="-mr-1.5 inline-flex h-11 w-11 items-center justify-center rounded-md text-charcoal hover:bg-warm-white"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        {/* Mobile drawer overlay */}
        <div
          className={`fixed inset-0 z-40 bg-charcoal/25 transition-opacity duration-300 lg:hidden ${
            drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden="true"
          onClick={() => setDrawerOpen(false)}
        />

        {/* Mobile drawer */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] flex-col bg-white transition-transform duration-300 lg:hidden ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-label="Mobile admin navigation"
          inert={!drawerOpen}
        >
          <div className="flex h-20 items-center justify-between border-b border-border-light px-4">
            <AdminLogo className="h-14" />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close navigation"
              className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-md text-charcoal"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Admin navigation">
            {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={navLinkClass}
                onClick={() => setDrawerOpen(false)}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-border-light p-4">
            <p className="mb-2 truncate text-xs text-charcoal/70">{user?.email}</p>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-charcoal/70 transition hover:bg-surface-cream hover:text-charcoal"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Page content */}
        <main className="min-w-0 flex-1 overflow-auto">
          {/* Desktop breadcrumb strip */}
          <div className="hidden border-b border-border-grey bg-white px-6 py-3 lg:flex items-center gap-1 text-xs text-steel-grey">
            <Link to="/" className="hover:text-brand-orange-dark transition">
              Site
            </Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-charcoal font-medium">Admin</span>
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {setupDone ? <Outlet /> : <PageLoader label="Loading…" />}
          </div>
        </main>
      </div>
    </div>
  );
}
