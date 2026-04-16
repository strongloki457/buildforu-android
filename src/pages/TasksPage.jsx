import { ClipboardList, Filter } from "lucide-react";
import { useMemo, useState } from "react";
import Card from "../components/ui/Card";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";
import { useAuth } from "../hooks/useAuth";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";
import { getTaskLocation, getTaskProjectName, getTaskTitle } from "../utils/localizedValue";

const filters = ["all", "pending", "completed"];

export default function TasksPage() {
  const { user } = useAuth();
  const { tasks, toggleTaskStatus } = useAppData();
  const { t } = useI18n();
  const [activeFilter, setActiveFilter] = useState("all");
  const currentWorkerId = user.workerId || user.id;

  const scopedTasks = useMemo(() => {
    const byRole = user.role === "admin" ? tasks : tasks.filter((task) => task.employeeId === currentWorkerId);
    return activeFilter === "all" ? byRole : byRole.filter((task) => task.status === activeFilter);
  }, [activeFilter, currentWorkerId, tasks, user.role]);

  return (
    <Card>
      <SectionHeader
        title={t("tasks.title")}
        subtitle={t("tasks.subtitle")}
        action={
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`rounded-2xl px-4 py-2 text-sm transition ${
                  filter === activeFilter ? "bg-brand-700 text-white" : "bg-white/80 text-slate-600"
                }`}
              >
                {t(`tasks.${filter}`)}
              </button>
            ))}
          </div>
        }
      />

      <div className="overflow-hidden rounded-[28px] border border-white/60">
        <div className="hidden grid-cols-[1.4fr_1fr_1fr_0.9fr] bg-white/70 px-5 py-4 text-xs uppercase tracking-[0.2em] text-slate-400 md:grid">
          <span>{t("tasks.task")}</span>
          <span>{t("common.location")}</span>
          <span>{user.role === "admin" ? t("common.assignedTo") : t("common.date")}</span>
          <span>{t("common.status")}</span>
        </div>

        <div className="divide-y divide-white/60">
          {scopedTasks.map((task) => (
            <div key={task.id} className="bg-white/55 px-4 py-4 md:grid md:grid-cols-[1.4fr_1fr_1fr_0.9fr] md:items-center md:gap-4 md:px-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                    <ClipboardList size={16} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-900">{getTaskTitle(t, task)}</p>
                    {getTaskProjectName(t, task) ? (
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        {t("common.project")}: {getTaskProjectName(t, task)}
                      </p>
                    ) : null}
                    <p className="text-xs text-slate-400">
                      {t("tasks.prioritySuffix", { priority: t(`priorityLabels.${task.priority}`, task.priority) })}
                    </p>
                  </div>
                </div>

              <div className="mt-3 grid gap-2 text-sm text-slate-500 md:mt-0 md:block">
                <p className="md:hidden">
                  <span className="text-slate-400">{t("common.location")}:</span> {getTaskLocation(t, task)}
                </p>
                <p className="md:hidden">
                  <span className="text-slate-400">{user.role === "admin" ? t("common.assignedTo") : t("common.date")}:</span>{" "}
                  {user.role === "admin" ? task.assignee : task.date}
                </p>
                <p className="hidden md:block">{getTaskLocation(t, task)}</p>
              </div>

              <p className="hidden text-sm text-slate-500 md:block">{user.role === "admin" ? task.assignee : task.date}</p>
              <div className="mt-3 flex items-center gap-3 md:mt-0">
                <StatusBadge value={task.status} />
                {user.role === "employee" ? (
                  <button onClick={() => toggleTaskStatus(task.id)} className="text-xs text-brand-700">
                    {t("common.toggleStatus")}
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm text-slate-400">
        <Filter size={15} />
        {t("tasks.filterHint")}
      </div>
    </Card>
  );
}
