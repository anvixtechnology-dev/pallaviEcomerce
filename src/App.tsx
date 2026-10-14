import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicLayout from "./components/PublicLayout";
import { ToastProvider } from "./components/Toast";
import About from "./pages/About";
import Categories from "./pages/Categories";
import CategoryProducts from "./pages/CategoryProducts";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProductDetails from "./pages/ProductDetails";
import Products from "./pages/Products";
import AddProduct from "./pages/admin/AddProduct";
import AdminCategories from "./pages/admin/Categories";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import EditProduct from "./pages/admin/EditProduct";
import AdminEnquiries from "./pages/admin/Enquiries";
import Login from "./pages/admin/Login";
import AdminProducts from "./pages/admin/Products";
import Settings from "./pages/admin/Settings";

export default function App() {
  return (
    <ToastProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            {/* Public website */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:productId" element={<ProductDetails />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/:categoryId" element={<CategoryProducts />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Admin */}
            <Route path="/admin/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/add" element={<AddProduct />} />
                <Route path="products/:productId/edit" element={<EditProduct />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="enquiries" element={<AdminEnquiries />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </ToastProvider>
  );
}
