import { useEffect, useState } from "react";
import { Truck, Plus, Search, Phone, Mail } from "lucide-react";
import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:3001/api" });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface Supplier {
  id: number;
  name: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    API.get("/suppliers")
      .then((r) => setSuppliers(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.contact_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">Suppliers</h2>
          <span className="text-slate-400 text-sm ml-1">({filtered.length})</span>
        </div>
        <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          <Plus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search suppliers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 text-sm"
        />
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading...</p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl p-4 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white font-semibold">{s.name}</p>
                  {s.contact_name && (
                    <p className="text-slate-400 text-sm mt-0.5">{s.contact_name}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-3">
                {s.email && (
                  <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Mail className="w-3.5 h-3.5" />
                    {s.email}
                  </span>
                )}
                {s.phone && (
                  <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Phone className="w-3.5 h-3.5" />
                    {s.phone}
                  </span>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-8">No suppliers found.</p>
          )}
        </div>
      )}
    </div>
  );
}
