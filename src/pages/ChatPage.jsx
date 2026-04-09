import ChatPanel from "../components/dashboard/ChatPanel";
import { useAuth } from "../hooks/useAuth";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";

export default function ChatPage() {
  const { user } = useAuth();
  const { threads, sendMessage } = useAppData();
  const { t } = useI18n();

  const scopedThreads = threads.filter((thread) => thread.participants.includes(user.id));

  return (
    <ChatPanel
      title={t("chat.title")}
      subtitle={t("chat.subtitle")}
      threads={scopedThreads}
      user={user}
      onSendMessage={sendMessage}
      placeholder={t("chat.placeholder")}
    />
  );
}
