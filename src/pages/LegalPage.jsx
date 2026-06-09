import PublicShell from "../components/marketing/PublicShell";
import { useI18n } from "../hooks/useI18n";

export default function LegalPage({ type }) {
  const { t } = useI18n();
  const contentKey = type === "privacy" ? "legal.privacy" : "legal.terms";
  const sections = t(`${contentKey}.sections`);

  return (
    <PublicShell>
      <section className="mx-auto max-w-3xl rounded-[34px] border border-white/70 bg-white/88 p-6 shadow-soft sm:p-8">
        <p className="text-xs uppercase tracking-[0.26em] text-brand-700/75">{t("legal.eyebrow")}</p>
        <h1 className="mt-4 text-3xl leading-tight text-slate-950 sm:text-4xl">{t(`${contentKey}.title`)}</h1>
        <p className="mt-2 text-xs text-slate-400">{t(`${contentKey}.lastUpdated`)}</p>

        <div className="mt-8 space-y-8">
          {Array.isArray(sections)
            ? sections.map((section, i) => (
                <div key={i}>
                  <h2 className="text-base font-semibold text-slate-800">{section.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{section.body}</p>
                </div>
              ))
            : null}
        </div>
      </section>
    </PublicShell>
  );
}
