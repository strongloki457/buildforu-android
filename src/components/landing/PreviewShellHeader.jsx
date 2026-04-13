import { useI18n } from "../../hooks/useI18n";
import { previewPillKeys } from "./landingData";

export default function PreviewShellHeader() {
  const { t } = useI18n();

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-brand-300">{t("landing.preview.eyebrow")}</p>
          <h2 className="mt-2 text-2xl">{t("landing.preview.title")}</h2>
        </div>
        <div className="rounded-2xl bg-white/10 px-3 py-2 text-xs text-white/70">{t("landing.preview.badge")}</div>
      </div>

      <div className="mt-5 rounded-[24px] bg-gradient-to-r from-brand-800 via-brand-700 to-brand-500 p-4 sm:p-5">
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
