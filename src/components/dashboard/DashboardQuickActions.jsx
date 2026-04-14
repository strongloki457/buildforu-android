import { Link } from "react-router-dom";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";

function ActionTile({ action }) {
  const Icon = action.icon;
  const className =
    "flex w-full items-start gap-3 rounded-[22px] border border-white/70 bg-white/85 px-4 py-4 text-left transition hover:-translate-y-0.5 hover:bg-white";

  if (action.to) {
    return (
      <Link to={action.to} className={className}>
        <span className="rounded-2xl bg-brand-50 p-3 text-brand-700">
          <Icon size={18} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm text-slate-900">{action.label}</span>
          <span className="mt-1 block text-sm text-slate-500">{action.description}</span>
        </span>
      </Link>
    );
  }

  return (
    <button type="button" onClick={action.onClick} className={className}>
      <span className="rounded-2xl bg-brand-50 p-3 text-brand-700">
        <Icon size={18} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm text-slate-900">{action.label}</span>
        <span className="mt-1 block text-sm text-slate-500">{action.description}</span>
      </span>
    </button>
  );
}

export default function DashboardQuickActions({ title, subtitle, actions }) {
  return (
    <Card>
      <SectionHeader title={title} subtitle={subtitle} />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <ActionTile key={action.key} action={action} />
        ))}
      </div>
    </Card>
  );
}
