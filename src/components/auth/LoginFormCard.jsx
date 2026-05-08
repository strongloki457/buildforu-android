import { demoAccounts } from "./authData";
import { useI18n } from "../../hooks/useI18n";

export default function LoginFormCard({
  detectedRole,
  error,
  form,
  isSubmitting,
  onChange,
  onSelectDemoAccount,
  onSubmit
}) {
  const { t } = useI18n();

  return (
    <section className="flex items-center lg:justify-end">
      <div className="w-full rounded-[32px] border border-slate-200/80 bg-white/92 p-6 shadow-[0_28px_70px_-44px_rgba(15,23,42,0.38)] backdrop-blur sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{t("login.accessNote")}</p>
            <h2 className="mt-3 text-3xl text-slate-950">{t("login.button")}</h2>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-brand-50 px-3 py-2 text-xs uppercase tracking-[0.22em] text-brand-700">
            {t("app.name")}
          </div>
        </div>

        <div className="mt-5 inline-flex rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-xs text-brand-800">
          {t("login.detectedRole")}: {t(`roles.${detectedRole}`)}
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-600">{t("login.email")}</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={(event) => onChange("email", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-600">{t("login.password")}</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={(event) => onChange("password", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            />
          </label>

          <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.rememberMe}
                onChange={(event) => onChange("rememberMe", event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
              />
              <span>{t("login.rememberMe")}</span>
            </label>

            <a
              href="mailto:support@buildforu.com?subject=BuildForU%20Password%20Reset"
              className="font-medium text-brand-700 transition hover:text-brand-600"
            >
              {t("login.forgotPassword")}
            </a>
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-brand-700 px-4 py-3.5 text-sm text-white shadow-[0_18px_36px_-24px_rgba(20,83,45,0.9)] transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? t("login.loading") : t("login.button")}
          </button>
        </form>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50/85 p-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-slate-900">{t("login.demoAccounts")}</p>
            <p className="text-sm text-slate-500">{t("login.helper")}</p>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => onSelectDemoAccount(account)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 transition hover:border-brand-200 hover:bg-brand-50"
              >
                <span className="block text-slate-950">{account.email}</span>
                <span className="mt-1 block text-xs text-slate-500">{account.name}</span>
                <span className="mt-2 block text-xs uppercase tracking-[0.18em] text-slate-400">
                  {t(`roles.${account.role}`)}
                </span>
                <span className="mt-1 block text-xs text-slate-500">{account.companyName}</span>
                <span className="mt-3 inline-flex rounded-full bg-brand-50 px-3 py-1 text-[11px] text-brand-700">
                  {t("login.password", "Password")}: {account.password}
                </span>
              </button>
            ))}
          </div>

          <p className="mt-4 text-xs text-slate-500">
            {t("login.mockCredentialsHint", "These example accounts must exist in the backend seed data.")}
          </p>
        </div>
      </div>
    </section>
  );
}
