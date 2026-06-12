import { useState } from "react";
import { X, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:3001/api" });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface Props {
  productId: number;
  productName: string;
  currentStock: number;
  onClose: () => void;
  onDone: () => void;
}

type MovementType = "in" | "out" | "adjustment";

const TYPES: { id: MovementType; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "in",         label: "Stock In",    icon: <TrendingUp className="w-4 h-4" />,   color: "bg-emerald-500/20 border-emerald-500 text-emerald-400" },
  { id: "out",        label: "Stock Out",   icon: <TrendingDown className="w-4 h-4" />, color: "bg-red-500/20 border-red-500 text-red-400" },
  { id: "adjustment", label: "Adjustment",  icon: <RefreshCw className="w-4 h-4" />,    color: "bg-amber-500/20 border-amber-500 text-amber-400" },
];

export default function StockMovementModal({ productId, productName, currentStock, onClose, onDone }: Props) {
  const [type, setType] = useState<MovementType>("in");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) { setError("Quantity must be a positive number."); return; }

    setSaving(true);
    try {
      await API.post("/movements", { product_id: productId, type, quantity: qty, note });
      onDone();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || "Failed to record movement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div>
            <h3 className="font-semibold text-white">Record Movement</h3>
            <p className="text-slate-400 text-xs mt-0.5">{productName} — current stock: {currentStock}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type selector */}
          <div className="grid grid-cols-3 gap-2">
            {TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-medium transition-colors ${
                  type === t.id ? t.color : "bg-slate-700 border-slate-600 text-slate-400 hover:text-white"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1">Quantity *</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1">Note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Purchase order #123"
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2.5 rounded-xl transition-colors text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
              {saving ? "Saving..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
