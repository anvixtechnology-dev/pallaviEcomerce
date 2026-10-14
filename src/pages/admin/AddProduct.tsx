import ProductForm from "../../components/admin/ProductForm";
import { useSeo } from "../../hooks/useSeo";

export default function AddProduct() {
  useSeo("Add Product | PallaviTraders Admin");

  return <ProductForm mode="add" />;
}
