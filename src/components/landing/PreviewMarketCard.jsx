import { CheckCircle2, Map, Search } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import { previewMarketResults } from "./landingData";

export default function PreviewMarketCard() {
  const { t } = useI18n();

  return (
    <article className="rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-brand-500/15 p-2.5 text-brand-300">
          <Map size={18} />
        </div>
        <div>
          <p className="text-sm text-white/60">{t("landing.preview.market.label")}</p>
          <p className="text-base">{t("landing.preview.market.title")}</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white/5 px-3 py-3">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Search size={14} />
          <span>{t("landing.preview.market.search")}</span>
        </div>
      </div>

      <div className="mt-3 space-y-3">
        {previewMarketResults.map((resultKey) => (
          <div key={resultKey} className="rounded-2xl bg-white/5 px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm">{t(`landing.preview.market.${resultKey}.store`)}</p>
              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-300">
                <CheckCircle2 size={12} />
                {t(`landing.preview.market.${resultKey}.badge`)}
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-white/45">
              <span>{t(`landing.preview.market.${resultKey}.meta`)}</span>
              <span>{t(`landing.preview.market.${resultKey}.price`)}</span>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
