import { useEffect, useState } from "react";
import { Package, Plus, Search, AlertTriangle } from "lucide-react";
import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:3001/api" });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface Product {
  id: number;
  sku: string;
  name: string;
  category_name: string;
  supplier_name: string;
  stock_quantity: number;
  min_stock: number;
  unit_price: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    API.get("/products", { params: { search } })
      .then((r) => setProducts(r.data))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">Products</h2>
          <span className="text-slate-400 text-sm ml-1">({products.length})</span>
        </div>
        <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 text-sm"
        />
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-slate-400 text-sm">Loading...</p>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="text-left px-4 py-3 font-medium">SKU</th>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-right px-4 py-3 font-medium">Stock</th>
                <th className="text-right px-4 py-3 font-medium">Price</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3 text-slate-400 font-mono">{p.sku}</td>
                  <td className="px-4 py-3 text-white font-medium">
                    {p.name}
                    {p.stock_quantity <= p.min_stock && (
                      <AlertTriangle className="inline w-3.5 h-3.5 text-amber-400 ml-2" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{p.category_name || "—"}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${p.stock_quantity <= p.min_stock ? "text-amber-400" : "text-white"}`}>
                    {p.stock_quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">€{p.unit_price.toFixed(2)}</td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
