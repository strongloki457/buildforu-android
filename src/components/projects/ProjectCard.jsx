import { CalendarDays, ClipboardList, MapPin, Users2 } from "lucide-react";
import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";
import { useI18n } from "../../hooks/useI18n";
import { getLocalizedValue, getProjectName, getProjectPhase } from "../../utils/localizedValue";
import { getInitials } from "../../utils/people";
import { formatProjectDate } from "./projectUtils";

export default function ProjectCard({ locale, onViewDetails, project }) {
  const { t } = useI18n();

  return (
    <article className="rounded-[28px] border border-white/60 bg-white/85 p-5 shadow-soft transition hover:-translate-y-0.5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg text-slate-950">{getProjectName(t, project)}</p>
          <p className="mt-1 text-sm text-slate-500">{getProjectPhase(t, project)}</p>
        </div>
        <StatusBadge value={project.status} />
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-[20px] bg-slate-50/90 px-4 py-3">
          <MapPin size={14} className="text-brand-600" />
          <span>{getLocalizedValue(t, project.locationKey, project.location) || "-"}</span>
        </div>
        <div className="flex items-center gap-2 rounded-[20px] bg-slate-50/90 px-4 py-3">
          <CalendarDays size={14} className="text-brand-600" />
          <span>{formatProjectDate(project.deadline, locale)}</span>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            {t("projects.teamAssigned", "Assigned team")}
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-slate-500">
            <Users2 size={14} />
            <span>{project.assignedWorkers.length}</span>
          </div>
        </div>

        {project.assignedWorkers.length ? (
          <div className="flex flex-wrap gap-2">
            {project.assignedWorkers.map((worker) => (
              <span
                key={worker.id}
                className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs text-brand-700"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] text-brand-700">
                  {getInitials(worker.name)}
                </span>
                <span>{worker.name}</span>
              </span>
            ))}
          </div>
        ) : (
          <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50/60 px-4 py-4 text-sm text-slate-500">
            {t("projects.noAssignedWorkers", "No workers are assigned to this project yet.")}
          </div>
        )}
      </div>

      <div className="mt-5 rounded-[22px] bg-slate-50/90 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-sm text-slate-500">
            <ClipboardList size={14} className="text-brand-600" />
            <span>{t("projects.progressLabel", "Progress")}</span>
          </div>
          <span className="text-sm text-slate-700">{t("projects.progressComplete", { value: project.progress })}</span>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-700 to-brand-500"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-500">
          {t("projects.startDate", "Start date")}: {formatProjectDate(project.startDate, locale)}
        </div>
        <Button variant="secondary" className="gap-2" onClick={() => onViewDetails(project.id)}>
          {t("projects.viewDetails", "View details")}
        </Button>
      </div>
    </article>
  );
}
