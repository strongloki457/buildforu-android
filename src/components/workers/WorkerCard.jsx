import { Clock3, Crosshair, Eye, Mail, MapPin, Phone, Trash2, UserRoundPen } from "lucide-react";
import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";
import { useI18n } from "../../hooks/useI18n";
import { formatAttendanceDateTime, hasAttendanceLocation } from "../../utils/attendance";
import { getLocalizedValue, getProjectName, getWorkerPosition } from "../../utils/localizedValue";

function getWorkerInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

export default function WorkerCard({ locale, onDelete, onEdit, onViewAttendance, worker }) {
  const { t } = useI18n();

  return (
    <article className="rounded-[28px] border border-white/60 bg-white/85 p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-brand-100">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-brand-50 text-lg text-brand-700">
            {getWorkerInitials(worker.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg text-slate-900">{worker.name}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">
                {getWorkerPosition(t, worker) || t("workers.notProvided")}
              </span>
              <StatusBadge value={worker.attendance?.currentStatus ?? worker.status} />
              <StatusBadge value={worker.availability} />
            </div>
          </div>
        </div>

        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <Button variant="ghost" className="flex-1 gap-2 px-3 py-2 sm:flex-none" onClick={() => onViewAttendance(worker)}>
            <Eye size={16} />
            {t("attendance.viewDetails")}
          </Button>
          <Button variant="secondary" className="flex-1 gap-2 px-3 py-2 sm:flex-none" onClick={() => onEdit(worker)}>
            <UserRoundPen size={16} />
            {t("common.edit")}
          </Button>
          <Button
            variant="ghost"
            className="flex-1 gap-2 bg-rose-50 px-3 py-2 text-rose-700 hover:bg-rose-100 sm:flex-none"
            onClick={() => onDelete(worker)}
          >
            <Trash2 size={16} />
            {t("common.delete")}
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-500">
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

        <div className="rounded-[22px] bg-slate-50/90 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("workers.operations")}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <p className="text-slate-400">{t("workers.assignedProjects", "Assigned projects")}:</p>
              {worker.assignedProjects.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {worker.assignedProjects.map((project) => (
                    <span key={project.id} className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">
                      {getProjectName(t, project)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2">{t("workers.notProvided")}</p>
              )}
            </div>
            <p>
              <span className="text-slate-400">{t("workers.nextShift")}:</span>{" "}
              {worker.nextShift === "Not scheduled" ? t("workers.notScheduled") : worker.nextShift}
            </p>
            <p>
              <span className="text-slate-400">{t("common.location")}:</span>{" "}
              {getLocalizedValue(t, worker.locationKey, worker.location) || t("workers.notProvided")}
            </p>
            <p>
              <span className="text-slate-400">{t("workers.completionRate")}:</span> {worker.completionRate}%
            </p>
          </div>
        </div>

        <div className="rounded-[22px] bg-slate-50/90 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("attendance.title")}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <Clock3 size={14} className="mt-0.5 text-brand-600" />
              <div>
                <p className="text-xs text-slate-400">{t("attendance.lastStart")}</p>
                <p className="text-sm text-slate-600">
                  {formatAttendanceDateTime(worker.attendance?.workStartTime, locale) ?? t("attendance.noRecord")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock3 size={14} className="mt-0.5 text-brand-600" />
              <div>
                <p className="text-xs text-slate-400">{t("attendance.lastEnd")}</p>
                <p className="text-sm text-slate-600">
                  {formatAttendanceDateTime(worker.attendance?.workEndTime, locale) ?? t("attendance.noRecord")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Crosshair size={14} className="mt-0.5 text-brand-600" />
              <div>
                <p className="text-xs text-slate-400">{t("attendance.locationIndicator")}</p>
                <p className="text-sm text-slate-600">
                  {hasAttendanceLocation(worker.attendance?.workStartLocation) ||
                  hasAttendanceLocation(worker.attendance?.workEndLocation)
                    ? t("attendance.locationCaptured")
                    : t("attendance.locationUnavailableShort")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 text-brand-600" />
              <div>
                <p className="text-xs text-slate-400">{t("attendance.currentStatus")}</p>
                <p className="text-sm text-slate-600">
                  {t(
                    `statusLabels.${String(worker.attendance?.currentStatus ?? worker.status).toLowerCase()}`,
                    worker.attendance?.currentStatus ?? worker.status
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
