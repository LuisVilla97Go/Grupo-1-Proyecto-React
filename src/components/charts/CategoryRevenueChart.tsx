import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { BarChart3 as BarChartIcon } from "lucide-react";
import { type Sale, type Product } from "../../types";

interface CategoryRevenueChartProps {
  sales: Sale[];
  products: Product[];
  currencySymbol: string;
}

export default function CategoryRevenueChart({
  sales,
  products,
  currencySymbol,
}: CategoryRevenueChartProps) {
  const categoryData = useMemo(() => {
    const grouped = sales.reduce(
      (acc, sale) => {
        sale.items.forEach((item) => {
          const product = products.find((p) => p.id === item.productId);
          const categoryName =
            item.category || (product ? product.category : "Otros");
          acc[categoryName] =
            (acc[categoryName] || 0) + item.price * item.quantity;
        });
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [sales, products]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 flex items-center gap-2">
        <BarChartIcon className="w-5 h-5 text-emerald-600" />
        <h3 className="text-lg font-bold text-slate-800">
          Ingresos por Categoría
        </h3>
      </div>
      <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[350px]">
        {categoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={categoryData}
              margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickFormatter={(val) => `${currencySymbol}${val}`}
              />
              <Tooltip
                cursor={{ fill: "#f1f5f9" }}
                formatter={(value: unknown) => [
                  `${currencySymbol} ${Number(value).toFixed(2)}`,
                  "Ingresos",
                ]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Bar
                dataKey="value"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-slate-500">
            <BarChartIcon className="w-12 h-12 text-slate-300 mb-3 mx-auto" />
            <p>Sin datos suficientes</p>
          </div>
        )}
      </div>
    </div>
  );
}
