import { ArrowRight, CalendarDays, ClipboardList, UserPlus } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";

const STEPS = [
  { icon: UserPlus, step: 1, key: "register" },
  { icon: ClipboardList, step: 2, key: "setup" },
  { icon: CalendarDays, step: 3, key: "manage" }
];

export default function LandingHowItWorks() {
  const { t } = useI18n();

  return (
    <section className="mt-16">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.28em] text-brand-700/75">
          {t("landing.howEyebrow", "Getting started")}
        </p>
        <h2 className="mt-4 text-3xl text-slate-950 sm:text-4xl">
          {t("landing.howTitle", "Up and running in under 5 minutes")}
        </h2>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {STEPS.map(({ icon: Icon, step, key }, index) => (
          <div key={key} className="relative flex gap-5 rounded-[30px] border border-white/70 bg-white/82 p-6 shadow-soft">
            <div className="flex shrink-0 flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-700 text-white text-sm font-medium">
                {step}
              </div>
              {index < STEPS.length - 1 ? (
                <div className="mt-3 hidden h-full w-px bg-brand-100 md:block" />
              ) : null}
            </div>
            <div>
              <div className="inline-flex rounded-xl bg-brand-50 p-2.5 text-brand-700">
                <Icon size={18} />
              </div>
              <h3 className="mt-4 text-lg text-slate-950">
                {t(`landing.how.${key}.title`, key)}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {t(`landing.how.${key}.description`, "")}
              </p>
            </div>
            {index < STEPS.length - 1 ? (
              <ArrowRight size={16} className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-brand-300 md:block" />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
