import { X } from "lucide-react";

export default function Modal({ children, onClose, title, description }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-8 backdrop-blur-sm">
      <div className="glass-panel relative w-full max-w-2xl rounded-[32px] p-6 sm:p-7">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-white/80 p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="mb-6 pr-10">
          <h3 className="text-2xl text-slate-900">{title}</h3>
          {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
        </div>

        {children}
      </div>
    </div>
  );
}
