import { projectStatusOptions } from "../../data/options";
import { useI18n } from "../../hooks/useI18n";
import { getLocalizedValue, getProjectName, getProjectNotes, getProjectPhase } from "../../utils/localizedValue";
import Modal from "../ui/Modal";
import ProjectTeamList from "./ProjectTeamList";
import { formatProjectDate } from "./projectUtils";

export default function ProjectDetailsModal({ onClose, onStatusChange, project }) {
  const { locale, t } = useI18n();

  return (
    <Modal
      onClose={onClose}
      title={getProjectName(t, project)}
      description={t("projects.detailsDescriptionPractical", "Project scope, crew and timeline in one place.")}
    >
      <div className="grid gap-4">
        <div className="rounded-[24px] bg-slate-50/90 p-4">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                {t("projects.currentPhase", "Current phase")}
              </p>
              <p className="mt-2 text-base text-slate-900">{getProjectPhase(t, project)}</p>
            </div>

            <label className="grid gap-2 text-sm text-slate-500">
              <span>{t("common.status", "Status")}</span>
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
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              {t("projects.projectLocation", "Location")}
            </p>
            <p className="mt-3 text-sm text-slate-700">{getLocalizedValue(t, project.locationKey, project.location) || "-"}</p>
          </div>

          <div className="rounded-[24px] bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              {t("projects.startDate", "Start date")}
            </p>
            <p className="mt-3 text-sm text-slate-700">{formatProjectDate(project.startDate, locale)}</p>
          </div>

          <div className="rounded-[24px] bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("projects.deadline", "Deadline")}</p>
            <p className="mt-3 text-sm text-slate-700">{formatProjectDate(project.deadline, locale)}</p>
          </div>

          <div className="rounded-[24px] bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              {t("projects.teamAssigned", "Assigned team")}
            </p>
            <p className="mt-3 text-sm text-slate-700">{project.assignedWorkers.length}</p>
          </div>
        </div>

        <div className="rounded-[24px] bg-slate-50/90 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            {t("projects.teamAssigned", "Assigned team")}
          </p>
          <ProjectTeamList workers={project.assignedWorkers} />
        </div>

        <div className="rounded-[24px] bg-slate-50/90 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("projects.notes", "Notes")}</p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{getProjectNotes(t, project) || "-"}</p>
        </div>
      </div>
    </Modal>
  );
}
