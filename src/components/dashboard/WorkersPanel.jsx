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
            <div key={worker.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="break-anywhere text-base text-slate-900">{worker.name}</p>
                  <p className="break-anywhere mt-1 text-sm text-slate-500">{getWorkerPosition(t, worker)}</p>
                  <p className="break-anywhere mt-2 text-sm text-slate-500">
                    {t("workers.assignedProjects", "Assigned projects")}:{" "}
                    {getLocalizedValue(t, worker.assignedProjectKey, worker.assignedProject) ||
                      t("workers.notProvided", "Not provided")}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <StatusBadge value={worker.status} />
                  {String(worker.status).toLowerCase() !== "on site" ? (
                    <span className="text-xs text-amber-700">{t("attendance.notStarted", "Not started work")}</span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm text-slate-500">
          {t("workers.noWorkersFound")} {t("workers.emptyCreateHint", "Create the first worker to unlock employee login and assignments.")}
        </div>
      )}
    </Card>
  );
}
