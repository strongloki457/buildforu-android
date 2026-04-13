import { FileText, X } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import { formatFileSize } from "./chatAttachments";

export default function AttachmentPreview({ attachment, onRemove, removable = false }) {
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
