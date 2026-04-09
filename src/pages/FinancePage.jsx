import { CircleDollarSign, CreditCard, Landmark, Receipt } from "lucide-react";
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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Landmark} label="Revenue" value={finance.revenue} detail="Current mocked revenue snapshot." />
        <MetricCard icon={CreditCard} label="Expenses" value={finance.expenses} detail="Operating spend across projects." />
        <MetricCard icon={CircleDollarSign} label="Profit" value={finance.profit} detail="Positive margin this cycle." />
        <MetricCard
          icon={Receipt}
          label="Open invoices"
          value={String(finance.outstandingInvoices)}
          detail="Ready for live backend data later."
        />
      </div>
      <Card>
        <SectionHeader title={t("finance.title")} subtitle={t("finance.subtitle")} />
        <div className="rounded-[28px] bg-white/80 p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Cash flow outlook</p>
              <p className="mt-2 text-4xl text-slate-900">{finance.profit}</p>
            </div>
            <div className="rounded-2xl bg-emerald-100 px-4 py-2 text-sm text-emerald-700">+12.4% month-over-month</div>
          </div>
          <div className="mt-6 h-64 rounded-[28px] bg-[linear-gradient(180deg,rgba(34,197,94,0.14),rgba(255,255,255,0.7))] p-6">
            <div className="flex h-full items-end gap-4">
              {[38, 44, 52, 47, 58, 69, 74].map((value, index) => (
                <div key={value} className="flex flex-1 flex-col items-center gap-3">
                  <div
                    className="w-full rounded-t-[20px] bg-gradient-to-t from-brand-700 to-brand-500"
                    style={{ height: `${value * 2}px` }}
                  />
                  <span className="text-xs text-slate-400">W{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
