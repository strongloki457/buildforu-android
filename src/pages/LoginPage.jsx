import { Building2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { demoAccounts } from "../components/auth/authData";
import LoginFormCard from "../components/auth/LoginFormCard";
import LoginHeroPanel from "../components/auth/LoginHeroPanel";
import LanguageSwitcher from "../components/navigation/LanguageSwitcher";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "../hooks/useI18n";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PUBLIC_AUTH_PATHS = new Set(["/login", "/register-company"]);

const ROLE_LABELS = { ADMIN: "Admin", EMPLOYEE: "Pracownik" };

function CompanyPicker({ companies, onSelect, isSubmitting }) {
  return (
    <div className="w-full min-w-0 rounded-[24px] border border-slate-200/80 bg-white/92 p-4 shadow-[0_28px_70px_-44px_rgba(15,23,42,0.38)] backdrop-blur sm:rounded-[32px] sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl text-slate-950 sm:text-3xl">Wybierz firmę</h2>
        <p className="mt-2 text-sm text-slate-500">Twoje konto należy do kilku firm. Wybierz z której chcesz korzystać.</p>
      </div>

      <div className="flex flex-col gap-3">
        {companies.map((company) => (
          <button
            key={company.id}
            type="button"
            disabled={isSubmitting}
            onClick={() => onSelect(company.id)}
            className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-brand-300 hover:bg-brand-50 disabled:opacity-60"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <Building2 size={18} />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-slate-900">{company.name}</p>
              <p className="mt-0.5 text-xs text-slate-500">{ROLE_LABELS[company.role] ?? company.role}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { login, selectCompany } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [pendingCompanies, setPendingCompanies] = useState(null);

  const detectedRole = useMemo(() => {
    const email = form.email.trim().toLowerCase();
    return demoAccounts.find((account) => account.email === email)?.role ?? null;
  }, [form.email]);

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSelectDemoAccount = (account) => {
    const demoPassword = import.meta.env[`VITE_DEMO_PASSWORD_${account.role.toUpperCase()}`] ?? "";
    setForm((current) => ({
      ...current,
      email: account.email,
      password: demoPassword
    }));
  };

  const navigateAfterLogin = () => {
    const requestedPath = location.state?.from?.pathname;
    const destination = requestedPath && !PUBLIC_AUTH_PATHS.has(requestedPath) ? requestedPath : "/dashboard";
    navigate(destination, { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const email = form.email.trim();

    if (!email || !form.password) {
      setError(t("login.requiredError", "Email and password are required."));
      setIsSubmitting(false);
      return;
    }

    if (!EMAIL_PATTERN.test(email)) {
      setError(t("login.validationError", "Enter a valid email address and try again."));
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(form);

      if (result?.requiresCompanySelection) {
        setPendingCompanies(result.companies);
        return;
      }

      navigateAfterLogin();
    } catch (issue) {
      setError(
        issue.message === "login.invalidCredentials"
          ? t("login.invalidCredentials", "Invalid email or password.")
          : t(issue.message, issue.message)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectCompany = async (companyId) => {
    setIsSubmitting(true);
    setError("");
    try {
      await selectCompany(companyId, { rememberMe: form.rememberMe });
      navigateAfterLogin();
    } catch (issue) {
      setError(t(issue.message, issue.message));
      setPendingCompanies(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f7f3] px-3 py-4 text-slate-900 sm:px-4 sm:py-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(20,83,45,0.12),transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,83,45,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,83,45,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50" />

      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-5">
        <LanguageSwitcher />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl items-center sm:min-h-[calc(100vh-3rem)]">
        <div className="grid w-full min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center lg:gap-10">
          <LoginHeroPanel />
          {pendingCompanies ? (
            <section className="flex items-center lg:justify-end">
              <CompanyPicker
                companies={pendingCompanies}
                onSelect={handleSelectCompany}
                isSubmitting={isSubmitting}
              />
            </section>
          ) : (
            <LoginFormCard
              detectedRole={detectedRole}
              error={error}
              form={form}
              isSubmitting={isSubmitting}
              onChange={handleChange}
              onSelectDemoAccount={handleSelectDemoAccount}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
