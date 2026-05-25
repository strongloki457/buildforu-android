import { useCallback, useState } from "react";

const STORAGE_KEY = "buildforu_shop_orders_v1";

function loadFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function computeStatus(placedAt) {
  const ageMinutes = (Date.now() - new Date(placedAt).getTime()) / 60000;
  if (ageMinutes < 2) return "Wysłano";
  if (ageMinutes < 10) return "Potwierdzone";
  if (ageMinutes < 30) return "W realizacji";
  return "Dostarczone";
}

export function useShopOrders() {
  const [orders, setOrders] = useState(loadFromStorage);

  const placeOrder = useCallback((data) => {
    const current = loadFromStorage();
    const initials = data.storeId
      .split("-")
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");
    const newOrder = {
      id: `ord-${Date.now()}`,
      ref: `${initials}-${new Date().getFullYear()}-${String(current.length + 1).padStart(4, "0")}`,
      ...data,
      placedAt: new Date().toISOString(),
    };
    const updated = [newOrder, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setOrders(updated);
    return newOrder;
  }, []);

  return {
    orders: orders.map((o) => ({ ...o, status: computeStatus(o.placedAt) })),
    placeOrder,
  };
}
