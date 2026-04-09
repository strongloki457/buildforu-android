import { CalendarDays, Clock3, Layers3, Plus } from "lucide-react";
import { useState } from "react";
import AssignmentPanel from "../components/dashboard/AssignmentPanel";
import CalendarCard from "../components/dashboard/CalendarCard";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import MetricCard from "../components/ui/MetricCard";
import Modal from "../components/ui/Modal";
import SectionHeader from "../components/ui/SectionHeader";
import { useAuth } from "../hooks/useAuth";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";

export default function CalendarPage() {
  const { user } = useAuth();
  const { tasks, workers, addTask } = useAppData();
  const { t } = useI18n();
  const [showTaskModal, setShowTaskModal] = useState(false);

  const scopedTasks = user.role === "admin" ? tasks : tasks.filter((task) => task.employeeId === user.id);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <CalendarCard
          title={t("calendar.title")}
          subtitle={t("calendar.subtitle")}
          tasks={scopedTasks}
          action={
            user.role === "admin" ? (
              <Button className="w-full gap-2 sm:w-auto" onClick={() => setShowTaskModal(true)}>
                <Plus size={16} />
                {t("calendar.addTask")}
              </Button>
            ) : undefined
          }
        />
        <div className="grid gap-4">
          <MetricCard
            icon={CalendarDays}
            label={t("calendar.scheduledThisMonth")}
            value={scopedTasks.length}
            detail={t("calendar.scheduledThisMonthDetail")}
          />
          <MetricCard
            icon={Layers3}
            label={t("calendar.coverage")}
            value={user.role === "admin" ? t("calendar.coverageAllCrews") : t("calendar.coveragePersonal")}
            detail={t("calendar.coverageDetail")}
          />
          <MetricCard
            icon={Clock3}
            label={t("calendar.nextCheckpoint")}
            value="09:30"
            detail={t("calendar.nextCheckpointDetail")}
          />
        </div>
      </div>

      <Card>
        <SectionHeader title={t("calendar.upcomingTimeline")} subtitle={t("calendar.upcomingTimelineSubtitle")} />
        <div className="grid gap-3">
          {scopedTasks.length ? (
            scopedTasks.map((task) => (
              <div key={task.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-white/80 p-4">
                <div>
                  <p className="text-slate-900">{task.title}</p>
                  <p className="text-sm text-slate-500">{task.location}</p>
                </div>
                <div className="rounded-2xl bg-brand-50 px-4 py-2 text-sm text-brand-700">{task.date}</div>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/50 p-6 text-sm text-slate-500">
              {t("calendar.noUpcoming")}
            </div>
          )}
        </div>
      </Card>

      {showTaskModal ? (
        <Modal
          onClose={() => setShowTaskModal(false)}
          title={t("calendar.formTitle")}
          description={t("calendar.formSubtitle")}
        >
          <AssignmentPanel
            workers={workers}
            onAssign={(payload) => {
              addTask(payload);
              setShowTaskModal(false);
            }}
            embedded
          />
        </Modal>
      ) : null}
    </div>
  );
}
