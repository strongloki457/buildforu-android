import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import { previewSchedule } from "./landingData";

export default function PreviewScheduleCard() {
  const { t } = useI18n();

  return (
    <article className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-brand-50 p-2.5 text-brand-700">
          <CalendarDays size={18} />
        </div>
        <div>
          <p className="text-sm text-slate-500">{t("landing.preview.calendar.label")}</p>
          <p className="text-base text-slate-900">{t("landing.preview.calendar.title")}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {previewSchedule.map((taskId) => (
          <div key={taskId} className="rounded-2xl bg-slate-50 px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-900">{t(`seed.tasks.${taskId}.title`)}</p>
              <div className="inline-flex items-center gap-1.5 text-xs text-brand-700">
                <Clock3 size={12} />
                {t(`seed.previewSchedule.${taskId}.time`)}
              </div>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin size={12} />
              {t(`seed.previewSchedule.${taskId}.site`)}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
