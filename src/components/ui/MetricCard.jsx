import Card from "./Card";

export default function MetricCard({ icon: Icon, label, value, tone = "default", detail }) {
  const tones = {
    default: "from-white to-brand-50/70",
    dark: "from-brand-800 to-brand-600 text-white",
    soft: "from-emerald-50 to-white"
  };

  return (
    <Card className={`bg-gradient-to-br ${tones[tone] ?? tones.default}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm ${tone === "dark" ? "text-white/70" : "text-slate-500"}`}>{label}</p>
          <p className={`mt-2 text-2xl sm:text-3xl ${tone === "dark" ? "text-white" : "text-slate-900"}`}>{value}</p>
        </div>
        <div
          className={`rounded-2xl p-2.5 sm:p-3 ${
            tone === "dark" ? "bg-white/10 text-white" : "bg-brand-100 text-brand-700"
          }`}
        >
          <Icon size={20} />
        </div>
      </div>
      {detail ? (
        <p className={`mt-5 text-sm ${tone === "dark" ? "text-white/70" : "text-slate-500"}`}>{detail}</p>
      ) : null}
    </Card>
  );
}
