import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "../../hooks/useI18n";
import { landingStatKeys } from "./landingData";
import LandingProductPreview from "./LandingProductPreview";

export default function LandingHero() {
  const { t } = useI18n();

  return (
    <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.28em] text-brand-700/75">{t("landing.eyebrow")}</p>
        <h1 className="mt-6 text-3xl leading-tight text-slate-950 sm:text-5xl lg:text-6xl">{t("landing.title")}</h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">{t("landing.subtitle")}</p>

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
          {landingStatKeys.map((cardKey) => (
            <div key={cardKey} className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-soft">
              <p className="text-sm text-slate-500">{t(`landing.stats.${cardKey}.label`)}</p>
              <p className="mt-3 text-2xl text-slate-950">{t(`landing.stats.${cardKey}.value`)}</p>
            </div>
          ))}
        </div>
      </div>

      <LandingProductPreview />
    </section>
  );
}
