import { Bell, Globe, Shield, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import Card from "../components/ui/Card";
import SectionHeader from "../components/ui/SectionHeader";
import { useI18n } from "../hooks/useI18n";

export default function SettingsPage() {
  const { t } = useI18n();
  const [toggles, setToggles] = useState({
    alerts: true,
    summaries: true,
    privacy: false
  });

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

      <div className="mt-6 rounded-[28px] bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <SlidersHorizontal size={18} />
          </div>
          <div>
            <p className="text-lg">{t("settings.workspaceSaved")}</p>
            <p className="text-sm text-white/60">{t("settings.workspaceSavedDetail")}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
