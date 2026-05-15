import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";
import { materialRequestStatusOptions } from "../../data/options";
import { useI18n } from "../../hooks/useI18n";
import MaterialStatusBadge from "./MaterialStatusBadge";

const statusDescriptions = {
  Ordered: "Sent to the supplier or store and waiting for confirmation.",
  Pending: "Waiting for office review, approval, or buying action.",
  Purchased: "Confirmed and ready for pickup or delivery to site.",
  Rejected: "Declined or sent back for clarification before ordering."
};

export default function MaterialWorkflowCard({ projectLinkedCount = 0, statusCounts = {}, totalRequests = 0 }) {
  const { t } = useI18n();

  return (
    <Card>
      <SectionHeader
        title={t("materials.adminScope", "Admin material board")}
        subtitle={t(
          "materials.adminScopeSubtitle",
          "Review requests from the field and move them through purchasing statuses."
        )}
      />

      <div className="grid gap-3">
        {materialRequestStatusOptions.map((status) => (
          <div key={status} className="rounded-[22px] bg-slate-50/90 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-900">{t(`statusLabels.${status.toLowerCase()}`, status)}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {t(`materials.workflowHelp.${status.toLowerCase()}`, statusDescriptions[status])}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="min-w-7 text-right text-sm text-slate-500">{statusCounts[status] ?? 0}</span>
                <MaterialStatusBadge value={status} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
        <div className="rounded-[22px] bg-brand-50/80 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.22em] text-brand-600">{t("materials.requestsVisible", "Requests")}</p>
          <p className="mt-2 text-2xl text-slate-900">{totalRequests}</p>
        </div>
        <div className="rounded-[22px] bg-slate-50/90 px-4 py-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            {t("materials.projectLinked", "Linked to project")}
          </p>
          <p className="mt-2 text-2xl text-slate-900">{projectLinkedCount}</p>
        </div>
      </div>
    </Card>
  );
}
