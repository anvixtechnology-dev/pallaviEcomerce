import {
  ChevronLeft,
  FolderTree,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  Settings,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { cn } from "../../lib/utils";
import { auth } from "../../lib/firebase";
import { useAuth } from "../../hooks/useAuth";
import ScrollToTop from "../../components/ScrollToTop";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin/login", { replace: true });
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-navy-800 px-5">
        <Link to="/" className="font-display text-xl leading-none font-bold tracking-wide text-white uppercase">
          Pallavi<span className="text-accent-500">Traders</span>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="rounded p-1 text-steel-400 transition hover:text-white lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <p className="px-5 pt-5 pb-2 text-[11px] font-semibold tracking-[0.18em] text-steel-500 uppercase">
        Admin Panel
      </p>

      <nav className="flex-1 space-y-1 px-3" aria-label="Admin navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-navy-800 text-white shadow-inner"
                  : "text-steel-400 hover:bg-navy-900 hover:text-white",
              )
            }
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-navy-800 p-3">
        <div className="mb-2 flex items-center gap-3 px-2 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-700 text-xs font-bold text-white">
            {(user?.email ?? "A").charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-semibold text-steel-200">{user?.email ?? "Admin"}</span>
            <span className="block text-[11px] text-steel-500">Signed in</span>
          </span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-steel-400 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </button>

        <Link
          to="/"
          className="mt-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-steel-400 transition hover:bg-navy-900 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          View website
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-steel-100">
      <ScrollToTop />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-navy-950 lg:block">{sidebarContent}</aside>

      {/* Mobile sidebar */}
      <div
        className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "pointer-events-auto" : "pointer-events-none")}
        aria-hidden={!sidebarOpen}
      >
        <button
          type="button"
          tabIndex={sidebarOpen ? 0 : -1}
          onClick={() => setSidebarOpen(false)}
          className={cn(
            "absolute inset-0 bg-steel-950/70 transition-opacity duration-300",
            sidebarOpen ? "opacity-100" : "opacity-0",
          )}
          aria-label="Close sidebar"
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 w-64 max-w-[85vw] bg-navy-950 shadow-2xl transition-transform duration-300",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {sidebarContent}
        </aside>
      </div>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-steel-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-steel-300 text-steel-600 transition hover:bg-steel-50 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="font-display text-lg leading-none font-bold text-steel-900 uppercase">Admin Dashboard</p>
              <p className="mt-1 hidden text-xs text-steel-500 sm:block">
                Manage products, categories and customer enquiries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-md bg-steel-100 px-3 py-1.5 text-xs font-medium text-steel-600 sm:inline-flex">
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="max-w-48 truncate">{user?.email ?? "admin"}</span>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-md border border-steel-300 px-3 py-2 text-xs font-semibold text-steel-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Logout
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
