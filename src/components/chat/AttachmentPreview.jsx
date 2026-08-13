import { Check, Download, FileText, Share2, X, ZoomIn } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "../../hooks/useI18n";
import { isNativeApp, saveImageAttachment, shareImageAttachment } from "../../utils/nativeMedia";
import { formatFileSize } from "./chatAttachments";

function ImageLightbox({ attachment, onClose }) {
  const { t } = useI18n();
  const [savedFlash, setSavedFlash] = useState(false);

  const handleShare = async (event) => {
    event.stopPropagation();
    try {
      await shareImageAttachment(attachment);
    } catch {
      // user cancelled the share sheet or it failed silently — nothing to recover from here
    }
  };

  const handleSave = async (event) => {
    event.stopPropagation();
    try {
      await saveImageAttachment(attachment);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    } catch {
      // ignore — no toast system to surface a failure through
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30"
        aria-label="Close"
      >
        <X size={20} />
      </button>

      {isNativeApp ? (
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/30"
          >
            <Share2 size={16} />
            {t("chat.shareAttachment", "Share")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/30"
          >
            {savedFlash ? <Check size={16} /> : <Download size={16} />}
            {savedFlash ? t("chat.attachmentSaved", "Saved") : t("chat.saveAttachment", "Save")}
          </button>
        </div>
      ) : null}

      <img
        src={attachment.previewUrl}
        alt={attachment.name}
        className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    document.body
  );
}

export default function AttachmentPreview({ attachment, onRemove, removable = false }) {
  const { t } = useI18n();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const isImage = attachment.type.startsWith("image/");

  return (
    <>
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
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="group relative w-full overflow-hidden rounded-2xl"
          >
            <img src={attachment.previewUrl} alt={attachment.name} className="h-24 w-full rounded-2xl object-cover" />
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/0 transition group-hover:bg-black/30">
              <ZoomIn size={22} className="scale-0 text-white transition group-hover:scale-100" />
            </div>
          </button>
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

      {lightboxOpen ? (
        <ImageLightbox attachment={attachment} onClose={() => setLightboxOpen(false)} />
      ) : null}
    </>
  );
}
