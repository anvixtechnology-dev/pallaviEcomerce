import { ChevronLeft, ChevronRight, Eye, EyeOff, Package, PackagePlus, Pencil, Rocket, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "../../components/SearchBar";
import { ProductGridSkeleton } from "../../components/Loading";
import { EmptyState, ErrorState } from "../../components/StateMessage";
import { useToast } from "../../components/Toast";
import { useSeo } from "../../hooks/useSeo";
import { useProducts } from "../../hooks/useProducts";
import { validateProduct } from "../../lib/productValidation";
import { cn, getErrorMessage } from "../../lib/utils";
import { deleteProduct, filterProducts, updateProduct } from "../../services/productService";
import { deleteProductImages } from "../../services/storageService";
import {
  AVAILABILITY_LABELS,
  PRODUCT_STATUS_LABELS,
  type Product,
  type ProductSort,
  type ProductStatus,
} from "../../types/product";

const PAGE_SIZE = 20;

const AVAILABILITY_BADGE: Record<Product["availability"], string> = {
  "in-stock": "border-emerald-200 bg-emerald-50 text-emerald-700",
  limited: "border-amber-200 bg-amber-50 text-amber-700",
  "out-of-stock": "border-steel-300 bg-steel-100 text-steel-600",
};

const STATUS_BADGE: Record<ProductStatus, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  draft: "border-amber-200 bg-amber-50 text-amber-700",
  inactive: "border-steel-300 bg-steel-100 text-steel-600",
};

const SORT_OPTIONS: Array<{ value: ProductSort; label: string }> = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

const FILTER_CLASSES =
  "w-full min-w-0 rounded-md border border-steel-300 bg-white px-3 py-2.5 text-sm text-steel-800 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/15 focus:outline-none";

const ACTION_CLASSES =
  "rounded-md border border-steel-200 p-2 text-steel-500 transition hover:border-brand-orange hover:text-brand-orange-dark disabled:cursor-not-allowed disabled:opacity-50";

export default function AdminProducts() {
  useSeo("Manage Products | PallaviTraders Admin");

  const { products, loading, error, reload } = useProducts();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProductStatus | "all">("all");
  const [sort, setSort] = useState<ProductSort>("newest");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterProducts(products, { search, status, sort }),
    [products, search, status, sort],
  );

  useEffect(() => {
    setPage(1);
  }, [search, status, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasFilters = Boolean(search.trim()) || status !== "all";

  const togglePublished = async (product: Product) => {
    const publishing = product.status !== "active";

    if (publishing && Object.values(validateProduct(product, "publish")).some(Boolean)) {
      showToast(`Complete the required fields to publish "${product.name}".`, "error");
      navigate(`/admin/products/${product.id}/edit`);
      return;
    }

    setPublishingId(product.id);
    try {
      await updateProduct(product.id, { status: publishing ? "active" : "inactive" });
      showToast(`"${product.name}" ${publishing ? "published" : "unpublished"}.`, "success");
      reload();
    } catch (caught) {
      showToast(getErrorMessage(caught), "error");
    } finally {
      setPublishingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!target) return;
    setDeleting(true);

    try {
      await deleteProduct(target.id);
      await deleteProductImages(target.id);
      showToast(`"${target.name}" has been deleted.`, "success");
      setTarget(null);
      reload();
    } catch (caught) {
      showToast(getErrorMessage(caught), "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-steel-900 uppercase sm:text-3xl">Products</h1>
          <p className="mt-1 text-sm text-steel-600">
            {products.length} {products.length === 1 ? "product" : "products"} in the catalogue.
          </p>
        </div>
        <Link
          to="/admin/products/add"
          className="inline-flex items-center gap-2 rounded-md bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-orange-dark"
        >
          <PackagePlus className="h-4 w-4" aria-hidden="true" />
          Add Product
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
        <div className="min-w-0 sm:col-span-2 lg:col-span-1">
          <SearchBar id="admin-product-search" value={search} onChange={setSearch} placeholder="Search by name, brand, material…" />
        </div>
        <select value={status} onChange={(event) => setStatus(event.target.value as ProductStatus | "all")} aria-label="Filter by status" className={FILTER_CLASSES}>
          <option value="all">All statuses</option>
          {(Object.keys(PRODUCT_STATUS_LABELS) as ProductStatus[]).map((key) => (
            <option key={key} value={key}>{PRODUCT_STATUS_LABELS[key]}</option>
          ))}
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value as ProductSort)} aria-label="Sort products" className={FILTER_CLASSES}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : filtered.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-steel-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-steel-50 text-[11px] tracking-wider text-steel-500 uppercase">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Product</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Stock</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-100">
                {visible.map((product) => (
                  <tr key={product.id} className="transition hover:bg-steel-50/70">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="h-11 w-11 shrink-0 overflow-hidden rounded-md border border-steel-200 bg-steel-100">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center font-display text-lg font-bold text-steel-400">
                              {product.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-medium text-steel-900">{product.name}</span>
                          <span className="block max-w-56 truncate text-xs text-steel-500">{product.type}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "inline-block rounded border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
                          AVAILABILITY_BADGE[product.availability],
                        )}
                      >
                        {AVAILABILITY_LABELS[product.availability]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "inline-block rounded border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
                          STATUS_BADGE[product.status],
                        )}
                      >
                        {PRODUCT_STATUS_LABELS[product.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={
                            product.status === "active"
                              ? `/products/${product.slug || product.id}`
                              : `/admin/products/${product.id}/preview`
                          }
                          className={ACTION_CLASSES}
                          title="View product"
                          aria-label={`View ${product.name}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className={ACTION_CLASSES}
                          title="Edit product"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => togglePublished(product)}
                          disabled={publishingId === product.id}
                          className={ACTION_CLASSES}
                          title={product.status === "active" ? "Unpublish product" : "Publish product"}
                          aria-label={`${product.status === "active" ? "Unpublish" : "Publish"} ${product.name}`}
                        >
                          {product.status === "active" ? <EyeOff className="h-4 w-4" /> : <Rocket className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setTarget(product)}
                          className="rounded-md border border-steel-200 p-2 text-steel-500 transition hover:border-red-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete product"
                          aria-label={`Delete ${product.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pageCount > 1 ? (
            <div className="flex items-center justify-between gap-3 border-t border-steel-100 px-5 py-3 text-sm text-steel-600">
              <p>
                Page {currentPage} of {pageCount} · {filtered.length} products
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1} className={ACTION_CLASSES} aria-label="Previous page">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage === pageCount} className={ACTION_CLASSES} aria-label="Next page">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title={hasFilters ? "No products match your filters" : "No products yet"}
          description={
            hasFilters
              ? "Try a different keyword or filter to see more of the catalogue."
              : "Add your first product to populate the PallaviTraders catalogue."
          }
        >
          <Link
            to="/admin/products/add"
            className="inline-flex items-center gap-2 rounded-md bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-orange-dark"
          >
            <PackagePlus className="h-4 w-4" aria-hidden="true" />
            Add Product
          </Link>
        </EmptyState>
      )}

      {/* Delete confirmation */}
      {target ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-charcoal/25 backdrop-blur-sm"
            onClick={() => setTarget(null)}
            aria-label="Cancel"
          />
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-steel-200 bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-5 w-5 text-red-600" aria-hidden="true" />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold text-steel-900 uppercase">
              Are you sure you want to delete this product?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-steel-600">
              <span className="font-semibold text-steel-800">{target.name}</span> will be permanently removed from
              Firestore along with its uploaded images and documents. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setTarget(null)}
                disabled={deleting}
                className="rounded-md border border-steel-300 px-4 py-2.5 text-sm font-semibold text-steel-700 transition hover:bg-steel-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deleting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Deleting…
                  </span>
                ) : (
                  "Delete product"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
