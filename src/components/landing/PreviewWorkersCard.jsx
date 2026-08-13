import { Users2 } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import { previewWorkers } from "./landingData";

export default function PreviewWorkersCard() {
  const { t } = useI18n();

  return (
    <article className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-50 p-2.5 text-brand-700">
            <Users2 size={18} />
          </div>
          <div>
            <p className="text-sm text-slate-500">{t("landing.preview.workers.label")}</p>
            <p className="text-base text-slate-900">{t("landing.preview.workers.title")}</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
          {t("landing.preview.workers.badge")}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {previewWorkers.map((workerId, index) => {
          const status = index === 1 ? "Off Site" : "On Site";
          return (
            <div key={workerId} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-3">
              <div>
                <p className="text-sm text-slate-900">{t(`seed.previewWorkers.${workerId}.name`)}</p>
                <p className="mt-1 text-xs text-slate-500">{t(`seed.previewWorkers.${workerId}.role`)}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs ${
                  status === "On Site" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                }`}
              >
                {t(`statusLabels.${status.toLowerCase()}`)}
              </span>
            </div>
          );
        })}
      </div>
    </article>
  );
}
