import { FileText, X, ZoomIn } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "../../hooks/useI18n";
import { formatFileSize } from "./chatAttachments";

function ImageLightbox({ src, alt, onClose }) {
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
      <img
        src={src}
        alt={alt}
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
        <ImageLightbox
          src={attachment.previewUrl}
          alt={attachment.name}
          onClose={() => setLightboxOpen(false)}
        />
      ) : null}
    </>
  );
}
