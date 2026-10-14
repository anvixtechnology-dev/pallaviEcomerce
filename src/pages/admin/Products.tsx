import { Eye, Package, PackagePlus, Pencil, Star, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../../components/SearchBar";
import { ProductGridSkeleton } from "../../components/Loading";
import { EmptyState, ErrorState } from "../../components/StateMessage";
import { useToast } from "../../components/Toast";
import { useSeo } from "../../hooks/useSeo";
import { useProducts } from "../../hooks/useProducts";
import { cn, formatTimestamp, getErrorMessage } from "../../lib/utils";
import { deleteProduct, filterProducts } from "../../services/productService";
import { deleteProductImages } from "../../services/storageService";
import { AVAILABILITY_LABELS, type Product } from "../../types/product";

const AVAILABILITY_BADGE: Record<Product["availability"], string> = {
  "in-stock": "border-emerald-200 bg-emerald-50 text-emerald-700",
  limited: "border-amber-200 bg-amber-50 text-amber-700",
  "out-of-stock": "border-steel-300 bg-steel-100 text-steel-600",
};

export default function AdminProducts() {
  useSeo("Manage Products | PallaviTraders Admin");

  const { products, loading, error, reload } = useProducts();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => filterProducts(products, { search }), [products, search]);

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
          className="inline-flex items-center gap-2 rounded-md bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
        >
          <PackagePlus className="h-4 w-4" aria-hidden="true" />
          Add Product
        </Link>
      </div>

      <div className="max-w-md">
        <SearchBar id="admin-product-search" value={search} onChange={setSearch} placeholder="Search products…" />
      </div>

      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : filtered.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-steel-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="bg-steel-50 text-[11px] tracking-wider text-steel-500 uppercase">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Product</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Category</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Material</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Availability</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Featured</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Updated</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-100">
                {filtered.map((product) => (
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
                    <td className="px-5 py-3.5 text-steel-600">{product.categoryName || "—"}</td>
                    <td className="px-5 py-3.5 text-steel-600">{product.material || "—"}</td>
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
                      {product.featured ? (
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-label="Featured" />
                      ) : (
                        <span className="text-steel-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-steel-500">{formatTimestamp(product.updatedAt ?? product.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/products/${product.id}`}
                          className="rounded-md border border-steel-200 p-2 text-steel-500 transition hover:border-navy-600 hover:text-navy-800"
                          title="View product"
                          aria-label={`View ${product.name}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="rounded-md border border-steel-200 p-2 text-steel-500 transition hover:border-navy-600 hover:text-navy-800"
                          title="Edit product"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
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
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title={search ? "No products match your search" : "No products yet"}
          description={
            search
              ? "Try a different keyword, or clear the search to see the full catalogue."
              : "Add your first product to populate the PallaviTraders catalogue."
          }
        >
          <Link
            to="/admin/products/add"
            className="inline-flex items-center gap-2 rounded-md bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
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
            className="absolute inset-0 bg-steel-950/70 backdrop-blur-sm"
            onClick={() => setTarget(null)}
            aria-label="Cancel"
          />
          <div className="relative w-full max-w-md rounded-xl border border-steel-200 bg-white p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-5 w-5 text-red-600" aria-hidden="true" />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold text-steel-900 uppercase">
              Are you sure you want to delete this product?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-steel-600">
              <span className="font-semibold text-steel-800">{target.name}</span> will be permanently removed from
              Firestore along with its uploaded images. This action cannot be undone.
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
