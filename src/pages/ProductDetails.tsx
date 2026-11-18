import { useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ProductDetailsView from "../components/ProductDetailsView";
import { PageLoader } from "../components/Loading";
import { ErrorState, SectionHeader } from "../components/StateMessage";
import { useSeo } from "../hooks/useSeo";
import { usePublishedProduct, useProductsByCategory } from "../hooks/useProducts";

export default function ProductDetails() {
  const { productId: slugOrId } = useParams<{ productId: string }>();
  const { data: product, loading, error } = usePublishedProduct(slugOrId);
  const { products: categoryProducts } = useProductsByCategory(product?.categoryId);
  const related = categoryProducts.filter((p) => p.id !== product?.id).slice(0, 4);

  useSeo(
    product ? `${product.seoTitle || product.name} | PallaviTraders` : "Product Details | PallaviTraders",
    product?.seoDescription || product?.shortDescription || product?.description || "Iron and steel product details — Pallavi Iron Traders, Bhimavaram.",
  );

  if (loading || error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-below-nav pb-16">
        {loading ? <PageLoader label="Loading product…" /> : <ErrorState message={error ?? "Product not found."} />}
      </div>
    );
  }

  return (
    <>
      <ProductDetailsView key={product.id} product={product} />

      {/* Related products */}
      {related.length > 0 ? (
        <section className="bg-white py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              tone="light"
              eyebrow="More Products"
              title="Related Products"
              to="/products"
              actionLabel="View all products"
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
