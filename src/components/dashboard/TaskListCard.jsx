import { CheckCircle2, MapPin } from "lucide-react";
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
            <div key={task.id} className="rounded-[24px] border border-white/70 bg-white/75 p-4">
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
                    className="inline-flex items-center gap-2 rounded-2xl bg-brand-50 px-3 py-2 text-xs text-brand-700 transition hover:bg-brand-100"
                  >
                    <CheckCircle2 size={14} />
                    {t("common.toggleStatus")}
                  </button>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/50 p-6 text-sm text-slate-500">
            {emptyText}
          </div>
        )}
      </div>
    </Card>
  );
}
