import { useI18n } from "../../hooks/useI18n";
import { getTaskLocation, getTaskTitle } from "../../utils/localizedValue";

export default function CalendarMobileTaskList({ tasks }) {
  const { t } = useI18n();

  return (
    <div className="space-y-3 md:hidden">
      {tasks.length ? (
        tasks.map((task) => (
          <div key={task.id} className="rounded-[22px] border border-white/70 bg-white/75 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-anywhere text-base text-slate-900">{getTaskTitle(t, task)}</p>
                <p className="break-anywhere mt-2 text-sm text-slate-500">{getTaskLocation(t, task)}</p>
              </div>
              <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">{task.date}</span>
            </div>
          </div>
        ))
      ) : (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/50 p-6 text-sm text-slate-500">
          {t("calendar.emptyMonth")}
        </div>
      )}
    </div>
  );
}
