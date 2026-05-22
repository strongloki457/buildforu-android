import { Check, Star } from "lucide-react";
import { Link } from "react-router-dom";
import PublicShell from "../components/marketing/PublicShell";
import { useI18n } from "../hooks/useI18n";

const planIds = ["starter", "pro", "enterprise"];

export default function PricingPage() {
  const { t } = useI18n();

  return (
    <PublicShell>
      <section className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-brand-700/75">{t("pricing.eyebrow")}</p>
        <h1 className="mt-5 text-5xl leading-tight text-slate-950 sm:text-6xl">{t("pricing.title")}</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">{t("pricing.subtitle")}</p>
      </section>

      <section className="mt-12 grid gap-5 xl:grid-cols-3">
        {planIds.map((planId) => {
          const highlighted = planId === "pro";
          const isEnterprise = planId === "enterprise";

          const ctaProps = isEnterprise
            ? { as: "a", href: "mailto:kontakt@buildforu.pl" }
            : { as: Link, to: "/register-company", state: { plan: planId } };

          const CtaElement = ctaProps.as;

          return (
            <article
              key={planId}
              className={`rounded-[34px] border p-6 shadow-soft ${
                highlighted
                  ? "border-brand-200 bg-gradient-to-b from-brand-50 via-white to-white"
                  : "border-white/70 bg-white/86"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl text-slate-950">{t(`plans.${planId}`)}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{t(`pricing.plans.${planId}.subtitle`)}</p>
                </div>
                {highlighted ? (
                  <div className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-3 py-1.5 text-xs text-white">
                    <Star size={12} />
                    {t("pricing.mostPopular")}
                  </div>
                ) : null}
              </div>

              <div className="mt-8">
                <p className="text-4xl text-slate-950">{t(`pricing.plans.${planId}.price`)}</p>
                <p className="mt-2 text-sm text-slate-500">{t("pricing.perMonth")}</p>
              </div>

              <div className="mt-6 rounded-[24px] bg-slate-50/90 px-4 py-4 text-sm text-slate-700">
                {t(`pricing.plans.${planId}.workers`)}
              </div>

              <div className="mt-6 space-y-3">
                {[1, 2, 3, 4].map((featureIndex) => (
                  <div key={`${planId}-${featureIndex}`} className="flex items-start gap-3 text-sm text-slate-600">
                    <div className="mt-0.5 rounded-full bg-brand-50 p-1 text-brand-700">
                      <Check size={12} />
                    </div>
                    <span>{t(`pricing.plans.${planId}.features.${featureIndex}`)}</span>
                  </div>
                ))}
              </div>

              <CtaElement
                {...(isEnterprise ? { href: ctaProps.href } : { to: ctaProps.to, state: ctaProps.state })}
                className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3.5 text-sm transition ${
                  highlighted
                    ? "bg-brand-700 text-white hover:bg-brand-600"
                    : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                }`}
              >
                {isEnterprise ? t("pricing.contactUs", "Kontakt") : t("pricing.choosePlan")}
              </CtaElement>
            </article>
          );
        })}
      </section>
    </PublicShell>
  );
}
