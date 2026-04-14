import { useI18n } from "../../hooks/useI18n";
import { getLocalizedValue, getProjectName } from "../../utils/localizedValue";

export default function WorkerOperationsSection({ worker }) {
  const { t } = useI18n();

  return (
    <div className="rounded-[22px] bg-slate-50/90 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("workers.operations")}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <p className="text-slate-400">{t("workers.assignedProjects", "Assigned projects")}:</p>
          {worker.assignedProjects.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {worker.assignedProjects.map((project) => (
                <span key={project.id} className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">
                  {getProjectName(t, project)}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2">{t("workers.notProvided")}</p>
          )}
        </div>
        <p>
          <span className="text-slate-400">{t("workers.nextShift")}:</span>{" "}
          {worker.nextShift === "Not scheduled" ? t("workers.notScheduled") : worker.nextShift}
        </p>
        <p>
          <span className="text-slate-400">{t("common.location")}:</span>{" "}
          {getLocalizedValue(t, worker.locationKey, worker.location) || t("workers.notProvided")}
        </p>
        {worker.notes ? (
          <p className="sm:col-span-2">
            <span className="text-slate-400">{t("projects.notes")}:</span> {worker.notes}
          </p>
        ) : null}
      </div>
    </div>
  );
}
