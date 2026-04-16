import { Trash2 } from "lucide-react";
import Button from "../ui/Button";
import { materialRequestStatusOptions } from "../../data/mockMaterials";
import { useI18n } from "../../hooks/useI18n";
import {
  getMaterialRequestItem,
  getMaterialRequestNote,
  getMaterialRequestProjectName
} from "../../utils/localizedValue";
import MaterialStatusBadge from "./MaterialStatusBadge";
import { formatRequestDate } from "./materialsUtils";

export default function MaterialRequestCard({ request, isAdmin, locale, onDelete, onStatusChange }) {
  const { t } = useI18n();
  const canDelete = !isAdmin && ["pending", "rejected"].includes(String(request.status).toLowerCase());

  return (
    <article className="rounded-[28px] border border-white/60 bg-white/85 p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg text-slate-950">{getMaterialRequestItem(t, request)}</p>
          <p className="mt-1 text-sm text-slate-500">
            {t("materials.requestedBy", "Requested by")}: {request.requestedBy}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MaterialStatusBadge value={request.status} />
          {canDelete ? (
            <Button
              variant="ghost"
              className="gap-2 bg-rose-50 px-3 py-2 text-rose-700 hover:bg-rose-100"
              onClick={() => onDelete(request.id)}
            >
              <Trash2 size={14} />
              {t("common.delete")}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
        {request.projectName ? (
          <div className="rounded-[20px] bg-slate-50/90 px-4 py-3">
            <span className="text-slate-400">{t("common.project")}:</span> {getMaterialRequestProjectName(t, request)}
          </div>
        ) : null}

        {request.quantity ? (
          <div className="rounded-[20px] bg-slate-50/90 px-4 py-3">
            <span className="text-slate-400">{t("materials.quantity", "Quantity")}:</span> {request.quantity}
          </div>
        ) : null}

        <div className="rounded-[20px] bg-slate-50/90 px-4 py-3 sm:col-span-2">
          <span className="text-slate-400">{t("materials.createdOn", "Created")}:</span>{" "}
          {formatRequestDate(request.createdAt, locale)}
        </div>

        {request.note ? (
          <div className="rounded-[20px] bg-slate-50/90 px-4 py-3 sm:col-span-2">
            <p className="text-slate-400">{t("materials.note", "Note")}</p>
            <p className="mt-2 text-slate-600">{getMaterialRequestNote(t, request)}</p>
          </div>
        ) : null}
      </div>

      {isAdmin ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">{t("materials.updateStatus", "Update request status")}</p>
          <select
            value={request.status}
            onChange={(event) => onStatusChange(request.id, event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          >
            {materialRequestStatusOptions.map((status) => (
              <option key={status} value={status}>
                {t(`statusLabels.${status.toLowerCase()}`, status)}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </article>
  );
}
