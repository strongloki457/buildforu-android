import { MailCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import PublicShell from "../components/marketing/PublicShell";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "../hooks/useI18n";

export default function VerifyPendingPage() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [resendSent, setResendSent] = useState(false);
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      await apiRequest("/api/auth/resend-verification", { method: "POST" });
      setResendSent(true);
    } catch {
      // ignore
    } finally {
      setResending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <PublicShell>
      <section className="mx-auto max-w-lg text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
          <MailCheck size={40} className="text-brand-700" />
        </div>

        <h1 className="mt-6 text-4xl text-slate-950">{t("verifyPending.title")}</h1>
        <p className="mt-4 text-lg text-slate-600">
          {t("verifyPending.subtitle", { email: user?.email ?? "" })}
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          {resendSent ? (
            <p className="text-sm text-green-600">{t("verifyPending.resentConfirm")}</p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="inline-flex items-center justify-center rounded-2xl bg-brand-700 px-6 py-3.5 text-sm text-white hover:bg-brand-600 transition disabled:opacity-60"
            >
              {resending ? t("common.loading") : t("verifyPending.resend")}
            </button>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-slate-500 hover:text-slate-700 transition"
          >
            {t("verifyPending.logout")}
          </button>
        </div>
      </section>
    </PublicShell>
  );
}
