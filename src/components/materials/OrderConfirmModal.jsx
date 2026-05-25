import { ShoppingCart, X } from "lucide-react";
import { useState } from "react";

export default function OrderConfirmModal({ product, projects, onConfirm, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [delivery, setDelivery] = useState("pickup");

  const total = (product.price * quantity).toFixed(2);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
    >
      <div className="w-full max-w-md space-y-5 rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-brand-600">Zamówienie</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">{product.name}</h2>
            <p className="text-sm text-slate-400">{product.storeName} · {product.sku}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Ilość ({product.unit})
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-lg text-slate-600 hover:bg-slate-50"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="h-10 w-20 rounded-xl border border-slate-200 text-center text-sm outline-none focus:border-brand-400"
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-lg text-slate-600 hover:bg-slate-50"
              >
                +
              </button>
              <span className="ml-1 text-xs text-slate-400">{product.unit}</span>
            </div>
          </div>

          {projects.length > 0 && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">Projekt</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400"
              >
                <option value="">— brak projektu —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">Sposób odbioru</label>
            <div className="grid grid-cols-2 gap-2">
              {["pickup", "delivery"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setDelivery(opt)}
                  className={`rounded-xl border px-3 py-2.5 text-sm transition ${
                    delivery === opt
                      ? "border-brand-400 bg-brand-50 text-brand-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {opt === "pickup" ? "Odbiór osobisty" : "Dostawa"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
          <span className="text-sm text-slate-500">Razem</span>
          <span className="text-xl font-semibold text-slate-900">{total} EUR</span>
        </div>

        <p className="text-xs text-slate-400">
          {product.eta} · Zamówienie zostanie wysłane do{" "}
          <strong className="text-slate-600">{product.storeName}</strong>
        </p>

        <button
          type="button"
          onClick={() => onConfirm({ quantity, projectId, delivery })}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-700 py-3 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          <ShoppingCart size={16} />
          Potwierdź zamówienie
        </button>
      </div>
    </div>
  );
}
