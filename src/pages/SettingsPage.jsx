import { ArrowUpRight, Bell, Building2, CreditCard, Globe, Shield, Users2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import SectionHeader from "../components/ui/SectionHeader";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "../hooks/useI18n";

export default function SettingsPage() {
  const { company, companyUsers } = useAuth();
  const { t } = useI18n();
  const [toggles, setToggles] = useState({
    alerts: true,
    summaries: true,
    privacy: false
  });
  const adminCount = companyUsers.filter((member) => member.role === "admin").length;
  const employeeCount = companyUsers.filter((member) => member.role === "employee").length;

  const toggle = (key) => setToggles((current) => ({ ...current, [key]: !current[key] }));

  const settingsItems = [
    { key: "alerts", title: t("settings.alertsTitle"), description: t("settings.alertsDescription"), icon: Bell },
    { key: "summaries", title: t("settings.summariesTitle"), description: t("settings.summariesDescription"), icon: Globe },
    { key: "privacy", title: t("settings.privacyTitle"), description: t("settings.privacyDescription"), icon: Shield }
  ];

  return (
    <Card>
      <SectionHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />

      <div className="grid gap-4 xl:grid-cols-2">
        {settingsItems.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.key} className="rounded-[28px] bg-white/80 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-base text-slate-900">{item.title}</p>
                    <p className="mt-2 text-sm text-slate-500">{item.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(item.key)}
                  className={`relative h-8 w-14 rounded-full transition ${
                    toggles[item.key] ? "bg-brand-600" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                      toggles[item.key] ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-[28px] bg-gradient-to-r from-brand-800 via-brand-700 to-brand-500 p-6 text-white">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <Building2 size={18} />
            </div>
            <div>
              <p className="text-lg">{company?.name || t("settings.workspaceSaved")}</p>
              <p className="text-sm text-white/70">
                {company
                  ? t(
                      "settings.workspaceAccessHint",
                      {
                        plan: t(`plans.${company.plan}`, company.plan)
                      },
                      "Company workspace, subscription plan and seat structure for {{plan}}."
                    )
                  : t("settings.workspaceSavedDetail")}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] bg-white/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">{t("settings.planLabel", "Plan")}</p>
              <p className="mt-2 text-sm text-white">{company ? t(`plans.${company.plan}`, company.plan) : "-"}</p>
            </div>
            <div className="rounded-[22px] bg-white/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">{t("roles.admin", "Admin")}</p>
              <p className="mt-2 text-sm text-white">{adminCount}</p>
            </div>
            <div className="rounded-[22px] bg-white/10 px-4 py-3">
              <div className="flex items-center gap-2 text-white/60">
                <Users2 size={14} />
                <p className="text-xs uppercase tracking-[0.18em]">{t("roles.employee", "Employee")}</p>
              </div>
              <p className="mt-2 text-sm text-white">{employeeCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[28px] bg-white/82 p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
              <CreditCard size={18} />
            </div>
            <div>
              <p className="text-lg text-slate-900">{t("settings.billingTitle")}</p>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">{t("settings.billingDescription")}</p>
            </div>
          </div>

          <Link
            to="/settings/billing"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-700 px-4 py-3 text-sm text-white transition hover:bg-brand-600"
          >
            {t("settings.manageBilling")}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </Card>
  );
}
