import { ClipboardList, Users2 } from "lucide-react";
import { projectStatusOptions } from "../../data/options";
import { useI18n } from "../../hooks/useI18n";
import { getProjectName, getProjectNotes, getProjectPhase } from "../../utils/localizedValue";
import { getInitials } from "../../utils/people";
import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";
import { formatProjectDate } from "./projectUtils";

function getNotePreview(value) {
  if (!value) {
    return "";
  }

  return value.length > 120 ? `${value.slice(0, 117)}...` : value;
}

export default function ProjectCard({ onStatusChange, onViewDetails, project }) {
  const { locale, t } = useI18n();
  const notePreview = getNotePreview(getProjectNotes(t, project));

  return (
    <article className="rounded-[24px] border border-white/70 bg-white/92 p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg text-slate-950">{getProjectName(t, project)}</p>
          <p className="mt-1 text-sm text-slate-500">{getProjectPhase(t, project)}</p>
        </div>
        <StatusBadge value={project.status} />
      </div>

      {notePreview ? <p className="mt-4 text-sm leading-6 text-slate-600">{notePreview}</p> : null}

      {project.startDate ? (
        <p className="mt-3 text-sm text-slate-500">
          {t("projects.startDate", "Start date")}: {formatProjectDate(project.startDate, locale)}
        </p>
      ) : null}

      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between gap-3">
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

      <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <label className="grid gap-2 text-sm text-slate-500">
          <span className="inline-flex items-center gap-2">
            <ClipboardList size={14} className="text-brand-600" />
            {t("common.status", "Status")}
          </span>
          <select
            value={project.status}
            onChange={(event) => onStatusChange?.(project.id, event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
          >
            {projectStatusOptions.map((status) => (
              <option key={status} value={status}>
                {t(`statusLabels.${status.toLowerCase()}`, status)}
              </option>
            ))}
          </select>
        </label>

        <Button variant="secondary" className="gap-2" onClick={() => onViewDetails(project.id)}>
          {t("projects.viewDetails", "View details")}
        </Button>
      </div>
    </article>
  );
}
