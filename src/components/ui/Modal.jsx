import { X } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";

export default function Modal({ children, onClose, title, description }) {
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-8">
      <div
        role="dialog"
        aria-modal="true"
        className="glass-panel relative max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-[28px] p-5 sm:max-h-[calc(100vh-4rem)] sm:rounded-[32px] sm:p-7"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-white/80 p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
          aria-label={t("common.closeModal")}
        >
          <X size={18} />
        </button>

        <div className="mb-6 pr-10">
          <h3 className="text-xl text-slate-900 sm:text-2xl">{title}</h3>
          {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
        </div>

        {children}
      </div>
    </div>
  );
}
