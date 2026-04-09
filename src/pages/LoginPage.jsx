import { Building2, HardHat, ShieldCheck, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logoApp from "../assets/logo-app.svg";
import logoFull from "../assets/logo-full.svg";
import Button from "../components/ui/Button";
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
    password: "buildforu"
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
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.28),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(20,83,45,0.45),transparent_35%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[36px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl sm:p-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <img src={logoFull} alt={t("app.name")} className="h-11 w-auto sm:h-14" />
              <div className="mt-5 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
                <Sparkles size={16} />
                {t("app.commandCenter")}
              </div>
            </div>

            <div className="hidden rounded-[34px] border border-white/10 bg-white/5 p-4 shadow-[0_28px_80px_-40px_rgba(34,197,94,0.7)] lg:block">
              <img src={logoApp} alt={t("app.name")} className="h-36 w-36 xl:h-44 xl:w-44" />
            </div>
          </div>

          <div className="mt-8 max-w-2xl">
            <h1 className="text-5xl leading-tight text-white sm:text-6xl">{t("login.title")}</h1>
            <p className="mt-5 text-lg leading-8 text-white/70">{t("login.subtitle")}</p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
              <HardHat className="text-brand-300" size={22} />
              <p className="mt-5 text-2xl">126</p>
              <p className="mt-2 text-sm text-white/60">{t("login.liveAssignments")}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
              <Building2 className="text-brand-300" size={22} />
              <p className="mt-5 text-2xl">18</p>
              <p className="mt-2 text-sm text-white/60">{t("login.projectsInDelivery")}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
              <ShieldCheck className="text-brand-300" size={22} />
              <p className="mt-5 text-2xl">98%</p>
              <p className="mt-2 text-sm text-white/60">{t("login.scheduleReliability")}</p>
            </div>
          </div>

          <div className="mt-10 rounded-[32px] border border-white/10 bg-gradient-to-br from-brand-700/50 via-brand-800/50 to-slate-950/70 p-6 soft-ring">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-200">{t("login.previewAccess")}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {demoAccounts.map((account) => (
                <button
                  key={account.label}
                  onClick={() => setForm({ email: account.label, password: "buildforu" })}
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm transition hover:bg-white/15"
                >
                  {account.label}
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm text-white/60">{t("login.helper")}</p>
          </div>
        </section>

        <section className="flex items-center">
          <div className="glass-panel w-full rounded-[36px] p-8 text-slate-900 sm:p-10">
            <div className="rounded-[28px] bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-white/70">{t("app.tagline")}</p>
                  <p className="text-xs uppercase tracking-[0.25em] text-white/60">{t("login.detectedRole")}</p>
                  <h2 className="mt-2 text-3xl">{t(`roles.${detectedRole}`)}</h2>
                </div>
                <img src={logoApp} alt={t("app.name")} className="hidden h-16 w-16 rounded-[20px] bg-white/10 p-1.5 sm:block" />
              </div>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div className="rounded-3xl bg-white/10 px-4 py-3 text-sm">{t("login.mockPassword")}</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-500">{t("login.email")}</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  className="w-full rounded-[24px] border border-slate-200 bg-white px-4 py-4 outline-none transition focus:border-brand-300"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-500">{t("login.password")}</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => handleChange("password", event.target.value)}
                  className="w-full rounded-[24px] border border-slate-200 bg-white px-4 py-4 outline-none transition focus:border-brand-300"
                />
              </label>

              {error ? <p className="text-sm text-rose-600">{error}</p> : null}

              <Button type="submit" className="w-full py-4" disabled={isSubmitting}>
                {isSubmitting ? t("login.loading") : t("login.button")}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
