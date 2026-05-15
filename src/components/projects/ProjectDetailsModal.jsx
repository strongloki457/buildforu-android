import { CalendarDays, ClipboardList, MapPin, PackageCheck, Users2 } from "lucide-react";
import { projectStatusOptions } from "../../data/options";
import { useI18n } from "../../hooks/useI18n";
import {
  getLocalizedValue,
  getMaterialRequestItem,
  getMaterialRequestNote,
  getProjectName,
  getProjectNotes,
  getProjectPhase,
  getTaskLocation,
  getTaskTitle
} from "../../utils/localizedValue";
import Modal from "../ui/Modal";
import StatusBadge from "../ui/StatusBadge";
import ProjectTeamList from "./ProjectTeamList";
import { formatProjectDate } from "./projectUtils";

function clampProgress(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(numberValue)));
}

function DetailMetric({ icon: Icon, label, value, helper }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-100 bg-white px-4 py-4">
      <div className="flex min-w-0 items-center gap-2 text-xs uppercase text-slate-400">
        <Icon size={14} className="shrink-0 text-brand-600" />
        <span className="break-anywhere">{label}</span>
      </div>
      <p className="break-anywhere mt-3 text-base text-slate-950">{value}</p>
      {helper ? <p className="break-anywhere mt-1 text-xs leading-5 text-slate-500">{helper}</p> : null}
    </div>
  );
}

function EmptyPanel({ children }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-white/75 px-4 py-5 text-sm text-slate-500">
      {children}
    </div>
  );
}

export default function ProjectDetailsModal({ onClose, onStatusChange, project }) {
  const { locale, t } = useI18n();
  const linkedTasks = project.linkedTasks ?? [];
  const linkedMaterials = project.linkedMaterialRequests ?? [];
  const progress = clampProgress(project.progress);
  const completedTaskCount =
    project.completedTaskCount ?? linkedTasks.filter((task) => task.status === "completed").length;
  const openTaskCount = project.openTaskCount ?? linkedTasks.length - completedTaskCount;
  const openMaterialCount =
    project.openMaterialCount ??
    linkedMaterials.filter((request) => ["Pending", "Ordered"].includes(request.status)).length;
  const projectLocation = getLocalizedValue(t, project.locationKey, project.location) || "-";
  const projectPhase = getProjectPhase(t, project) || "-";

  return (
    <Modal
      onClose={onClose}
      title={getProjectName(t, project)}
      description={t("projects.detailsDescriptionPractical", "Project scope, crew and timeline in one place.")}
    >
      <div className="grid gap-4">
        <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-4">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <StatusBadge value={project.status} />
                <span className="text-sm text-slate-500">{projectPhase}</span>
              </div>
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-600">{t("projects.progressOverview", "Progress overview")}</span>
                  <span className="text-slate-950">
                    {t("projects.progressComplete", { value: progress }, "{{value}}% complete")}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            <label className="grid gap-2 text-sm text-slate-500">
              <span>{t("common.status", "Status")}</span>
              <select
                value={project.status}
                onChange={(event) => onStatusChange?.(project.id, event.target.value)}
                className="min-h-11 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
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

        <div className="grid gap-3 sm:grid-cols-2">
          <DetailMetric icon={MapPin} label={t("projects.projectLocation", "Location")} value={projectLocation} />
          <DetailMetric
            icon={CalendarDays}
            label={t("projects.startDate", "Start date")}
            value={formatProjectDate(project.startDate, locale)}
            helper={`${t("projects.deadline", "Deadline")}: ${formatProjectDate(project.deadline, locale)}`}
          />
          <DetailMetric
            icon={Users2}
            label={t("projects.teamAssigned", "Assigned team")}
            value={project.assignedWorkers.length}
            helper={t("projects.assignedWorkersHelper", "People connected to this job site.")}
          />
          <DetailMetric
            icon={ClipboardList}
            label={t("projects.linkedTasks", "Linked tasks")}
            value={linkedTasks.length}
            helper={t("projects.openTasksCount", { count: openTaskCount }, "{{count}} open")}
          />
          <DetailMetric
            icon={PackageCheck}
            label={t("projects.linkedMaterials", "Linked materials")}
            value={linkedMaterials.length}
            helper={t("projects.openMaterialsCount", { count: openMaterialCount }, "{{count}} open")}
          />
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-4">
          <p className="text-xs uppercase text-slate-400">{t("projects.teamAssigned", "Assigned team")}</p>
          <ProjectTeamList workers={project.assignedWorkers} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-lg border border-slate-100 bg-slate-50/80 p-4">
            <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
              <p className="text-xs uppercase text-slate-400">{t("projects.linkedTasks", "Linked tasks")}</p>
              <span className="text-xs text-slate-500">
                {linkedTasks.length
                  ? t("projects.tasksCompletedRatio", { completed: completedTaskCount, total: linkedTasks.length }, "{{completed}}/{{total}} done")
                  : t("projects.noLinkedTasksShort", "No tasks")}
              </span>
            </div>
            {linkedTasks.length ? (
              <div className="grid gap-2">
                {linkedTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="min-w-0 rounded-lg bg-white px-3 py-3">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-anywhere text-sm text-slate-900">{getTaskTitle(t, task)}</p>
                        <p className="break-anywhere mt-1 text-xs text-slate-500">
                          {formatProjectDate(task.date, locale)}
                          {getTaskLocation(t, task) ? ` | ${getTaskLocation(t, task)}` : ""}
                        </p>
                      </div>
                      <StatusBadge value={task.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyPanel>{t("projects.noLinkedTasks", "No tasks are linked to this project yet.")}</EmptyPanel>
            )}
          </section>

          <section className="rounded-lg border border-slate-100 bg-slate-50/80 p-4">
            <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
              <p className="text-xs uppercase text-slate-400">{t("projects.linkedMaterials", "Linked materials")}</p>
              <span className="text-xs text-slate-500">
                {t("projects.openMaterialsCount", { count: openMaterialCount }, "{{count}} open")}
              </span>
            </div>
            {linkedMaterials.length ? (
              <div className="grid gap-2">
                {linkedMaterials.slice(0, 5).map((request) => (
                  <div key={request.id} className="min-w-0 rounded-lg bg-white px-3 py-3">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-anywhere text-sm text-slate-900">{getMaterialRequestItem(t, request)}</p>
                        <p className="break-anywhere mt-1 text-xs text-slate-500">
                          {request.quantity || t("materials.quantity", "Quantity")}
                          {getMaterialRequestNote(t, request) ? ` | ${getMaterialRequestNote(t, request)}` : ""}
                        </p>
                      </div>
                      <StatusBadge value={request.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyPanel>
                {t("projects.noLinkedMaterials", "No material requests are linked to this project yet.")}
              </EmptyPanel>
            )}
          </section>
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-4">
          <p className="text-xs uppercase text-slate-400">{t("projects.notes", "Notes")}</p>
          <p className="break-anywhere mt-3 text-sm leading-7 text-slate-700">{getProjectNotes(t, project) || "-"}</p>
        </div>
      </div>
    </Modal>
  );
}
