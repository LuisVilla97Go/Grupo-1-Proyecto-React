import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Menu } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import NotificationsPopover from "./NotificationsPopover";

interface TopNavProps {
  onToggleMobileSidebar: () => void;
}

export default function TopNav({ onToggleMobileSidebar }: TopNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Configuración personalizada por página
  const pageConfig: Record<
    string,
    {
      title: string;
      subtitle: string;
      showBack?: boolean;
      action?: { label: string; onClick: () => void };
    }
  > = {
    "/admin": {
      title: "Resumen",
      subtitle: "Visión general de tu tienda",
    },
    "/admin/products": {
      title: "Productos",
      subtitle: "Gestiona tu catálogo de productos",
      action: {
        label: "Nuevo Producto",
        onClick: () => navigate("/admin/products/new"),
      },
    },
    "/admin/products/new": {
      title: "Nuevo Producto",
      subtitle: "Crea un nuevo producto en tu inventario",
      showBack: true,
    },
    "/admin/categories": {
      title: "Categorías",
      subtitle: "Organiza tus productos por categorías",
    },
    "/admin/low-stock": {
      title: "Stock Bajo",
      subtitle: "Productos que necesitan reabastecimiento",
    },
    "/admin/users": {
      title: "Usuarios",
      subtitle: "Gestiona los usuarios y accesos del sistema",
    },
    "/admin/sales": {
      title: "Punto de Venta (POS)",
      subtitle:
        "Registra nuevas transacciones y visualiza el historial de caja",
    },
    "/admin/settings": {
      title: "Configuración",
      subtitle:
        "Administra los datos generales, moneda e impuestos de tu tienda",
    },
  };

  // Detectar si es edición de producto
  const isEditProduct = location.pathname.startsWith("/admin/products/edit/");
  const currentPage = isEditProduct
    ? {
        title: "Editar Producto",
        subtitle: "Modifica la información del producto",
      }
    : pageConfig[location.pathname] || {
        title: "Dashboard",
        subtitle: "Panel de administración",
      };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      {/* Izquierda: Título y Subtítulo personalizados */}
      <div className="flex items-center gap-3">
        {/* Botón de menú hamburguesa para móviles */}
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 -ml-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors md:hidden"
          title="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        {currentPage.showBack && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
        )}

        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {currentPage.title}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {currentPage.subtitle}
          </p>
        </div>
      </div>

      {/* Derecha: Acciones y Perfil */}
      <div className="flex items-center gap-3">
        {/* Notificaciones */}
        <NotificationsPopover />

        {/* Separador */}
        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        {/* Perfil */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          title={user ? `${user.name} (${user.role})` : ""}
        >
          <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center font-bold text-sm group-hover:bg-rose-600 group-hover:text-white transition-colors">
            {user?.name.charAt(0) || "U"}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-700 leading-tight">
              {user?.name || "Usuario"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
