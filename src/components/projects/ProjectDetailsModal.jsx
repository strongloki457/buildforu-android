import Modal from "../ui/Modal";
import StatusBadge from "../ui/StatusBadge";
import { useI18n } from "../../hooks/useI18n";
import { getLocalizedValue, getProjectName, getProjectNotes, getProjectPhase } from "../../utils/localizedValue";
import ProjectTeamList from "./ProjectTeamList";
import { formatProjectDate } from "./projectUtils";

export default function ProjectDetailsModal({ project, onClose }) {
  const { locale, t } = useI18n();

  return (
    <Modal
      onClose={onClose}
      title={getProjectName(t, project)}
      description={t("projects.detailsDescription", "Project team, timeline and operational notes in one place.")}
    >
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-slate-50/90 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              {t("projects.currentPhase", "Current phase")}
            </p>
            <p className="mt-2 text-base text-slate-900">{getProjectPhase(t, project)}</p>
          </div>
          <StatusBadge value={project.status} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              {t("projects.projectLocation", "Location")}
            </p>
            <p className="mt-3 text-sm text-slate-700">{getLocalizedValue(t, project.locationKey, project.location) || "-"}</p>
          </div>

          <div className="rounded-[24px] bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("projects.budget", "Budget")}</p>
            <p className="mt-3 text-sm text-slate-700">{project.budget || "-"}</p>
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
        </div>

        <div className="rounded-[24px] bg-slate-50/90 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              {t("projects.progressLabel", "Progress")}
            </p>
            <p className="text-sm text-slate-600">{t("projects.progressComplete", { value: project.progress })}</p>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-700 to-brand-500"
              style={{ width: `${project.progress}%` }}
            />
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
