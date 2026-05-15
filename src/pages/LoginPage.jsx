import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { demoAccounts } from "../components/auth/authData";
import LoginFormCard from "../components/auth/LoginFormCard";
import LoginHeroPanel from "../components/auth/LoginHeroPanel";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "../hooks/useI18n";

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const defaultAccount = demoAccounts[0];
  const [form, setForm] = useState({
    email: defaultAccount?.email ?? "",
    password: defaultAccount?.password ?? "",
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

    if (!form.email.trim() || !form.password) {
      setError(t("login.requiredError", "Email and password are required."));
      setIsSubmitting(false);
      return;
    }

    try {
      await login(form);
      const destination = location.state?.from?.pathname || "/dashboard";
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
    <div className="relative min-h-screen overflow-hidden bg-[#f4f7f3] px-4 py-6 text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(20,83,45,0.12),transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,83,45,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,83,45,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center">
        <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center">
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
