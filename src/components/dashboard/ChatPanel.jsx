import { useEffect, useMemo, useState } from "react";
import ChatComposer from "../chat/ChatComposer";
import ChatMessageList from "../chat/ChatMessageList";
import ChatThreadList from "../chat/ChatThreadList";
import { buildAttachments } from "../chat/chatAttachments";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";

export default function ChatPanel({ title, subtitle, threads, user, onSendMessage, placeholder }) {
  const [activeThreadId, setActiveThreadId] = useState(threads[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState([]);

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

  return (
    <Card className="h-full">
      <SectionHeader title={title} subtitle={subtitle} />

      <div className="grid min-w-0 gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
        <ChatThreadList activeThread={activeThread} onSelectThread={setActiveThreadId} threads={threads} />

        <div className="flex min-h-[min(62dvh,520px)] min-w-0 flex-col rounded-[22px] bg-white/70 p-3 sm:min-h-[360px] sm:rounded-[28px] sm:p-4">
          <ChatMessageList activeThread={activeThread} user={user} />
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
