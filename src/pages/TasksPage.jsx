import { ClipboardList, Filter } from "lucide-react";
import { useMemo, useState } from "react";
import Card from "../components/ui/Card";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";
import { useAuth } from "../hooks/useAuth";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";

const filters = ["all", "pending", "completed"];

export default function TasksPage() {
  const { user } = useAuth();
  const { tasks, toggleTaskStatus } = useAppData();
  const { t } = useI18n();
  const [activeFilter, setActiveFilter] = useState("all");

  const scopedTasks = useMemo(() => {
    const byRole = user.role === "admin" ? tasks : tasks.filter((task) => task.employeeId === user.id);
    return activeFilter === "all" ? byRole : byRole.filter((task) => task.status === activeFilter);
  }, [activeFilter, tasks, user.id, user.role]);

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
        <div className="grid grid-cols-[1.4fr_1fr_1fr_0.9fr] bg-white/70 px-5 py-4 text-xs uppercase tracking-[0.2em] text-slate-400">
          <span>Task</span>
          <span>{t("common.location")}</span>
          <span>{user.role === "admin" ? t("common.assignedTo") : t("common.date")}</span>
          <span>{t("common.status")}</span>
        </div>

        <div className="divide-y divide-white/60">
          {scopedTasks.map((task) => (
            <div key={task.id} className="grid grid-cols-[1.4fr_1fr_1fr_0.9fr] items-center gap-4 bg-white/55 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                  <ClipboardList size={16} />
                </div>
                <div>
                  <p className="text-sm text-slate-900">{task.title}</p>
                  <p className="text-xs text-slate-400">{task.priority} priority</p>
                </div>
              </div>
              <p className="text-sm text-slate-500">{task.location}</p>
              <p className="text-sm text-slate-500">{user.role === "admin" ? task.assignee : task.date}</p>
              <div className="flex items-center gap-3">
                <StatusBadge value={task.status} />
                {user.role === "employee" ? (
                  <button onClick={() => toggleTaskStatus(task.id)} className="text-xs text-brand-700">
                    Toggle
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm text-slate-400">
        <Filter size={15} />
        Filter view is mocked on the frontend and ready for backend integration later.
      </div>
    </Card>
  );
}
