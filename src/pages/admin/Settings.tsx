import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Store, MapPin, Package, Save, Receipt, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { fetchFromLocalAPI } from "../../services/api";

// CONFIGURACIÓN DE MONEDAS Y SÍMBOLOS
const currencySymbols: Record<string, string> = {
    PEN: "S/",
    USD: "$",
    EUR: "€",
    ARS: "$",
    MXN: "$",
    COP: "$",
    CLP: "$",
    BRL: "R$",
};

const formatCurrency = (amount: number, currency: string) => {
    const symbol = currencySymbols[currency] || currency;
    return `${symbol} ${amount.toFixed(2)}`;
};

// COMPONENTE SELECT PERSONALIZADO PARA BANDERAS
type Option = { value?: string; label?: string; code?: string; group?: string };

function CustomSelect({ options, value, onChange }: { options: Option[], value: string, onChange: (val: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const selectedOption = options.find((o) => o.value === value) || options[0] || {};

    return (
        <div className="relative w-full" ref={ref}>
            <div
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-white flex items-center justify-between cursor-pointer focus:outline-none hover:border-slate-300 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2 text-sm text-slate-800">
                    {selectedOption.code && (
                        <img src={`https://flagcdn.com/w20/${selectedOption.code}.png`} alt="" className="w-5 h-auto rounded-xs" />
                    )}
                    {selectedOption.label}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto overflow-x-hidden py-1">
                    {options.map((o, idx) => {
                        if (o.group) {
                            return (
                                <div key={`group-${idx}`} className="px-3 py-1.5 text-xs font-bold text-slate-400 bg-slate-50 mt-1 first:mt-0 uppercase tracking-wider">
                                    {o.group}
                                </div>
                            );
                        }
                        return (
                            <div
                                key={o.value}
                                className={`px-3 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer text-sm ${value === o.value ? "bg-rose-50 text-rose-700 font-semibold" : "text-slate-700"}`}
                                onClick={() => {
                                    onChange(o.value!);
                                    setIsOpen(false);
                                }}
                            >
                                <img src={`https://flagcdn.com/w20/${o.code}.png`} alt="" className="w-5 h-auto rounded-xs" />
                                {o.label}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ============================================
// ESQUEMA DE VALIDACIÓN
// ============================================
const settingsSchema = z.object({
    storeName: z.string().min(3, "El nombre de la tienda es obligatorio"),
    ruc: z.string().length(11, "El RUC debe tener exactamente 11 dígitos"),
    email: z.string().email("Correo electrónico inválido"),
    currency: z.string(),
    timezone: z.string(),
    minStockThreshold: z.coerce
        .number()
        .min(1, "El stock mínimo debe ser al menos 1"),
    includeIgv: z.boolean(),
    igvPercentage: z.coerce.number().min(0).max(100),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function Settings() {
    const [isSaving, setIsSaving] = useState(false);
    const [currencyOptions, setCurrencyOptions] = useState<Option[]>([]);
    const [timezoneOptions, setTimezoneOptions] = useState<Option[]>([]);

    useEffect(() => {
        fetchFromLocalAPI("currencies.json")
            .then((data) => {
                if (data) setCurrencyOptions(data);
            });

        fetchFromLocalAPI("timezones.json")
            .then((data) => {
                if (data) setTimezoneOptions(data);
            });
    }, []);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<SettingsFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(settingsSchema) as any,
        defaultValues: {
            storeName: "Mi Tienda Perú",
            ruc: "20123456789",
            email: "contacto@mitienda.pe",
            currency: "PEN",
            timezone: "America/Lima",
            minStockThreshold: 5,
            includeIgv: true,
            igvPercentage: 18,
        },
    });

    // Observar la moneda seleccionada para el preview
    // eslint-disable-next-line react-hooks/incompatible-library
    const selectedCurrency = watch("currency");
    const samplePrice = 150;

    const onSubmit = (data: SettingsFormValues) => {
        setIsSaving(true);
        setTimeout(() => {
            localStorage.setItem("store_settings", JSON.stringify(data));
            toast.success("Configuración guardada correctamente");
            setIsSaving(false);
        }, 800);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* ============================================
            SECCIÓN 1: INFORMACIÓN DE LA TIENDA
        ============================================ */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    {/* Header de la card con título a la izquierda y botón a la derecha */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <Store className="w-5 h-5 text-rose-600" />
                            <h3 className="text-lg font-semibold text-slate-800">
                                Información de la Tienda
                            </h3>
                        </div>
                        <button
                            onClick={handleSubmit(onSubmit)}
                            disabled={isSaving}
                            className="bg-rose-600 text-white px-5 py-2.5 rounded-lg hover:bg-rose-700 font-medium flex items-center gap-2 transition shadow-sm shadow-rose-600/20 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {isSaving ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>

                    {/* Formulario */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">
                                Nombre de la Tienda *
                            </label>
                            <input
                                {...register("storeName")}
                                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 ${errors.storeName ? "border-red-500" : "border-slate-200"}`}
                            />
                            {errors.storeName && (
                                <p className="text-xs text-red-500">
                                    {errors.storeName.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">
                                RUC *
                            </label>
                            <input
                                {...register("ruc")}
                                placeholder="20123456789"
                                maxLength={11}
                                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 ${errors.ruc ? "border-red-500" : "border-slate-200"}`}
                            />
                            <p className="text-xs text-slate-500">
                                Necesario para emitir boletas y facturas electrónicas.
                            </p>
                            {errors.ruc && (
                                <p className="text-xs text-red-500">{errors.ruc.message}</p>
                            )}
                        </div>

                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700">
                                Correo de Contacto *
                            </label>
                            <input
                                {...register("email")}
                                type="email"
                                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 ${errors.email ? "border-red-500" : "border-slate-200"}`}
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500">{errors.email.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ============================================
            SECCIÓN 2: MONEDA Y LOCALIZACIÓN
        ============================================ */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                        <MapPin className="w-5 h-5 text-rose-600" />
                        <h3 className="text-lg font-semibold text-slate-800">
                            Moneda y Localización
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">
                                Moneda Principal
                            </label>
                            {currencyOptions.length > 0 ? (
                                <CustomSelect
                                    options={currencyOptions}
                                    value={watch("currency")}
                                    onChange={(val) => setValue("currency", val, { shouldValidate: true })}
                                />
                            ) : (
                                <div className="w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-400 text-sm animate-pulse">
                                    Cargando monedas...
                                </div>
                            )}
                            <p className="text-xs text-slate-500">
                                La moneda en la que se mostrarán los precios en tu tienda.
                            </p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">
                                Zona Horaria
                            </label>
                            {timezoneOptions.length > 0 ? (
                                <CustomSelect
                                    options={timezoneOptions}
                                    value={watch("timezone")}
                                    onChange={(val) => setValue("timezone", val, { shouldValidate: true })}
                                />
                            ) : (
                                <div className="w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-400 text-sm animate-pulse">
                                    Cargando zonas horarias...
                                </div>
                            )}
                            <p className="text-xs text-slate-500">
                                Zona horaria para calcular fechas de pedidos y envíos.
                            </p>
                        </div>
                    </div>

                    {/* Preview en vivo de la moneda */}
                    <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Receipt className="w-5 h-5 text-slate-500" />
                            <div>
                                <p className="text-sm font-semibold text-slate-700">
                                    Vista previa de precios
                                </p>
                                <p className="text-xs text-slate-500">
                                    Así se verán los precios en tu tienda con la moneda
                                    seleccionada
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 mb-1">
                                Ejemplo: Producto de S/150.00
                            </p>
                            <p className="text-xl font-bold text-slate-800">
                                {formatCurrency(samplePrice, selectedCurrency)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ============================================
            SECCIÓN 3: INVENTARIO E IMPUESTOS
        ============================================ */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                        <Package className="w-5 h-5 text-rose-600" />
                        <h3 className="text-lg font-semibold text-slate-800">
                            Inventario e Impuestos
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700">
                                Alerta de Stock Bajo
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    {...register("minStockThreshold")}
                                    className="w-full px-3 py-2.5 pr-20 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                />
                                <span className="absolute right-3 top-2.5 text-sm text-slate-500">
                                    unidades
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">
                                Se marcará en rojo cuando el stock sea igual o menor a este
                                valor.
                            </p>
                            {errors.minStockThreshold && (
                                <p className="text-xs text-red-500">
                                    {errors.minStockThreshold.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                                <input
                                    type="checkbox"
                                    {...register("includeIgv")}
                                    className="w-5 h-5 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                                />
                                <div>
                                    <span className="text-sm font-semibold text-slate-700 block">
                                        Los precios incluyen IGV
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        Activo por defecto en Perú (18%)
                                    </span>
                                </div>
                            </label>

                            <div className="relative">
                                <label className="text-sm font-semibold text-slate-700 mb-1 block">
                                    Porcentaje de IGV
                                </label>
                                <input
                                    type="number"
                                    {...register("igvPercentage")}
                                    className="w-full px-3 py-2.5 pr-10 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                                />
                                <span className="absolute right-3 top-[34px] text-sm text-slate-500">
                                    %
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
