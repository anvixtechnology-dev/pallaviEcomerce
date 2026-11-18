import { ArrowLeft, PackageX, Pencil } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { PageLoader } from "../../components/Loading";
import ProductDetailsView from "../../components/ProductDetailsView";
import { EmptyState, ErrorState } from "../../components/StateMessage";
import { useProduct } from "../../hooks/useProducts";
import { useSeo } from "../../hooks/useSeo";
import { PRODUCT_STATUS_LABELS } from "../../types/product";

/** Lets admins view a saved product that customers cannot see yet. */
export default function PreviewProduct() {
  const { productId } = useParams<{ productId: string }>();
  const { data: product, loading, error, reload } = useProduct(productId);

  useSeo("Preview Product | PallaviTraders Admin");

  if (loading) return <PageLoader label="Loading product…" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  if (!product) {
    return (
      <EmptyState icon={PackageX} title="Product not found" description="This product may have been deleted.">
        <Link to="/admin/products" className="rounded-md bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700">
          Back to products
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-steel-600">
          Status: <span className="font-semibold text-steel-900">{PRODUCT_STATUS_LABELS[product.status]}</span>
          {product.status !== "active" ? " — hidden from customers." : ""}
        </p>
        <div className="flex gap-2">
          <Link to="/admin/products" className="inline-flex items-center gap-2 rounded-md border border-steel-300 bg-white px-4 py-2 text-sm font-semibold text-steel-700 transition hover:border-navy-700 hover:text-navy-900">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
          <Link to={`/admin/products/${product.id}/edit`} className="inline-flex items-center gap-2 rounded-md bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-700">
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit
          </Link>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-steel-200">
        <ProductDetailsView product={product} preview />
      </div>
    </div>
  );
}
