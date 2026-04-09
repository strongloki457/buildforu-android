import { Camera, FileText, ImagePlus, Paperclip, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";
import { useI18n } from "../../hooks/useI18n";

function formatFileSize(size) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 102.4) / 10} KB`;
  }

  return `${Math.round(size / 1024 / 102.4) / 10} MB`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function buildAttachments(files, source) {
  return Promise.all(
    files.map(async (file) => ({
      id: `${source}-${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      source,
      previewUrl: file.type.startsWith("image/") ? await readFileAsDataUrl(file) : ""
    }))
  );
}

function AttachmentPreview({ attachment, onRemove, removable = false }) {
  const { t } = useI18n();
  const isImage = attachment.type.startsWith("image/");

  return (
    <div className="relative overflow-hidden rounded-[22px] border border-white/70 bg-white/90 p-3 shadow-soft">
      {removable ? (
        <button
          type="button"
          onClick={() => onRemove?.(attachment.id)}
          className="absolute right-2 top-2 rounded-full bg-slate-950/70 p-1 text-white"
          aria-label={t("chat.removeAttachment")}
        >
          <X size={14} />
        </button>
      ) : null}

      {isImage ? (
        <img src={attachment.previewUrl} alt={attachment.name} className="h-24 w-full rounded-2xl object-cover" />
      ) : (
        <div className="flex h-24 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <FileText size={24} />
        </div>
      )}

      <div className="mt-3 min-w-0">
        <p className="truncate text-sm text-slate-900">{attachment.name}</p>
        <p className="mt-1 text-xs text-slate-400">{formatFileSize(attachment.size)}</p>
      </div>
    </div>
  );
}

function MessageAttachments({ attachments }) {
  if (!attachments?.length) {
    return null;
  }

  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {attachments.map((attachment) => (
        <AttachmentPreview key={attachment.id} attachment={attachment} />
      ))}
    </div>
  );
}

export default function ChatPanel({
  title,
  subtitle,
  threads,
  user,
  onSendMessage,
  placeholder
}) {
  const { t } = useI18n();
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const cameraInputRef = useRef(null);
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

      <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
        <div className="flex gap-2 overflow-x-auto pb-1 xl:block xl:space-y-2 xl:overflow-visible xl:pb-0">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => setActiveThreadId(thread.id)}
              className={`min-w-[220px] rounded-[24px] p-4 text-left transition xl:w-full xl:min-w-0 ${
                thread.id === activeThread?.id ? "bg-brand-700 text-white shadow-lg shadow-brand-900/20" : "bg-white/80 text-slate-700"
              }`}
            >
              <p className="text-sm">{thread.name}</p>
              <p className={`mt-2 text-xs ${thread.id === activeThread?.id ? "text-white/70" : "text-slate-400"}`}>
                {t(
                  thread.messages[thread.messages.length - 1]?.textKey,
                  thread.messages[thread.messages.length - 1]?.text || t("chat.messageWithAttachments")
                )}
              </p>
            </button>
          ))}
        </div>

        <div className="flex min-h-[320px] flex-col rounded-[28px] bg-white/70 p-4 sm:min-h-[360px]">
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {activeThread ? (
              activeThread.messages.map((item) => {
                const isOwn = item.senderId === user.id;

                return (
                  <div key={item.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[92%] rounded-[24px] px-4 py-3 text-sm shadow-soft sm:max-w-[75%] ${
                        isOwn ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {item.text || item.textKey ? <p>{t(item.textKey, item.text)}</p> : null}
                      <MessageAttachments attachments={item.attachments} />
                      <p className={`mt-2 text-[11px] ${isOwn ? "text-white/70" : "text-slate-400"}`}>{item.timestamp}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/60 p-6 text-center">
                <p className="text-base text-slate-900">{t("chat.emptyTitle")}</p>
                <p className="mt-2 text-sm text-slate-500">{t("chat.emptySubtitle")}</p>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-[28px] border border-white/70 bg-white/85 p-3 shadow-soft">
            {attachments.length ? (
              <div className="mb-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("chat.attachments")}</p>
                  <p className="text-xs text-slate-400">{t("chat.attachmentReady")}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {attachments.map((attachment) => (
                    <AttachmentPreview
                      key={attachment.id}
                      attachment={attachment}
                      onRemove={removeAttachment}
                      removable
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSend} className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={placeholder}
                  rows={3}
                  className="min-h-[108px] flex-1 rounded-[22px] border border-white/70 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-300"
                />

                <div className="flex gap-2 sm:flex-col">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-200 sm:w-12 sm:flex-none sm:px-0"
                    title={t("chat.attachFile")}
                  >
                    <Paperclip size={18} />
                    <span className="sm:hidden">{t("chat.attachFile")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-200 sm:w-12 sm:flex-none sm:px-0"
                    title={t("chat.attachImage")}
                  >
                    <ImagePlus size={18} />
                    <span className="sm:hidden">{t("chat.attachImage")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-200 sm:w-12 sm:flex-none sm:px-0"
                    title={t("chat.takePhoto")}
                  >
                    <Camera size={18} />
                    <span className="sm:hidden">{t("chat.takePhoto")}</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">{t("chat.cameraReady")}</p>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 px-5 py-3 text-white transition hover:-translate-y-0.5"
                  disabled={!message.trim() && !attachments.length}
                >
                  <Send size={18} />
                  {t("common.send")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
        className="hidden"
        onChange={(event) => handleAttachmentSelection(event.target.files ?? [], "file")}
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(event) => handleAttachmentSelection(event.target.files ?? [], "image")}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => handleAttachmentSelection(event.target.files ?? [], "camera")}
      />
    </Card>
  );
}
