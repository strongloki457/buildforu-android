import { CheckCircle, Clock, Search, ShoppingCart, Store, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { MOCK_PRODUCTS, MOCK_STORE_CONNECTORS, PRODUCT_CATEGORIES } from "../../data/mockShopData";
import { useShopOrders } from "../../hooks/useShopOrders";
import OrderConfirmModal from "./OrderConfirmModal";

const AVAILABILITY = {
  in_stock:    { label: "Na stanie",       color: "text-emerald-700 bg-emerald-50" },
  limited:     { label: "Ostatnie sztuki", color: "text-amber-700 bg-amber-50" },
  preorder:    { label: "Preorder",        color: "text-blue-700 bg-blue-50" },
  out_of_stock:{ label: "Brak",            color: "text-slate-500 bg-slate-100" },
};

const STATUS_STYLE = {
  "Wysłano":     "text-blue-700 bg-blue-50",
  "Potwierdzone":"text-amber-700 bg-amber-50",
  "W realizacji":"text-orange-700 bg-orange-50",
  "Dostarczone": "text-emerald-700 bg-emerald-50",
};

function ProductCard({ product, onOrder }) {
  const avail = AVAILABILITY[product.availability] ?? AVAILABILITY.in_stock;
  const canOrder = product.availability !== "out_of_stock";

  return (
    <div className="flex flex-col gap-3 rounded-[22px] border border-slate-100 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium leading-snug text-slate-900">{product.name}</p>
          <p className="mt-0.5 truncate text-xs text-slate-400">{product.storeName} · {product.sku}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${avail.color}`}>
          {avail.label}
        </span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-xl font-semibold text-slate-900">
            {product.price.toFixed(2)}{" "}
            <span className="text-sm font-normal text-slate-400">EUR/{product.unit}</span>
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
            <Clock size={10} />
            {product.eta}
          </p>
        </div>
        <button
          type="button"
          onClick={() => canOrder && onOrder(product)}
          disabled={!canOrder}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-3 py-2 text-xs font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShoppingCart size={13} />
          Zamów
        </button>
      </div>
    </div>
  );
}

function ConnectorBadge({ connector }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-3 py-2">
      <span className="h-2 w-2 rounded-full bg-emerald-400" />
      <span className="text-xs font-medium text-slate-700">{connector.name}</span>
      <span className="text-xs text-slate-400">mock API</span>
    </div>
  );
}

export default function StoreShopTab({ projects = [] }) {
  const [innerTab, setInnerTab] = useState("shop");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [storeFilter, setStoreFilter] = useState("all");
  const [confirmProduct, setConfirmProduct] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);
  const { orders, placeOrder } = useShopOrders();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return MOCK_PRODUCTS.filter((p) => {
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (storeFilter !== "all" && p.storeId !== storeFilter) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.storeName.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, categoryFilter, storeFilter]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((p) => {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p);
    });
    return map;
  }, [filtered]);

  const handleConfirm = ({ quantity, projectId, delivery }) => {
    const project = projects.find((p) => p.id === projectId);
    const order = placeOrder({
      productId: confirmProduct.id,
      productName: confirmProduct.name,
      storeId: confirmProduct.storeId,
      storeName: confirmProduct.storeName,
      sku: confirmProduct.sku,
      unit: confirmProduct.unit,
      unitPrice: confirmProduct.price,
      totalPrice: +(confirmProduct.price * quantity).toFixed(2),
      quantity,
      projectId: projectId || null,
      projectName: project?.name ?? null,
      deliveryType: delivery,
    });
    setConfirmProduct(null);
    setLastOrder(order);
    setTimeout(() => setLastOrder(null), 5000);
  };

  return (
    <div className="space-y-5">
      {/* Connected store connectors */}
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-widest text-slate-400">
          Podłączone sklepy
        </p>
        <div className="flex flex-wrap gap-2">
          {MOCK_STORE_CONNECTORS.map((c) => (
            <ConnectorBadge key={c.id} connector={c} />
          ))}
        </div>
      </div>

      {/* Inner tab switcher */}
      <div className="flex w-fit gap-1 rounded-xl border border-slate-200 bg-white p-1">
        {[
          ["shop", "Katalog produktów"],
          ["history", `Historia zamówień (${orders.length})`],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setInnerTab(key)}
            className={`rounded-lg px-4 py-2 text-sm transition ${
              innerTab === key
                ? "bg-brand-700 text-white shadow"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Success notification */}
      {lastOrder && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle size={16} className="shrink-0 text-emerald-600" />
          <span>
            Zamówienie <strong>{lastOrder.ref}</strong> wysłane do{" "}
            <strong>{lastOrder.storeName}</strong>!
          </span>
        </div>
      )}

      {innerTab === "shop" ? (
        <div className="space-y-5">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Szukaj produktu, SKU..."
                className="h-10 w-56 rounded-xl border border-slate-200 bg-white pl-8 pr-4 text-sm outline-none focus:border-brand-400"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-400"
            >
              <option value="all">Wszystkie kategorie</option>
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-400"
            >
              <option value="all">Wszystkie sklepy</option>
              {MOCK_STORE_CONNECTORS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product grid grouped by category */}
          {Object.keys(grouped).length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-[22px] bg-white/80">
              <p className="text-sm text-slate-400">Brak produktów spełniających kryteria</p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, products]) => (
              <div key={category}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  {category}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} onOrder={setConfirmProduct} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Order history */
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-[22px] bg-white/80">
              <p className="text-sm text-slate-400">Brak zamówień — zamów coś z katalogu</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="rounded-[22px] border border-slate-100 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">
                        {order.productName}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          STATUS_STYLE[order.status] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {order.ref} · {order.storeName}
                    </p>
                    {order.projectName && (
                      <p className="mt-0.5 text-xs text-slate-400">
                        Projekt: {order.projectName}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {order.totalPrice.toFixed(2)} EUR
                    </p>
                    <p className="text-xs text-slate-400">
                      {order.quantity} {order.unit}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                  {order.deliveryType === "delivery" ? (
                    <Truck size={12} />
                  ) : (
                    <Store size={12} />
                  )}
                  <span>
                    {order.deliveryType === "delivery" ? "Dostawa" : "Odbiór osobisty"}
                  </span>
                  <span>·</span>
                  <span>{new Date(order.placedAt).toLocaleString("pl-PL")}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {confirmProduct && (
        <OrderConfirmModal
          product={confirmProduct}
          projects={projects}
          onConfirm={handleConfirm}
          onClose={() => setConfirmProduct(null)}
        />
      )}
    </div>
  );
}
