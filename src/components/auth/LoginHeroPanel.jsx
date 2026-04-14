import logoFull from "../../assets/logo-full.svg";
import { useI18n } from "../../hooks/useI18n";

export default function LoginHeroPanel() {
  const { t } = useI18n();

  return (
    <section className="max-w-xl">
      <p className="text-xs uppercase tracking-[0.28em] text-brand-700/75">{t("login.workspaceEyebrow")}</p>
      <img src={logoFull} alt={t("app.name")} className="mt-4 h-11 w-auto sm:h-12" />
      <h1 className="mt-8 max-w-lg text-4xl leading-tight text-slate-950 sm:text-5xl">{t("login.title")}</h1>
      <p className="mt-4 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">{t("login.subtitle")}</p>

      <div className="mt-8 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
        <div className="rounded-3xl border border-white/70 bg-white/75 px-4 py-4 shadow-soft">
          {t("login.featureWorkspaceAccess", "One company workspace with admin access.")}
        </div>
        <div className="rounded-3xl border border-white/70 bg-white/75 px-4 py-4 shadow-soft">
          {t("login.featureEmployeeCredentials", "Separate employee logins for each crew member.")}
        </div>
        <div className="rounded-3xl border border-white/70 bg-white/75 px-4 py-4 shadow-soft">
          {t("login.featureRoleViews", "Each role opens its own working view after sign-in.")}
        </div>
      </div>
    </section>
  );
}
