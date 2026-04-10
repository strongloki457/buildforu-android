import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Map,
  MapPin,
  MessageSquare,
  Search,
  Users2
} from "lucide-react";
import { Link } from "react-router-dom";
import PublicShell from "../components/marketing/PublicShell";
import { useI18n } from "../hooks/useI18n";

export default function LandingPage() {
  const { t } = useI18n();

  const features = [
    { key: "workers", icon: Users2 },
    { key: "calendar", icon: CalendarDays },
    { key: "chat", icon: MessageSquare },
    { key: "marketMap", icon: Map }
  ];

  const workerPreview = ["u-employee-1", "u-employee-2", "u-employee-3"];
  const schedulePreview = ["task-101", "task-102", "task-105"];
  const chatPreview = ["message-1", "message-2"];
  const marketPreview = ["result-1", "result-2"];

  return (
    <PublicShell>
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.28em] text-brand-700/75">{t("landing.eyebrow")}</p>
          <h1 className="mt-6 text-5xl leading-tight text-slate-950 sm:text-6xl">{t("landing.title")}</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">{t("landing.subtitle")}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register-company"
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-700 px-5 py-3.5 text-sm text-white shadow-[0_18px_36px_-24px_rgba(20,83,45,0.9)] transition hover:bg-brand-600"
            >
              {t("publicNav.startTrial")}
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/pricing"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              {t("publicNav.pricing")}
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {["roles", "deployment", "focus"].map((cardKey) => (
              <div key={cardKey} className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-soft">
                <p className="text-sm text-slate-500">{t(`landing.stats.${cardKey}.label`)}</p>
                <p className="mt-3 text-2xl text-slate-950">{t(`landing.stats.${cardKey}.value`)}</p>
              </div>
            ))}
          </div>
        </div>

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
                  {["workers", "tasks", "threads"].map((pillKey) => (
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
                  {workerPreview.map((workerId, index) => {
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
                  {schedulePreview.map((taskId) => (
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
                  {chatPreview.map((messageKey, index) => (
                    <div
                      key={messageKey}
                      className={`rounded-2xl px-3 py-3 text-sm ${
                        index === 1 ? "bg-brand-500/15 text-white" : "bg-white/5 text-white/75"
                      }`}
                    >
                      <p className="text-xs uppercase tracking-[0.18em] text-white/45">{t(`landing.preview.chat.${messageKey}.author`)}</p>
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
                  {marketPreview.map((resultKey, index) => (
                    <div key={resultKey} className="rounded-2xl bg-white/5 px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm">{t(`landing.preview.market.${resultKey}.store`)}</p>
                        <div className="inline-flex items-center gap-1.5 text-xs text-emerald-300">
                          <CheckCircle2 size={12} />
                          {t(`landing.preview.market.${resultKey}.${index === 0 ? "badge" : "badge"}`)}
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
      </section>

      <section className="mt-16">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.28em] text-brand-700/75">{t("landing.featuresEyebrow")}</p>
          <h2 className="mt-4 text-3xl text-slate-950 sm:text-4xl">{t("landing.featuresTitle")}</h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article key={feature.key} className="rounded-[30px] border border-white/70 bg-white/82 p-6 shadow-soft">
                <div className="inline-flex rounded-2xl bg-brand-50 p-3 text-brand-700">
                  <Icon size={20} />
                </div>
                <h3 className="mt-5 text-xl text-slate-950">{t(`landing.features.${feature.key}.title`)}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{t(`landing.features.${feature.key}.description`)}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-16 rounded-[36px] bg-gradient-to-r from-slate-950 via-slate-900 to-brand-900 px-6 py-8 text-white sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.28em] text-brand-300">{t("landing.ctaEyebrow")}</p>
            <h2 className="mt-4 text-3xl sm:text-4xl">{t("landing.ctaTitle")}</h2>
            <p className="mt-4 text-base leading-7 text-white/70">{t("landing.ctaSubtitle")}</p>
          </div>

          <Link
            to="/register-company"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm text-slate-900 transition hover:bg-slate-100"
          >
            {t("publicNav.startTrial")}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
