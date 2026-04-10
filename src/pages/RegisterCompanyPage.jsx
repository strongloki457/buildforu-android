import { ArrowRight, CheckCircle2, Mail, ShieldCheck, Sparkles, Users2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PublicShell from "../components/marketing/PublicShell";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "../hooks/useI18n";

const availablePlans = ["starter", "pro", "enterprise"];

function sanitizeCompanyName(value) {
  const slug = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || "trial";
}

function normalizePlan(value) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

  if (normalized === "starter") {
    return "starter";
  }

  if (normalized === "enterprise") {
    return "enterprise";
  }

  return "pro";
}

export default function RegisterCompanyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useI18n();
  const [form, setForm] = useState({
    companyName: "",
    ownerName: "",
    email: "",
    password: "",
    plan: availablePlans.includes(normalizePlan(location.state?.plan)) ? normalizePlan(location.state?.plan) : "pro"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const helperEmail = useMemo(() => {
    if (form.email.trim()) {
      return form.email.trim();
    }

    return `boss+${sanitizeCompanyName(form.companyName)}@buildforu.com`;
  }, [form.companyName, form.email]);

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const adminTrialEmail =
      form.email.toLowerCase().includes("boss") || form.email.toLowerCase().includes("admin")
        ? form.email
        : `boss+${sanitizeCompanyName(form.companyName)}@buildforu.com`;

    try {
      await login({
        email: adminTrialEmail,
        password: form.password || "buildforu",
        rememberMe: true
      });

      navigate("/dashboard", { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicShell>
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.02fr)_420px] lg:items-start">
        <div className="glass-panel order-1 rounded-[34px] p-6 sm:p-8">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.26em] text-brand-700/75">{t("register.eyebrow")}</p>
            <h1 className="mt-4 text-3xl leading-tight text-slate-950 sm:text-4xl">{t("register.title")}</h1>
            <p className="mt-3 text-base leading-7 text-slate-600">{t("register.subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm text-slate-600">{t("register.companyName")}</span>
              <input
                type="text"
                required
                value={form.companyName}
                onChange={(event) => handleChange("companyName", event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm text-slate-600">{t("register.ownerName")}</span>
                <input
                  type="text"
                  value={form.ownerName}
                  onChange={(event) => handleChange("ownerName", event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-slate-600">{t("login.email")}</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
                />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm text-slate-600">{t("login.password")}</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => handleChange("password", event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-slate-600">{t("register.plan")}</span>
              <select
                value={form.plan}
                onChange={(event) => handleChange("plan", event.target.value)}
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

        <aside className="order-2 space-y-4 lg:sticky lg:top-6">
          <div className="rounded-[34px] border border-white/70 bg-white/84 p-6 shadow-soft">
            <div className="inline-flex rounded-2xl bg-brand-50 p-3 text-brand-700">
              <Sparkles size={18} />
            </div>
            <p className="mt-5 text-xs uppercase tracking-[0.24em] text-brand-700/75">{t("register.onboardingEyebrow")}</p>
            <h2 className="mt-3 text-2xl text-slate-950">{t("register.onboardingTitle")}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{t("register.onboardingSubtitle")}</p>

            <div className="mt-6 space-y-3">
              {[CheckCircle2, Users2, ShieldCheck].map((Icon, index) => {
                const step = index + 1;
                return (
                  <div key={step} className="flex items-start gap-3 rounded-[22px] bg-slate-50/90 px-4 py-4">
                    <Icon size={18} className="mt-0.5 text-brand-700" />
                    <div>
                      <p className="text-sm text-slate-900">{t(`register.steps.${step}.title`)}</p>
                      <p className="mt-1 text-sm text-slate-500">{t(`register.steps.${step}.description`)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[34px] border border-brand-100 bg-gradient-to-b from-brand-50 via-white to-white p-6 shadow-soft">
            <p className="text-xs uppercase tracking-[0.24em] text-brand-700/75">{t("register.selectedPlan")}</p>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl text-slate-950">{t(`plans.${form.plan}`)}</h3>
                <p className="mt-2 text-sm text-slate-500">{t(`register.planCards.${form.plan}.price`)}</p>
              </div>
              <div className="rounded-2xl bg-white px-3 py-2 text-xs text-brand-700 shadow-soft">
                {t(`register.planCards.${form.plan}.workers`)}
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">{t(`register.planCards.${form.plan}.note`)}</p>

            <div className="mt-5 rounded-[24px] bg-white/90 px-4 py-4">
              <div className="flex items-start gap-3">
                <Mail size={17} className="mt-0.5 text-brand-700" />
                <div>
                  <p className="text-sm text-slate-900">{t("register.workspaceSignIn")}</p>
                  <p className="mt-1 text-sm text-slate-500">{helperEmail}</p>
                </div>
              </div>
            </div>

            <p className="mt-5 text-sm text-slate-500">{t("register.dashboardPreviewNote")}</p>
          </div>
        </aside>
      </section>
    </PublicShell>
  );
}
