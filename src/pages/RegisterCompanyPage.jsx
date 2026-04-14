import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RegisterFormPanel from "../components/auth/RegisterFormPanel";
import RegisterSidePanel from "../components/auth/RegisterSidePanel";
import { availablePlans } from "../components/auth/authData";
import { normalizePlan, sanitizeCompanyName } from "../components/auth/registerUtils";
import PublicShell from "../components/marketing/PublicShell";
import { useAuth } from "../hooks/useAuth";

export default function RegisterCompanyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { registerCompany } = useAuth();
  const [form, setForm] = useState({
    companyName: "",
    ownerName: "",
    email: "",
    password: "",
    plan: availablePlans.includes(normalizePlan(location.state?.plan)) ? normalizePlan(location.state?.plan) : "pro"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const helperEmail = useMemo(() => {
    if (form.email.trim()) {
      return form.email.trim();
    }

    return `admin+${sanitizeCompanyName(form.companyName)}@buildforu.com`;
  }, [form.companyName, form.email]);

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await registerCompany({
        companyName: form.companyName,
        ownerName: form.ownerName,
        email: form.email || helperEmail,
        password: form.password,
        plan: form.plan
      });

      navigate("/dashboard", { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PublicShell>
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.02fr)_420px] lg:items-start">
        <RegisterFormPanel
          form={form}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
        <RegisterSidePanel form={form} helperEmail={helperEmail} />
      </section>
    </PublicShell>
  );
}
