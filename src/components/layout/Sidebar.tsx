import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  Tags,
  AlertTriangle,
  Settings as SettingsIcon,
  Box,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Users,
  ShoppingCart,
} from "lucide-react";

const menuItems = [
  { name: "Resumen", icon: LayoutDashboard, path: "/admin" },
  { name: "Productos", icon: Package, path: "/admin/products" },
  { name: "Categorías", icon: Tags, path: "/admin/categories" },
  { name: "Stock Bajo", icon: AlertTriangle, path: "/admin/low-stock" },
  { name: "Ventas", icon: ShoppingCart, path: "/admin/sales" },
  { name: "Usuarios", icon: Users, path: "/admin/users" },
  { name: "Configuración", icon: SettingsIcon, path: "/admin/settings" },
];

interface SidebarProps {
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  isMobile = false,
  onCloseMobile,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();

  return (
    <aside
      className={
        isMobile
          ? "bg-slate-900 text-white flex flex-col h-full w-full border-r border-slate-800"
          : `bg-slate-900 text-white shrink-0 hidden md:flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out border-r border-slate-800 ${
              isCollapsed ? "w-20" : "w-64"
            }`
      }
    >
      {/* Logo y Botón de Toggle */}
      <div
        className={`p-4 border-b border-slate-700/50 flex items-center ${isCollapsed && !isMobile ? "justify-center" : "justify-between"} gap-3`}
      >
        {(!isCollapsed || isMobile) && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-rose-600 rounded-lg flex items-center justify-center shadow-lg shadow-rose-600/20 shrink-0">
              <Box className="w-6 h-6 text-white" />
            </div>
            <div className="whitespace-nowrap">
              <h1 className="text-lg font-bold tracking-tight">AdminPanel</h1>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">
                Gestión
              </p>
            </div>
          </div>
        )}

        {/* Botón para colapsar/expandir (Solo escritorio) */}
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title={isCollapsed ? "Expandir menú" : "Contraer menú"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin"}
            onClick={() => isMobile && onCloseMobile?.()}
            title={isCollapsed && !isMobile ? item.name : ""}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative ${
                isActive
                  ? "bg-rose-600 text-white font-semibold shadow-lg shadow-rose-600/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              } ${isCollapsed && !isMobile ? "justify-center" : "justify-start"}`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive
                      ? "text-white"
                      : "text-slate-500 group-hover:text-rose-500"
                  }`}
                />

                {/* Texto del menú con animación de ancho y opacidad */}
                <span
                  className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                    isCollapsed && !isMobile
                      ? "w-0 opacity-0"
                      : "w-auto opacity-100"
                  }`}
                >
                  {item.name}
                </span>

                {/* Indicador visual de activo (punto lateral) cuando está colapsado */}
                {isCollapsed && !isMobile && isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-rose-500 rounded-r-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Perfil de Usuario (Footer) */}
      <div className="p-3 border-t border-slate-700/50 bg-slate-900/50">
        <div
          className={`flex items-center justify-between gap-2 ${isCollapsed && !isMobile ? "flex-col" : ""}`}
        >
          <div
            className={`flex items-center gap-3 p-1 rounded-lg transition-colors flex-1 min-w-0 ${
              isCollapsed && !isMobile ? "justify-center" : ""
            }`}
            title={user ? `${user.name} (${user.role})` : ""}
          >
            <div className="w-9 h-9 bg-linear-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
              {user?.name.charAt(0) || "U"}
            </div>

            {(!isCollapsed || isMobile) && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-semibold text-slate-200 truncate">
                  {user?.name || "Usuario"}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.role || "Personal"}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              logout();
              if (isMobile && onCloseMobile) {
                onCloseMobile();
              }
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
