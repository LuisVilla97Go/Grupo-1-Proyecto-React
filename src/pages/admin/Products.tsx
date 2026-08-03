import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../contexts/StoreContext";
import {
    Plus,
    Search,
    Pencil,
    Copy,
    Trash2,
    Package,
    Download,
    ChevronDown,
    ArrowUpDown,
    AlertTriangle,
    X,
} from "lucide-react";
import { toast } from "sonner";

export default function Products() {
    const { products, deleteProduct } = useStore();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

    // Obtener categorías únicas memoizadas
    const categories = useMemo(
        () => ["all", ...new Set(products.map((p) => p.category))],
        [products]
    );

    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const matchSearch =
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.sku.toLowerCase().includes(search.toLowerCase());
            const matchCategory =
                selectedCategory === "all" || p.category === selectedCategory;
            const matchStatus =
                selectedStatus === "all" ||
                (selectedStatus === "published" && p.status === "published") ||
                (selectedStatus === "out" && p.stock === 0);
            return matchSearch && matchCategory && matchStatus;
        });
    }, [products, search, selectedCategory, selectedStatus]);

    const handleDelete = (id: string, name: string) => {
        setProductToDelete({ id, name });
    };

    const confirmDelete = () => {
        if (productToDelete) {
            deleteProduct(productToDelete.id);
            toast.success("Producto eliminado correctamente");
            setProductToDelete(null);
        }
    };

    const toggleSelectAll = () => {
        if (selectedProducts.length === filteredProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(filteredProducts.map((p) => p.id));
        }
    };

    const toggleSelectProduct = (id: string) => {
        if (selectedProducts.includes(id)) {
            setSelectedProducts(selectedProducts.filter((pid) => pid !== id));
        } else {
            setSelectedProducts([...selectedProducts, id]);
        }
    };

    return (
        <div className="space-y-6">
            {/* Barra de Filtros */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col lg:flex-row gap-3">
                {/* Búsqueda */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm"
                    />
                </div>

                {/* Filtro Categoría */}
                <div className="relative">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm font-medium text-slate-700 cursor-pointer"
                    >
                        <option value="all">Todas las categorías</option>
                        {categories
                            .filter((c) => c !== "all")
                            .map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                {/* Filtro Estado */}
                <div className="relative">
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm font-medium text-slate-700 cursor-pointer"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="published">Publicados</option>
                        <option value="out">Agotados</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                {/* Botón Exportar */}
                <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition text-sm font-medium text-slate-700">
                    <Download className="w-4 h-4" />
                    Exportar
                </button>
                {/*  Botón añadir*/}
                <div className="flex flex-col sm:flex-row sm:items- justify-end gap-4">
                    <button
                        onClick={() => navigate("/admin/products/new")}
                        className="bg-rose-600 text-white px-3 py-2.5 rounded-lg hover:bg-rose-700 font-medium flex items-center gap-2 transition shadow-lg shadow-rose-600/20"
                    >
                        <Plus className="w-5 h-5" /> Nuevo Producto
                    </button>
                </div>
            </div>

            {/* Tabla de Productos */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {filteredProducts.length === 0 ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                            <Package className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                            {products.length === 0
                                ? "No hay productos registrados"
                                : "No se encontraron resultados"}
                        </h3>
                        <p className="text-slate-500 max-w-md mb-6">
                            {products.length === 0
                                ? "Empieza agregando tu primer producto al inventario."
                                : "Intenta ajustar los filtros de búsqueda."}
                        </p>
                        {products.length === 0 && (
                            <button
                                onClick={() => navigate("/admin/products/new")}
                                className="text-rose-600 hover:text-rose-700 font-medium text-sm flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Agregar primer producto
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left">
                                        <input
                                            type="checkbox"
                                            checked={
                                                selectedProducts.length === filteredProducts.length &&
                                                filteredProducts.length > 0
                                            }
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <button className="flex items-center gap-1 hover:text-slate-700">
                                            Producto
                                            <ArrowUpDown className="w-3 h-3" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        SKU
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Categoría
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <button className="flex items-center gap-1 hover:text-slate-700">
                                            Precio
                                            <ArrowUpDown className="w-3 h-3" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <button className="flex items-center gap-1 hover:text-slate-700">
                                            Stock
                                            <ArrowUpDown className="w-3 h-3" />
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredProducts.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.includes(product.id)}
                                                onChange={() => toggleSelectProduct(product.id)}
                                                className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                                    {product.images && product.images.length > 0 ? (
                                                        <img
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Package className="w-5 h-5 text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {product.category}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                                {product.sku}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {product.category}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-slate-800">
                                                    ${product.price.toFixed(2)}
                                                </p>
                                                {product.cost > 0 && (
                                                    <p className="text-xs text-slate-400 line-through">
                                                        ${product.cost.toFixed(2)}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`font-semibold ${product.stock <= 5 ? "text-red-600" : "text-slate-700"}`}
                                            >
                                                {product.stock} {product.stock === 1 ? "ud" : "uds"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.stock === 0 ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                    Agotado
                                                </span>
                                            ) : product.status === "published" ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    Publicado
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                    Borrador
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() =>
                                                        navigate(`/admin/products/edit/${product.id}`)
                                                    }
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        toast.info("Producto duplicado");
                                                        // Lógica de duplicar aquí
                                                    }}
                                                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                                    title="Duplicar"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id, product.name)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Footer con resumen */}
            {filteredProducts.length > 0 && (
                <div className="flex items-center justify-between text-sm text-slate-500">
                    <p>
                        Mostrando {filteredProducts.length} de {products.length} productos
                    </p>
                    {selectedProducts.length > 0 && (
                        <p>{selectedProducts.length} seleccionado(s)</p>
                    )}
                </div>
            )}
            {/* MODAL: ELIMINAR PRODUCTO */}
            {productToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    {/* Backdrop con desenfoque de fondo */}
                    <div
                        onClick={() => setProductToDelete(null)}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
                    />

                    {/* Tarjeta de Confirmación */}
                    <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 z-10">
                        {/* Header Modal */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0 animate-pulse">
                                    <AlertTriangle className="w-5.5 h-5.5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800">Eliminar Producto</h3>
                                    <p className="text-xs text-slate-400">Esta acción es irreversible</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setProductToDelete(null)}
                                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                            ¿Estás seguro de eliminar el producto <span className="font-bold text-slate-800">"{productToDelete.name}"</span> del inventario? Se borrará físicamente del catálogo y no podrá ser restaurado.
                        </p>

                        {/* Acciones */}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setProductToDelete(null)}
                                className="px-4.5 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-red-600/10 active:scale-95"
                            >
                                Eliminar Producto
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
