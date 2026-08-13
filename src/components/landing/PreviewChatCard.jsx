import { MessageSquare } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import { previewChatMessages } from "./landingData";

export default function PreviewChatCard() {
  const { t } = useI18n();

  return (
    <article className="rounded-[26px] border border-slate-100 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-50 p-2.5 text-brand-700">
            <MessageSquare size={18} />
          </div>
          <div>
            <p className="text-sm text-slate-500">{t("landing.preview.chat.label")}</p>
            <p className="text-base text-slate-900">{t("landing.preview.chat.title")}</p>
          </div>
        </div>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">{t("landing.preview.chat.badge")}</span>
      </div>

      <div className="mt-4 space-y-3">
        {previewChatMessages.map((messageKey, index) => (
          <div
            key={messageKey}
            className={`rounded-2xl px-3 py-3 text-sm ${
              index === 1 ? "bg-brand-700 text-white" : "bg-slate-50 text-slate-700"
            }`}
          >
            <p className={`text-xs uppercase tracking-[0.18em] ${index === 1 ? "text-white/60" : "text-slate-400"}`}>
              {t(`landing.preview.chat.${messageKey}.author`)}
            </p>
            <p className="mt-2 leading-6">{t(`landing.preview.chat.${messageKey}.text`)}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
