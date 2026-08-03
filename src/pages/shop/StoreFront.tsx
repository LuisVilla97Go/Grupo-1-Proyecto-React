import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../contexts/StoreContext";
import {
  Search,
  ShoppingCart,
  Package,
  Plus,
  Sparkles,
  ShieldAlert,
} from "lucide-react";

export default function StoreFront() {
  const { products, categories, cart, addToCart } = useStore();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currencySymbol] = useState(() => {
    const savedSettings = localStorage.getItem("store_settings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        const symbols: Record<string, string> = {
          PEN: "S/",
          USD: "$",
          EUR: "€",
          ARS: "$",
          MXN: "$",
          COP: "$",
          CLP: "$",
          BRL: "R$",
        };
        return symbols[settings.currency as keyof typeof symbols] || "S/";
      } catch {
        return "S/";
      }
    }
    return "S/";
  });

  // Filtrar productos publicados (memoizado para performance)
  const publishedProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        selectedCategory === "all" || p.category === selectedCategory;
      return matchSearch && matchCategory && p.status === "published";
    });
  }, [products, search, selectedCategory]);

  // Totales para mostrar en el badge del carrito
  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );
  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* HEADER DE LA TIENDA */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-9 h-9 bg-rose-600 rounded-lg flex items-center justify-center shadow-lg shadow-rose-600/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white hover:text-rose-400 transition-colors">
              Grupo 01-G32
            </span>
          </div>

          {/* Menú derecho */}
          <div className="flex items-center gap-4">
            {/* Botón Carrito */}
            <button
              onClick={() => navigate("/cart")}
              className="relative p-2 text-slate-300 hover:text-white transition flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-slate-900">
                  {totalItems}
                </span>
              )}
              <span className="hidden sm:inline text-xs font-bold pr-1">
                {currencySymbol} {total.toFixed(2)}
              </span>
            </button>

            {/* Separador */}
            <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

            {/* Enlace Admin Panel */}
            <button
              onClick={() => navigate("/login")}
              className="text-xs font-bold text-slate-400 hover:text-white transition flex items-center gap-1.5 px-3.5 py-2 border border-slate-800 rounded-xl hover:bg-slate-800"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Panel Admin
            </button>
          </div>
        </div>
      </header>

      {/* HERO BANNER DE BIENVENIDA */}
      <section className="bg-linear-to-r from-slate-900 to-indigo-950 text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial from-rose-500/10 via-transparent to-transparent opacity-60 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-4 text-center md:text-left max-w-xl">
            <span className="bg-rose-600/20 text-rose-400 text-xs font-extrabold tracking-wider uppercase px-3 py-1 rounded-full border border-rose-500/10">
              Descuentos de Temporada ⚡
            </span>
            <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
              Los mejores productos a un solo clic de distancia
            </h1>
            <p className="text-sm text-slate-300">
              Compra con envío rápido y garantía asegurada en todas tus compras.
              Explora el catálogo en tiempo real.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col items-center gap-2 text-center min-w-[220px]">
            <div className="w-12 h-12 bg-rose-600/20 rounded-full flex items-center justify-center text-rose-500 mb-2">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Soporte Técnico
            </p>
            <p className="text-sm font-bold text-white">24 horas / 7 días</p>
          </div>
        </div>
      </section>

      {/* CONTENIDO PRINCIPAL: CATÁLOGO */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Barra de Búsqueda y Categorías */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          {/* Búsqueda */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar zapatillas, audífonos, camisetas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm"
            />
          </div>

          {/* Categorías (Pills) */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition ${
                selectedCategory === "all"
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition whitespace-nowrap ${
                  selectedCategory === cat.name
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Listado de Productos */}
        {publishedProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-lg">
              No encontramos productos
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Prueba buscando con otros términos o seleccionando otra categoría.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {publishedProducts.map((product) => {
              const isOutOfStock = product.stock <= 0;
              const isLowStock =
                !isOutOfStock && product.stock <= (product.minStock || 5);

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-2xl border p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-lg ${
                    isOutOfStock
                      ? "border-slate-100 opacity-60"
                      : "border-slate-200 hover:border-rose-200 hover:scale-[1.01]"
                  }`}
                >
                  <div>
                    {/* Imagen del Producto */}
                    <div className="relative w-full h-44 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center mb-4">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={`${product.brand || "Producto"} ${product.name} - ${product.category}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='16' height='16' x='4' y='4' rx='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <Package className="w-10 h-10 text-slate-300" />
                      )}

                      {/* Stock Badges */}
                      {isOutOfStock ? (
                        <span className="absolute top-2.5 right-2.5 bg-red-600 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow">
                          Agotado
                        </span>
                      ) : isLowStock ? (
                        <span className="absolute top-2.5 right-2.5 bg-amber-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow">
                          Últimas {product.stock} un.
                        </span>
                      ) : null}
                    </div>

                    {/* Marca y Nombre */}
                    {product.brand && (
                      <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block mb-1">
                        {product.brand}
                      </span>
                    )}
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[2.5rem]">
                      {product.shortDesc ||
                        "Sin descripción disponible en este producto."}
                    </p>
                  </div>

                  {/* Comprar / Añadir */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        Precio
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-black text-slate-800 text-base">
                          {currencySymbol} {product.price.toFixed(2)}
                        </span>
                        {(product.comparePrice || 0) > product.price && (
                          <span className="text-[10px] text-slate-400 line-through font-medium">
                            {currencySymbol} {product.comparePrice!.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={isOutOfStock}
                      className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition shadow ${
                        isOutOfStock
                          ? "bg-slate-100 text-slate-400 shadow-none pointer-events-none"
                          : "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/10 active:scale-[0.98]"
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Añadir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-500 py-8 border-t border-slate-800 text-center text-xs mt-12">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="text-slate-400 font-semibold">
            Grupo 01-G32 - E-commerce
          </p>
          <p>
            &copy; {new Date().getFullYear()} Todos los derechos reservados.
            Desarrollado como simulación local premium.
          </p>
        </div>
      </footer>
    </div>
  );
}
