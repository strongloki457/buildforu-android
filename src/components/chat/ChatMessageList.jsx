import { useI18n } from "../../hooks/useI18n";
import MessageAttachments from "./MessageAttachments";

export default function ChatMessageList({ activeThread, user }) {
  const { t } = useI18n();

  if (!activeThread) {
    return (
      <div className="flex-1">
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/60 p-6 text-center">
          <p className="text-base text-slate-900">{t("chat.emptyTitle")}</p>
          <p className="mt-2 text-sm text-slate-500">{t("chat.emptySubtitle")}</p>
        </div>
      </div>
    );
  }

  if (!activeThread.messages.length) {
    return (
      <div className="flex-1">
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/60 p-6 text-center">
          <p className="text-base text-slate-900">{t("chat.noMessagesTitle")}</p>
          <p className="mt-2 text-sm text-slate-500">{t("chat.noMessagesSubtitle")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="touch-scroll flex-1 space-y-3 overflow-y-auto pr-1">
      {activeThread.messages.map((item) => {
        const isOwn = item.senderId === user.id;

        return (
          <div key={item.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[92%] rounded-[22px] px-4 py-3 text-sm shadow-soft sm:max-w-[75%] sm:rounded-[24px] ${
                isOwn ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {item.text || item.textKey ? <p className="break-anywhere leading-6">{t(item.textKey, item.text)}</p> : null}
              <MessageAttachments attachments={item.attachments} />
              <p className={`mt-2 text-[11px] ${isOwn ? "text-white/70" : "text-slate-400"}`}>{item.timestamp}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
