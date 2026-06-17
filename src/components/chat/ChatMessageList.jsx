import { Trash2 } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import MessageAttachments from "./MessageAttachments";

export default function ChatMessageList({ activeThread, hasThreads = Boolean(activeThread), user, onDeleteMessage }) {
  const { t } = useI18n();

  if (!activeThread) {
    return (
      <div className="flex-1">
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/60 p-6 text-center">
          <p className="text-base text-slate-900">
            {hasThreads ? t("chat.emptyTitle") : t("chat.noThreadsTitle")}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {hasThreads ? t("chat.emptySubtitle") : t("chat.noThreadsSubtitle")}
          </p>
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
          <div key={item.id} className={`group flex items-end gap-1.5 ${isOwn ? "justify-end" : "justify-start"}`}>
            {isOwn && onDeleteMessage ? (
              <button
                type="button"
                onClick={() => onDeleteMessage(activeThread.id, item.id)}
                className="mb-1 shrink-0 rounded-full p-1 text-slate-300 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
                title={t("chat.deleteMessage", "Usuń wiadomość")}
              >
                <Trash2 size={13} />
              </button>
            ) : null}
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
