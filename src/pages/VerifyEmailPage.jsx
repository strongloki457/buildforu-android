import { AlertCircle, CheckCircle, Loader } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import PublicShell from "../components/marketing/PublicShell";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "../hooks/useI18n";

export default function VerifyEmailPage() {
  const { t } = useI18n();
  const { updateUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const token = searchParams.get("token");
    if (!token) {
      setStatus("invalid");
      return;
    }

    apiRequest(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, { auth: false })
      .then(() => {
        updateUser?.({ emailVerified: true });
        setStatus("success");
      })
      .catch(() => setStatus("invalid"));
  }, [searchParams, updateUser]);

  return (
    <PublicShell>
      <section className="mx-auto max-w-lg text-center">
        {status === "loading" && (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <Loader size={36} className="animate-spin text-slate-400" />
            </div>
            <p className="mt-6 text-lg text-slate-600">{t("emailVerify.verifying")}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h1 className="mt-6 text-4xl text-slate-950">{t("emailVerify.successTitle")}</h1>
            <p className="mt-4 text-lg text-slate-600">{t("emailVerify.successSubtitle")}</p>
            <div className="mt-8">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-2xl bg-brand-700 px-6 py-3.5 text-sm text-white hover:bg-brand-600 transition"
              >
                {t("emailVerify.goToDashboard")}
              </Link>
            </div>
          </>
        )}

        {status === "invalid" && (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <AlertCircle size={40} className="text-red-600" />
            </div>
            <h1 className="mt-6 text-4xl text-slate-950">{t("emailVerify.invalidTitle")}</h1>
            <p className="mt-4 text-lg text-slate-600">{t("emailVerify.invalidSubtitle")}</p>
            <div className="mt-8">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm text-slate-800 hover:bg-slate-50 transition"
              >
                {t("emailVerify.goToDashboard")}
              </Link>
            </div>
          </>
        )}
      </section>
    </PublicShell>
  );
}
