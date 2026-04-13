export default function AttendanceMetaItem({ icon: Icon, label, value, tone = "default" }) {
  const toneClassName =
    tone === "success" ? "text-emerald-700" : tone === "warning" ? "text-amber-700" : "text-slate-700";

  return (
    <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/90 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
        <Icon size={14} />
        <span>{label}</span>
      </div>
      <p className={`mt-3 text-sm ${toneClassName}`}>{value}</p>
    </div>
  );
}
