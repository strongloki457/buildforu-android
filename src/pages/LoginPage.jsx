import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { demoAccounts } from "../components/auth/authData";
import LoginFormCard from "../components/auth/LoginFormCard";
import LoginHeroPanel from "../components/auth/LoginHeroPanel";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "../hooks/useI18n";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PUBLIC_AUTH_PATHS = new Set(["/login", "/register-company"]);

export default function LoginPage() {
  const { login } = useAuth();
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

  const detectedRole = useMemo(() => {
    const email = form.email.trim().toLowerCase();
    return demoAccounts.find((account) => account.email === email)?.role ?? null;
  }, [form.email]);

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSelectDemoAccount = (account) => {
    setForm((current) => ({
      ...current,
      email: account.email,
      password: account.password
    }));
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
      await login(form);
      const requestedPath = location.state?.from?.pathname;
      const destination = requestedPath && !PUBLIC_AUTH_PATHS.has(requestedPath) ? requestedPath : "/dashboard";
      navigate(destination, { replace: true });
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f7f3] px-3 py-4 text-slate-900 sm:px-4 sm:py-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(20,83,45,0.12),transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,83,45,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,83,45,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50" />

      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl items-center sm:min-h-[calc(100vh-3rem)]">
        <div className="grid w-full min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center lg:gap-10">
          <LoginHeroPanel />
          <LoginFormCard
            detectedRole={detectedRole}
            error={error}
            form={form}
            isSubmitting={isSubmitting}
            onChange={handleChange}
            onSelectDemoAccount={handleSelectDemoAccount}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
