import { CalendarDays, CheckCircle2, Clock3, Map, MapPin, MessageSquare, Search, Users2 } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import { previewChatMessages, previewMarketResults, previewPillKeys, previewSchedule, previewWorkers } from "./landingData";

export default function LandingProductPreview() {
  const { t } = useI18n();

  return (
    <div className="glass-panel rounded-[36px] p-5 sm:p-6">
      <div className="rounded-[30px] border border-slate-200/80 bg-slate-950 p-4 text-white sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-brand-300">{t("landing.preview.eyebrow")}</p>
            <h2 className="mt-2 text-2xl">{t("landing.preview.title")}</h2>
          </div>
          <div className="rounded-2xl bg-white/10 px-3 py-2 text-xs text-white/70">{t("landing.preview.badge")}</div>
        </div>

        <div className="mt-5 rounded-[24px] bg-gradient-to-r from-brand-800 via-brand-700 to-brand-500 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">{t("landing.preview.glanceEyebrow")}</p>
              <p className="mt-2 text-lg">{t("landing.preview.glanceTitle")}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {previewPillKeys.map((pillKey) => (
                <span key={pillKey} className="rounded-full bg-white/15 px-3 py-1.5">
                  {t(`landing.preview.pills.${pillKey}`)}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <article className="rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-brand-500/15 p-2.5 text-brand-300">
                  <Users2 size={18} />
                </div>
                <div>
                  <p className="text-sm text-white/60">{t("landing.preview.workers.label")}</p>
                  <p className="text-base">{t("landing.preview.workers.title")}</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">
                {t("landing.preview.workers.badge")}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {previewWorkers.map((workerId, index) => {
                const status = index === 1 ? "Off Site" : "On Site";
                return (
                  <div key={workerId} className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 px-3 py-3">
                    <div>
                      <p className="text-sm">{t(`seed.previewWorkers.${workerId}.name`)}</p>
                      <p className="mt-1 text-xs text-white/45">{t(`seed.previewWorkers.${workerId}.role`)}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        status === "On Site" ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-500/20 text-slate-300"
                      }`}
                    >
                      {t(`statusLabels.${status.toLowerCase()}`)}
                    </span>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-brand-500/15 p-2.5 text-brand-300">
                <CalendarDays size={18} />
              </div>
              <div>
                <p className="text-sm text-white/60">{t("landing.preview.calendar.label")}</p>
                <p className="text-base">{t("landing.preview.calendar.title")}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {previewSchedule.map((taskId) => (
                <div key={taskId} className="rounded-2xl bg-white/5 px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm">{t(`seed.tasks.${taskId}.title`)}</p>
                    <div className="inline-flex items-center gap-1.5 text-xs text-brand-300">
                      <Clock3 size={12} />
                      {t(`seed.previewSchedule.${taskId}.time`)}
                    </div>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/45">
                    <MapPin size={12} />
                    {t(`seed.previewSchedule.${taskId}.site`)}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-brand-500/15 p-2.5 text-brand-300">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <p className="text-sm text-white/60">{t("landing.preview.chat.label")}</p>
                  <p className="text-base">{t("landing.preview.chat.title")}</p>
                </div>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">{t("landing.preview.chat.badge")}</span>
            </div>

            <div className="mt-4 space-y-3">
              {previewChatMessages.map((messageKey, index) => (
                <div
                  key={messageKey}
                  className={`rounded-2xl px-3 py-3 text-sm ${
                    index === 1 ? "bg-brand-500/15 text-white" : "bg-white/5 text-white/75"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                    {t(`landing.preview.chat.${messageKey}.author`)}
                  </p>
                  <p className="mt-2 leading-6">{t(`landing.preview.chat.${messageKey}.text`)}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-brand-500/15 p-2.5 text-brand-300">
                <Map size={18} />
              </div>
              <div>
                <p className="text-sm text-white/60">{t("landing.preview.market.label")}</p>
                <p className="text-base">{t("landing.preview.market.title")}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-white/5 px-3 py-3">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Search size={14} />
                <span>{t("landing.preview.market.search")}</span>
              </div>
            </div>

            <div className="mt-3 space-y-3">
              {previewMarketResults.map((resultKey) => (
                <div key={resultKey} className="rounded-2xl bg-white/5 px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm">{t(`landing.preview.market.${resultKey}.store`)}</p>
                    <div className="inline-flex items-center gap-1.5 text-xs text-emerald-300">
                      <CheckCircle2 size={12} />
                      {t(`landing.preview.market.${resultKey}.badge`)}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs text-white/45">
                    <span>{t(`landing.preview.market.${resultKey}.meta`)}</span>
                    <span>{t(`landing.preview.market.${resultKey}.price`)}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
