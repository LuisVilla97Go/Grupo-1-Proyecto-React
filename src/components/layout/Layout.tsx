import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import { X } from "lucide-react";

export default function Layout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar de Escritorio */}
      <Sidebar />

      {/* Sidebar para móviles (Drawer slide-over) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop blur */}
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          {/* Contenido Sidebar Drawer */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 text-white animate-in slide-in-from-left duration-300">
            {/* Botón Cerrar */}
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                title="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar interno móvil */}
            <Sidebar
              isMobile={true}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Área Principal (TopNav + Contenido) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar Superior con control de menú móvil */}
        <TopNav onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        {/* Contenido Dinámico de las Páginas */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
