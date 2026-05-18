import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  MapPin,
  PackageCheck,
  Users2
} from "lucide-react";
import { projectStatusOptions } from "../../data/options";
import { useI18n } from "../../hooks/useI18n";
import {
  getLocalizedValue,
  getMaterialRequestItem,
  getProjectName,
  getProjectNotes,
  getProjectPhase,
  getTaskTitle
} from "../../utils/localizedValue";
import { getInitials } from "../../utils/people";
import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";
import { formatProjectDate } from "./projectUtils";

const MAX_VISIBLE_WORKERS = 4;

function clampProgress(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(numberValue)));
}

function getNotePreview(value) {
  if (!value) {
    return "";
  }

  return value.length > 110 ? `${value.slice(0, 107)}...` : value;
}

function ProjectMetric({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-100 bg-slate-50/75 px-3 py-3">
      <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
        <Icon size={14} className="shrink-0 text-brand-600" />
        <span className="break-anywhere">{label}</span>
      </div>
      <p className="break-anywhere mt-2 text-sm text-slate-950">{value}</p>
    </div>
  );
}

export default function ProjectCard({ onStatusChange, onViewDetails, project }) {
  const { locale, t } = useI18n();
  const projectName = getProjectName(t, project);
  const projectPhase = getProjectPhase(t, project);
  const projectLocation = getLocalizedValue(t, project.locationKey, project.location);
  const linkedTasks = project.linkedTasks ?? [];
  const linkedMaterials = project.linkedMaterialRequests ?? [];
  const taskCount = project.taskCount ?? linkedTasks.length;
  const completedTaskCount = project.completedTaskCount ?? linkedTasks.filter((task) => task.status === "completed").length;
  const openTaskCount = project.openTaskCount ?? taskCount - completedTaskCount;
  const openMaterialCount =
    project.openMaterialCount ??
    linkedMaterials.filter((request) => ["Pending", "Ordered"].includes(request.status)).length;
  const progress = clampProgress(project.progress);
  const notePreview = getNotePreview(getProjectNotes(t, project));
  const visibleWorkers = project.assignedWorkers.slice(0, MAX_VISIBLE_WORKERS);
  const hiddenWorkerCount = Math.max(0, project.assignedWorkers.length - visibleWorkers.length);
  const nextTask = linkedTasks.find((task) => task.status !== "completed") ?? linkedTasks[0] ?? null;
  const nextMaterial = linkedMaterials.find((request) => ["Pending", "Ordered"].includes(request.status)) ?? linkedMaterials[0] ?? null;
  const taskProgressLabel = taskCount
    ? t("projects.tasksCompletedRatio", { completed: completedTaskCount, total: taskCount }, "{{completed}}/{{total}} done")
    : t("projects.noLinkedTasksShort", "No tasks");

  return (
    <article className="min-w-0 overflow-hidden rounded-lg border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-brand-100 hover:shadow-md sm:p-5">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="break-anywhere text-base text-slate-950 sm:text-lg">{projectName}</h3>
            <StatusBadge value={project.status} />
          </div>
          <div className="mt-2 flex min-w-0 flex-col gap-1 text-sm text-slate-500">
            {projectPhase ? <span className="break-anywhere">{projectPhase}</span> : null}
            {projectLocation ? (
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <MapPin size={14} className="shrink-0 text-slate-400" />
                <span className="break-anywhere">{projectLocation}</span>
              </span>
            ) : null}
          </div>
        </div>

        {onStatusChange ? (
          <label className="grid min-w-[150px] gap-2 text-sm text-slate-500">
            <span className="sr-only">{t("common.status", "Status")}</span>
            <select
              value={project.status}
              onChange={(event) => onStatusChange(project.id, event.target.value)}
              className="min-h-11 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
            >
              {projectStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {t(`statusLabels.${status.toLowerCase()}`, status)}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {notePreview ? <p className="break-anywhere mt-4 text-sm leading-6 text-slate-600">{notePreview}</p> : null}

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className="text-slate-600">{t("projects.progressOverview", "Progress overview")}</span>
          <span className="text-slate-950">{t("projects.progressComplete", { value: progress }, "{{value}}% complete")}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <ProjectMetric icon={Users2} label={t("projects.teamAssigned", "Assigned team")} value={project.assignedWorkers.length} />
        <ProjectMetric icon={ClipboardList} label={t("projects.linkedTasks", "Linked tasks")} value={taskProgressLabel} />
        <ProjectMetric icon={PackageCheck} label={t("projects.linkedMaterials", "Linked materials")} value={linkedMaterials.length} />
        <ProjectMetric
          icon={CalendarDays}
          label={t("projects.deadline", "Deadline")}
          value={formatProjectDate(project.deadline, locale)}
        />
      </div>

      <div className="mt-5 grid gap-3">
        <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <p className="text-xs uppercase text-slate-400">{t("projects.nextWorkItem", "Next work item")}</p>
            <span className="text-xs text-slate-500">
              {t("projects.openTasksCount", { count: openTaskCount }, "{{count}} open")}
            </span>
          </div>
          {nextTask ? (
            <div className="mt-3 flex min-w-0 items-start gap-2 text-sm text-slate-700">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-brand-600" />
              <span className="break-anywhere">{getTaskTitle(t, nextTask)}</span>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">{t("projects.noLinkedTasks", "No tasks are linked to this project yet.")}</p>
          )}
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
          <div className="flex min-w-0 items-center justify-between gap-3">
            <p className="text-xs uppercase text-slate-400">{t("projects.materialCoverage", "Material coverage")}</p>
            <span className="text-xs text-slate-500">
              {t("projects.openMaterialsCount", { count: openMaterialCount }, "{{count}} open")}
            </span>
          </div>
          {nextMaterial ? (
            <p className="break-anywhere mt-3 text-sm text-slate-700">{getMaterialRequestItem(t, nextMaterial)}</p>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              {t("projects.noLinkedMaterials", "No material requests are linked to this project yet.")}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex min-w-0 flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase text-slate-400">{t("projects.assignedWorkers", "Assigned workers")}</p>
          {project.assignedWorkers.length ? (
            <div className="mt-2 flex min-w-0 flex-wrap gap-2">
              {visibleWorkers.map((worker) => (
                <span
                  key={worker.id}
                  className="inline-flex min-w-0 items-center gap-2 rounded-full bg-brand-50 px-2.5 py-1.5 text-xs text-brand-700"
                >
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[11px] text-brand-700">
                    {getInitials(worker.name)}
                  </span>
                  <span className="max-w-[140px] truncate">{worker.name}</span>
                </span>
              ))}
              {hiddenWorkerCount ? (
                <span className="inline-flex h-9 items-center rounded-full bg-slate-100 px-3 text-xs text-slate-600">
                  +{hiddenWorkerCount}
                </span>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">{t("projects.noAssignedWorkers", "No workers are assigned to this project yet.")}</p>
          )}
        </div>

        <Button variant="secondary" className="w-full gap-2 sm:w-auto" onClick={() => onViewDetails(project.id)}>
          {t("projects.viewDetails", "View details")}
        </Button>
      </div>
    </article>
  );
}
