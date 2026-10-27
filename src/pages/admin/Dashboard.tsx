import { Boxes, MessageSquare, Package, Plus, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { TableSkeleton } from "../../components/Loading";
import { ErrorState } from "../../components/StateMessage";
import { useSeo } from "../../hooks/useSeo";
import { useCategories } from "../../hooks/useCategories";
import { useEnquiries } from "../../hooks/useEnquiries";
import { useProducts } from "../../hooks/useProducts";
import { formatTimestamp } from "../../lib/utils";

export default function Dashboard() {
  useSeo("Dashboard | PallaviTraders Admin", "");

  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const { enquiries, loading: enquiriesLoading, error: enquiriesError } = useEnquiries();

  const featuredCount = products.filter((p) => p.featured).length;
  const inStockCount = products.filter((p) => p.availability === "in-stock").length;
  const recentEnquiries = enquiries.slice(0, 6);

  const stats = [
    {
      label: "Total Products",
      value: productsLoading ? "—" : products.length,
      sub: productsLoading ? "" : `${featuredCount} featured · ${inStockCount} in stock`,
      icon: Package,
      to: "/admin/products",
    },
    {
      label: "Categories",
      value: categoriesLoading ? "—" : categories.length,
      sub: "Product categories",
      icon: Boxes,
      to: "/admin/categories",
    },
    {
      label: "Enquiries",
      value: enquiriesLoading ? "—" : enquiries.length,
      sub: "All time",
      icon: MessageSquare,
      to: "/admin/enquiries",
    },
    {
      label: "Featured",
      value: productsLoading ? "—" : featuredCount,
      sub: "Showcased on homepage",
      icon: TrendingUp,
      to: "/admin/products",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase text-charcoal sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-steel-grey">Overview of products, categories and enquiries.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-md bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-orange-dark"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            className="group rounded-lg border border-border-grey bg-white p-5 transition hover:border-charcoal/30 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-wide text-steel-grey uppercase">{label}</p>
                <p className="mt-1.5 font-display text-3xl font-bold text-charcoal">{value}</p>
                {sub ? <p className="mt-1 text-xs text-steel-grey">{sub}</p> : null}
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-warm-white text-brand-orange transition group-hover:bg-brand-orange group-hover:text-white">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 font-display text-lg font-bold uppercase text-charcoal">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-md border border-border-grey bg-white px-4 py-2.5 text-sm font-semibold text-charcoal transition hover:border-charcoal hover:bg-charcoal hover:text-white"
          >
            <Package className="h-4 w-4" aria-hidden="true" />
            New Product
          </Link>
          <Link
            to="/admin/categories/new"
            className="inline-flex items-center gap-2 rounded-md border border-border-grey bg-white px-4 py-2.5 text-sm font-semibold text-charcoal transition hover:border-charcoal hover:bg-charcoal hover:text-white"
          >
            <Boxes className="h-4 w-4" aria-hidden="true" />
            New Category
          </Link>
          <Link
            to="/admin/enquiries"
            className="inline-flex items-center gap-2 rounded-md border border-border-grey bg-white px-4 py-2.5 text-sm font-semibold text-charcoal transition hover:border-charcoal hover:bg-charcoal hover:text-white"
          >
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
            View Enquiries
          </Link>
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-border-grey bg-white px-4 py-2.5 text-sm font-semibold text-charcoal transition hover:border-charcoal hover:bg-charcoal hover:text-white"
          >
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
            View Live Site
          </Link>
        </div>
      </div>

      {/* Recent enquiries */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold uppercase text-charcoal">Recent Enquiries</h2>
          <Link
            to="/admin/enquiries"
            className="text-xs font-semibold text-brand-orange transition hover:text-brand-orange-dark"
          >
            View all →
          </Link>
        </div>

        {enquiriesLoading ? (
          <TableSkeleton rows={5} />
        ) : enquiriesError ? (
          <ErrorState message={enquiriesError} />
        ) : recentEnquiries.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border-grey bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-grey bg-warm-white">
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-steel-grey uppercase">
                      Name
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold tracking-wide text-steel-grey uppercase sm:table-cell">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-steel-grey uppercase">
                      Message
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold tracking-wide text-steel-grey uppercase md:table-cell">
                      Received
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-grey">
                  {recentEnquiries.map((enquiry) => (
                    <tr key={enquiry.id} className="hover:bg-warm-white/50 transition">
                      <td className="px-4 py-3 font-medium text-charcoal">{enquiry.name}</td>
                      <td className="hidden px-4 py-3 text-steel-600 sm:table-cell">{enquiry.phone}</td>
                      <td className="max-w-xs px-4 py-3 text-steel-600">
                        <p className="truncate">{enquiry.message}</p>
                      </td>
                      <td className="hidden px-4 py-3 text-steel-grey md:table-cell">
                        {formatTimestamp(enquiry.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border-grey bg-white px-6 py-10 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-steel-grey" aria-hidden="true" />
            <p className="mt-3 text-sm text-steel-grey">No enquiries yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
