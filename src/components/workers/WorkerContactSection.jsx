import { Mail, Phone } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";

export default function WorkerContactSection({ worker }) {
  const { t } = useI18n();

  return (
    <div className="rounded-[22px] bg-slate-50/90 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("workers.contact")}</p>
      <div className="mt-3 grid gap-2">
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-brand-600" />
          <span className="min-w-0 truncate">{worker.email || t("workers.notProvided")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-brand-600" />
          <span>{worker.phone || t("workers.notProvided")}</span>
        </div>
      </div>
    </div>
  );
}
