import { Bot, Camera, CornerDownLeft, RotateCcw, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { aiApi } from "../api/ai.api";
import PlanUpgradeWall from "../components/common/PlanUpgradeWall";
import Card from "../components/ui/Card";
import SectionHeader from "../components/ui/SectionHeader";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "../hooks/useI18n";

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-2">
      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
    </div>
  );
}

function compressImage(file, maxWidth = 900, quality = 0.75) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = url;
  });
}

export default function AiAssistantPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const suggestions = t("aiAssistant.suggestions") ?? [];
  const isStarterPlan = (user?.plan ?? "starter") === "starter";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const compressed = await compressImage(file);
    setPendingImage(compressed);
    inputRef.current?.focus();
  };

  const sendMessage = async (text, imageData = pendingImage) => {
    const trimmed = text.trim();
    if ((!trimmed && !imageData) || isLoading) return;

    const userMsg = { role: "user", content: trimmed, image: imageData || undefined, id: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setPendingImage(null);
    setIsLoading(true);
    setError(null);

    try {
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
        ...(m.image && { image: m.image })
      }));
      const response = await aiApi.chat(apiMessages);
      const assistantMsg = {
        role: "assistant",
        content: response.reply,
        id: Date.now() + 1
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(err?.message || t("aiAssistant.errorFallback"));
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
    setPendingImage(null);
    inputRef.current?.focus();
  };

  if (isStarterPlan) {
    return (
      <PlanUpgradeWall
        title={t("aiAssistant.proOnly.title")}
        subtitle={t("aiAssistant.proOnly.subtitle")}
        cta={t("aiAssistant.proOnly.cta")}
      />
    );
  }

  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-2">
        <SectionHeader
          title={t("aiAssistant.title")}
          subtitle={t("aiAssistant.subtitle")}
        />
        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleReset}
            title={t("aiAssistant.newConversation")}
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
              <p className="text-base font-medium text-slate-900">{t("aiAssistant.emptyTitle")}</p>
              <p className="mt-1 text-sm text-slate-500">{t("aiAssistant.emptySubtitle")}</p>
            </div>
            <div className="flex w-full max-w-md flex-col gap-2">
              {Array.isArray(suggestions) && suggestions.map((s) => (
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
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt=""
                      className="mb-2 max-h-48 w-full rounded-xl object-cover"
                    />
                  )}
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

      {/* Image preview */}
      {pendingImage && (
        <div className="mt-3 flex items-start gap-2">
          <div className="relative">
            <img
              src={pendingImage}
              alt=""
              className="h-20 w-20 rounded-2xl object-cover border border-slate-200"
            />
            <button
              type="button"
              onClick={() => setPendingImage(null)}
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-white hover:bg-slate-900"
            >
              <X size={10} />
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-400">{t("aiAssistant.imageReady", "Photo ready to send")}</p>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImagePick}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          title={t("aiAssistant.addImage", "Add photo")}
          className="shrink-0 rounded-2xl border border-slate-200 bg-white p-3 text-slate-500 transition hover:bg-slate-50 hover:text-brand-700 disabled:opacity-50"
        >
          <Camera size={16} />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("aiAssistant.placeholder")}
          disabled={isLoading}
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={(!input.trim() && !pendingImage) || isLoading}
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-700 px-4 py-3 text-sm text-white transition hover:bg-brand-600 disabled:opacity-50"
        >
          <CornerDownLeft size={15} />
          {t("aiAssistant.send")}
        </button>
      </form>
    </Card>
  );
}
