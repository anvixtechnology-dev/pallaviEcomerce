import { ArrowRight, CheckCircle2, FolderTree, Inbox, Package, Plus, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TableSkeleton } from "../../components/Loading";
import { EmptyState, ErrorState } from "../../components/StateMessage";
import { useSeo } from "../../hooks/useSeo";
import { getErrorMessage, formatTimestamp, cn } from "../../lib/utils";
import { getCategories } from "../../services/categoryService";
import { getEnquiries } from "../../services/enquiryService";
import { getProducts } from "../../services/productService";
import { ENQUIRY_STATUS_LABELS, type Enquiry, type EnquiryStatus } from "../../types/enquiry";

interface Stats {
  totalProducts: number;
  totalCategories: number;
  availableProducts: number;
  featuredProducts: number;
  newEnquiries: number;
}

const STATUS_STYLES: Record<EnquiryStatus, string> = {
  new: "border-blue-200 bg-blue-50 text-blue-700",
  contacted: "border-amber-200 bg-amber-50 text-amber-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export default function Dashboard() {
  useSeo("Admin Dashboard | PallaviTraders");

  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = () => {
    setLoading(true);
    setError(null);

    Promise.all([getProducts(), getCategories(), getEnquiries()])
      .then(([products, categories, enquiries]) => {
        setStats({
          totalProducts: products.length,
          totalCategories: categories.length,
          availableProducts: products.filter((product) => product.availability === "in-stock").length,
          featuredProducts: products.filter((product) => product.featured).length,
          newEnquiries: enquiries.filter((enquiry) => enquiry.status === "new").length,
        });
        setRecent(enquiries.slice(0, 5));
      })
      .catch((caught) => setError(getErrorMessage(caught)))
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const cards = [
    { label: "Total Products", value: stats?.totalProducts ?? 0, icon: Package, accent: "text-navy-700", to: "/admin/products" },
    { label: "Total Categories", value: stats?.totalCategories ?? 0, icon: FolderTree, accent: "text-violet-600", to: "/admin/categories" },
    { label: "Available Products", value: stats?.availableProducts ?? 0, icon: CheckCircle2, accent: "text-emerald-600", to: "/admin/products" },
    { label: "Featured Products", value: stats?.featuredProducts ?? 0, icon: Star, accent: "text-amber-500", to: "/admin/products" },
    { label: "New Enquiries", value: stats?.newEnquiries ?? 0, icon: Inbox, accent: "text-red-500", to: "/admin/enquiries" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-steel-900 uppercase sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-steel-600">Live statistics from your Firestore database.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/products/add"
            className="inline-flex items-center gap-2 rounded-md bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Product
          </Link>
          <Link
            to="/admin/enquiries"
            className="inline-flex items-center gap-2 rounded-md border border-steel-300 bg-white px-4 py-2.5 text-sm font-semibold text-steel-700 transition hover:border-navy-700 hover:text-navy-900"
          >
            View enquiries
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading || !stats ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="rounded-lg border border-steel-200 bg-white p-5">
              <div className="skeleton h-4 w-24 rounded" />
              <div className="skeleton mt-4 h-8 w-16 rounded" />
              <div className="skeleton mt-3 h-3 w-32 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map((card) => (
            <Link
              key={card.label}
              to={card.to}
              className="group rounded-lg border border-steel-200 bg-white p-5 transition hover:border-navy-600/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className={cn("flex h-10 w-10 items-center justify-center rounded-md bg-steel-100", card.accent)}>
                  <card.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <ArrowRight className="h-4 w-4 text-steel-300 transition group-hover:text-navy-700" aria-hidden="true" />
              </div>
              <p className="mt-4 font-display text-3xl leading-none font-bold text-steel-900">{card.value}</p>
              <p className="mt-1.5 text-xs font-semibold tracking-wide text-steel-500 uppercase">{card.label}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Recent enquiries */}
      <section className="rounded-lg border border-steel-200 bg-white">
        <div className="flex items-center justify-between border-b border-steel-200 px-5 py-4">
          <h2 className="font-display text-lg font-bold text-steel-900 uppercase">Recent Enquiries</h2>
          <Link to="/admin/enquiries" className="text-sm font-semibold text-navy-700 transition hover:text-navy-900">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="p-5">
            <TableSkeleton rows={4} />
          </div>
        ) : recent.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-steel-50 text-[11px] tracking-wider text-steel-500 uppercase">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Customer</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Product</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-100">
                {recent.map((enquiry) => (
                  <tr key={enquiry.id}>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-steel-900">{enquiry.name}</p>
                      <p className="text-xs text-steel-500">{enquiry.phone}</p>
                    </td>
                    <td className="px-5 py-3.5 text-steel-600">{enquiry.productName || "—"}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "inline-block rounded border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
                          STATUS_STYLES[enquiry.status],
                        )}
                      >
                        {ENQUIRY_STATUS_LABELS[enquiry.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-steel-500">{formatTimestamp(enquiry.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={Inbox}
              title="No enquiries yet"
              description="Customer enquiries from the contact form will appear here."
            />
          </div>
        )}
      </section>
    </div>
  );
}
