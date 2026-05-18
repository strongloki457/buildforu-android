import ChatPanel from "../components/dashboard/ChatPanel";
import { chatApi } from "../api/chat.api";
import { useAuth } from "../hooks/useAuth";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";
import { useEffect, useState } from "react";

export default function ChatPage() {
  const { user } = useAuth();
  const { threads, sendMessage, startThread } = useAppData();
  const { t } = useI18n();
  const [contacts, setContacts] = useState([]);
  const [isContactsLoading, setIsContactsLoading] = useState(false);

  const scopedThreads = threads.filter((thread) => {
    const participants = Array.isArray(thread.participants) ? thread.participants : [];
    return participants.includes(user.id);
  });

  useEffect(() => {
    let isMounted = true;

    setIsContactsLoading(true);
    chatApi
      .getCompanyUsers()
      .then((response) => {
        if (isMounted) {
          setContacts(response?.users ?? []);
        }
      })
      .catch(() => {
        if (isMounted) {
          setContacts([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsContactsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
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
