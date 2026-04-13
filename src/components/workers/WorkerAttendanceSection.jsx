import { Clock3, Crosshair, MapPin } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";
import { formatAttendanceDateTime, hasAttendanceLocation } from "../../utils/attendance";

export default function WorkerAttendanceSection({ locale, worker }) {
  const { t } = useI18n();

  return (
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
  );
}
