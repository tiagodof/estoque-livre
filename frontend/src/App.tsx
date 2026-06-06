import { useState, useEffect } from "react";
import {
  Package, TrendingDown, TrendingUp, AlertTriangle,
  BarChart2, Truck, LogOut, LayoutDashboard
} from "lucide-react";
import axios from "axios";
import ProductsPage from "./pages/ProductsPage";
import SuppliersPage from "./pages/SuppliersPage";
import MovementsPage from "./pages/MovementsPage";
import ReportsPage from "./pages/ReportsPage";

const API = axios.create({ baseURL: "http://localhost:3001/api" });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface Summary {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  totalMovements: number;
}

type Page = "dashboard" | "products" | "movements" | "suppliers" | "reports";

const NAV_ITEMS: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard",  label: "Dashboard",  icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "products",   label: "Products",   icon: <Package className="w-4 h-4" /> },
  { id: "movements",  label: "Movements",  icon: <TrendingUp className="w-4 h-4" /> },
  { id: "suppliers",  label: "Suppliers",  icon: <Truck className="w-4 h-4" /> },
  { id: "reports",    label: "Reports",    icon: <BarChart2 className="w-4 h-4" /> },
];

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [page, setPage] = useState<Page>("dashboard");

  useEffect(() => {
    if (token) {
      API.get("/reports/summary")
        .then((r) => setSummary(r.data))
        .catch(() => {
          localStorage.removeItem("token");
          setToken("");
        });
    }
  }, [token]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await API.post("/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
    } catch {
      setLoginError("Invalid username or password.");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken("");
    setSummary(null);
    setPage("dashboard");
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-sm">
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-7 h-7 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white">Estoque Livre</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
            />
            {loginError && <p className="text-red-400 text-sm">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-56 bg-slate-800 border-r border-slate-700 flex flex-col shrink-0">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-slate-700">
          <Package className="w-6 h-6 text-emerald-400" />
          <span className="font-bold text-lg">Estoque Livre</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                page === item.id
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {page === "dashboard" && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
            {summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryCard icon={<Package className="w-5 h-5 text-blue-400" />}  label="Total Products"  value={summary.totalProducts} />
                <SummaryCard icon={<BarChart2 className="w-5 h-5 text-emerald-400" />} label="Stock Value" value={`€${summary.totalValue.toFixed(2)}`} />
                <SummaryCard icon={<AlertTriangle className="w-5 h-5 text-amber-400" />} label="Low Stock" value={summary.lowStockCount} highlight={summary.lowStockCount > 0} />
                <SummaryCard icon={<TrendingUp className="w-5 h-5 text-purple-400" />} label="Movements" value={summary.totalMovements} />
              </div>
            )}
          </div>
        )}
        {page === "products"  && <ProductsPage />}
        {page === "movements" && <MovementsPage />}
        {page === "suppliers" && <SuppliersPage />}
        {page === "reports"   && <ReportsPage />}
      </main>
    </div>
  );
}

function SummaryCard({ icon, label, value, highlight = false }: {
  icon: React.ReactNode; label: string; value: string | number; highlight?: boolean;
}) {
  return (
    <div className={`bg-slate-800 border rounded-xl p-5 ${highlight ? "border-amber-500/50" : "border-slate-700"}`}>
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-slate-400 text-sm">{label}</span></div>
      <p className={`text-2xl font-bold ${highlight ? "text-amber-400" : "text-white"}`}>{value}</p>
    </div>
  );
}
