import { useStore } from "../../contexts/StoreContext";
import {
    DollarSign,
    ShoppingBag,
    Receipt,
    Package,
    Clock
} from "lucide-react";
import { useState, useMemo } from "react";
import PaymentMethodsChart from "../../components/charts/PaymentMethodsChart";
import CategoryRevenueChart from "../../components/charts/CategoryRevenueChart";

export default function Dashboard() {
    const { sales, products } = useStore();
    const [currencySymbol] = useState(() => {
        const savedSettings = localStorage.getItem("store_settings");
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                const symbols: Record<string, string> = {
                    PEN: "S/", USD: "$", EUR: "€", ARS: "$", MXN: "$", COP: "$", CLP: "$", BRL: "R$",
                };
                return symbols[settings.currency as keyof typeof symbols] || "$";
            } catch {
                return "S/";
            }
        }
        return "S/";
    });

    const { totalRevenue, totalSales, averageTicket, totalProducts, recentSales } = useMemo(() => {
        const rev = sales.reduce((acc, sale) => acc + sale.total, 0);
        const ts = sales.length;
        const avg = ts > 0 ? rev / ts : 0;
        const tp = products.length;

        // Últimas 5 ventas
        const recent = [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

        return { totalRevenue: rev, totalSales: ts, averageTicket: avg, totalProducts: tp, recentSales: recent };
    }, [sales, products]);

    const kpis = useMemo(() => [
        {
            title: "Ingresos Totales",
            value: `${currencySymbol} ${totalRevenue.toFixed(2)}`,
            icon: DollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            title: "Ventas Procesadas",
            value: totalSales.toString(),
            icon: ShoppingBag,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            title: "Ticket Promedio",
            value: `${currencySymbol} ${averageTicket.toFixed(2)}`,
            icon: Receipt,
            color: "text-amber-600",
            bg: "bg-amber-50"
        },
        {
            title: "Productos Activos",
            value: totalProducts.toString(),
            icon: Package,
            color: "text-purple-600",
            bg: "bg-purple-50"
        },
    ], [currencySymbol, totalRevenue, totalSales, averageTicket, totalProducts]);

    return (
        <main className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Dashboard</h2>
                    <p className="text-sm text-slate-500 mt-1">Resumen general de tu negocio en tiempo real.</p>
                </div>
            </div>

            {/* KPIs Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, idx) => {
                    const Icon = kpi.icon;
                    return (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500">{kpi.title}</p>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-1">{kpi.value}</h3>
                            </div>
                        </div>
                    );
                })}
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Actividad Reciente */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-rose-600" />
                            <h3 className="text-lg font-bold text-slate-800">Últimas Ventas</h3>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        {recentSales.length > 0 ? (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                                        <th className="p-4 font-semibold">ID Venta</th>
                                        <th className="p-4 font-semibold">Cliente</th>
                                        <th className="p-4 font-semibold">Método</th>
                                        <th className="p-4 font-semibold text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentSales.map((sale) => (
                                        <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4">
                                                <span className="font-mono text-sm font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                                                    {sale.id}
                                                </span>
                                                <div className="text-xs text-slate-500 mt-1">{new Date(sale.date).toLocaleDateString()}</div>
                                            </td>
                                            <td className="p-4 text-sm font-medium text-slate-800">
                                                {sale.seller}
                                            </td>
                                            <td className="p-4">
                                                <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                                                    {sale.paymentMethod}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right font-bold text-slate-800">
                                                {currencySymbol} {sale.total.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
                                <Receipt className="w-12 h-12 text-slate-300 mb-3" />
                                <p>Aún no hay ventas registradas.</p>
                            </div>
                        )}
                    </div>
                </div>

                <PaymentMethodsChart sales={sales} currencySymbol={currencySymbol} />
            </section>

            {/* Gráfico de Categorías (Full width) */}
            <section className="mt-6">
                <CategoryRevenueChart sales={sales} products={products} currencySymbol={currencySymbol} />
            </section>
        </main>
    );
}
