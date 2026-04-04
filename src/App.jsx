import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

import HomePage from "./pages/HomePage";
import ProductListingPage from "./pages/ProductListingPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/Adminorders"; // ✅ NEW

function StoreLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<StoreLayout><HomePage /></StoreLayout>} />
            <Route path="/products" element={<StoreLayout><ProductListingPage /></StoreLayout>} />
            <Route path="/products/:id" element={<StoreLayout><ProductDetailsPage /></StoreLayout>} />
            <Route path="/cart" element={<StoreLayout><CartPage /></StoreLayout>} />
            <Route path="/checkout" element={<StoreLayout><CheckoutPage /></StoreLayout>} />
            <Route path="/orders" element={<StoreLayout><MyOrdersPage /></StoreLayout>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductForm />} />
              <Route path="products/:id/edit" element={<AdminProductForm />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="orders" element={<AdminOrders />} /> {/* ✅ NEW */}
            </Route>
            <Route path="*" element={<StoreLayout><div className="flex items-center justify-center min-h-[60vh]"><div className="text-center"><h1 className="text-8xl font-bold text-gray-200">404</h1><p className="text-gray-500 mt-4 mb-6">Page not found</p><a href="/" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm">Go Home</a></div></div></StoreLayout>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}