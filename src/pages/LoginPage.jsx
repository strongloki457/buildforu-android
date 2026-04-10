import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logoFull from "../assets/logo-full.svg";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "../hooks/useI18n";

const demoAccounts = [
  { label: "boss@buildforu.com", role: "admin" },
  { label: "worker@buildforu.com", role: "employee" }
];

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: "boss@buildforu.com",
    password: "buildforu",
    rememberMe: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const detectedRole = useMemo(() => {
    const value = form.email.toLowerCase();
    return value.includes("boss") || value.includes("admin") ? "admin" : "employee";
  }, [form.email]);

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await login(form);
      const destination = location.state?.from?.pathname || "/dashboard";
      navigate(destination, { replace: true });
    } catch (issue) {
      setError(t(issue.message, issue.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f7f3] px-4 py-6 text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(20,83,45,0.12),transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,83,45,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,83,45,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center">
        <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center">
          <section className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.28em] text-brand-700/75">
              {t("login.workspaceEyebrow")}
            </p>
            <img src={logoFull} alt={t("app.name")} className="mt-4 h-11 w-auto sm:h-12" />
            <h1 className="mt-8 max-w-lg text-4xl leading-tight text-slate-950 sm:text-5xl">
              {t("login.title")}
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
              {t("login.subtitle")}
            </p>

            <div className="mt-8 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/70 bg-white/75 px-4 py-4 shadow-soft">
                {t("login.featureAdmin")}
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/75 px-4 py-4 shadow-soft">
                {t("login.featureOps")}
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/75 px-4 py-4 shadow-soft">
                {t("login.featureI18n")}
              </div>
            </div>
          </section>

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

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-600">{t("login.email")}</span>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) => handleChange("email", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-slate-600">{t("login.password")}</span>
                  <input
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(event) => handleChange("password", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  />
                </label>

                <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.rememberMe}
                      onChange={(event) => handleChange("rememberMe", event.target.checked)}
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
                      key={account.label}
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          email: account.label,
                          password: "buildforu"
                        }))
                      }
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 transition hover:border-brand-200 hover:bg-brand-50"
                    >
                      <span className="block text-slate-950">{account.label}</span>
                      <span className="mt-1 block text-xs uppercase tracking-[0.18em] text-slate-400">
                        {t(`roles.${account.role}`)}
                      </span>
                    </button>
                  ))}
                </div>

                <p className="mt-4 text-xs text-slate-500">{t("login.mockPassword")}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
