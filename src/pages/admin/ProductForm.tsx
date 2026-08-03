import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStore } from "../../contexts/StoreContext";
import ImageUploader from "../../components/ImageUploader";
import {
    X,
    Save,
    ArrowLeft,
    Package,
    Tag,
    DollarSign,
    Warehouse,
    Layers,
    Truck,
    Search,
    Wand2,
    RefreshCw,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";

const productSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    sku: z.string().min(3, "El SKU es obligatorio"),
    category: z.string().min(2, "La categoría es obligatoria"),
    brand: z.string().optional(),
    shortDesc: z.string().optional(),
    longDesc: z.string().optional(),
    price: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
    cost: z.coerce.number().min(0, "El costo debe ser mayor o igual a 0"),
    comparePrice: z.coerce.number().min(0).optional(),
    stock: z.coerce.number().int().min(0, "El stock no puede ser negativo"),
    minStock: z.coerce.number().int().min(0).default(5),
    status: z.enum(["published", "draft"]),
});

type ProductFormValues = z.infer<typeof productSchema>;

type Tab =
    | "general"
    | "images"
    | "pricing"
    | "inventory"
    | "variants"
    | "shipping"
    | "seo";

export default function ProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products, categories, addProduct, updateProduct } = useStore();
    const isEditing = Boolean(id);
    const existingProduct = isEditing ? products.find((p) => p.id === id) : null;

    const [activeTab, setActiveTab] = useState<Tab>("general");
    const [images, setImages] = useState<string[]>([]);

    const [currencySymbol, setCurrencySymbol] = useState("S/");

    useEffect(() => {
        const savedSettings = localStorage.getItem("store_settings");
        if (savedSettings) {
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
            setCurrencySymbol(symbols[settings.currency] || "S/");
        }
    }, []);

    const [isAutoSku, setIsAutoSku] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<ProductFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: "",
            sku: "",
            category: "",
            brand: "",
            shortDesc: "",
            longDesc: "",
            price: 0,
            cost: 0,
            comparePrice: 0,
            stock: 0,
            minStock: 5,
            status: "draft",
        },
    });

    const handleGenerateAutoSku = () => {
        // eslint-disable-next-line react-hooks/incompatible-library
        const cat = watch("category");
        const name = watch("name");
        const catPrefix = cat ? cat.substring(0, 3).toUpperCase() : "PROD";
        const nameClean = name
            ? name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 3).toUpperCase()
            : "ITEM";
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const newSku = `${catPrefix}-${nameClean}-${randomNum}`;
        setValue("sku", newSku, { shouldValidate: true });
    };

    useEffect(() => {
        if (existingProduct) {
            reset({
                name: existingProduct.name,
                sku: existingProduct.sku,
                category: existingProduct.category,
                brand: "",
                shortDesc: "",
                longDesc: "",
                price: existingProduct.price,
                cost: existingProduct.cost,
                stock: existingProduct.stock,
                minStock: existingProduct.minStock || 5,
                status: existingProduct.status,
            });
            setImages(existingProduct.images || []);
        }
    }, [existingProduct, reset]);

    const onSubmit = async (data: ProductFormValues) => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            const productData = { ...data, images };

            if (isEditing && id) {
                await updateProduct(id, productData);
                toast.success("Producto actualizado correctamente");
            } else {
                await addProduct(productData);
                toast.success("Producto creado correctamente");
            }
            navigate("/admin/products");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Ocurrió un error al guardar");
        } finally {
            setIsSaving(false);
        }
    };

    const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: "general", label: "General", icon: Package },
        { id: "images", label: "Imágenes", icon: Tag },
        { id: "pricing", label: "Precios", icon: DollarSign },
        { id: "inventory", label: "Inventario", icon: Warehouse },
        { id: "variants", label: "Variantes", icon: Layers },
        { id: "shipping", label: "Envío", icon: Truck },
        { id: "seo", label: "SEO", icon: Search },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/admin/products")}
                            className="p-2 hover:bg-slate-100 rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">
                                {isEditing ? "Editar Producto" : "Nuevo Producto"}
                            </h2>
                            <p className="text-xs text-slate-500">
                                Completa la información del producto
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/admin/products")}
                        className="p-2 hover:bg-slate-100 rounded-lg transition"
                    >
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 px-6 py-3 border-b border-slate-200 bg-slate-50/50 overflow-x-auto overflow-y-hidden scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === tab.id
                                    ? "bg-white text-rose-600 shadow-sm"
                                    : "text-slate-600 hover:bg-slate-100"
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Form Content */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex-1 overflow-y-auto p-6"
                >
                    {/* TAB: GENERAL */}
                    {activeTab === "general" && (
                        <div className="space-y-4 max-w-3xl">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Nombre del Producto <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register("name")}
                                    placeholder="Ej: Camiseta Deportiva Premium"
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 ${errors.name ? "border-red-500" : "border-slate-200"
                                        }`}
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Categoría <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register("category")}
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white ${errors.category ? "border-red-500" : "border-slate-200"
                                        }`}
                                >
                                    <option value="">Seleccionar categoría</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.name}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.category.message}
                                    </p>
                                )}
                                <p className="text-xs text-slate-500 mt-1">
                                    ¿No encuentras la categoría?{" "}
                                    <button
                                        type="button"
                                        onClick={() => navigate("/admin/categories")}
                                        className="text-rose-600 hover:underline"
                                    >
                                        Crear nueva
                                    </button>
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Descripción Corta
                                </label>
                                <textarea
                                    {...register("shortDesc")}
                                    placeholder="Resumen del producto que aparece en listados"
                                    rows={3}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Descripción Detallada
                                </label>
                                <textarea
                                    {...register("longDesc")}
                                    placeholder="Descripción completa con detalles del producto"
                                    rows={5}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* TAB: IMAGES */}
                    {activeTab === "images" && (
                        <div className="max-w-3xl">
                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Imágenes del Producto
                            </label>
                            <p className="text-sm text-slate-500 mb-4">
                                La primera imagen será la principal. Puedes arrastrar hasta 8
                                imágenes.
                            </p>
                            <ImageUploader
                                images={images}
                                onImagesChange={setImages}
                                maxImages={8}
                            />
                        </div>
                    )}

                    {/* TAB: PRICING */}
                    {activeTab === "pricing" && (
                        <div className="space-y-4 max-w-3xl">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Precio de Venta <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                                            {currencySymbol}
                                        </span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register("price")}
                                            className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 ${errors.price ? "border-red-500" : "border-slate-200"
                                                }`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Costo
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                                            {currencySymbol}
                                        </span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            {...register("cost")}
                                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Precio Comparativo (antes)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                                        {currencySymbol}
                                    </span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register("comparePrice")}
                                        placeholder="Precio anterior tachado"
                                        className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Se mostrará tachado para indicar descuento
                                </p>
                            </div>

                            {/* Cálculo de margen */}
                            <div className="bg-slate-50 rounded-lg p-4 mt-4">
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-500 mb-1">Costo</p>
                                        <p className="font-semibold text-slate-800">
                                            {currencySymbol} {Number(watch("cost") || 0).toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 mb-1">Precio Venta</p>
                                        <p className="font-semibold text-slate-800">
                                            {currencySymbol} {Number(watch("price") || 0).toFixed(2)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 mb-1">Margen</p>
                                        <p className="font-semibold text-green-600">
                                            {Number(watch("price")) > 0
                                                ? `${(((Number(watch("price")) - Number(watch("cost") || 0)) / Number(watch("price"))) * 100).toFixed(1)}%`
                                                : "0%"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: INVENTORY */}
                    {activeTab === "inventory" && (
                        <div className="space-y-4 max-w-3xl">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-semibold text-slate-700">
                                            SKU <span className="text-red-500">*</span>
                                        </label>
                                        <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-600 select-none hover:text-rose-600 transition">
                                            <input
                                                type="checkbox"
                                                checked={isAutoSku}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    setIsAutoSku(checked);
                                                    if (checked) {
                                                        handleGenerateAutoSku();
                                                    }
                                                }}
                                                className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 accent-rose-600 cursor-pointer"
                                            />
                                            <Wand2 className="w-3.5 h-3.5 text-rose-600" />
                                            <span>Generar en automático</span>
                                        </label>
                                    </div>

                                    <div className="relative">
                                        <input
                                            {...register("sku")}
                                            readOnly={isAutoSku}
                                            placeholder={
                                                isAutoSku
                                                    ? "Generado automáticamente..."
                                                    : "Ej: CAM-ROJ-M"
                                            }
                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition ${isAutoSku
                                                    ? "bg-slate-50 text-slate-700 font-mono pr-10"
                                                    : "bg-white"
                                                } ${errors.sku ? "border-red-500" : "border-slate-200"}`}
                                        />
                                        {isAutoSku && (
                                            <button
                                                type="button"
                                                onClick={handleGenerateAutoSku}
                                                title="Regenerar nuevo SKU"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-rose-600 hover:bg-rose-100 rounded-md transition"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    {errors.sku && (
                                        <p className="text-xs text-red-500 mt-1">
                                            {errors.sku.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Stock Actual <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        {...register("stock")}
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 ${errors.stock ? "border-red-500" : "border-slate-200"
                                            }`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Stock Mínimo
                                </label>
                                <input
                                    type="number"
                                    {...register("minStock")}
                                    defaultValue={5}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Te notificaremos cuando el stock esté por debajo de este valor
                                </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                                <div className="flex items-start gap-3">
                                    <Warehouse className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-blue-800 text-sm">
                                            Información de Inventario
                                        </h4>
                                        <p className="text-sm text-blue-700 mt-1">
                                            Stock actual:{" "}
                                            <span className="font-semibold">
                                                {watch("stock") || 0}
                                            </span>{" "}
                                            unidades
                                            {watch("stock") !== undefined &&
                                                watch("minStock") !== undefined &&
                                                watch("stock") <= watch("minStock") && (
                                                    <span className="text-red-600 font-semibold ml-2">
                                                        ⚠️ Stock bajo
                                                    </span>
                                                )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: VARIANTS */}
                    {activeTab === "variants" && (
                        <div className="text-center py-12">
                            <Layers className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                Variantes de Producto
                            </h3>
                            <p className="text-slate-500 text-sm">
                                Esta funcionalidad estará disponible próximamente
                            </p>
                        </div>
                    )}

                    {/* TAB: SHIPPING */}
                    {activeTab === "shipping" && (
                        <div className="text-center py-12">
                            <Truck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                Configuración de Envío
                            </h3>
                            <p className="text-slate-500 text-sm">
                                Esta funcionalidad estará disponible próximamente
                            </p>
                        </div>
                    )}

                    {/* TAB: SEO */}
                    {activeTab === "seo" && (
                        <div className="text-center py-12">
                            <Search className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                Optimización SEO
                            </h3>
                            <p className="text-slate-500 text-sm">
                                Esta funcionalidad estará disponible próximamente
                            </p>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
                    <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => navigate("/admin/products")}
                        className="px-6 py-2.5 border border-slate-300 rounded-lg hover:bg-white font-medium text-slate-700 transition disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        disabled={isSaving}
                        onClick={handleSubmit(onSubmit)}
                        className="px-6 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium flex items-center gap-2 transition shadow-lg shadow-rose-600/20 disabled:opacity-70 disabled:pointer-events-none"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? "Guardando..." : "Guardar Producto"}
                    </button>
                </div>
            </div>
        </div>
    );
}
