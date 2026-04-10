import { ArrowRight, Building2, Mail, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PublicShell from "../components/marketing/PublicShell";
import { useAuth } from "../hooks/useAuth";

const availablePlans = ["Starter", "Pro", "Enterprise"];

function sanitizeCompanyName(value) {
  const slug = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || "trial";
}

export default function RegisterCompanyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    companyName: "",
    ownerName: "",
    email: "",
    password: "",
    plan: availablePlans.includes(location.state?.plan) ? location.state.plan : "Pro"
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

    const adminTrialEmail = form.email.toLowerCase().includes("boss") || form.email.toLowerCase().includes("admin")
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
      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="max-w-xl">
          <p className="text-xs uppercase tracking-[0.28em] text-brand-700/75">Register your company</p>
          <h1 className="mt-5 text-4xl leading-tight text-slate-950 sm:text-5xl">
            Launch your BuildForU workspace with a mock SaaS onboarding flow.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Set up your company, pick a plan, and move straight into the existing dashboard experience.
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-[28px] border border-white/70 bg-white/82 p-5 shadow-soft">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                  <Building2 size={18} />
                </div>
                <div>
                  <p className="text-base text-slate-950">Company-ready onboarding</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Capture your business name, owner details and preferred plan in one clean registration flow.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/70 bg-white/82 p-5 shadow-soft">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-base text-slate-950">Mock admin access</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    This prototype logs you into the admin experience after registration so you can preview the product immediately.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/70 bg-white/82 p-5 shadow-soft">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-base text-slate-950">Trial workspace identity</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">Mock admin sign-in will use: {helperEmail}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-[34px] p-6 sm:p-8">
          <div className="max-w-xl">
            <p className="text-sm text-slate-500">Start your free trial</p>
            <h2 className="mt-3 text-3xl text-slate-950">Create company workspace</h2>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm text-slate-600">Company name</span>
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
                <span className="text-sm text-slate-600">Owner name</span>
                <input
                  type="text"
                  value={form.ownerName}
                  onChange={(event) => handleChange("ownerName", event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm text-slate-600">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
                />
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-sm text-slate-600">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => handleChange("password", event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-slate-600">Plan</span>
              <select
                value={form.plan}
                onChange={(event) => handleChange("plan", event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
              >
                {availablePlans.map((plan) => (
                  <option key={plan} value={plan}>
                    {plan}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-700 px-4 py-3.5 text-sm text-white shadow-[0_18px_36px_-24px_rgba(20,83,45,0.9)] transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Creating workspace..." : "Create company account"}
              <ArrowRight size={16} />
            </button>
          </form>

          <p className="mt-5 text-sm text-slate-500">
            Already testing the product?{" "}
            <Link to="/login" className="font-medium text-brand-700 transition hover:text-brand-600">
              Go to sign in
            </Link>
          </p>
        </div>
      </section>
    </PublicShell>
  );
}
