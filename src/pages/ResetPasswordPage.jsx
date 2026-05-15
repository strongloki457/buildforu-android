import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useI18n } from "../hooks/useI18n";

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(location.state?.devToken ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(t("register.validation.passwordTooShort", "Password must be at least 8 characters."));
      return;
    }

    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      setError(t("register.validation.passwordComplexity", "Password must include uppercase, lowercase, and a number."));
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: { token: token.trim(), password },
        auth: false
      });
      navigate("/login", { state: { passwordReset: true } });
    } catch (err) {
      setError(
        err?.message?.includes("TOKEN_INVALID")
          ? t("resetPassword.tokenInvalid", "Token is invalid or has expired.")
          : t("login.serverError", "Something went wrong. Please try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f7f3] px-3 py-4 sm:px-4 sm:py-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(20,83,45,0.12),transparent_28%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-md items-center">
        <div className="w-full rounded-[24px] border border-slate-200/80 bg-white/92 p-6 shadow-[0_28px_70px_-44px_rgba(15,23,42,0.38)] backdrop-blur sm:rounded-[32px] sm:p-8">
          <h1 className="text-2xl text-slate-950">{t("resetPassword.title", "Set new password")}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {t("resetPassword.subtitle", "Enter your reset token and choose a new password.")}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">{t("resetPassword.token", "Reset token")}</span>
              <input
                type="text"
                autoComplete="off"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 font-mono text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">{t("resetPassword.newPassword", "New password")}</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-4 pr-14 text-base text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>

            {error ? <p className="text-sm text-rose-600">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-brand-700 px-4 py-3.5 text-sm text-white transition hover:bg-brand-600 disabled:opacity-70"
            >
              {isSubmitting ? t("common.loading", "Loading…") : t("resetPassword.submit", "Reset password")}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            <Link to="/login" className="font-medium text-brand-700 transition hover:text-brand-600">
              {t("register.signIn", "Sign in")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
