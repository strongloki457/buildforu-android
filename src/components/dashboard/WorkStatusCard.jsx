import { Clock3, MapPin, Navigation } from "lucide-react";
import { useMemo, useState } from "react";
import AttendanceActionButton from "../attendance/AttendanceActionButton";
import AttendanceFeedback from "../attendance/AttendanceFeedback";
import AttendanceMetaItem from "../attendance/AttendanceMetaItem";
import { requestCurrentLocation } from "../attendance/attendanceLocation";
import { useAuth } from "../../hooks/useAuth";
import { useAppData } from "../../hooks/useAppData";
import { useI18n } from "../../hooks/useI18n";
import { formatAttendanceCoordinates, formatAttendanceDateTime, hasAttendanceLocation } from "../../utils/attendance";
import { getLocalizedValue } from "../../utils/localizedValue";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";
import StatusBadge from "../ui/StatusBadge";

export default function WorkStatusCard() {
  const { user } = useAuth();
  const { workers, startWork, endWork } = useAppData();
  const { locale, t } = useI18n();
  const [activeAction, setActiveAction] = useState("");
  const [feedback, setFeedback] = useState(null);
  const currentWorkerId = user?.workerId || user?.id;

  const worker = useMemo(() => workers.find((item) => item.id === currentWorkerId), [currentWorkerId, workers]);
  const attendance = worker?.attendance;
  const currentStatus = attendance?.currentStatus ?? worker?.status ?? "Off Site";
  const isOnSite = currentStatus === "On Site";

  const handleStatusAction = async (mode) => {
    if (!worker) {
      return;
    }

    setActiveAction(mode);
    const timestamp = new Date().toISOString();
    const { location, messageKey } = await requestCurrentLocation();

    if (mode === "start") {
      startWork(worker.id, { timestamp, location });
      setFeedback({
        tone: messageKey ? "warning" : "success",
        text: messageKey
          ? t("attendance.startSavedWithoutLocation", { reason: t(messageKey) })
          : t("attendance.startSaved")
      });
    } else {
      endWork(worker.id, { timestamp, location });
      setFeedback({
        tone: messageKey ? "warning" : "success",
        text: messageKey
          ? t("attendance.endSavedWithoutLocation", { reason: t(messageKey) })
          : t("attendance.endSaved")
      });
    }

    setActiveAction("");
  };

  if (!worker) {
    return (
      <Card>
        <SectionHeader title={t("attendance.title")} subtitle={t("attendance.subtitle")} />
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/70 px-5 py-10 text-sm text-slate-500">
          {t("attendance.noWorkerProfile")}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <SectionHeader title={t("attendance.title")} subtitle={t("attendance.subtitle")} />

      <div className="rounded-[28px] border border-white/70 bg-white/85 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{t("attendance.currentStatus")}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <StatusBadge value={currentStatus} />
              <span className="text-sm text-slate-500">
                {getLocalizedValue(t, worker.assignedProjectKey, worker.assignedProject) || t("workers.notProvided")}
              </span>
            </div>
          </div>

          <AttendanceActionButton
            activeAction={activeAction}
            isOnSite={isOnSite}
            onStatusAction={handleStatusAction}
          />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <AttendanceMetaItem
            icon={Clock3}
            label={t("attendance.lastStart")}
            value={formatAttendanceDateTime(attendance?.workStartTime, locale) ?? t("attendance.noRecord")}
          />
          <AttendanceMetaItem
            icon={Clock3}
            label={t("attendance.lastEnd")}
            value={formatAttendanceDateTime(attendance?.workEndTime, locale) ?? t("attendance.noRecord")}
          />
          <AttendanceMetaItem
            icon={Navigation}
            label={t("attendance.startLocation")}
            value={formatAttendanceCoordinates(attendance?.workStartLocation) ?? t("attendance.locationUnavailableShort")}
            tone={hasAttendanceLocation(attendance?.workStartLocation) ? "success" : "warning"}
          />
          <AttendanceMetaItem
            icon={MapPin}
            label={t("attendance.endLocation")}
            value={formatAttendanceCoordinates(attendance?.workEndLocation) ?? t("attendance.locationUnavailableShort")}
            tone={hasAttendanceLocation(attendance?.workEndLocation) ? "success" : "warning"}
          />
        </div>

        <AttendanceFeedback feedback={feedback} fallback={t("attendance.locationHint")} />
      </div>
    </Card>
  );
}
