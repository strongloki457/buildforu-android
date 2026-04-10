import { ArrowUpRight, CreditCard, ReceiptText, Users2 } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import MetricCard from "../components/ui/MetricCard";
import SectionHeader from "../components/ui/SectionHeader";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";

export default function BillingPage() {
  const { workers } = useAppData();
  const { locale, t } = useI18n();
  const workerCount = workers.length;
  const currentPlan = workerCount <= 5 ? "starter" : workerCount <= 25 ? "pro" : "enterprise";
  const workerLimit = currentPlan === "starter" ? 5 : currentPlan === "pro" ? 25 : "Unlimited";
  const usagePercentage =
    workerLimit === "Unlimited" ? 18 : Math.min(100, Math.round((workerCount / Number(workerLimit)) * 100));
  const nextInvoiceDate = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale, {
    dateStyle: "long"
  }).format(new Date("2026-04-30T00:00:00"));
  const localizedPlan = t(`plans.${currentPlan}`);
  const localizedWorkerLimit = workerLimit === "Unlimited" ? t("billing.unlimitedWorkers") : String(workerLimit);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={CreditCard} label={t("billing.currentPlan")} value={localizedPlan} detail={t("billing.mockSubscriptionData")} />
        <MetricCard icon={Users2} label={t("billing.workerLimit")} value={localizedWorkerLimit} detail={t("billing.workerLimitDetail")} />
        <MetricCard
          icon={ReceiptText}
          label={t("billing.usage")}
          value={t("billing.usageWorkers", { count: workerCount })}
          detail={t("billing.usageDetail")}
        />
      </div>

      <Card>
        <SectionHeader
          title={t("billing.title")}
          subtitle={t("billing.subtitle")}
          action={
            <Link to="/pricing">
              <Button className="w-full gap-2 sm:w-auto">
                {t("billing.upgradePlan")}
                <ArrowUpRight size={16} />
              </Button>
            </Link>
          }
        />

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] bg-white/82 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{t("billing.subscriptionOverview")}</p>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl text-slate-950">{localizedPlan}</h2>
                <p className="mt-2 text-sm text-slate-500">{t(`billing.planDescriptions.${currentPlan}`)}</p>
              </div>
              <div className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-700">{t("billing.uiOnly")}</div>
            </div>

            <div className="mt-8 rounded-[24px] bg-slate-50/90 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-600">{t("billing.workerUsage")}</p>
                <p className="text-sm text-slate-900">
                  {workerCount} / {localizedWorkerLimit}
                </p>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-700 to-brand-500" style={{ width: `${usagePercentage}%` }} />
              </div>
              <p className="mt-3 text-sm text-slate-500">{t("billing.workerUsageHint")}</p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/85 p-5">
                <p className="text-sm text-slate-500">{t("billing.nextInvoice")}</p>
                <p className="mt-3 text-2xl text-slate-950">$99.00</p>
                <p className="mt-2 text-sm text-slate-500">{nextInvoiceDate}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/85 p-5">
                <p className="text-sm text-slate-500">{t("billing.billingContact")}</p>
                <p className="mt-3 text-2xl text-slate-950">finance@buildforu.com</p>
                <p className="mt-2 text-sm text-slate-500">{t("billing.billingContactHint")}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] bg-gradient-to-r from-slate-950 to-slate-800 p-6 text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-300">{t("billing.paymentMethod")}</p>
              <p className="mt-4 text-2xl">{t("billing.cardLabel")}</p>
              <p className="mt-2 text-sm text-white/60">{t("billing.cardHint")}</p>
            </div>

            <div className="rounded-[28px] bg-white/82 p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{t("billing.recentActivity")}</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-slate-50/90 px-4 py-4">
                  <p className="text-sm text-slate-900">{t("billing.activity.invoiceTitle")}</p>
                  <p className="mt-1 text-sm text-slate-500">{t("billing.activity.invoiceBody")}</p>
                </div>
                <div className="rounded-2xl bg-slate-50/90 px-4 py-4">
                  <p className="text-sm text-slate-900">{t("billing.activity.renewalTitle")}</p>
                  <p className="mt-1 text-sm text-slate-500">{t("billing.activity.renewalBody")}</p>
                </div>
                <div className="rounded-2xl bg-slate-50/90 px-4 py-4">
                  <p className="text-sm text-slate-900">{t("billing.activity.growthTitle")}</p>
                  <p className="mt-1 text-sm text-slate-500">{t("billing.activity.growthBody")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
