import Modal from "../ui/Modal";
import StatusBadge from "../ui/StatusBadge";
import { useI18n } from "../../hooks/useI18n";
import { formatAttendanceCoordinates, formatAttendanceDateTime, hasAttendanceLocation } from "../../utils/attendance";

export default function AttendanceDetailsModal({ worker, onClose }) {
  const { locale, t } = useI18n();
  const attendance = worker.attendance ?? {};

  return (
    <Modal
      onClose={onClose}
      title={t("attendance.detailsTitle", { name: worker.name })}
      description={t("attendance.detailsDescription")}
    >
      <div className="grid gap-4">
        <div className="rounded-[24px] bg-slate-50/90 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("attendance.currentStatus")}</p>
          <div className="mt-3">
            <StatusBadge value={attendance.currentStatus ?? worker.status} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("attendance.lastStart")}</p>
            <p className="mt-3 text-sm text-slate-700">
              {formatAttendanceDateTime(attendance.workStartTime, locale) ?? t("attendance.noRecord")}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {formatAttendanceCoordinates(attendance.workStartLocation) ?? t("attendance.locationUnavailableShort")}
            </p>
          </div>

          <div className="rounded-[24px] bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("attendance.lastEnd")}</p>
            <p className="mt-3 text-sm text-slate-700">
              {formatAttendanceDateTime(attendance.workEndTime, locale) ?? t("attendance.noRecord")}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {formatAttendanceCoordinates(attendance.workEndLocation) ?? t("attendance.locationUnavailableShort")}
            </p>
          </div>
        </div>

        <div className="rounded-[24px] bg-slate-50/90 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("attendance.locationIndicator")}</p>
          <div className="mt-3">
            <StatusBadge
              value={
                hasAttendanceLocation(attendance.workStartLocation) || hasAttendanceLocation(attendance.workEndLocation)
                  ? t("attendance.locationCaptured")
                  : t("attendance.locationUnavailableShort")
              }
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
