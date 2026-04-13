import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "../../hooks/useI18n";

export default function LandingCta() {
  const { t } = useI18n();

  return (
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
  );
}
