import { Camera, ImagePlus, Paperclip, Send } from "lucide-react";
import { useRef } from "react";
import { useI18n } from "../../hooks/useI18n";
import AttachmentPreview from "./AttachmentPreview";

export default function ChatComposer({
  attachments,
  message,
  onFilesSelected,
  onMessageChange,
  onRemoveAttachment,
  onSend,
  placeholder
}) {
  const { t } = useI18n();
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFilesSelected = (event, source) => {
    onFilesSelected(event.target.files ?? [], source);
    event.target.value = "";
  };

  return (
    <div className="mt-4 rounded-[22px] border border-white/70 bg-white/85 p-3 shadow-soft sm:rounded-[28px]">
      {attachments.length ? (
        <div className="mb-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400 sm:tracking-[0.22em]">{t("chat.attachments")}</p>
            <p className="text-xs text-slate-400">{t("chat.attachmentReady")}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {attachments.map((attachment) => (
              <AttachmentPreview
                key={attachment.id}
                attachment={attachment}
                onRemove={onRemoveAttachment}
                removable
              />
            ))}
          </div>
        </div>
      ) : null}

      <form onSubmit={onSend} className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 md:flex-row">
          <textarea
            value={message}
            onChange={(event) => onMessageChange(event.target.value)}
            placeholder={placeholder}
            rows={3}
            className="min-h-[96px] flex-1 resize-none rounded-[20px] border border-white/70 bg-white px-4 py-3 text-base outline-none transition focus:border-brand-300 sm:text-sm md:min-h-[108px] md:rounded-[22px]"
          />

          <div className="grid grid-cols-3 gap-2 md:flex md:flex-col">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-3 py-3 text-sm text-slate-700 transition hover:bg-slate-200 md:w-12 md:flex-none md:px-0"
              title={t("chat.attachFile")}
            >
              <Paperclip size={18} />
              <span className="truncate md:hidden">{t("chat.attachFile")}</span>
            </button>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-3 py-3 text-sm text-slate-700 transition hover:bg-slate-200 md:w-12 md:flex-none md:px-0"
              title={t("chat.attachImage")}
            >
              <ImagePlus size={18} />
              <span className="truncate md:hidden">{t("chat.attachImage")}</span>
            </button>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-3 py-3 text-sm text-slate-700 transition hover:bg-slate-200 md:w-12 md:flex-none md:px-0"
              title={t("chat.takePhoto")}
            >
              <Camera size={18} />
              <span className="truncate md:hidden">{t("chat.takePhoto")}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">{t("chat.cameraReady")}</p>
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 px-5 py-3 text-white transition hover:-translate-y-0.5 sm:min-h-0"
            disabled={!message.trim() && !attachments.length}
          >
            <Send size={18} />
            {t("common.send")}
          </button>
        </div>
      </form>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
        className="hidden"
        onChange={(event) => handleFilesSelected(event, "file")}
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(event) => handleFilesSelected(event, "image")}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => handleFilesSelected(event, "camera")}
      />
    </div>
  );
}
