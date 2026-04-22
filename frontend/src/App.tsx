import { useState, useEffect } from "react";
import {
  Package, TrendingDown, TrendingUp, AlertTriangle,
  BarChart2, Users, Truck, LogOut
} from "lucide-react";
import axios from "axios";

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

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

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
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6 text-emerald-400" />
          <span className="font-bold text-xl">Estoque Livre</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <SummaryCard icon={<Package className="w-5 h-5 text-blue-400" />}  label="Total Products"  value={summary.totalProducts} />
            <SummaryCard icon={<BarChart2 className="w-5 h-5 text-emerald-400" />} label="Stock Value" value={`€${summary.totalValue.toFixed(2)}`} />
            <SummaryCard icon={<AlertTriangle className="w-5 h-5 text-amber-400" />} label="Low Stock" value={summary.lowStockCount} highlight={summary.lowStockCount > 0} />
            <SummaryCard icon={<TrendingUp className="w-5 h-5 text-purple-400" />} label="Movements" value={summary.totalMovements} />
          </div>
        )}

        {/* Navigation placeholder */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Package />,       label: "Products" },
            { icon: <TrendingDown />,  label: "Stock In" },
            { icon: <TrendingUp />,    label: "Stock Out" },
            { icon: <Truck />,         label: "Suppliers" },
          ].map((item) => (
            <button key={item.label} className="bg-slate-800 border border-slate-700 hover:border-emerald-500 rounded-xl p-5 flex flex-col items-center gap-3 text-slate-300 hover:text-white transition-all">
              <span className="text-emerald-400">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
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
