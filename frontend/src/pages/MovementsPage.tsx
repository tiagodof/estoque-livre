import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:3001/api" });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface Movement {
  id: number;
  product_name: string;
  sku: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  note: string;
  username: string;
  created_at: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const TYPE_CONFIG = {
  in:         { label: "Stock In",     icon: TrendingUp,   color: "text-emerald-400" },
  out:        { label: "Stock Out",    icon: TrendingDown, color: "text-red-400" },
  adjustment: { label: "Adjustment",  icon: RefreshCw,    color: "text-amber-400" },
};

export default function MovementsPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, pages: 1 });
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number> = { page: pagination.page, limit: pagination.limit };
    if (typeFilter) params.type = typeFilter;

    API.get("/movements", { params })
      .then((r) => {
        setMovements(r.data.data);
        setPagination(r.data.pagination);
      })
      .finally(() => setLoading(false));
  }, [pagination.page, typeFilter]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("en-IE", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Stock Movements</h2>
        <div className="flex gap-2">
          {(["", "in", "out", "adjustment"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTypeFilter(t); setPagination((p) => ({ ...p, page: 1 })); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                typeFilter === t
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
              }`}
            >
              {t === "" ? "All" : TYPE_CONFIG[t].label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading...</p>
      ) : (
        <>
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="text-left px-4 py-3 font-medium">Product</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-right px-4 py-3 font-medium">Qty</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Note</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">User</th>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => {
                  const cfg = TYPE_CONFIG[m.type];
                  const Icon = cfg.icon;
                  return (
                    <tr key={m.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{m.product_name}</p>
                        <p className="text-slate-500 text-xs font-mono">{m.sku}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1.5 ${cfg.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${cfg.color}`}>
                        {m.type === "out" ? "-" : "+"}{m.quantity}
                      </td>
                      <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{m.note || "—"}</td>
                      <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{m.username}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{formatDate(m.created_at)}</td>
                    </tr>
                  );
                })}
                {movements.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No movements found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-slate-400 text-sm">
                {pagination.total} movements total
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-slate-400 text-sm">
                  {pagination.page} / {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
