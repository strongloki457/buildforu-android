import { Bot, CornerDownLeft, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { aiApi } from "../api/ai.api";
import Card from "../components/ui/Card";
import SectionHeader from "../components/ui/SectionHeader";

const SUGGESTIONS = [
  "Ile cementu potrzebuję na 10m² posadzki?",
  "Jak obliczyć ilość cegieł na ścianę?",
  "Jakie normy BHP obowiązują na budowie?",
  "Czym różni się beton C20/25 od C25/30?",
  "Jak zaizolować fundament przed wilgocią?"
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-2">
      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
    </div>
  );
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg = { role: "user", content: trimmed, id: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const apiMessages = newMessages.map((m) => ({ role: m.role, content: m.content }));
      const response = await aiApi.chat(apiMessages);
      const assistantMsg = {
        role: "assistant",
        content: response.reply,
        id: Date.now() + 1
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(err?.message || "Nie udało się połączyć z asystentem. Sprawdź czy ANTHROPIC_API_KEY jest ustawiony w backend/.env");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleReset = () => {
    setMessages([]);
    setError(null);
    inputRef.current?.focus();
  };

  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-2">
        <SectionHeader
          title="Asystent budowlany AI"
          subtitle="Zadaj pytanie dotyczące materiałów, technologii lub norm budowlanych"
        />
        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleReset}
            title="Nowa rozmowa"
            className="mt-1 shrink-0 rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:bg-slate-50"
          >
            <RotateCcw size={15} />
          </button>
        )}
      </div>

      {/* Message area */}
      <div className="mt-4 flex min-h-[min(55dvh,460px)] flex-1 flex-col overflow-y-auto rounded-[22px] bg-white/70 p-3 sm:min-h-[360px] sm:rounded-[28px] sm:p-4">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[28px] bg-brand-50">
              <Bot size={32} className="text-brand-600" />
            </div>
            <div className="text-center">
              <p className="text-base font-medium text-slate-900">Asystent budowlany</p>
              <p className="mt-1 text-sm text-slate-500">Pytaj o materiały, technologie, normy i BHP</p>
            </div>
            <div className="flex w-full max-w-md flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendMessage(s)}
                  className="rounded-2xl border border-slate-100 bg-white px-4 py-3 text-left text-sm text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
                >
                  <Sparkles size={13} className="mr-2 inline-block text-brand-400" />
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-2xl bg-brand-100">
                    <Bot size={14} className="text-brand-700" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-[20px] px-4 py-3 text-sm leading-relaxed shadow-soft sm:max-w-[75%] ${
                    msg.role === "user"
                      ? "bg-brand-700 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="mr-2 mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-2xl bg-brand-100">
                  <Bot size={14} className="text-brand-700" />
                </div>
                <div className="rounded-[20px] bg-slate-100 px-4 py-1 shadow-soft">
                  <TypingDots />
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Zadaj pytanie budowlane…"
          disabled={isLoading}
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-700 px-4 py-3 text-sm text-white transition hover:bg-brand-600 disabled:opacity-50"
        >
          <CornerDownLeft size={15} />
          Wyślij
        </button>
      </form>
    </Card>
  );
}
