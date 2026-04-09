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
        <div className="flex gap-2 overflow-x-auto pb-1 xl:block xl:space-y-2 xl:overflow-visible xl:pb-0">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setActiveThreadId(thread.id)}
              className={`min-w-[220px] rounded-[24px] p-4 text-left transition xl:w-full xl:min-w-0 ${
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

        <div className="flex min-h-[320px] flex-col rounded-[28px] bg-white/70 p-4 sm:min-h-[360px]">
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {activeThread?.messages.map((item) => {
              const isOwn = item.senderId === user.id;

              return (
                <div key={item.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[88%] rounded-[24px] px-4 py-3 text-sm sm:max-w-[75%] ${
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

          <form onSubmit={handleSend} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={placeholder}
              className="flex-1 rounded-2xl border border-white/70 bg-white px-4 py-3 text-sm outline-none"
            />
            <button className="rounded-2xl bg-brand-700 px-4 py-3 text-white transition hover:bg-brand-600 sm:py-0">
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </Card>
  );
}
