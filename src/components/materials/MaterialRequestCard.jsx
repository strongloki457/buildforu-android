import { Trash2 } from "lucide-react";
import Button from "../ui/Button";
import { materialRequestStatusOptions } from "../../data/options";
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
    <article className="rounded-[22px] border border-white/60 bg-white/85 p-4 shadow-soft sm:rounded-[28px] sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="break-anywhere text-base text-slate-950 sm:text-lg">{getMaterialRequestItem(t, request)}</p>
          <p className="break-anywhere mt-1 text-sm text-slate-500">
            {t("materials.requestedBy", "Requested by")}: {request.requestedBy}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MaterialStatusBadge value={request.status} />
          {canDelete ? (
            <Button
              variant="ghost"
              className="min-h-11 gap-2 bg-rose-50 px-3 py-2 text-rose-700 hover:bg-rose-100"
              onClick={() => onDelete(request.id)}
            >
              <Trash2 size={14} />
              {t("common.delete")}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-500 sm:mt-5 sm:grid-cols-2">
        <div className="rounded-[20px] bg-slate-50/90 px-4 py-3">
          <span className="text-slate-400">{t("common.project")}:</span>{" "}
          <span className="break-anywhere">{request.projectName ? getMaterialRequestProjectName(t, request) : t("materials.noProjectLink", "No project link")}</span>
        </div>

        {request.quantity ? (
          <div className="rounded-[20px] bg-slate-50/90 px-4 py-3">
            <span className="text-slate-400">{t("materials.quantity", "Quantity")}:</span> <span className="break-anywhere">{request.quantity}</span>
          </div>
        ) : null}

        <div className="rounded-[20px] bg-slate-50/90 px-4 py-3 sm:col-span-2">
          <span className="text-slate-400">{t("materials.createdOn", "Created")}:</span>{" "}
          {formatRequestDate(request.createdAt, locale)}
        </div>

        {request.note ? (
          <div className="rounded-[20px] bg-slate-50/90 px-4 py-3 sm:col-span-2">
            <p className="text-slate-400">{t("materials.note", "Note")}</p>
            <p className="break-anywhere mt-2 text-slate-600">{getMaterialRequestNote(t, request)}</p>
          </div>
        ) : null}

        {request.imageBase64 ? (
          <div className="sm:col-span-2">
            <img
              src={request.imageBase64}
              alt=""
              className="w-full rounded-[20px] object-cover max-h-64"
            />
          </div>
        ) : null}
      </div>

      {isAdmin ? (
        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">{t("materials.updateStatus", "Update request status")}</p>
          <select
            value={request.status}
            onChange={(event) => onStatusChange(request.id, event.target.value)}
            className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-base text-slate-700 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100 sm:w-auto sm:text-sm"
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
