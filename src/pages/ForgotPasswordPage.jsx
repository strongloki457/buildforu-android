import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useI18n } from "../hooks/useI18n";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!EMAIL_PATTERN.test(email.trim())) {
      setError(t("login.validationError", "Enter a valid email address."));
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: { email: email.trim().toLowerCase() },
        auth: false
      });
      setSubmitted(true);
    } catch {
      setError(t("login.networkError", "Something went wrong. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f7f3] px-3 py-4 sm:px-4 sm:py-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(20,83,45,0.12),transparent_28%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-md items-center">
        <div className="w-full rounded-[24px] border border-slate-200/80 bg-white/92 p-6 shadow-[0_28px_70px_-44px_rgba(15,23,42,0.38)] backdrop-blur sm:rounded-[32px] sm:p-8">

          {submitted ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
                <svg className="h-7 w-7 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-slate-900">
                {t("forgotPassword.checkEmail", "Check your email")}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {t("forgotPassword.sentDescription", "We've sent a password reset link to")}{" "}
                <span className="font-medium text-slate-700">{email}</span>.{" "}
                {t("forgotPassword.linkExpiry", "The link expires in 30 minutes.")}
              </p>
              <p className="mt-4 text-xs text-slate-400">
                {t("forgotPassword.noEmail", "Didn't receive it? Check your spam folder or")}{" "}
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="font-medium text-brand-700 transition hover:text-brand-600"
                >
                  {t("forgotPassword.tryAgain", "try again")}
                </button>.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl text-slate-950">{t("login.forgotPassword", "Forgot password")}</h1>
              <p className="mt-2 text-sm text-slate-500">
                {t("forgotPassword.subtitle", "Enter your email and we'll send you a reset link.")}
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm text-slate-600">{t("login.email", "Email")}</span>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 sm:text-sm"
                  />
                </label>

                {error ? <p className="text-sm text-rose-600">{error}</p> : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-brand-700 px-4 py-3.5 text-sm text-white transition hover:bg-brand-600 disabled:opacity-70"
                >
                  {isSubmitting ? t("common.loading", "Loading…") : t("forgotPassword.send", "Send reset link")}
                </button>
              </form>
            </>
          )}

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
