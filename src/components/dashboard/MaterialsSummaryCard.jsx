import { ArrowRight, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "../../hooks/useI18n";
import {
  getMaterialRequestItem,
  getMaterialRequestProjectName
} from "../../utils/localizedValue";
import MaterialStatusBadge from "../materials/MaterialStatusBadge";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";

export default function MaterialsSummaryCard({ requests }) {
  const { t } = useI18n();

  return (
    <Card>
      <SectionHeader
        title={t("dashboard.materialRequestsLabel", "Material requests")}
        subtitle={t(
          "dashboard.materialRequestsSubtitle",
          "Recent requests that still need office follow-up or status checks."
        )}
        action={
          <Link to="/materials" className="inline-flex items-center gap-2 text-sm text-brand-700">
            {t("dashboard.openMaterials", "Open materials")}
            <ArrowRight size={15} />
          </Link>
        }
      />

      <div className="space-y-3">
        {requests.length ? (
          requests.map((request) => (
            <div key={request.id} className="rounded-[24px] bg-white/80 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base text-slate-900">{getMaterialRequestItem(t, request)}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {request.requestedBy}
                    {request.projectName ? ` - ${getMaterialRequestProjectName(t, request)}` : ""}
                  </p>
                </div>
                <MaterialStatusBadge value={request.status} />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/60 px-5 py-10 text-sm text-slate-500">
            {t("materials.emptyRequests", "No material requests are in the queue right now.")}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
        <ClipboardList size={15} className="text-brand-600" />
        <span>{t("dashboard.materialStatusHint", "Pending, ordered, purchased and rejected requests stay visible here.")}</span>
      </div>
    </Card>
  );
}
