import { Send } from "lucide-react";
import { useMemo, useState } from "react";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";

export default function ChatPanel({
  title,
  subtitle,
  threads,
  user,
  onSendMessage,
  placeholder
}) {
  const [activeThreadId, setActiveThreadId] = useState(threads[0]?.id ?? "");
  const [message, setMessage] = useState("");

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? threads[0],
    [threads, activeThreadId]
  );

  const handleSend = (event) => {
    event.preventDefault();

    if (!activeThread) {
      return;
    }

    onSendMessage({
      threadId: activeThread.id,
      senderId: user.id,
      text: message
    });
    setMessage("");
  };

  return (
    <Card className="h-full">
      <SectionHeader title={title} subtitle={subtitle} />

      <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
        <div className="space-y-2">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setActiveThreadId(thread.id)}
              className={`w-full rounded-[24px] p-4 text-left transition ${
                thread.id === activeThread?.id ? "bg-brand-700 text-white" : "bg-white/80 text-slate-700"
              }`}
            >
              <p className="text-sm">{thread.name}</p>
              <p className={`mt-2 text-xs ${thread.id === activeThread?.id ? "text-white/70" : "text-slate-400"}`}>
                {thread.messages[thread.messages.length - 1]?.text}
              </p>
            </button>
          ))}
        </div>

        <div className="flex min-h-[360px] flex-col rounded-[28px] bg-white/70 p-4">
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {activeThread?.messages.map((item) => {
              const isOwn = item.senderId === user.id;

              return (
                <div key={item.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-[24px] px-4 py-3 text-sm ${
                      isOwn ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <p>{item.text}</p>
                    <p className={`mt-2 text-[11px] ${isOwn ? "text-white/70" : "text-slate-400"}`}>{item.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSend} className="mt-4 flex gap-3">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={placeholder}
              className="flex-1 rounded-2xl border border-white/70 bg-white px-4 py-3 text-sm outline-none"
            />
            <button className="rounded-2xl bg-brand-700 px-4 text-white transition hover:bg-brand-600">
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </Card>
  );
}
