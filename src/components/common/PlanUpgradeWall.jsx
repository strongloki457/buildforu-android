import { Lock } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../ui/Card";

export default function PlanUpgradeWall({ title, subtitle, cta }) {
  return (
    <Card>
      <div className="flex flex-col items-center py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
          <Lock size={36} className="text-brand-700" />
        </div>
        <h2 className="mt-6 text-2xl text-slate-950">{title}</h2>
        <p className="mt-3 max-w-md text-slate-500">{subtitle}</p>
        <Link
          to="/settings/billing"
          className="mt-8 inline-flex items-center justify-center rounded-2xl bg-brand-700 px-6 py-3.5 text-sm text-white hover:bg-brand-600 transition"
        >
          {cta}
        </Link>
      </div>
    </Card>
  );
}
