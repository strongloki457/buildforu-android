import { Clock3, MapPin, Navigation } from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useAppData } from "../../hooks/useAppData";
import { useI18n } from "../../hooks/useI18n";
import { formatAttendanceCoordinates, formatAttendanceDateTime, hasAttendanceLocation } from "../../utils/attendance";
import { getLocalizedValue } from "../../utils/localizedValue";
import Button from "../ui/Button";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";
import StatusBadge from "../ui/StatusBadge";

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 8000,
  maximumAge: 0
};

function getLocationErrorKey(error) {
  if (error?.code === 1) {
    return "attendance.locationDenied";
  }

  return "attendance.locationUnavailable";
}

function requestCurrentLocation() {
  if (!("geolocation" in navigator)) {
    return Promise.resolve({
      location: null,
      messageKey: "attendance.locationUnavailable"
    });
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          location: {
            latitude: Number(position.coords.latitude.toFixed(5)),
            longitude: Number(position.coords.longitude.toFixed(5))
          },
          messageKey: null
        });
      },
      (error) => {
        resolve({
          location: null,
          messageKey: getLocationErrorKey(error)
        });
      },
      GEOLOCATION_OPTIONS
    );
  });
}

function AttendanceMetaItem({ icon: Icon, label, value, tone = "default" }) {
  const toneClassName =
    tone === "success"
      ? "text-emerald-700"
      : tone === "warning"
        ? "text-amber-700"
        : "text-slate-700";

  return (
    <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/90 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
        <Icon size={14} />
        <span>{label}</span>
      </div>
      <p className={`mt-3 text-sm ${toneClassName}`}>{value}</p>
    </div>
  );
}

export default function WorkStatusCard() {
  const { user } = useAuth();
  const { workers, startWork, endWork } = useAppData();
  const { locale, t } = useI18n();
  const [activeAction, setActiveAction] = useState("");
  const [feedback, setFeedback] = useState(null);

  const worker = useMemo(() => workers.find((item) => item.id === user?.id), [workers, user?.id]);
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

          {isOnSite ? (
            <Button
              variant="secondary"
              className="w-full border border-slate-200 bg-white px-5 py-3 text-slate-900 hover:bg-slate-50 sm:w-auto"
              disabled={activeAction === "end"}
              onClick={() => handleStatusAction("end")}
            >
              {activeAction === "end" ? t("attendance.endingWork") : t("attendance.endWork")}
            </Button>
          ) : (
            <Button
              className="w-full px-5 py-3 sm:w-auto"
              disabled={activeAction === "start"}
              onClick={() => handleStatusAction("start")}
            >
              {activeAction === "start" ? t("attendance.startingWork") : t("attendance.startWork")}
            </Button>
          )}
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
            value={
              formatAttendanceCoordinates(attendance?.workStartLocation) ??
              t("attendance.locationUnavailableShort")
            }
            tone={hasAttendanceLocation(attendance?.workStartLocation) ? "success" : "warning"}
          />
          <AttendanceMetaItem
            icon={MapPin}
            label={t("attendance.endLocation")}
            value={
              formatAttendanceCoordinates(attendance?.workEndLocation) ??
              t("attendance.locationUnavailableShort")
            }
            tone={hasAttendanceLocation(attendance?.workEndLocation) ? "success" : "warning"}
          />
        </div>

        {feedback ? (
          <div
            className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
              feedback.tone === "success"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {feedback.text}
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-500">{t("attendance.locationHint")}</p>
        )}
      </div>
    </Card>
  );
}
