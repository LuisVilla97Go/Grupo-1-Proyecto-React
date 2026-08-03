import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../contexts/StoreContext";
import { type SaleItem } from "../../types";
import { toast } from "sonner";
import {
    ShoppingCart,
    Package,
    Plus,
    Minus,
    Trash2,
    Sparkles,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Check,
    Banknote,
    CreditCard,
    QrCode,
    Truck
} from "lucide-react";

export default function CartFront() {
    const { cart, registerSale, updateQuantity, removeFromCart, clearCart } = useStore();
    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"Efectivo" | "Tarjeta" | "Yape/Plin" | "Contraentrega">("Contraentrega");
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

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const subtotal = total / 1.18;
    const igv = total - subtotal;

    const handleCheckout = () => {
        if (cart.length === 0) {
            toast.error("El carrito está vacío.");
            return;
        }
        setShowConfirmModal(true);
    };

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
                    paymentMethod: paymentMethod,
                });

                toast.success("¡Tu pedido ha sido procesado con éxito! Gracias por tu compra.");
                clearCart();
                setShowConfirmModal(false);
                navigate("/");
            } catch {
                toast.error("Ocurrió un error al procesar tu compra.");
                setShowConfirmModal(false);
            } finally {
                setIsSubmitting(false);
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* HEADER SIMPLIFICADO */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/")}
                            className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition flex items-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                            <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center shadow-md shadow-rose-600/20">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-extrabold text-lg tracking-tight text-slate-800 hidden sm:block">
                                Grupo 01-G32
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                        <Check className="w-4 h-4" />
                        <span className="text-xs font-bold">Compra Segura</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Tu Carrito</h1>
                        {cart.length > 0 && (
                            <p className="text-slate-500 mt-1 text-sm">
                                Tienes {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'} en tu bolsa listos para comprar.
                            </p>
                        )}
                    </div>
                </div>

                {cart.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 sm:p-24 text-center max-w-3xl mx-auto">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 mb-6 mx-auto shadow-inner">
                            <ShoppingCart className="w-10 h-10 text-slate-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-3">Tu carrito está vacío</h2>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto text-sm">
                            Agrega productos a tu carrito para continuar con la compra. Descubre las mejores ofertas en nuestro catálogo.
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition shadow-lg shadow-rose-600/20 hover:-translate-y-0.5 active:scale-95 text-sm"
                        >
                            Descubrir Productos
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Columna Izquierda: Lista de Productos */}
                        <div className="w-full lg:w-2/3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <span className="font-bold text-slate-700 text-sm">Productos seleccionados</span>
                                <button
                                    onClick={clearCart}
                                    className="text-xs text-slate-400 hover:text-rose-600 font-semibold transition"
                                >
                                    Vaciar carrito
                                </button>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {cart.map((item) => (
                                    <div key={item.productId} className="p-6 flex flex-col sm:flex-row gap-6 group hover:bg-slate-50/50 transition">
                                        {/* Imagen */}
                                        <div className="w-full sm:w-28 h-28 bg-white rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm group-hover:shadow-md transition">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                            ) : (
                                                <Package className="w-10 h-10 text-slate-300" />
                                            )}
                                        </div>

                                        {/* Info del Producto */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div className="flex justify-between gap-4">
                                                <div>
                                                    <h3 className="font-bold text-slate-800 text-base leading-tight group-hover:text-rose-600 transition pr-4">{item.name}</h3>
                                                    <p className="text-xs text-slate-400 mt-1.5 uppercase font-medium">SKU: {item.productId.substring(0, 8)}</p>
                                                </div>
                                                <div className="text-right shrink-0 hidden sm:block">
                                                    <span className="font-black text-lg text-slate-800">{currencySymbol} {(item.price * item.quantity).toFixed(2)}</span>
                                                    {item.quantity > 1 && (
                                                        <p className="text-xs font-medium text-slate-400 mt-0.5">{currencySymbol} {item.price.toFixed(2)} c/u</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-6 sm:mt-0">
                                                {/* Controles Qty */}
                                                <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-sm p-1">
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, -1)}
                                                        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition active:scale-95"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="w-10 text-center font-bold text-sm text-slate-700 select-none">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.productId, 1)}
                                                        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition active:scale-95"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="sm:hidden text-right">
                                                    <span className="font-black text-lg text-slate-800">{currencySymbol} {(item.price * item.quantity).toFixed(2)}</span>
                                                </div>

                                                <button
                                                    onClick={() => removeFromCart(item.productId, item.name)}
                                                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-500 transition hover:bg-red-50 px-3 py-1.5 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    <span className="hidden sm:inline">Eliminar</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Columna Derecha: Resumen de Compra (Sticky) */}
                        <div className="w-full lg:w-1/3 sticky top-24">
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
                                <h3 className="font-bold text-slate-800 text-lg mb-6 pb-4 border-b border-slate-100">Resumen de compra</h3>

                                <div className="space-y-4 text-slate-600 text-sm mb-6">
                                    <div className="flex justify-between">
                                        <span>Subtotal de productos</span>
                                        <span className="font-semibold text-slate-800">{currencySymbol} {subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>IGV (18%)</span>
                                        <span className="font-semibold text-slate-800">{currencySymbol} {igv.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg -mx-3">
                                        <span>Costo de envío</span>
                                        <span className="font-bold">¡Gratis!</span>
                                    </div>
                                </div>

                                {/* Selección de Método de Pago */}
                                <div className="mb-6">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Método de Pago</label>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {[
                                            { id: "Efectivo", icon: Banknote },
                                            { id: "Tarjeta", icon: CreditCard },
                                            { id: "Yape/Plin", icon: QrCode },
                                            { id: "Contraentrega", icon: Truck }
                                        ].map((method) => {
                                            const Icon = method.icon;
                                            return (
                                                <button
                                                    key={method.id}
                                                    onClick={() => setPaymentMethod(method.id as "Efectivo" | "Tarjeta" | "Yape/Plin" | "Contraentrega")}
                                                    className={`flex flex-col items-center justify-center py-4 px-2 gap-2 text-xs font-semibold border rounded-xl transition ${paymentMethod === method.id
                                                            ? "bg-rose-50 border-rose-400 text-rose-700 shadow-sm"
                                                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                                                        }`}
                                                >
                                                    <Icon className={`w-5 h-5 ${paymentMethod === method.id ? 'text-rose-600' : 'text-slate-400'}`} />
                                                    {method.id}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 mb-8">
                                    <div className="flex justify-between items-end">
                                        <span className="font-bold text-slate-800">Total a Pagar</span>
                                        <span className="font-black text-3xl text-rose-600 tracking-tight">{currencySymbol} {total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl transition-all font-bold shadow-lg shadow-rose-600/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none text-sm tracking-wide"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Procesando Pedido...
                                        </>
                                    ) : (
                                        <>
                                            Confirmar Compra
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-xs text-slate-400 mt-4 font-medium flex items-center justify-center gap-1.5">
                                    <Check className="w-3.5 h-3.5" /> Pago seguro contraentrega garantizado
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* FOOTER */}
            <footer className="bg-slate-900 text-slate-500 py-8 text-center text-xs mt-auto">
                <div className="max-w-7xl mx-auto px-4 space-y-2">
                    <p className="text-slate-400 font-semibold">Grupo 01-G32 - E-commerce</p>
                    <p>&copy; {new Date().getFullYear()} Todos los derechos reservados.</p>
                </div>
            </footer>

            {/* MODAL DE CONFIRMACIÓN */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div
                        onClick={() => setShowConfirmModal(false)}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                    />
                    <div className="relative bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 z-10 text-center">
                        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mx-auto mb-4">
                            <ShoppingCart className="w-8 h-8" />
                        </div>

                        <h3 className="text-xl font-bold text-slate-800 mb-2">Finalizar Compra</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Estás a punto de completar tu pedido por un total de <strong className="text-slate-800">{currencySymbol}{total.toFixed(2)}</strong>.
                        </p>

                        <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100 text-left text-sm space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Forma de Pago</span>
                                <span className="font-semibold text-slate-800">{paymentMethod}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Total artículos</span>
                                <span className="font-semibold text-slate-800">{totalItems} unidades</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={executeCheckout}
                                disabled={isSubmitting}
                                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    "Confirmar"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
