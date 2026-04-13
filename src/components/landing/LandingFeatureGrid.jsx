import { CalendarDays, Map, MessageSquare, Users2 } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import { landingFeatureKeys } from "./landingData";

const featureIcons = {
  calendar: CalendarDays,
  chat: MessageSquare,
  marketMap: Map,
  workers: Users2
};

export default function LandingFeatureGrid() {
  const { t } = useI18n();

  return (
    <section className="mt-16">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.28em] text-brand-700/75">{t("landing.featuresEyebrow")}</p>
        <h2 className="mt-4 text-3xl text-slate-950 sm:text-4xl">{t("landing.featuresTitle")}</h2>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {landingFeatureKeys.map((featureKey) => {
          const Icon = featureIcons[featureKey];

          return (
            <article key={featureKey} className="rounded-[30px] border border-white/70 bg-white/82 p-6 shadow-soft">
              <div className="inline-flex rounded-2xl bg-brand-50 p-3 text-brand-700">
                <Icon size={20} />
              </div>
              <h3 className="mt-5 text-xl text-slate-950">{t(`landing.features.${featureKey}.title`)}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{t(`landing.features.${featureKey}.description`)}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
