import { X } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";

export default function Modal({ children, onClose, title, description }) {
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-2 py-2 backdrop-blur-sm sm:items-center sm:px-4 sm:py-8">
      <div
        role="dialog"
        aria-modal="true"
        className="glass-panel relative max-h-[calc(100dvh-1rem)] w-full max-w-2xl overflow-y-auto rounded-[24px] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:max-h-[calc(100vh-4rem)] sm:rounded-[32px] sm:p-7"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/80 p-2 text-slate-500 transition hover:bg-white hover:text-slate-900 sm:right-4 sm:top-4"
          aria-label={t("common.closeModal")}
        >
          <X size={18} />
        </button>

        <div className="mb-5 min-w-0 pr-12 sm:mb-6">
          <h3 className="break-anywhere text-lg text-slate-900 sm:text-2xl">{title}</h3>
          {description ? <p className="break-anywhere mt-2 text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>

        {children}
      </div>
    </div>
  );
}
