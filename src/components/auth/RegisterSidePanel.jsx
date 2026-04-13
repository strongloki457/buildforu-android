import { CheckCircle2, Mail, ShieldCheck, Sparkles, Users2 } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";

export default function RegisterSidePanel({ form, helperEmail }) {
  const { t } = useI18n();

  return (
    <aside className="order-2 space-y-4 lg:sticky lg:top-6">
      <div className="rounded-[34px] border border-white/70 bg-white/84 p-6 shadow-soft">
        <div className="inline-flex rounded-2xl bg-brand-50 p-3 text-brand-700">
          <Sparkles size={18} />
        </div>
        <p className="mt-5 text-xs uppercase tracking-[0.24em] text-brand-700/75">{t("register.onboardingEyebrow")}</p>
        <h2 className="mt-3 text-2xl text-slate-950">{t("register.onboardingTitle")}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{t("register.onboardingSubtitle")}</p>

        <div className="mt-6 space-y-3">
          {[CheckCircle2, Users2, ShieldCheck].map((Icon, index) => {
            const step = index + 1;
            return (
              <div key={step} className="flex items-start gap-3 rounded-[22px] bg-slate-50/90 px-4 py-4">
                <Icon size={18} className="mt-0.5 text-brand-700" />
                <div>
                  <p className="text-sm text-slate-900">{t(`register.steps.${step}.title`)}</p>
                  <p className="mt-1 text-sm text-slate-500">{t(`register.steps.${step}.description`)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-[34px] border border-brand-100 bg-gradient-to-b from-brand-50 via-white to-white p-6 shadow-soft">
        <p className="text-xs uppercase tracking-[0.24em] text-brand-700/75">{t("register.selectedPlan")}</p>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl text-slate-950">{t(`plans.${form.plan}`)}</h3>
            <p className="mt-2 text-sm text-slate-500">{t(`register.planCards.${form.plan}.price`)}</p>
          </div>
          <div className="rounded-2xl bg-white px-3 py-2 text-xs text-brand-700 shadow-soft">
            {t(`register.planCards.${form.plan}.workers`)}
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-600">{t(`register.planCards.${form.plan}.note`)}</p>

        <div className="mt-5 rounded-[24px] bg-white/90 px-4 py-4">
          <div className="flex items-start gap-3">
            <Mail size={17} className="mt-0.5 text-brand-700" />
            <div>
              <p className="text-sm text-slate-900">{t("register.workspaceSignIn")}</p>
              <p className="mt-1 text-sm text-slate-500">{helperEmail}</p>
            </div>
          </div>
        </div>

        <p className="mt-5 text-sm text-slate-500">{t("register.dashboardPreviewNote")}</p>
      </div>
    </aside>
  );
}
