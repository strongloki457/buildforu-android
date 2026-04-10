import { useI18n } from "../../hooks/useI18n";

const styles = {
  pending: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  high: "bg-rose-100 text-rose-700",
  medium: "bg-blue-100 text-blue-700",
  low: "bg-slate-100 text-slate-600",
  healthy: "bg-emerald-100 text-emerald-700",
  "at risk": "bg-amber-100 text-amber-700",
  available: "bg-emerald-100 text-emerald-700",
  busy: "bg-slate-200 text-slate-700",
  "on site": "bg-emerald-100 text-emerald-700",
  "off site": "bg-slate-100 text-slate-700",
  "in transit": "bg-blue-100 text-blue-700",
  "off shift": "bg-slate-100 text-slate-700",
  "in stock": "bg-emerald-100 text-emerald-700",
  "low stock": "bg-amber-100 text-amber-700",
  limited: "bg-amber-100 text-amber-700",
  preorder: "bg-blue-100 text-blue-700",
  "out of stock": "bg-rose-100 text-rose-700"
};

export default function StatusBadge({ value }) {
  const { t } = useI18n();
  const key = String(value).toLowerCase();

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs ${styles[key] ?? "bg-slate-100 text-slate-700"}`}
    >
      {t(`statusLabels.${key}`, value)}
    </span>
  );
}
