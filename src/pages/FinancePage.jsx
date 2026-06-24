import {
  CalendarCheck2,
  FolderKanban,
  PackageCheck,
  PackagePlus,
  Users2
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { projectsApi } from "../api/projects.api";
import { workersApi } from "../api/workers.api";
import PlanUpgradeWall from "../components/common/PlanUpgradeWall";
import Card from "../components/ui/Card";
import MetricCard from "../components/ui/MetricCard";
import SectionHeader from "../components/ui/SectionHeader";
import { useAppData } from "../hooks/useAppData";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "../hooks/useI18n";
import { getLocalDateKey } from "../utils/date";

function RateInputRow({ label, sublabel, value, suffix, onSave, isSaving }) {
  const [draft, setDraft] = useState(value ?? "");

  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  const handleBlur = () => {
    const trimmed = draft.trim();
    const numeric = trimmed === "" ? null : Number(trimmed);
    if (numeric !== null && (Number.isNaN(numeric) || numeric < 0)) {
      setDraft(value ?? "");
      return;
    }
    if (numeric === (value ?? null)) return;
    onSave(numeric);
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-4 py-3">
      <div className="min-w-0">
        <p className="break-anywhere text-sm text-slate-900">{label}</p>
        {sublabel ? <p className="text-xs text-slate-400">{sublabel}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={draft}
          disabled={isSaving}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={handleBlur}
          placeholder="0"
          className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-right text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        />
        <span className="text-xs text-slate-400">{suffix}</span>
      </div>
    </div>
  );
}

function RatesAndBudgetsSection() {
  const { t } = useI18n();
  const { user } = useAuth();
  const isStarterPlan = (user?.plan ?? "starter") === "starter";
  const [workersList, setWorkersList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (isStarterPlan) {
      setIsLoading(false);
      return;
    }

    let active = true;
    Promise.all([workersApi.list({ limit: 200 }), projectsApi.list({ limit: 200 })])
      .then(([workersRes, projectsRes]) => {
        if (!active) return;
        setWorkersList(workersRes.data ?? []);
        setProjectsList(projectsRes.data ?? []);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isStarterPlan]);

  if (isStarterPlan) {
    return (
      <PlanUpgradeWall
        title={t("finance.proOnly.title", "Rates & budgets are a Pro feature")}
        subtitle={t(
          "finance.proOnly.subtitle",
          "Upgrade to Pro to set hourly rates and project budgets, and track job costing."
        )}
        cta={t("finance.proOnly.cta", "View plans")}
      />
    );
  }

  const handleSaveRate = async (workerId, hourlyRate) => {
    setSavingId(workerId);
    try {
      const { worker } = await workersApi.updateRate(workerId, hourlyRate);
      setWorkersList((current) =>
        current.map((item) => (item.id === workerId ? { ...item, hourlyRate: worker.hourlyRate } : item))
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveBudget = async (projectId, budget) => {
    setSavingId(projectId);
    try {
      const { project } = await projectsApi.updateBudget(projectId, budget);
      setProjectsList((current) =>
        current.map((item) => (item.id === projectId ? { ...item, budget: project.budget } : item))
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <SectionHeader
          title={t("finance.workerRatesTitle", "Worker hourly rates")}
          subtitle={t("finance.workerRatesSubtitle", "Used to calculate labor cost from logged hours.")}
        />
        {isLoading ? (
          <p className="text-sm text-slate-400">{t("common.loading", "Loading interface...")}</p>
        ) : workersList.length ? (
          <div className="space-y-2">
            {workersList.map((worker) => (
              <RateInputRow
                key={worker.id}
                label={worker.name}
                value={worker.hourlyRate}
                suffix={t("finance.perHour", "€/h")}
                isSaving={savingId === worker.id}
                onSave={(value) => handleSaveRate(worker.id, value)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">{t("finance.noWorkers", "No workers yet.")}</p>
        )}
      </Card>

      <Card>
        <SectionHeader
          title={t("finance.projectBudgetsTitle", "Project budgets")}
          subtitle={t("finance.projectBudgetsSubtitle", "Set a target budget to track profitability per project.")}
        />
        {isLoading ? (
          <p className="text-sm text-slate-400">{t("common.loading", "Loading interface...")}</p>
        ) : projectsList.length ? (
          <div className="space-y-2">
            {projectsList.map((project) => (
              <RateInputRow
                key={project.id}
                label={project.name}
                value={project.budget}
                suffix={t("finance.currency", "€")}
                isSaving={savingId === project.id}
                onSave={(value) => handleSaveBudget(project.id, value)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">{t("finance.noProjects", "No projects yet.")}</p>
        )}
      </Card>
    </div>
  );
}

function WeeklyTasksChart({ tasks }) {
  const { t } = useI18n();

  const weeklyData = useMemo(() => {
    const weeks = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - i * 7 - 6);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const startKey = weekStart.toISOString().slice(0, 10);
      const endKey = weekEnd.toISOString().slice(0, 10);

      const completed = tasks.filter(
        (task) => task.status === "completed" && task.date >= startKey && task.date <= endKey
      ).length;

      weeks.push({ label: `W${7 - i}`, completed });
    }

    return weeks;
  }, [tasks]);

  const maxValue = Math.max(...weeklyData.map((w) => w.completed), 1);

  return (
    <div className="mt-6 h-52 rounded-[28px] bg-white/80 p-5">
      <p className="mb-4 text-xs uppercase tracking-[0.2em] text-slate-400">
        {t("finance.weeklyTasksLabel", "Completed tasks — last 7 weeks")}
      </p>
      <div className="flex h-36 items-end gap-3">
        {weeklyData.map((week) => {
          const heightPct = maxValue ? Math.max((week.completed / maxValue) * 100, week.completed > 0 ? 8 : 0) : 0;
          return (
            <div key={week.label} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs text-slate-500">{week.completed || ""}</span>
              <div
                className="w-full rounded-t-xl bg-gradient-to-t from-brand-700 to-brand-500 transition-all duration-500"
                style={{ height: `${heightPct}%` }}
              />
              <span className="text-xs text-slate-400">{week.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FinancePage() {
  const { projects, tasks, workers, attendance, materialRequests } = useAppData();
  const { t } = useI18n();
  const todayKey = getLocalDateKey();

  const metrics = useMemo(() => {
    const activeProjects = projects.filter((p) => p.status === "In Progress").length;
    const completedProjects = projects.filter((p) => p.status === "Completed").length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const onSiteToday = attendance.filter((r) => !r.workEndTime).length;
    const pendingMaterials = materialRequests.filter((r) => r.status === "Pending").length;
    const purchasedMaterials = materialRequests.filter((r) => r.status === "Purchased").length;
    const todayTasks = tasks.filter((t) => t.date === todayKey).length;

    return {
      activeProjects,
      completedProjects,
      completionRate,
      onSiteToday,
      pendingMaterials,
      purchasedMaterials,
      todayTasks,
      totalWorkers: workers.length
    };
  }, [attendance, materialRequests, projects, tasks, todayKey, workers]);

  const recentMaterialsPurchased = useMemo(
    () =>
      materialRequests
        .filter((r) => r.status === "Purchased")
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
        .slice(0, 5),
    [materialRequests]
  );

  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.25em] text-brand-600">{t("finance.eyebrow", "Operations")}</p>
        <h1 className="mt-2 text-2xl text-slate-950 sm:text-3xl">{t("finance.pageTitle", "Operations overview")}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {t("finance.pageSubtitle", "Real-time snapshot of projects, crew and materials across your company.")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard
          icon={FolderKanban}
          label={t("finance.activeProjects", "Active projects")}
          value={String(metrics.activeProjects)}
          detail={t("finance.completedProjectsDetail", { count: metrics.completedProjects })}
        />
        <MetricCard
          icon={Users2}
          label={t("finance.onSiteToday", "On site today")}
          value={String(metrics.onSiteToday)}
          detail={t("finance.totalWorkersDetail", { count: metrics.totalWorkers })}
        />
        <MetricCard
          icon={CalendarCheck2}
          label={t("finance.taskCompletion", "Task completion")}
          value={`${metrics.completionRate}%`}
          detail={t("finance.todayTasksDetail", { count: metrics.todayTasks })}
        />
        <MetricCard
          icon={PackageCheck}
          label={t("finance.materialsPurchased", "Materials purchased")}
          value={String(metrics.purchasedMaterials)}
          detail={t("finance.pendingMaterialsDetail", { count: metrics.pendingMaterials })}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <SectionHeader
            title={t("finance.taskProgressTitle", "Task activity")}
            subtitle={t("finance.taskProgressSubtitle", "Completed tasks per week across all projects.")}
          />
          <WeeklyTasksChart tasks={tasks} />
        </Card>

        <Card>
          <SectionHeader
            title={t("finance.recentPurchasesTitle", "Recently purchased materials")}
            subtitle={t("finance.recentPurchasesSubtitle", "Last materials marked as purchased.")}
          />
          {recentMaterialsPurchased.length ? (
            <div className="mt-4 space-y-2">
              {recentMaterialsPurchased.map((req) => (
                <div key={req.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <PackagePlus size={15} className="shrink-0 text-brand-600" />
                    <div className="min-w-0">
                      <p className="break-anywhere text-sm text-slate-900">{req.itemName}</p>
                      {req.projectName ? (
                        <p className="text-xs text-slate-400">{req.projectName}</p>
                      ) : null}
                    </div>
                  </div>
                  {req.quantity ? (
                    <span className="shrink-0 text-xs text-slate-500">{req.quantity}</span>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 px-5 py-8 text-center">
              <PackageCheck size={22} className="mx-auto text-slate-300" />
              <p className="mt-3 text-sm text-slate-400">
                {t("finance.noPurchasesYet", "No materials marked as purchased yet.")}
              </p>
            </div>
          )}
        </Card>
      </div>

      <RatesAndBudgetsSection />
    </div>
  );
}
