import { useState } from "react";
import { X, Package } from "lucide-react";
import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:3001/api" });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function AddProductModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    sku: "", name: "", description: "",
    unit_price: "", stock_quantity: "", min_stock: "5",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await API.post("/products", {
        ...form,
        unit_price: parseFloat(form.unit_price) || 0,
        stock_quantity: parseInt(form.stock_quantity) || 0,
        min_stock: parseInt(form.min_stock) || 5,
      });
      onCreated();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || "Failed to create product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white">Add Product</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs mb-1">SKU *</label>
              <input name="sku" value={form.sku} onChange={handleChange} required
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1">Unit Price (€)</label>
              <input name="unit_price" type="number" step="0.01" value={form.unit_price} onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400" />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1">Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400" />
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs mb-1">Initial Stock</label>
              <input name="stock_quantity" type="number" value={form.stock_quantity} onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400" />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1">Min Stock</label>
              <input name="min_stock" type="number" value={form.min_stock} onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400" />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2.5 rounded-xl transition-colors text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
              {saving ? "Saving..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
