import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";
import StatusBadge from "../ui/StatusBadge";
import { useI18n } from "../../hooks/useI18n";
import { getLocalizedValue, getWorkerPosition } from "../../utils/localizedValue";

export default function WorkersPanel({ title, subtitle, workers }) {
  const { t } = useI18n();

  return (
    <Card>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        action={
          <Link to="/workers" className="inline-flex items-center gap-2 text-sm text-brand-700">
            {t("dashboard.openWorkers", "Open workers")}
            <ArrowRight size={15} />
          </Link>
        }
      />

      {workers.length ? (
        <div className="space-y-3">
          {workers.map((worker) => (
            <div key={worker.id} className="rounded-[24px] bg-white/80 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base text-slate-900">{worker.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{getWorkerPosition(t, worker)}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    {t("workers.assignedProjects", "Assigned projects")}:{" "}
                    {getLocalizedValue(t, worker.assignedProjectKey, worker.assignedProject) ||
                      t("workers.notProvided", "Not provided")}
                  </p>
                </div>
                <StatusBadge value={worker.status} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/60 px-5 py-10 text-center text-sm text-slate-500">
          {t("workers.noWorkersFound")}
        </div>
      )}
    </Card>
  );
}
