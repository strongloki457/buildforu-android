import { CircleDollarSign, CreditCard, Construction, Landmark, Receipt } from "lucide-react";
import Card from "../components/ui/Card";
import MetricCard from "../components/ui/MetricCard";
import SectionHeader from "../components/ui/SectionHeader";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";

export default function FinancePage() {
  const { finance } = useAppData();
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-[20px] border border-amber-200 bg-amber-50 px-5 py-4">
        <Construction size={18} className="shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">{t("finance.demoNotice")}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Landmark} label={t("finance.revenue")} value={finance.revenue} detail={t("finance.revenueDetail")} />
        <MetricCard icon={CreditCard} label={t("finance.expenses")} value={finance.expenses} detail={t("finance.expensesDetail")} />
        <MetricCard icon={CircleDollarSign} label={t("finance.profit")} value={finance.profit} detail={t("finance.profitDetail")} />
        <MetricCard
          icon={Receipt}
          label={t("finance.openInvoices")}
          value={String(finance.outstandingInvoices)}
          detail={t("finance.openInvoicesDetail")}
        />
      </div>
      <Card>
        <SectionHeader title={t("finance.title")} subtitle={t("finance.subtitle")} />
        <div className="rounded-[28px] bg-white/80 p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">{t("finance.cashFlowOutlook")}</p>
              <p className="mt-2 text-4xl text-slate-900">{finance.profit}</p>
            </div>
            <div className="rounded-2xl bg-emerald-100 px-4 py-2 text-sm text-emerald-700">{t("finance.monthOverMonth")}</div>
          </div>
          <div className="mt-6 h-64 rounded-[28px] bg-[linear-gradient(180deg,rgba(34,197,94,0.14),rgba(255,255,255,0.7))] p-6">
            <div className="flex h-full items-end gap-4">
              {[38, 44, 52, 47, 58, 69, 74].map((value, index) => (
                <div key={value} className="flex flex-1 flex-col items-center gap-3">
                  <div
                    className="w-full rounded-t-[20px] bg-gradient-to-t from-brand-700 to-brand-500"
                    style={{ height: `${value * 2}px` }}
                  />
                  <span className="text-xs text-slate-400">{t("finance.weekLabel", { number: index + 1 })}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
