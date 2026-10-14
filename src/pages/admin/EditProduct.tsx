import { Link, useParams } from "react-router-dom";
import ProductForm from "../../components/admin/ProductForm";
import { PageLoader } from "../../components/Loading";
import { EmptyState, ErrorState } from "../../components/StateMessage";
import { useSeo } from "../../hooks/useSeo";
import { useProduct } from "../../hooks/useProducts";
import { PackageX } from "lucide-react";

export default function EditProduct() {
  const { productId } = useParams<{ productId: string }>();
  const { data: product, loading, error, reload } = useProduct(productId);

  useSeo("Edit Product | PallaviTraders Admin");

  if (loading) {
    return <PageLoader label="Loading product…" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={reload} />;
  }

  if (!product || !productId) {
    return (
      <EmptyState
        icon={PackageX}
        title="Product not found"
        description="This product may have been deleted. Return to the product list to continue."
      >
        <Link
          to="/admin/products"
          className="rounded-md bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
        >
          Back to products
        </Link>
      </EmptyState>
    );
  }

  return <ProductForm mode="edit" product={product} productId={productId} />;
}
