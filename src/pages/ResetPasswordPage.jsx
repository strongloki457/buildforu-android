import { CheckCircle2, Eye, EyeOff, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useI18n } from "../hooks/useI18n";

function getPasswordStrength(password) {
  if (!password || password.length < 8) return "weak";
  let score = password.length >= 12 ? 2 : 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  return score >= 4 ? "strong" : "fair";
}

const strengthConfig = {
  weak:   { bars: 1, color: "bg-rose-400",   label: "register.passwordStrength.weak"   },
  fair:   { bars: 2, color: "bg-amber-400",  label: "register.passwordStrength.fair"   },
  strong: { bars: 3, color: "bg-emerald-500", label: "register.passwordStrength.strong" },
};

function PasswordStrengthBar({ password, t }) {
  const strength = getPasswordStrength(password);
  const { bars, color, label } = strengthConfig[strength];

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= bars ? color : "bg-slate-100"}`}
          />
        ))}
      </div>
      <p className="text-xs text-slate-500">
        {t("register.passwordStrengthLabel", "Siła hasła")}:{" "}
        <span className={strength === "strong" ? "text-emerald-600 font-medium" : strength === "fair" ? "text-amber-600 font-medium" : "text-rose-500 font-medium"}>
          {t(label)}
        </span>
      </p>
    </div>
  );
}

function MatchIndicator({ password, confirm, t }) {
  if (!confirm) return null;
  const match = password === confirm;
  return (
    <p className={`mt-1.5 flex items-center gap-1 text-xs ${match ? "text-emerald-600" : "text-rose-500"}`}>
      {match
        ? <><CheckCircle2 size={13} /> {t("register.validation.fieldValid", "Wygląda dobrze")}</>
        : <><XCircle size={13} /> {t("register.validation.passwordMismatch", "Hasła nie są takie same.")}</>
      }
    </p>
  );
}

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  function validate() {
    const errs = {};
    if (password.length < 8) {
      errs.password = t("register.validation.passwordTooShort", "Hasło musi mieć co najmniej 8 znaków.");
    } else if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      errs.password = t("register.validation.passwordComplexity", "Użyj wielkiej litery, małej litery i co najmniej jednej cyfry.");
    }
    if (!confirm) {
      errs.confirm = t("register.validation.confirmPasswordRequired", "Potwierdź hasło.");
    } else if (password !== confirm) {
      errs.confirm = t("register.validation.passwordMismatch", "Hasła nie są takie same.");
    }
    return errs;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setHasSubmitted(true);
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setError("");
    setIsSubmitting(true);

    try {
      await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: { token: tokenFromUrl, password },
        auth: false
      });
      navigate("/login", { state: { passwordReset: true } });
    } catch (err) {
      setError(
        err?.code === "TOKEN_INVALID" || err?.message?.includes("TOKEN_INVALID")
          ? t("resetPassword.tokenInvalid", "Ten link jest nieważny lub wygasł. Poproś o nowy link.")
          : t("login.serverError", "Coś poszło nie tak. Spróbuj ponownie.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tokenFromUrl) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#f4f7f3] px-3 py-4 sm:px-4 sm:py-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(20,83,45,0.12),transparent_28%)]" />
        <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-md items-center">
          <div className="w-full rounded-[24px] border border-slate-200/80 bg-white/92 p-6 shadow-[0_28px_70px_-44px_rgba(15,23,42,0.38)] backdrop-blur sm:rounded-[32px] sm:p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
              <svg className="h-7 w-7 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-slate-900">
              {t("resetPassword.invalidLink", "Nieprawidłowy link")}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {t("resetPassword.invalidLinkDescription", "W linku brakuje tokenu resetowania. Poproś o nowy link.")}
            </p>
            <Link
              to="/forgot-password"
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-brand-700 px-4 py-3 text-sm text-white transition hover:bg-brand-600"
            >
              {t("resetPassword.requestNew", "Poproś o nowy link")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f7f3] px-3 py-4 sm:px-4 sm:py-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(20,83,45,0.12),transparent_28%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] max-w-md items-center">
        <div className="w-full rounded-[24px] border border-slate-200/80 bg-white/92 p-6 shadow-[0_28px_70px_-44px_rgba(15,23,42,0.38)] backdrop-blur sm:rounded-[32px] sm:p-8">

          {/* Header */}
          <div className="mb-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
              <svg className="h-6 w-6 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-slate-950">
              {t("resetPassword.title", "Ustaw nowe hasło")}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              {t("resetPassword.subtitle", "Wybierz mocne hasło, którego wcześniej nie używałeś.")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* New password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {t("resetPassword.newPassword", "Nowe hasło")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (hasSubmitted) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={`w-full rounded-2xl border py-3.5 pl-4 pr-14 text-base text-slate-900 outline-none transition focus:ring-4 sm:text-sm ${
                    fieldErrors.password
                      ? "border-rose-300 bg-rose-50/40 focus:border-rose-400 focus:ring-rose-100"
                      : "border-slate-200 bg-white focus:border-brand-400 focus:ring-brand-100"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {/* Strength bar — shown once user types */}
              {password.length > 0 && <PasswordStrengthBar password={password} t={t} />}

              {/* Hint — shown when no error */}
              {!fieldErrors.password && password.length === 0 && (
                <p className="mt-1.5 text-xs text-slate-400">
                  {t("resetPassword.passwordHint", "Min. 8 znaków — wielka litera, mała litera i cyfra.")}
                </p>
              )}

              {fieldErrors.password && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
                  <XCircle size={13} /> {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {t("register.confirmPassword", "Potwierdź hasło")}
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    if (hasSubmitted) setFieldErrors((prev) => ({ ...prev, confirm: undefined }));
                  }}
                  className={`w-full rounded-2xl border py-3.5 pl-4 pr-14 text-base text-slate-900 outline-none transition focus:ring-4 sm:text-sm ${
                    fieldErrors.confirm
                      ? "border-rose-300 bg-rose-50/40 focus:border-rose-400 focus:ring-rose-100"
                      : "border-slate-200 bg-white focus:border-brand-400 focus:ring-brand-100"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {fieldErrors.confirm ? (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
                  <XCircle size={13} /> {fieldErrors.confirm}
                </p>
              ) : (
                <MatchIndicator password={password} confirm={confirm} t={t} />
              )}
            </div>

            {/* Server error */}
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}{" "}
                {(error.includes("wygasł") || error.includes("nieważny") || error.includes("expired") || error.includes("invalid")) && (
                  <Link to="/forgot-password" className="font-medium underline">
                    {t("resetPassword.requestNew", "Poproś o nowy link")}
                  </Link>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || strength === "weak"}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand-700 px-4 py-3.5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  {t("common.loading", "Ładowanie...")}
                </>
              ) : (
                t("resetPassword.submit", "Ustaw nowe hasło")
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            <Link to="/login" className="font-medium text-brand-700 transition hover:text-brand-600">
              {t("register.signIn", "Zaloguj się")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
