import { Link } from "react-router-dom";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";

function ActionTile({ action }) {
  const Icon = action.icon;
  const className =
    "flex min-h-[76px] w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-brand-200 hover:bg-brand-50/40";

  if (action.to) {
    return (
      <Link to={action.to} className={className}>
        <span className="rounded-lg bg-brand-50 p-3 text-brand-700">
          <Icon size={18} />
        </span>
        <span className="min-w-0">
          <span className="break-anywhere block text-sm text-slate-900">{action.label}</span>
          {action.description ? <span className="break-anywhere mt-1 block text-sm leading-5 text-slate-500">{action.description}</span> : null}
        </span>
      </Link>
    );
  }

  return (
    <button type="button" onClick={action.onClick} className={className}>
      <span className="rounded-lg bg-brand-50 p-3 text-brand-700">
        <Icon size={18} />
      </span>
      <span className="min-w-0">
        <span className="break-anywhere block text-sm text-slate-900">{action.label}</span>
        {action.description ? <span className="break-anywhere mt-1 block text-sm leading-5 text-slate-500">{action.description}</span> : null}
      </span>
    </button>
  );
}

export default function DashboardQuickActions({ title, subtitle, actions }) {
  return (
    <Card>
      <SectionHeader title={title} subtitle={subtitle} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <ActionTile key={action.key} action={action} />
        ))}
      </div>
    </Card>
  );
}
