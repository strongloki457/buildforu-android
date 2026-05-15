import { ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { availablePlans } from "./authData";
import { useI18n } from "../../hooks/useI18n";

const strengthStyles = {
  weak: {
    bar: "w-1/3 bg-rose-500",
    text: "text-rose-600"
  },
  fair: {
    bar: "w-2/3 bg-amber-500",
    text: "text-amber-600"
  },
  strong: {
    bar: "w-full bg-brand-600",
    text: "text-brand-700"
  }
};

function FieldFeedback({ isValid, messageKey }) {
  const { t } = useI18n();

  if (messageKey) {
    return <p className="text-sm text-rose-600">{t(messageKey)}</p>;
  }

  if (isValid) {
    return (
      <p className="inline-flex items-center gap-1.5 text-sm text-brand-700">
        <CheckCircle2 size={14} />
        {t("register.validation.fieldValid")}
      </p>
    );
  }

  return null;
}

export default function RegisterFormPanel({
  error = "",
  fieldErrors = {},
  fieldStatus = {},
  form,
  isSubmitDisabled,
  isSubmitting,
  onBlur,
  onChange,
  onSubmit,
  passwordStrength
}) {
  const { t } = useI18n();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const strength = strengthStyles[passwordStrength] ?? strengthStyles.weak;

  return (
    <div className="glass-panel order-1 min-w-0 rounded-[24px] p-4 sm:rounded-[34px] sm:p-8">
      <div className="max-w-xl">
        <p className="text-xs uppercase tracking-[0.18em] text-brand-700/75 sm:tracking-[0.26em]">{t("register.eyebrow")}</p>
        <h1 className="break-anywhere mt-4 text-2xl leading-tight text-slate-950 sm:text-4xl">{t("register.title")}</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">{t("register.subtitle")}</p>
        <div className="mt-5 grid gap-2 text-sm text-slate-600">
          {["workspace", "admin", "employees"].map((item) => (
            <div key={item} className="flex items-start gap-2">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand-700" />
              <span>{t(`register.helper.${item}`)}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-8 grid gap-5" noValidate>
        <label className="grid gap-2">
          <span className="text-sm text-slate-600">{t("register.companyName")}</span>
          <input
            type="text"
            autoComplete="organization"
            disabled={isSubmitting}
            value={form.companyName}
            onChange={(event) => onChange("companyName", event.target.value)}
            onBlur={() => onBlur("companyName")}
            placeholder={t("register.placeholders.companyName")}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100 sm:text-sm"
          />
          <FieldFeedback isValid={fieldStatus.companyName} messageKey={fieldErrors.companyName} />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm text-slate-600">{t("register.ownerName")}</span>
            <input
              type="text"
              autoComplete="name"
              disabled={isSubmitting}
              value={form.ownerName}
              onChange={(event) => onChange("ownerName", event.target.value)}
              onBlur={() => onBlur("ownerName")}
              placeholder={t("register.placeholders.ownerName")}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100 sm:text-sm"
            />
            <FieldFeedback isValid={fieldStatus.ownerName} messageKey={fieldErrors.ownerName} />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-600">{t("login.email")}</span>
            <input
              type="email"
              autoComplete="email"
              disabled={isSubmitting}
              value={form.email}
              onChange={(event) => onChange("email", event.target.value)}
              onBlur={() => onBlur("email")}
              placeholder={t("register.placeholders.email")}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100 sm:text-sm"
            />
            <FieldFeedback isValid={fieldStatus.email} messageKey={fieldErrors.email} />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm text-slate-600">{t("login.password")}</span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              disabled={isSubmitting}
              minLength={8}
              value={form.password}
              onChange={(event) => onChange("password", event.target.value)}
              onBlur={() => onBlur("password")}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-4 pr-14 text-base text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100 sm:text-sm"
            />
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={showPassword ? t("register.hidePassword") : t("register.showPassword")}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <FieldFeedback isValid={fieldStatus.password} messageKey={fieldErrors.password} />
          <div className="rounded-2xl border border-slate-200 bg-slate-50/85 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{t("register.passwordStrengthLabel")}</p>
              <p className={`text-sm font-medium ${strength.text}`}>{t(`register.passwordStrength.${passwordStrength}`)}</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
              <div className={`h-full rounded-full transition-all ${strength.bar}`} />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">{t("register.passwordHint")}</p>
          </div>
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-600">{t("register.confirmPassword", "Confirm password")}</span>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              disabled={isSubmitting}
              minLength={8}
              value={form.confirmPassword}
              onChange={(event) => onChange("confirmPassword", event.target.value)}
              onBlur={() => onBlur("confirmPassword")}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-4 pr-14 text-base text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100 sm:text-sm"
            />
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setShowConfirmPassword((current) => !current)}
              className="absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={showConfirmPassword ? t("register.hidePassword") : t("register.showPassword")}
            >
              {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <FieldFeedback isValid={fieldStatus.confirmPassword} messageKey={fieldErrors.confirmPassword} />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-600">{t("register.plan")}</span>
          <select
            disabled={isSubmitting}
            value={form.plan}
            onChange={(event) => onChange("plan", event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition focus:border-brand-300 focus:ring-4 focus:ring-brand-100 sm:text-sm"
          >
            {availablePlans.map((planId) => (
              <option key={planId} value={planId}>
                {t(`plans.${planId}`)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/85 p-4">
          <input
            type="checkbox"
            checked={Boolean(form.termsAccepted)}
            disabled={isSubmitting}
            onChange={(event) => onChange("termsAccepted", event.target.checked)}
            onBlur={() => onBlur("termsAccepted")}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
          />
          <span className="min-w-0 text-sm leading-6 text-slate-600">
            {t("register.termsPrefix")}{" "}
            <Link to="/terms" className="font-medium text-brand-700 hover:text-brand-600">
              {t("register.termsLink")}
            </Link>{" "}
            {t("register.termsMiddle")}{" "}
            <Link to="/privacy" className="font-medium text-brand-700 hover:text-brand-600">
              {t("register.privacyLink")}
            </Link>
            <span className="mt-1 block text-slate-500">{t("register.legalNote")}</span>
          </span>
        </label>
        <FieldFeedback isValid={fieldStatus.termsAccepted} messageKey={fieldErrors.termsAccepted} />

        {error ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brand-700 px-4 py-3.5 text-sm text-white shadow-[0_18px_36px_-24px_rgba(20,83,45,0.9)] transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? t("register.creatingWorkspace") : t("register.createAccount")}
          <ArrowRight size={16} />
        </button>
      </form>

      <p className="mt-5 text-sm text-slate-500">
        {t("register.alreadyHaveAccount")}{" "}
        <Link to="/login" className="font-medium text-brand-700 transition hover:text-brand-600">
          {t("register.signIn")}
        </Link>
      </p>
    </div>
  );
}
