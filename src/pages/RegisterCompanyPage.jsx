import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RegisterFormPanel from "../components/auth/RegisterFormPanel";
import RegisterSidePanel from "../components/auth/RegisterSidePanel";
import PublicShell from "../components/marketing/PublicShell";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "../hooks/useI18n";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegisterForm(form) {
  const errors = {};

  if (!form.companyName.trim()) {
    errors.companyName = "register.validation.companyNameRequired";
  }

  if (!form.ownerName.trim()) {
    errors.ownerName = "register.validation.adminNameRequired";
  }

  if (!form.email.trim()) {
    errors.email = "register.validation.emailRequired";
  } else if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = "register.validation.emailInvalid";
  }

  if (!form.password) {
    errors.password = "register.validation.passwordRequired";
  } else if (form.password.length < 8) {
    errors.password = "register.validation.passwordTooShort";
  } else if (!/[a-z]/.test(form.password) || !/[A-Z]/.test(form.password) || !/\d/.test(form.password)) {
    errors.password = "register.validation.passwordComplexity";
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "register.validation.confirmPasswordRequired";
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "register.validation.passwordMismatch";
  }

  if (!form.termsAccepted) {
    errors.termsAccepted = "register.validation.termsRequired";
  }

  return errors;
}

function getPasswordStrength(password) {
  if (!password || password.length < 8) {
    return "weak";
  }

  let score = password.length >= 12 ? 2 : 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score >= 4) {
    return "strong";
  }

  return "fair";
}

export default function RegisterCompanyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { registerCompany } = useAuth();
  const { t } = useI18n();
  const intendedPlan = location.state?.plan === "pro" ? "pro" : null;

  const [form, setForm] = useState({
    companyName: "",
    ownerName: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false
  });
  const [touched, setTouched] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const helperEmail = useMemo(() => {
    if (form.email.trim()) {
      return form.email.trim();
    }

    return t("register.workspaceEmailPending");
  }, [form.email, t]);
  const validationErrors = useMemo(() => validateRegisterForm(form), [form]);
  const fieldErrors = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(validationErrors).filter(([key]) => touched[key] || hasSubmitted)
      ),
    [hasSubmitted, touched, validationErrors]
  );
  const fieldStatus = useMemo(
    () => ({
      companyName: Boolean((touched.companyName || hasSubmitted) && form.companyName.trim() && !validationErrors.companyName),
      ownerName: Boolean((touched.ownerName || hasSubmitted) && form.ownerName.trim() && !validationErrors.ownerName),
      email: Boolean((touched.email || hasSubmitted) && form.email.trim() && !validationErrors.email),
      password: Boolean((touched.password || hasSubmitted) && form.password && !validationErrors.password),
      confirmPassword: Boolean(
        (touched.confirmPassword || hasSubmitted) && form.confirmPassword && !validationErrors.confirmPassword
      ),
      termsAccepted: Boolean((touched.termsAccepted || hasSubmitted) && form.termsAccepted)
    }),
    [form, hasSubmitted, touched, validationErrors]
  );
  const passwordStrength = useMemo(() => getPasswordStrength(form.password), [form.password]);
  const isSubmitDisabled = isSubmitting || (hasSubmitted && Object.keys(validationErrors).length > 0);

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  };

  const handleBlur = (key) => {
    setTouched((current) => ({ ...current, [key]: true }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setHasSubmitted(true);
    setTouched({
      companyName: true,
      ownerName: true,
      email: true,
      password: true,
      confirmPassword: true,
      termsAccepted: true
    });
    setIsSubmitting(true);
    setError("");

    const nextErrors = validateRegisterForm(form);

    if (Object.keys(nextErrors).length) {
      setIsSubmitting(false);
      return;
    }

    try {
      await registerCompany({
        companyName: form.companyName.trim(),
        ownerName: form.ownerName.trim(),
        email: form.email.trim(),
        password: form.password,
        plan: "starter"
      });

      navigate("/verify-pending", { replace: true, state: { intendedPlan } });
    } catch (issue) {
      setError(t(issue.message, "We could not create this workspace. Check the details and try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicShell>
      <section className="grid min-w-0 gap-5 sm:gap-8 lg:grid-cols-[minmax(0,1.02fr)_420px] lg:items-start">
        <RegisterFormPanel
          error={error}
          fieldErrors={fieldErrors}
          fieldStatus={fieldStatus}
          form={form}
          isSubmitDisabled={isSubmitDisabled}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onBlur={handleBlur}
          onSubmit={handleSubmit}
          passwordStrength={passwordStrength}
        />
        <RegisterSidePanel form={form} helperEmail={helperEmail} />
      </section>
    </PublicShell>
  );
}
