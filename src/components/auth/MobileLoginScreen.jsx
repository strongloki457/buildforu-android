import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import logoMark from "../../assets/logo-mark.svg";
import { useI18n } from "../../hooks/useI18n";

export default function MobileLoginScreen({ error, form, isSubmitting, onChange, onSubmit }) {
  const { t } = useI18n();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-white px-6 pb-8 pt-[max(2.5rem,env(safe-area-inset-top))]">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="flex w-full max-w-sm flex-col items-center">
          <img src={logoMark} alt={t("app.name")} className="h-16 w-16 rounded-2xl shadow-soft" />
          <h1 className="mt-5 text-2xl font-semibold text-slate-950">{t("app.name")}</h1>
          <p className="mt-1.5 text-center text-sm text-slate-500">
            {t("login.mobileSubtitle", "Sign in to your workspace")}
          </p>

          <form onSubmit={onSubmit} className="mt-9 w-full space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm text-slate-600">{t("login.email")}</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(event) => onChange("email", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base text-slate-900 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm text-slate-600">{t("login.password")}</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="off"
                  required
                  value={form.password}
                  onChange={(event) => onChange("password", event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-4 pr-14 text-base text-slate-900 outline-none transition focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
                  aria-label={showPassword ? t("register.hidePassword") : t("register.showPassword")}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <div className="flex items-center justify-between text-sm text-slate-600">
              <label className="inline-flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={form.rememberMe}
                  onChange={(event) => onChange("rememberMe", event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
                />
                <span>{t("login.rememberMe")}</span>
              </label>

              <Link to="/forgot-password" className="font-medium text-brand-700">
                {t("login.forgotPassword")}
              </Link>
            </div>

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-brand-700 px-4 text-base font-medium text-white shadow-[0_18px_36px_-24px_rgba(20,83,45,0.9)] transition active:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? t("login.loading") : t("login.button")}
            </button>
          </form>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400">
        {t("login.needHelp", "Need help?")}{" "}
        <a href="mailto:info@buildforu.eu" className="text-brand-700">
          info@buildforu.eu
        </a>
      </p>
    </div>
  );
}
