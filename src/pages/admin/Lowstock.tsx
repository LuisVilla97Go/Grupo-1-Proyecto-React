import { useStore } from "../../contexts/StoreContext";
import { AlertTriangle, PackagePlus, Search, ArrowRight } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import TemplateModal from "../../components/TemplateModal";

export default function LowStock() {
    const { products, updateProduct } = useStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<{ id: string, stock: number } | null>(null);
    const [minStockThreshold] = useState(() => {
        const savedSettings = localStorage.getItem("store_settings");
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                if (settings.minStockThreshold !== undefined) {
                    return Number(settings.minStockThreshold);
                }
            } catch {
                return 5;
            }
        }
        return 5;
    });

    // Filtrar productos críticos (memoizado para performance)
    const criticalProducts = useMemo(() => {
        return products.filter(
            (p) => p.stock <= minStockThreshold && p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, minStockThreshold, searchTerm]);

    const handleRestockClick = (id: string, currentStock: number) => {
        setSelectedProduct({ id, stock: currentStock });
        setIsModalOpen(true);
    };

    const confirmRestock = (amount: string) => {
        if (!selectedProduct) return;
        const parsedAmount = parseInt(amount, 10);
        if (!isNaN(parsedAmount) && parsedAmount > 0) {
            updateProduct(selectedProduct.id, { stock: selectedProduct.stock + parsedAmount });
            toast.success(`Stock actualizado. Se agregaron ${parsedAmount} unidades.`);
            setIsModalOpen(false);
            setSelectedProduct(null);
        } else {
            toast.error("Por favor ingresa un número válido mayor a 0.");
        }
    };

    return (
        <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        Alerta de Inventario
                        <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full">
                            {criticalProducts.length} críticos
                        </span>
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Productos que tienen un stock menor o igual al límite configurado ({minStockThreshold} uds).
                    </p>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Buscar producto crítico..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm transition-all"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {criticalProducts.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-semibold">Producto</th>
                                    <th className="p-4 font-semibold">SKU</th>
                                    <th className="p-4 font-semibold">Categoría</th>
                                    <th className="p-4 font-semibold text-center">Stock Actual</th>
                                    <th className="p-4 font-semibold text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {criticalProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {product.images && product.images.length > 0 ? (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={`${product.brand || 'Producto'} ${product.name} - ${product.category}`}
                                                        className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                                                        onError={(e) => {
                                                            e.currentTarget.onerror = null;
                                                            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='16' height='16' x='4' y='4' rx='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                                                        <span className="text-slate-400 text-xs">Sin img</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{product.name}</p>
                                                    <p className="text-xs text-slate-500">
                                                        Estado: {product.status === "published" ? "Publicado" : "Borrador"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                                                {product.sku}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <AlertTriangle className={`w-4 h-4 ${product.stock === 0 ? "text-red-500" : "text-amber-500"}`} />
                                                <span className={`font-black ${product.stock === 0 ? "text-red-600" : "text-amber-600"}`}>
                                                    {product.stock}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleRestockClick(product.id, product.stock)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 font-bold text-xs rounded-lg transition-colors border border-emerald-200"
                                            >
                                                <PackagePlus className="w-4 h-4" />
                                                Reabastecer
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-16 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                            <PackagePlus className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">
                            ¡Inventario Saludable!
                        </h3>
                        <p className="text-slate-500 max-w-md mb-6">
                            Todos tus productos tienen un nivel de stock por encima del umbral mínimo ({minStockThreshold} unidades).
                        </p>
                        <Link
                            to="/admin/products"
                            className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all text-sm shadow-sm"
                        >
                            Ver Catálogo Completo
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}
            </div>

            <TemplateModal
                isOpen={isModalOpen}
                title="Reabastecer Inventario"
                message="¿Cuánto stock adicional deseas añadir al inventario actual de este producto?"
                inputType="number"
                onConfirm={confirmRestock}
                onCancel={() => {
                    setIsModalOpen(false);
                    setSelectedProduct(null);
                }}
            />
        </section>
    );
}
