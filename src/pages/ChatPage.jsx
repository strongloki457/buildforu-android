import ChatPanel from "../components/dashboard/ChatPanel";
import { chatApi } from "../api/chat.api";
import { useAuth } from "../hooks/useAuth";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";
import { useSocket } from "../hooks/useSocket";
import { useCallback, useEffect, useState } from "react";

export default function ChatPage() {
  const { user } = useAuth();
  const { threads, sendMessage, startThread } = useAppData();
  const { t } = useI18n();
  const [contacts, setContacts] = useState([]);
  const [isContactsLoading, setIsContactsLoading] = useState(false);
  const [liveMessages, setLiveMessages] = useState({});

  const scopedThreads = threads
    .filter((thread) => {
      const participants = Array.isArray(thread.participants) ? thread.participants : [];
      return participants.includes(user.id);
    })
    .map((thread) => {
      const extras = liveMessages[thread.id];
      if (!extras?.length) return thread;
      const existingIds = new Set(thread.messages.map((m) => m.id));
      const newOnes = extras.filter((m) => !existingIds.has(m.id));
      return newOnes.length ? { ...thread, messages: [...thread.messages, ...newOnes] } : thread;
    });

  const handleSocketMessage = useCallback(({ threadId, message }) => {
    if (message.senderId === user.id) return;
    const ts = new Date(message.createdAt);
    const formatted = `${String(ts.getHours()).padStart(2, "0")}:${String(ts.getMinutes()).padStart(2, "0")}`;
    const apiAttachments = Array.isArray(message.attachments) ? message.attachments : [];
    const attachments = apiAttachments.length
      ? apiAttachments.map((a) => ({ ...a, previewUrl: a.data }))
      : undefined;
    setLiveMessages((prev) => ({
      ...prev,
      [threadId]: [...(prev[threadId] ?? []), {
        id: message.id,
        senderId: message.senderId,
        text: message.text,
        timestamp: formatted,
        attachments
      }]
    }));
  }, [user.id]);

  useSocket(handleSocketMessage);

  useEffect(() => {
    let isMounted = true;
    setIsContactsLoading(true);
    chatApi
      .getCompanyUsers()
      .then((response) => { if (isMounted) setContacts(response?.users ?? []); })
      .catch(() => { if (isMounted) setContacts([]); })
      .finally(() => { if (isMounted) setIsContactsLoading(false); });
    return () => { isMounted = false; };
  }, []);

  return (
    <ChatPanel
      title={t("chat.title")}
      subtitle={t("chat.subtitle")}
      threads={scopedThreads}
      user={user}
      onSendMessage={sendMessage}
      contacts={contacts}
      isContactsLoading={isContactsLoading}
      onStartThread={startThread}
      placeholder={t("chat.placeholder")}
    />
  );
}
