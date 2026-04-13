import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { availablePlans } from "./authData";
import { useI18n } from "../../hooks/useI18n";

export default function RegisterFormPanel({ form, isSubmitting, onChange, onSubmit }) {
  const { t } = useI18n();

  return (
    <div className="glass-panel order-1 rounded-[34px] p-6 sm:p-8">
      <div className="max-w-xl">
        <p className="text-xs uppercase tracking-[0.26em] text-brand-700/75">{t("register.eyebrow")}</p>
        <h1 className="mt-4 text-3xl leading-tight text-slate-950 sm:text-4xl">{t("register.title")}</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">{t("register.subtitle")}</p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm text-slate-600">{t("register.companyName")}</span>
          <input
            type="text"
            required
            value={form.companyName}
            onChange={(event) => onChange("companyName", event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
          />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm text-slate-600">{t("register.ownerName")}</span>
            <input
              type="text"
              value={form.ownerName}
              onChange={(event) => onChange("ownerName", event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-600">{t("login.email")}</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => onChange("email", event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm text-slate-600">{t("login.password")}</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => onChange("password", event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-600">{t("register.plan")}</span>
          <select
            value={form.plan}
            onChange={(event) => onChange("plan", event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
          >
            {availablePlans.map((planId) => (
              <option key={planId} value={planId}>
                {t(`plans.${planId}`)}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-700 px-4 py-3.5 text-sm text-white shadow-[0_18px_36px_-24px_rgba(20,83,45,0.9)] transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? t("register.creatingWorkspace") : t("register.createAccount")}
          <ArrowRight size={16} />
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-500">
        {t("register.alreadyTesting")}{" "}
        <Link to="/login" className="font-medium text-brand-700 transition hover:text-brand-600">
          {t("register.goToSignIn")}
        </Link>
      </p>
    </div>
  );
}
