import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { type Sale } from "../../types";

interface PaymentMethodsChartProps {
  sales: Sale[];
  currencySymbol: string;
}

const COLORS = ["#0284c7", "#059669", "#d97706", "#7c3aed", "#db2777"];

export default function PaymentMethodsChart({
  sales,
  currencySymbol,
}: PaymentMethodsChartProps) {
  const paymentData = useMemo(() => {
    const grouped = sales.reduce(
      (acc, sale) => {
        acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [sales]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 flex items-center gap-2">
        <PieChartIcon className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-bold text-slate-800">Métodos de Pago</h3>
      </div>
      <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[300px]">
        {sales.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={paymentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {paymentData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
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
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-slate-500">
            <PieChartIcon className="w-12 h-12 text-slate-300 mb-3 mx-auto" />
            <p>Sin datos suficientes</p>
          </div>
        )}
      </div>
    </div>
  );
}
