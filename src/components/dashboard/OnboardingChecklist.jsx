import { CheckCircle2, Circle, ChevronRight, X, Rocket } from "lucide-react";
import { useState } from "react";
import { useI18n } from "../../hooks/useI18n";

const STORAGE_KEY = "buildforu-onboarding-dismissed";

export default function OnboardingChecklist({ workers, projects, tasks, onAddWorker, onAddProject, onAddTask }) {
  const { t } = useI18n();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");

  const steps = [
    {
      id: "worker",
      label: t("onboarding.addWorker", "Add your first worker"),
      description: t("onboarding.addWorkerDesc", "Register crew members and give them access to the app."),
      done: workers.length > 0,
      action: onAddWorker,
      actionLabel: t("workers.addWorker", "Add worker")
    },
    {
      id: "project",
      label: t("onboarding.addProject", "Create your first project"),
      description: t("onboarding.addProjectDesc", "Set up a job site to track tasks and materials."),
      done: projects.length > 0,
      action: onAddProject,
      actionLabel: t("projects.addProjectAction", "Create project")
    },
    {
      id: "task",
      label: t("onboarding.addTask", "Assign the first task"),
      description: t("onboarding.addTaskDesc", "Schedule work and put it on the team calendar."),
      done: tasks.length > 0,
      action: onAddTask,
      actionLabel: t("calendar.addTask", "Add task")
    }
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const allDone = completedCount === steps.length;

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  };

  if (dismissed || allDone) return null;

  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="rounded-[28px] border border-brand-100 bg-gradient-to-br from-brand-50/60 to-white/80 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white">
            <Rocket size={18} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-900">
              {t("onboarding.title", {
                done: completedCount,
                total: steps.length
              })}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {t("onboarding.subtitle", "Complete these steps to get the most out of BuildForU.")}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 rounded-xl p-2 text-slate-400 hover:bg-white/60 hover:text-slate-600 transition"
          aria-label={t("common.dismiss", "Dismiss")}
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/70">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`rounded-2xl border p-4 transition ${
              step.done
                ? "border-green-200 bg-green-50/60"
                : "border-white/70 bg-white/60 hover:bg-white/80"
            }`}
          >
            <div className="flex items-start gap-2.5">
              {step.done ? (
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-500" />
              ) : (
                <Circle size={18} className="mt-0.5 shrink-0 text-slate-300" />
              )}
              <div className="min-w-0">
                <p className={`text-sm ${step.done ? "text-green-800 line-through decoration-green-400" : "text-slate-900"}`}>
                  {step.label}
                </p>
                {!step.done ? (
                  <>
                    <p className="mt-1 text-xs leading-4 text-slate-500">{step.description}</p>
                    <button
                      type="button"
                      onClick={step.action}
                      className="mt-3 inline-flex items-center gap-1 rounded-xl bg-brand-600 px-3 py-1.5 text-xs text-white hover:bg-brand-700 transition"
                    >
                      {step.actionLabel}
                      <ChevronRight size={12} />
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
