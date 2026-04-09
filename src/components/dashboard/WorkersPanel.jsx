import { ArrowRight, Clock3, MapPin } from "lucide-react";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";
import StatusBadge from "../ui/StatusBadge";

export default function WorkersPanel({ title, subtitle, workers }) {
  return (
    <Card>
      <SectionHeader title={title} subtitle={subtitle} />

      {workers.length ? (
        <div className="space-y-3">
          {workers.map((worker) => (
            <div key={worker.id} className="rounded-[24px] bg-white/80 p-4 transition hover:-translate-y-0.5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base text-slate-900">{worker.name}</p>
                  <p className="text-sm text-slate-500">{worker.position ?? worker.trade}</p>
                </div>
                <StatusBadge value={worker.status} />
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <MapPin size={14} />
                  <span>{worker.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 size={14} />
                  <span>Next shift {worker.nextShift}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-slate-500">{worker.completionRate}% completion rate</div>
                <button className="inline-flex items-center gap-2 text-sm text-brand-700">
                  View profile
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/60 px-5 py-10 text-center text-sm text-slate-500">
          No workers are available right now.
        </div>
      )}
    </Card>
  );
}
