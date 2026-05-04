import { AlertTriangle, CheckCircle2, MapPin } from "lucide-react";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";
import StatusBadge from "../ui/StatusBadge";
import { useI18n } from "../../hooks/useI18n";
import { getTaskLocation, getTaskProjectName, getTaskTitle } from "../../utils/localizedValue";

export default function TaskListCard({
  title,
  subtitle,
  tasks,
  onToggleStatus,
  emptyText,
  action,
  maxItems,
  showAssignee = false
}) {
  const { t } = useI18n();
  const visibleTasks = typeof maxItems === "number" ? tasks.slice(0, maxItems) : tasks;

  return (
    <Card>
      <SectionHeader title={title} subtitle={subtitle} action={action} />

      <div className="space-y-3">
        {visibleTasks.length ? (
          visibleTasks.map((task) => (
            <div key={task.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base text-slate-900">{getTaskTitle(t, task)}</p>
                  {getTaskProjectName(t, task) ? (
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                      {t("common.project")}: {getTaskProjectName(t, task)}
                    </p>
                  ) : null}
                  {showAssignee && task.assignee ? (
                    <p className="mt-2 text-sm text-slate-500">
                      {t("common.assignedTo", "Assigned to")}: {task.assignee}
                    </p>
                  ) : null}
                  {showAssignee && !task.employeeId ? (
                    <p className="mt-2 inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                      <AlertTriangle size={14} />
                      {t("calendar.unassignedWorker", "Unassigned")}
                    </p>
                  ) : null}
                  {!task.projectId ? (
                    <p className="mt-2 inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                      <AlertTriangle size={14} />
                      {t("calendar.noProjectLink", "No project link")}
                    </p>
                  ) : null}
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <MapPin size={14} />
                    <span>{getTaskLocation(t, task)}</span>
                  </div>
                </div>
                <StatusBadge value={task.status} />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{task.date}</div>
                {onToggleStatus ? (
                  <button
                    onClick={() => onToggleStatus(task.id)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-700 px-4 py-2 text-sm text-white transition hover:bg-brand-800"
                  >
                    <CheckCircle2 size={14} />
                    {t("common.toggleStatus")}
                  </button>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
            {emptyText}
          </div>
        )}
      </div>
    </Card>
  );
}
