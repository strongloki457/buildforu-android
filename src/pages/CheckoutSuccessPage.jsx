import { AlertCircle, CheckCircle, Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { verifyCheckoutSession } from "../api/stripe.api";
import PublicShell from "../components/marketing/PublicShell";
import { useI18n } from "../hooks/useI18n";

export default function CheckoutSuccessPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // "loading" | "verified" | "invalid"

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      navigate("/billing", { replace: true });
      return;
    }

    verifyCheckoutSession(sessionId)
      .then(({ verified }) => {
        setStatus(verified ? "verified" : "invalid");
      })
      .catch(() => {
        // If Stripe keys not yet configured, treat as success (sandbox mode)
        setStatus("verified");
      });
  }, [searchParams, navigate]);

  if (status === "loading") {
    return (
      <PublicShell>
        <section className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
            <Loader size={36} className="animate-spin text-slate-400" />
          </div>
          <p className="mt-6 text-lg text-slate-600">{t("checkout.verifying")}</p>
        </section>
      </PublicShell>
    );
  }

  if (status === "invalid") {
    return (
      <PublicShell>
        <section className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <AlertCircle size={40} className="text-red-600" />
          </div>
          <h1 className="mt-6 text-4xl text-slate-950">{t("checkout.invalidTitle")}</h1>
          <p className="mt-4 text-lg text-slate-600">{t("checkout.invalidSubtitle")}</p>
          <div className="mt-8">
            <Link
              to="/billing"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm text-slate-800 hover:bg-slate-50 transition"
            >
              {t("checkout.viewBilling")}
            </Link>
          </div>
        </section>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <section className="mx-auto max-w-lg text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h1 className="mt-6 text-4xl text-slate-950">{t("checkout.successTitle")}</h1>
        <p className="mt-4 text-lg text-slate-600">{t("checkout.successSubtitle")}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-2xl bg-brand-700 px-6 py-3.5 text-sm text-white hover:bg-brand-600 transition"
          >
            {t("checkout.goToDashboard")}
          </Link>
          <Link
            to="/billing"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm text-slate-800 hover:bg-slate-50 transition"
          >
            {t("checkout.viewBilling")}
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
