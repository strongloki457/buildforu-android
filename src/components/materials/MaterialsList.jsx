import { ClipboardList } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import MaterialRequestCard from "./MaterialRequestCard";

export default function MaterialsList({ filteredRequests, isAdmin, locale, onDelete, onStatusChange }) {
  const { t } = useI18n();

  if (!filteredRequests.length) {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
        <ClipboardList size={28} className="mx-auto text-brand-600" />
        <h3 className="mt-4 text-2xl text-slate-900">{t("materials.emptyTitle", "No requests found")}</h3>
        <p className="mt-2 text-sm text-slate-500">
          {t(
            "materials.emptySubtitle",
            "Try a different search or status filter, or create a new request to get started."
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {filteredRequests.map((request) => (
        <MaterialRequestCard
          key={request.id}
          request={request}
          isAdmin={isAdmin}
          locale={locale}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
