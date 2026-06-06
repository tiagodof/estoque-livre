import { useEffect, useState } from "react";
import { BarChart2, Download, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:3001/api" });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface StockValueRow {
  category: string;
  total_value: number;
  product_count: number;
}

interface MovementSummaryRow {
  type: "in" | "out" | "adjustment";
  count: number;
  total_quantity: number;
}

const TYPE_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  in:         { label: "Stock In",    color: "text-emerald-400", icon: <TrendingUp className="w-4 h-4" /> },
  out:        { label: "Stock Out",   color: "text-red-400",     icon: <TrendingDown className="w-4 h-4" /> },
  adjustment: { label: "Adjustment", color: "text-amber-400",   icon: <RefreshCw className="w-4 h-4" /> },
};

export default function ReportsPage() {
  const [stockValue, setStockValue] = useState<StockValueRow[]>([]);
  const [movSummary, setMovSummary] = useState<MovementSummaryRow[]>([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      API.get("/reports/stock-value"),
      API.get("/reports/movements-summary", { params: { days } }),
    ])
      .then(([sv, ms]) => {
        setStockValue(sv.data);
        setMovSummary(ms.data.data);
      })
      .finally(() => setLoading(false));
  }, [days]);

  const totalStockValue = stockValue.reduce((sum, r) => sum + r.total_value, 0);

  function handleExport() {
    const token = localStorage.getItem("token");
    window.open(`http://localhost:3001/api/reports/export/products.csv?token=${token}`, "_blank");
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">Reports</h2>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-slate-600"
        >
          <Download className="w-4 h-4" />
          Export Products CSV
        </button>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading...</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Stock value by category */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-4">Stock Value by Category</h3>
            <p className="text-slate-400 text-sm mb-4">
              Total: <span className="text-white font-semibold">€{totalStockValue.toFixed(2)}</span>
            </p>
            <div className="space-y-3">
              {stockValue.map((row) => {
                const pct = totalStockValue > 0 ? (row.total_value / totalStockValue) * 100 : 0;
                return (
                  <div key={row.category || "uncategorised"}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{row.category || "Uncategorised"}</span>
                      <span className="text-white font-medium">€{row.total_value.toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {stockValue.length === 0 && (
                <p className="text-slate-400 text-sm">No data available.</p>
              )}
            </div>
          </div>

          {/* Movement summary */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Movement Summary</h3>
              <select
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="bg-slate-700 border border-slate-600 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
            <div className="space-y-3">
              {movSummary.map((row) => {
                const cfg = TYPE_LABELS[row.type];
                return (
                  <div key={row.type} className="flex items-center justify-between">
                    <span className={`flex items-center gap-2 ${cfg.color}`}>
                      {cfg.icon}
                      <span className="text-sm">{cfg.label}</span>
                    </span>
                    <div className="text-right">
                      <p className="text-white font-semibold text-sm">{row.count} movements</p>
                      <p className="text-slate-400 text-xs">{row.total_quantity} units</p>
                    </div>
                  </div>
                );
              })}
              {movSummary.length === 0 && (
                <p className="text-slate-400 text-sm">No movements in this period.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
