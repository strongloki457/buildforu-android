import { ArrowUpRight, CreditCard, ReceiptText, Users2 } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import MetricCard from "../components/ui/MetricCard";
import SectionHeader from "../components/ui/SectionHeader";
import { useAppData } from "../hooks/useAppData";

export default function BillingPage() {
  const { workers } = useAppData();
  const workerCount = workers.length;
  const currentPlan = workerCount <= 5 ? "Starter" : workerCount <= 25 ? "Pro" : "Enterprise";
  const workerLimit = currentPlan === "Starter" ? 5 : currentPlan === "Pro" ? 25 : "Unlimited";
  const usagePercentage =
    workerLimit === "Unlimited" ? 18 : Math.min(100, Math.round((workerCount / Number(workerLimit)) * 100));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={CreditCard} label="Current plan" value={currentPlan} detail="Mock subscription data" />
        <MetricCard icon={Users2} label="Worker limit" value={String(workerLimit)} detail="Based on selected plan tier" />
        <MetricCard icon={ReceiptText} label="Usage" value={`${workerCount} workers`} detail="Tracked against current tier" />
      </div>

      <Card>
        <SectionHeader
          title="Billing & Subscription"
          subtitle="Review your current subscription, mock billing details, and upgrade options."
          action={
            <Link to="/pricing">
              <Button className="w-full gap-2 sm:w-auto">
                Upgrade plan
                <ArrowUpRight size={16} />
              </Button>
            </Link>
          }
        />

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] bg-white/82 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Subscription overview</p>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl text-slate-950">{currentPlan}</h2>
                <p className="mt-2 text-sm text-slate-500">
                  {currentPlan === "Starter"
                    ? "A lightweight workspace for small companies."
                    : currentPlan === "Pro"
                      ? "Built for active companies with multiple teams."
                      : "Ready for larger organizations and rollout support."}
                </p>
              </div>
              <div className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-700">UI only for now</div>
            </div>

            <div className="mt-8 rounded-[24px] bg-slate-50/90 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-600">Worker usage</p>
                <p className="text-sm text-slate-900">
                  {workerCount} / {workerLimit}
                </p>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-700 to-brand-500" style={{ width: `${usagePercentage}%` }} />
              </div>
              <p className="mt-3 text-sm text-slate-500">Upgrade when your crew count grows beyond the current plan capacity.</p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/85 p-5">
                <p className="text-sm text-slate-500">Next invoice</p>
                <p className="mt-3 text-2xl text-slate-950">$99.00</p>
                <p className="mt-2 text-sm text-slate-500">April 30, 2026</p>
              </div>
              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/85 p-5">
                <p className="text-sm text-slate-500">Billing contact</p>
                <p className="mt-3 text-2xl text-slate-950">finance@buildforu.com</p>
                <p className="mt-2 text-sm text-slate-500">Mock contact shown for UI preview</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] bg-gradient-to-r from-slate-950 to-slate-800 p-6 text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-brand-300">Payment method</p>
              <p className="mt-4 text-2xl">Visa ending in 2048</p>
              <p className="mt-2 text-sm text-white/60">Expires 09/28 - Mock card details for subscription preview</p>
            </div>

            <div className="rounded-[28px] bg-white/82 p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Recent billing activity</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-slate-50/90 px-4 py-4">
                  <p className="text-sm text-slate-900">Invoice INV-2026-041</p>
                  <p className="mt-1 text-sm text-slate-500">Paid successfully - $99.00</p>
                </div>
                <div className="rounded-2xl bg-slate-50/90 px-4 py-4">
                  <p className="text-sm text-slate-900">Subscription renewal reminder</p>
                  <p className="mt-1 text-sm text-slate-500">Automatic renewal scheduled for the end of the month.</p>
                </div>
                <div className="rounded-2xl bg-slate-50/90 px-4 py-4">
                  <p className="text-sm text-slate-900">Seat growth insight</p>
                  <p className="mt-1 text-sm text-slate-500">You are within the current plan limit with room for additional workers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
