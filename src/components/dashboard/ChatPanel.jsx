import { useEffect, useMemo, useState } from "react";
import ChatComposer from "../chat/ChatComposer";
import ChatMessageList from "../chat/ChatMessageList";
import ChatThreadList from "../chat/ChatThreadList";
import { buildAttachments } from "../chat/chatAttachments";
import { MessageSquarePlus } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";

export default function ChatPanel({
  contacts = [],
  isContactsLoading = false,
  onStartThread,
  title,
  subtitle,
  threads,
  user,
  onSendMessage,
  placeholder
}) {
  const { t } = useI18n();
  const [activeThreadId, setActiveThreadId] = useState(threads[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [startingUserId, setStartingUserId] = useState("");

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? threads[0],
    [threads, activeThreadId]
  );

  useEffect(() => {
    if (!threads.some((thread) => thread.id === activeThreadId)) {
      setActiveThreadId(threads[0]?.id ?? "");
    }
  }, [activeThreadId, threads]);

  const handleAttachmentSelection = async (files, source) => {
    if (!files.length) {
      return;
    }

    const nextAttachments = await buildAttachments(Array.from(files), source);
    setAttachments((current) => [...current, ...nextAttachments]);
  };

  const handleSend = async (event) => {
    event.preventDefault();

    if (!activeThread) {
      return;
    }

    onSendMessage({
      threadId: activeThread.id,
      senderId: user.id,
      text: message,
      attachments
    });
    setMessage("");
    setAttachments([]);
  };

  const removeAttachment = (attachmentId) => {
    setAttachments((current) => current.filter((attachment) => attachment.id !== attachmentId));
  };

  const handleStartThread = async (contactId) => {
    if (!onStartThread || !contactId) {
      return;
    }

    setStartingUserId(contactId);
    const thread = await onStartThread(contactId);

    if (thread?.id) {
      setActiveThreadId(thread.id);
    }

    setStartingUserId("");
  };

  return (
    <Card className="h-full">
      <SectionHeader title={title} subtitle={subtitle} />

      <div className="grid min-w-0 gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
        <div className="grid min-w-0 gap-3">
          {threads.length ? (
            <ChatThreadList activeThread={activeThread} onSelectThread={setActiveThreadId} threads={threads} />
          ) : null}

          <div className="rounded-[24px] border border-slate-100 bg-white/70 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-900">
              <MessageSquarePlus size={16} className="text-brand-600" />
              <span>{t("chat.startConversation")}</span>
            </div>

            <div className="mt-3 grid gap-2">
              {isContactsLoading ? (
                <p className="text-sm text-slate-500">{t("chat.loadingContacts")}</p>
              ) : contacts.length ? (
                contacts.map((contact) => (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => handleStartThread(contact.id)}
                    disabled={startingUserId === contact.id}
                    className="min-h-11 rounded-2xl bg-slate-50 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-brand-50 hover:text-brand-700 disabled:cursor-wait disabled:opacity-70"
                  >
                    <span className="block truncate">{contact.name}</span>
                    <span className="block text-xs uppercase text-slate-400">
                      {t(`roles.${String(contact.role || "").toLowerCase()}`, contact.role)}
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-sm leading-6 text-slate-500">{t("chat.noContacts")}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex min-h-[min(62dvh,520px)] min-w-0 flex-col rounded-[22px] bg-white/70 p-3 sm:min-h-[360px] sm:rounded-[28px] sm:p-4">
          <ChatMessageList activeThread={activeThread} hasThreads={threads.length > 0} user={user} />
          {activeThread ? (
            <ChatComposer
              attachments={attachments}
              message={message}
              onFilesSelected={handleAttachmentSelection}
              onMessageChange={setMessage}
              onRemoveAttachment={removeAttachment}
              onSend={handleSend}
              placeholder={placeholder}
            />
          ) : null}
        </div>
      </div>
    </Card>
  );
}
