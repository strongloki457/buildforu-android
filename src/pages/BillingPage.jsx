import { ArrowUpRight, CreditCard, ExternalLink, Mail, ReceiptText, Users2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createCheckoutSession, createPortalSession, getSubscription } from "../api/stripe.api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import MetricCard from "../components/ui/MetricCard";
import SectionHeader from "../components/ui/SectionHeader";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";

const PLAN_ORDER = ["starter", "pro", "enterprise"];

const PLAN_PRICES = {
  starter: { amount: "€12.95", monthly: "€12.95", hasStripe: true },
  pro: { amount: "€69.95", monthly: "€69.95", hasStripe: true },
  enterprise: { amount: null, monthly: null, hasStripe: false }
};

export default function BillingPage() {
  const { workers } = useAppData();
  const { locale, t } = useI18n();
  const [subscription, setSubscription] = useState(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(null);
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    getSubscription()
      .then(setSubscription)
      .catch(() => null);
  }, []);

  const workerCount = workers.length;
  const currentPlan = subscription?.plan ?? (workerCount <= 5 ? "starter" : workerCount <= 25 ? "pro" : "enterprise");
  const workerLimit = currentPlan === "starter" ? 5 : currentPlan === "pro" ? 25 : "Unlimited";
  const usagePercentage =
    workerLimit === "Unlimited" ? 18 : Math.min(100, Math.round((workerCount / Number(workerLimit)) * 100));
  const localizedPlan = t(`plans.${currentPlan}`);
  const localizedWorkerLimit = workerLimit === "Unlimited" ? t("billing.unlimitedWorkers") : String(workerLimit);
  const hasActiveSubscription = subscription?.hasActiveSubscription;
  const hasStripeCustomer = subscription?.hasStripeCustomer;
  const cancelAtPeriodEnd = subscription?.cancelAtPeriodEnd ?? false;
  const cancelAtDate = subscription?.cancelAt
    ? new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale, { dateStyle: "long" }).format(
        new Date(subscription.cancelAt)
      )
    : null;

  const switchablePlans = PLAN_ORDER.filter((p) => p !== currentPlan);

  const currentPriceAmount =
    subscription?.nextInvoiceAmount != null
      ? `€${subscription.nextInvoiceAmount.toFixed(2)}`
      : (PLAN_PRICES[currentPlan]?.amount ?? t("billing.customPrice"));

  const nextInvoiceDate = subscription?.nextInvoiceDate
    ? new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale, { dateStyle: "long" }).format(
        new Date(subscription.nextInvoiceDate)
      )
    : null;

  const handleOpenPortal = async () => {
    setLoadingPortal(true);
    try {
      const { url } = await createPortalSession();
      window.location.href = url;
    } catch {
      setLoadingPortal(false);
    }
  };

  const handleUpgrade = async (plan) => {
    setLoadingCheckout(plan);
    try {
      const { url } = await createCheckoutSession(plan, isAnnual ? "annual" : "monthly");
      window.location.href = url;
    } catch {
      setLoadingCheckout(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={CreditCard}
          label={t("billing.currentPlan")}
          value={localizedPlan}
          detail={hasActiveSubscription ? t("billing.subscriptionActive") : t("billing.mockSubscriptionData")}
        />
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
            hasActiveSubscription && hasStripeCustomer ? (
              <Button onClick={handleOpenPortal} disabled={loadingPortal} className="w-full gap-2 sm:w-auto">
                {loadingPortal ? t("common.loading") : t("billing.manageSubscription")}
                <ExternalLink size={16} />
              </Button>
            ) : null
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
              <div
                className={`rounded-2xl px-4 py-3 text-sm ${
                  hasActiveSubscription ? "bg-green-50 text-green-700" : "bg-brand-50 text-brand-700"
                }`}
              >
                {hasActiveSubscription ? t("billing.subscriptionActive") : t("billing.uiOnly")}
              </div>
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
                <p className="mt-3 text-2xl text-slate-950">
                  {hasActiveSubscription ? currentPriceAmount : "—"}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {hasActiveSubscription && nextInvoiceDate ? nextInvoiceDate : t("billing.noActiveSubscription")}
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/85 p-5">
                <p className="text-sm text-slate-500">{t("billing.billingContact")}</p>
                <p className="mt-3 text-2xl text-slate-950">{t("billing.billingContactEmail")}</p>
                <p className="mt-2 text-sm text-slate-500">{t("billing.billingContactHint")}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] bg-gradient-to-r from-slate-950 to-slate-800 p-6 text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-300">{t("billing.paymentMethod")}</p>
              {hasActiveSubscription ? (
                <>
                  <p className="mt-4 text-2xl">{t("billing.activeCard")}</p>
                  <button
                    onClick={handleOpenPortal}
                    disabled={loadingPortal}
                    className="mt-3 flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition"
                  >
                    {t("billing.manageInStripe")} <ExternalLink size={12} />
                  </button>
                </>
              ) : (
                <>
                  <p className="mt-4 text-2xl">{t("billing.noPaymentMethod")}</p>
                  <p className="mt-2 text-sm text-white/60">{t("billing.noPaymentMethodHint")}</p>
                </>
              )}
            </div>

            {switchablePlans.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{t("billing.availablePlans")}</p>
                  {!hasActiveSubscription && (
                    <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-0.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setIsAnnual(false)}
                        className={`rounded-lg px-2.5 py-1 transition ${!isAnnual ? "bg-brand-700 text-white shadow" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        {t("pricing.monthly", "Monthly")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAnnual(true)}
                        className={`rounded-lg px-2.5 py-1 transition ${isAnnual ? "bg-brand-700 text-white shadow" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        {t("pricing.annually", "Annual")} <span className={`ml-1 ${isAnnual ? "text-white/80" : "text-green-600"}`}>-20%</span>
                      </button>
                    </div>
                  )}
                </div>
                {switchablePlans.map((plan) => {
                  const price = PLAN_PRICES[plan];
                  if (!price.hasStripe || plan === "enterprise") {
                    return (
                      <a
                        key={plan}
                        href="mailto:kontakt@buildforu.pl"
                        className="flex w-full items-center justify-between rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-left hover:bg-slate-50 transition"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">{t(`plans.${plan}`)}</p>
                          <p className="mt-0.5 text-sm text-slate-500">{t(`billing.planDescriptions.${plan}`)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500">{t("billing.contactUs")}</span>
                          <Mail size={16} className="text-brand-700" />
                        </div>
                      </a>
                    );
                  }
                  if (hasActiveSubscription && hasStripeCustomer) {
                    return (
                      <button
                        key={plan}
                        onClick={handleOpenPortal}
                        disabled={loadingPortal}
                        className="w-full rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-left hover:bg-slate-50 transition disabled:opacity-50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{t(`plans.${plan}`)}</p>
                            <p className="mt-0.5 text-sm text-slate-500">{t(`billing.planDescriptions.${plan}`)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">{price.monthly}{t("billing.perMonthShort")}</span>
                            <ExternalLink size={16} className="text-brand-700" />
                          </div>
                        </div>
                      </button>
                    );
                  }
                  return (
                    <button
                      key={plan}
                      onClick={() => handleUpgrade(plan)}
                      disabled={loadingCheckout === plan}
                      className="w-full rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-left hover:bg-slate-50 transition disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{t(`plans.${plan}`)}</p>
                          <p className="mt-0.5 text-sm text-slate-500">{t(`billing.planDescriptions.${plan}`)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-700">
                            {loadingCheckout === plan
                              ? t("common.loading")
                              : isAnnual && price.monthly
                                ? `€${(parseFloat(price.monthly.replace("€", "")) * 0.8).toFixed(2).replace(".", ",")}${t("billing.perMonthShort")}`
                                : `${price.monthly}${t("billing.perMonthShort")}`}
                          </span>
                          <ArrowUpRight size={16} className="text-brand-700" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {currentPlan === "enterprise" && (
              <div className="rounded-[28px] border border-brand-100 bg-brand-50/60 p-5">
                <p className="text-sm font-medium text-brand-900">{t("billing.enterprisePlan")}</p>
                <p className="mt-1 text-sm text-brand-700">{t("billing.enterprisePlanHint")}</p>
              </div>
            )}

            {hasActiveSubscription && (
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
                </div>
              </div>
            )}

            <div className="rounded-[28px] border border-red-100 bg-red-50/60 p-5">
              {hasActiveSubscription && hasStripeCustomer ? (
                cancelAtPeriodEnd ? (
                  <>
                    <p className="text-sm font-medium text-red-900">{t("billing.cancelScheduledTitle")}</p>
                    <p className="mt-1 text-sm text-red-700">
                      {cancelAtDate
                        ? t("billing.cancelScheduledHint", { date: cancelAtDate })
                        : t("billing.cancelScheduledHintNoDate")}
                    </p>
                    <button
                      onClick={handleOpenPortal}
                      disabled={loadingPortal}
                      className="mt-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 transition disabled:opacity-50"
                    >
                      <ExternalLink size={15} />
                      {loadingPortal ? t("common.loading") : t("billing.manageInStripeShort")}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-red-900">{t("billing.cancelTitle")}</p>
                    <p className="mt-1 text-sm text-red-700">{t("billing.cancelHint")}</p>
                    <button
                      onClick={handleOpenPortal}
                      disabled={loadingPortal}
                      className="mt-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 transition disabled:opacity-50"
                    >
                      <XCircle size={15} />
                      {loadingPortal ? t("common.loading") : t("billing.cancelButton")}
                    </button>
                  </>
                )
              ) : (
                <>
                  <p className="text-sm font-medium text-red-900">{t("billing.cancelTitle", "Cancel subscription")}</p>
                  <p className="mt-1 text-sm text-red-700">{t("billing.noActiveSubCancel", "You don't have an active subscription to cancel. Contact us if you need help.")}</p>
                  <a
                    href="mailto:kontakt@buildforu.pl"
                    className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 transition"
                  >
                    <Mail size={15} />
                    {t("billing.contactSupport", "Contact support")}
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
