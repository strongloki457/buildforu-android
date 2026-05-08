import { useI18n } from "../../hooks/useI18n";

export default function ChatThreadList({ activeThread, onSelectThread, threads }) {
  const { t } = useI18n();

  if (!threads.length) {
    return (
      <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/60 p-5 text-sm text-slate-500">
        <p className="text-base text-slate-900">{t("chat.noThreadsTitle")}</p>
        <p className="mt-2">{t("chat.noThreadsSubtitle")}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 xl:block xl:space-y-2 xl:overflow-visible xl:pb-0">
      {threads.map((thread) => {
        const isActive = thread.id === activeThread?.id;
        const latestMessage = thread.messages[thread.messages.length - 1];

        return (
          <button
            key={thread.id}
            type="button"
            onClick={() => onSelectThread(thread.id)}
            className={`min-w-[220px] rounded-[24px] p-4 text-left transition xl:w-full xl:min-w-0 ${
              isActive ? "bg-brand-700 text-white shadow-lg shadow-brand-900/20" : "bg-white/80 text-slate-700"
            }`}
          >
            <p className="text-sm">{thread.name}</p>
            <p className={`mt-2 text-xs ${isActive ? "text-white/70" : "text-slate-400"}`}>
              {t(latestMessage?.textKey, latestMessage?.text || t("chat.messageWithAttachments"))}
            </p>
          </button>
        );
      })}
    </div>
  );
}
