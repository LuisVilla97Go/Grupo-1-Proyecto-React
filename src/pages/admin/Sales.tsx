import { useState, useMemo } from "react";
import { useStore } from "../../contexts/StoreContext";
import { useAuth } from "../../contexts/AuthContext";
import { type Product, type SaleItem } from "../../types";
import { toast } from "sonner";
import {
    Search,
    ShoppingCart,
    Receipt,
    Plus,
    Minus,
    Trash2,
    Package,
    User,
    CreditCard,
    Banknote,
    QrCode,
    Check,
    Store,
    Loader2,
    X,
} from "lucide-react";

interface CartItem extends SaleItem {
    stockLimit: number;
    image?: string;
}

export default function Sales() {
    const { products, sales, registerSale, categories } = useStore();
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState<"pos" | "history">("pos");
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<"Efectivo" | "Tarjeta" | "Yape/Plin">("Efectivo");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currencySymbol] = useState(() => {
        const savedSettings = localStorage.getItem("store_settings");
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                const symbols: Record<string, string> = {
                    PEN: "S/", USD: "$", EUR: "€", ARS: "$", MXN: "$", COP: "$", CLP: "$", BRL: "R$",
                };
                return symbols[settings.currency as keyof typeof symbols] || "S/";
            } catch {
                return "S/";
            }
        }
        return "S/";
    });
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Filtrar productos del catálogo (solo publicados) y memoizar
    const publishedProducts = useMemo(
        () => products.filter((p) => p.status === "published"),
        [products]
    );

    const filteredProducts = useMemo(() => {
        return publishedProducts.filter((p) => {
            const matchSearch =
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.sku.toLowerCase().includes(search.toLowerCase());
            const matchCategory =
                selectedCategory === "all" || p.category === selectedCategory;
            return matchSearch && matchCategory;
        });
    }, [publishedProducts, search, selectedCategory]);

    const categoryCounts = useMemo(() => {
        return publishedProducts.reduce((acc, p) => {
            acc[p.category] = (acc[p.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [publishedProducts]);

    const totalRecaudado = useMemo(() => sales.reduce((sum, s) => sum + s.total, 0), [sales]);
    const ticketPromedio = useMemo(() => sales.length > 0 ? totalRecaudado / sales.length : 0, [sales, totalRecaudado]);

    // Agregar producto al carrito
    const addToCart = (product: Product) => {
        if (product.stock <= 0) {
            toast.error(`"${product.name}" está agotado.`);
            return;
        }

        const existingIndex = cart.findIndex((item) => item.productId === product.id);

        if (existingIndex > -1) {
            const currentQty = cart[existingIndex].quantity;
            if (currentQty >= product.stock) {
                toast.warning(`No puedes agregar más. Límite de stock alcanzado (${product.stock} disponibles).`);
                return;
            }
            const updatedCart = [...cart];
            updatedCart[existingIndex].quantity += 1;
            setCart(updatedCart);
            toast.success(`Se incrementó la cantidad de "${product.name}".`);
        } else {
            const newItem: CartItem = {
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                stockLimit: product.stock,
                image: product.images && product.images.length > 0 ? product.images[0] : undefined,
            };
            setCart([...cart, newItem]);
            toast.success(`"${product.name}" agregado al carrito.`);
        }
    };

    // Modificar cantidad en el carrito (+ o -)
    const updateQuantity = (productId: string, amount: number) => {
        const updatedCart = cart
            .map((item) => {
                if (item.productId === productId) {
                    const newQty = item.quantity + amount;
                    if (newQty > item.stockLimit) {
                        toast.warning(`Límite de stock alcanzado (${item.stockLimit} disponibles).`);
                        return item;
                    }
                    return { ...item, quantity: newQty };
                }
                return item;
            })
            .filter((item) => item.quantity > 0);

        setCart(updatedCart);
    };

    // Quitar un producto del carrito
    const removeFromCart = (productId: string, name: string) => {
        setCart(cart.filter((item) => item.productId !== productId));
        toast.info(`"${name}" removido del carrito.`);
    };


    // Cálculos del Ticket de Venta
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const subtotal = total / 1.18;
    const igv = total - subtotal;

    // Mostrar modal de confirmación
    const handleCheckout = () => {
        if (cart.length === 0) {
            toast.error("El carrito está vacío. Agrega productos para realizar una venta.");
            return;
        }

        // Doble verificación del stock (DevSecOps)
        for (const item of cart) {
            const currentProduct = products.find((p) => p.id === item.productId);
            if (!currentProduct || currentProduct.stock < item.quantity) {
                toast.error(`Inconsistencia: "${item.name}" ya no tiene stock suficiente (${currentProduct?.stock || 0} disponibles).`);
                return;
            }
        }

        setShowConfirmModal(true);
    };

    // Procesar y registrar la venta (Ejecución real)
    const executeCheckout = async () => {
        setIsSubmitting(true);

        setTimeout(() => {
            try {
                const saleItems: SaleItem[] = cart.map((item) => ({
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    category: item.category,
                }));

                registerSale({
                    items: saleItems,
                    subtotal: parseFloat(subtotal.toFixed(2)),
                    igv: parseFloat(igv.toFixed(2)),
                    total: parseFloat(total.toFixed(2)),
                    paymentMethod,
                });

                toast.success("¡Venta completada con éxito!");
                setCart([]); // Vaciar carrito
                setShowConfirmModal(false);
            } catch {
                toast.error("Ocurrió un error al procesar la venta.");
                setShowConfirmModal(false);
            } finally {
                setIsSubmitting(false);
            }
        }, 800);
    };

    return (
        <div className="space-y-6">
            {/* Cabecera del POS interna */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-600/20 shrink-0">
                        <Store className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-800">Punto de Venta (POS)</h2>
                        <p className="text-xs text-slate-400 font-medium">Caja activa y emisión de comprobantes en tiempo real</p>
                    </div>
                </div>

                {/* Tabuladores como botones */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab("pos")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${activeTab === "pos"
                            ? "bg-rose-50 text-rose-600 border-rose-200"
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            }`}
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Terminal POS
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${activeTab === "history"
                            ? "bg-rose-50 text-rose-600 border-rose-200"
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            }`}
                    >
                        <Receipt className="w-4 h-4" />
                        Historial de Caja ({sales.length})
                    </button>
                </div>
            </div>

            {/* PESTAÑA: TERMINAL POS */}
            {activeTab === "pos" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* COLUMNA IZQUIERDA: CATÁLOGO DE PRODUCTOS (2/3 de ancho en lg) */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Barra de Filtros y Búsqueda */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
                            <div className="relative w-full">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar producto por nombre o SKU..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-sm"
                                />
                            </div>

                            {/* Categorías (Pills) */}
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                <button
                                    onClick={() => setSelectedCategory("all")}
                                    className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-wide transition whitespace-nowrap ${selectedCategory === "all"
                                        ? "bg-rose-600 text-white shadow-sm"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                >
                                    Todas ({publishedProducts.length})
                                </button>
                                {categories.map((cat) => {
                                    const count = categoryCounts[cat.name] || 0;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.name)}
                                            className={`px-4 py-2 rounded-xl text-xs font-extrabold tracking-wide transition whitespace-nowrap ${selectedCategory === cat.name
                                                ? "bg-rose-600 text-white shadow-sm"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                }`}
                                        >
                                            {cat.name} ({count})
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Rejilla del Catálogo */}
                        {filteredProducts.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="font-bold text-slate-800 text-lg">No se encontraron productos</h3>
                                <p className="text-slate-500 text-sm mt-1">
                                    Intenta cambiar los términos de búsqueda o filtros.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {filteredProducts.map((product) => {
                                    const isOutOfStock = product.stock <= 0;
                                    const itemInCart = cart.find((item) => item.productId === product.id);
                                    const isCartLimit = itemInCart ? itemInCart.quantity >= product.stock : false;
                                    const isLowStock = !isOutOfStock && product.stock <= (product.minStock || 5);

                                    return (
                                        <div
                                            key={product.id}
                                            onClick={() => !isOutOfStock && addToCart(product)}
                                            className={`bg-white rounded-2xl border p-4 flex flex-col justify-between transition-all duration-300 shadow-sm ${isOutOfStock
                                                ? "border-slate-100 opacity-60 cursor-not-allowed"
                                                : "border-slate-200 hover:border-rose-300 hover:shadow-md cursor-pointer hover:scale-[1.01]"
                                                }`}
                                        >
                                            <div>
                                                {/* Contenedor Imagen */}
                                                <div className="relative w-full h-36 bg-slate-55 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden mb-3">
                                                    {product.images && product.images.length > 0 ? (
                                                        <img
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Package className="w-8 h-8 text-slate-300" />
                                                    )}

                                                    {/* Red cantidad en carrito */}
                                                    {itemInCart && itemInCart.quantity > 0 && (
                                                        <span className="absolute top-2 left-2 w-6 h-6 bg-rose-600 text-white text-xs font-black rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
                                                            {itemInCart.quantity}
                                                        </span>
                                                    )}

                                                    {isOutOfStock ? (
                                                        <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                                                            Agotado
                                                        </span>
                                                    ) : isLowStock ? (
                                                        <span className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                                            Poco Stock
                                                        </span>
                                                    ) : null}
                                                </div>

                                                {/* Detalles */}
                                                <h4 className="font-bold text-slate-800 text-xs line-clamp-1">{product.name}</h4>
                                                <p className="text-[9px] text-slate-400 font-mono mt-0.5">{product.sku}</p>
                                            </div>

                                            {/* Footer Tarjeta */}
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                                                <div className="flex flex-col">
                                                    <span className="font-extrabold text-slate-800 text-sm">
                                                        {currencySymbol} {product.price.toFixed(2)}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 mt-0.5">
                                                        Stock: {product.stock}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    disabled={isOutOfStock || isCartLimit}
                                                    className={`w-7 h-7 rounded-full transition-colors flex items-center justify-center text-white ${isOutOfStock || isCartLimit
                                                        ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                                                        : "bg-rose-600 hover:bg-rose-700 active:scale-95"
                                                        }`}
                                                >
                                                    <Plus className="w-4.5 h-4.5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* COLUMNA DERECHA: TICKET DE COMPRA (1/3 de ancho en lg, Blanco) */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between sticky top-24 min-h-[70vh]">
                        <div className="space-y-4">
                            {/* Encabezado Ticket */}
                            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                                <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5 text-rose-600" />
                                    Carrito de Compra
                                </h3>

                                {/* Vendedor Activo Badge */}
                                <span className="bg-rose-50 text-rose-600 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <User className="w-3.5 h-3.5" />
                                    {user?.name || "Administrador"}
                                </span>
                            </div>

                            {/* Items del Carrito */}
                            {cart.length === 0 ? (
                                <div className="py-20 text-center space-y-3">
                                    <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
                                    <p className="text-sm font-bold text-slate-800">Carrito vacío</p>
                                    <p className="text-xs text-slate-400 max-w-50 mx-auto">
                                        Selecciona productos a la izquierda para armar la transacción.
                                    </p>
                                </div>
                            ) : (
                                <div className="max-h-[35vh] overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                                    {cart.map((item) => (
                                        <div
                                            key={item.productId}
                                            className="flex items-center justify-between gap-3 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100"
                                        >
                                            {/* Detalles item */}
                                            <div className="flex-1 min-w-0">
                                                <h5 className="font-bold text-xs text-slate-800 truncate">{item.name}</h5>
                                                <p className="text-[10px] text-slate-400 mt-0.5">
                                                    {currencySymbol} {item.price.toFixed(2)} c/u
                                                </p>
                                            </div>

                                            {/* Controles cantidad */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                {/* Selector cantidad estilizado */}
                                                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white h-7 text-xs">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuantity(item.productId, -1)}
                                                        className="px-2 h-full hover:bg-slate-50 text-slate-500 font-bold transition-colors"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="px-2.5 font-bold text-slate-700 min-w-4.5 text-center border-x border-slate-200 h-full flex items-center bg-slate-50">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuantity(item.productId, 1)}
                                                        className="px-2 h-full hover:bg-slate-50 text-slate-500 font-bold transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>

                                                {/* Subtotal Item */}
                                                <span className="font-bold text-xs text-slate-800 min-w-15 text-right">
                                                    {currencySymbol} {(item.price * item.quantity).toFixed(2)}
                                                </span>

                                                {/* Quitar item */}
                                                <button
                                                    onClick={() => removeFromCart(item.productId, item.name)}
                                                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selector de Pago y Totales */}
                        <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
                            {/* Método de Pago */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    Método de Pago
                                </label>
                                <div className="grid grid-cols-3 gap-1.5 text-xs">
                                    {[
                                        { id: "Efectivo", icon: Banknote },
                                        { id: "Tarjeta", icon: CreditCard },
                                        { id: "Yape/Plin", icon: QrCode },
                                    ].map((method) => {
                                        const Icon = method.icon;
                                        const isSelected = paymentMethod === method.id;
                                        return (
                                            <button
                                                key={method.id}
                                                type="button"
                                                onClick={() => setPaymentMethod(method.id as "Efectivo" | "Tarjeta" | "Yape/Plin")}
                                                className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border transition-all ${isSelected
                                                    ? "bg-rose-50 border-rose-500 text-rose-600 font-bold"
                                                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800"
                                                    }`}
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span>{method.id}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Totales */}
                            <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-155 text-xs text-slate-600">
                                <div className="flex justify-between">
                                    <span>Subtotal (sin IGV):</span>
                                    <span className="font-medium text-slate-800">{currencySymbol} {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>IGV (18%):</span>
                                    <span className="font-medium text-slate-800">{currencySymbol} {igv.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-extrabold text-sm pt-2.5 border-t border-slate-200">
                                    <span className="text-slate-800">Total a Pagar:</span>
                                    <span className="text-rose-600 text-base">{currencySymbol} {total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Botón Completar */}
                            <button
                                onClick={handleCheckout}
                                disabled={cart.length === 0 || isSubmitting}
                                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition font-bold shadow-lg shadow-rose-600/10 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-30 disabled:pointer-events-none text-xs uppercase tracking-wider"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Procesando venta...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span>Completar Venta ({currencySymbol} {total.toFixed(2)})</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PESTAÑA: HISTORIAL DEL DÍA */}
            {activeTab === "history" && (
                <div className="space-y-6">
                    {/* Tarjetas de Resumen */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Total Recaudado */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                Total Recaudado
                            </span>
                            <p className="text-2xl font-black text-slate-800">
                                {currencySymbol} {totalRecaudado.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>

                        {/* Ventas Procesadas */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                Ventas Procesadas
                            </span>
                            <p className="text-2xl font-black text-rose-600">
                                {sales.length} {sales.length === 1 ? "transacción" : "transacciones"}
                            </p>
                        </div>

                        {/* Ticket Promedio */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                Ticket Promedio
                            </span>
                            <p className="text-2xl font-black text-emerald-600">
                                {currencySymbol} {ticketPromedio.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    {/* Tabla de Historial */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        {sales.length === 0 ? (
                            <div className="p-16 text-center space-y-3">
                                <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
                                <h3 className="font-bold text-slate-800 text-base">Caja vacía</h3>
                                <p className="text-slate-500 text-sm">No se han registrado transacciones el día de hoy.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-400 font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-bold">ID Venta</th>
                                            <th className="px-6 py-4 text-left font-bold">Fecha / Hora</th>
                                            <th className="px-6 py-4 text-left font-bold">Vendedor Auditado</th>
                                            <th className="px-6 py-4 text-left font-bold">Ítems</th>
                                            <th className="px-6 py-4 text-left font-bold">Pago</th>
                                            <th className="px-6 py-4 text-right font-bold">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                        {sales.map((sale) => (
                                            <tr key={sale.id} className="hover:bg-slate-55/30 transition-colors">
                                                {/* ID Venta (#v-xxxx) */}
                                                <td className="px-6 py-4 font-bold text-rose-600 text-xs whitespace-nowrap">
                                                    #v-{sale.id.startsWith("sale-") ? sale.id.replace("sale-", "") : sale.id}
                                                </td>

                                                {/* Fecha y Hora Formateada */}
                                                <td className="px-6 py-4 text-slate-500 font-medium whitespace-nowrap">
                                                    {new Date(sale.date).toLocaleDateString("es-PE")},{" "}
                                                    {new Date(sale.date).toLocaleTimeString("es-PE", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        second: "2-digit",
                                                        hour12: true,
                                                    })}
                                                </td>

                                                {/* Vendedor con punto verde */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0 animate-pulse"></span>
                                                        {sale.seller}
                                                    </span>
                                                </td>

                                                {/* Items listados */}
                                                <td className="px-6 py-4 max-w-70">
                                                    <div className="flex flex-col gap-0.5">
                                                        {sale.items.map((item, idx) => (
                                                            <span key={idx} className="text-xs text-slate-600 block">
                                                                {item.name} <span className="text-slate-400 font-medium">(x{item.quantity})</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>

                                                {/* Tipo de Pago Badge */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                                        {sale.paymentMethod}
                                                    </span>
                                                </td>

                                                {/* Total Venta */}
                                                <td className="px-6 py-4 text-right font-black text-slate-900 text-base whitespace-nowrap">
                                                    {currencySymbol} {sale.total.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* MODAL DE CONFIRMACIÓN DE VENTA */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop con desenfoque de fondo */}
                    <div
                        onClick={() => setShowConfirmModal(false)}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
                    />

                    {/* Tarjeta de Confirmación */}
                    <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 z-10">
                        {/* Header Modal */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                                    <ShoppingCart className="w-5.5 h-5.5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800">Confirmar Venta</h3>
                                    <p className="text-xs text-slate-400">Verifica los detalles de la transacción</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Resumen del Ticket */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2.5 text-xs text-slate-600 mb-6">
                            <div className="flex justify-between">
                                <span>Vendedor Auditado:</span>
                                <span className="font-semibold text-slate-800">{user?.name || "Administrador"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Método de Pago:</span>
                                <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">{paymentMethod}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Productos agregados:</span>
                                <span className="font-semibold text-slate-800">{cart.reduce((sum, item) => sum + item.quantity, 0)} uds.</span>
                            </div>
                            <div className="flex justify-between font-black text-sm pt-2.5 border-t border-slate-200">
                                <span className="text-slate-700">Total Recaudado:</span>
                                <span className="text-slate-900 text-base">{currencySymbol} {total.toFixed(2)}</span>
                            </div>
                        </div>

                        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                            ¿Estás seguro de registrar esta venta por un total de <span className="font-bold text-slate-700">{currencySymbol}{total.toFixed(2)}</span> pagado con <span className="font-bold text-slate-700">{paymentMethod}</span>? Esta acción se guardará físicamente y descontará el stock de inmediato.
                        </p>

                        {/* Acciones */}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4.5 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={executeCheckout}
                                disabled={isSubmitting}
                                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-rose-600/10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    "Aceptar y Registrar"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
