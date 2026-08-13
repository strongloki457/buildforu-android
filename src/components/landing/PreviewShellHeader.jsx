import { Bell, Menu } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import { previewPillKeys } from "./landingData";

export default function PreviewShellHeader() {
  const { t } = useI18n();

  return (
    <>
      <div className="glass-nav flex items-center justify-between gap-3 rounded-[20px] p-2.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <Menu size={16} />
          </span>
          <div>
            <p className="hidden text-[10px] uppercase tracking-[0.2em] text-brand-600 sm:block">
              {t("landing.preview.eyebrow")}
            </p>
            <p className="text-base text-slate-900">{t("nav.dashboard")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/80 p-2 text-slate-600">
            <Bell size={15} />
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-700 to-brand-500 text-xs text-white">
            BU
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-[24px] bg-gradient-to-r from-brand-800 via-brand-700 to-brand-500 p-4 text-white sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-white/60">{t("landing.preview.glanceEyebrow")}</p>
            <p className="mt-2 text-lg">{t("landing.preview.glanceTitle")}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {previewPillKeys.map((pillKey) => (
              <span key={pillKey} className="rounded-full bg-white/15 px-3 py-1.5">
                {t(`landing.preview.pills.${pillKey}`)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
