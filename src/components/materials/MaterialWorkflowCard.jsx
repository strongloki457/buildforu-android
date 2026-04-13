import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";
import { materialRequestStatusOptions } from "../../data/mockMaterials";
import { useI18n } from "../../hooks/useI18n";
import MaterialStatusBadge from "./MaterialStatusBadge";

export default function MaterialWorkflowCard() {
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
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-900">{t(`statusLabels.${status.toLowerCase()}`, status)}</p>
              <MaterialStatusBadge value={status} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
