import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import LowStock from "./pages/admin/Lowstock";
import Settings from "./pages/admin/Settings";
import ProductForm from "./pages/admin/ProductForm";
import Login from "./pages/auth/Login";
import Users from "./pages/admin/Users";
import Sales from "./pages/admin/Sales";
import StoreFront from "./pages/shop/StoreFront";
import CartFront from "./pages/shop/CartFront";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-semibold">
        Cargando sistema...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública principal: Tienda E-commerce */}
        <Route path="/" element={<StoreFront />} />

        {/* Ruta pública: Carrito de Compras */}
        <Route path="/cart" element={<CartFront />} />

        {/* Ruta pública de Login Administrativo */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/admin" replace />}
        />

        {/* Rutas protegidas del Dashboard Administrativo */}
        <Route
          path="/admin"
          element={user ? <Layout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="categories" element={<Categories />} />
          <Route path="low-stock" element={<LowStock />} />
          <Route path="users" element={<Users />} />
          <Route path="sales" element={<Sales />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
