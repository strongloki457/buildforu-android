import { Clock3, MapPin, Navigation } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { attendanceApi } from "../../api/attendance.api";
import AttendanceActionButton from "../attendance/AttendanceActionButton";
import AttendanceFeedback from "../attendance/AttendanceFeedback";
import AttendanceMetaItem from "../attendance/AttendanceMetaItem";
import { requestCurrentLocation } from "../attendance/attendanceLocation";
import { useAppData } from "../../hooks/useAppData";
import { useI18n } from "../../hooks/useI18n";
import { useCurrentWorker } from "../../hooks/useRoleData";
import { formatAttendanceCoordinates, formatAttendanceDateTime, hasAttendanceLocation } from "../../utils/attendance";
import { getLocalizedValue } from "../../utils/localizedValue";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";
import StatusBadge from "../ui/StatusBadge";

const LOCATION_TRACKING_MIN_INTERVAL_MS = 2 * 60 * 1000;

function createLocationPointPayload(location) {
  return {
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy,
    recordedAt: new Date().toISOString()
  };
}

export default function WorkStatusCard() {
  const { startWork, endWork } = useAppData();
  const { locale, t } = useI18n();
  const worker = useCurrentWorker();
  const [activeAction, setActiveAction] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const watchIdRef = useRef(null);
  const lastSentAtRef = useRef(0);
  const attendance = worker?.attendance;
  const currentStatus = attendance?.currentStatus ?? worker?.status ?? "Off Site";
  const isOnSite = currentStatus === "On Site";

  const stopLocationTracking = () => {
    if (watchIdRef.current !== null && "geolocation" in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setIsTrackingLocation(false);
  };

  const sendLocationPoint = async (location) => {
    if (!Number.isFinite(location?.latitude) || !Number.isFinite(location?.longitude)) {
      return;
    }

    try {
      await attendanceApi.recordLocation(createLocationPointPayload(location));
    } catch {
      // Attendance remains valid even if one GPS point cannot be saved.
    }
  };

  const startLocationTracking = () => {
    if (watchIdRef.current !== null || !("geolocation" in navigator)) {
      return;
    }

    setIsTrackingLocation(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();

        if (now - lastSentAtRef.current < LOCATION_TRACKING_MIN_INTERVAL_MS) {
          return;
        }

        lastSentAtRef.current = now;
        sendLocationPoint({
          latitude: Number(position.coords.latitude.toFixed(5)),
          longitude: Number(position.coords.longitude.toFixed(5)),
          accuracy: Number.isFinite(position.coords.accuracy) ? Math.round(position.coords.accuracy) : undefined
        });
      },
      () => {
        stopLocationTracking();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  };

  useEffect(() => {
    if (isOnSite) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }

    return stopLocationTracking;
  }, [isOnSite]);

  const handleStatusAction = async (mode) => {
    if (!worker) {
      return;
    }

    setActiveAction(mode);
    const timestamp = new Date().toISOString();
    let location = null;
    let messageKey = null;

    if (mode === "end") {
      stopLocationTracking();
    }

    const locationResult = await requestCurrentLocation();
    location = locationResult.location;
    messageKey = locationResult.messageKey;

    if (mode === "start") {
      const savedRecord = await startWork(worker.id, { timestamp, location });
      if (!savedRecord) {
        setFeedback({
          tone: "warning",
          text: t("attendance.saveFailed", "Could not save attendance. Please try again.")
        });
        setActiveAction("");
        return;
      }
      if (!messageKey) {
        startLocationTracking();
      }
      setFeedback({
        tone: messageKey ? "warning" : "success",
        text: messageKey
          ? t("attendance.locationPermissionDeniedWorkRecorded")
          : t("attendance.trackingActiveNotice")
      });
    } else {
      const savedRecord = await endWork(worker.id, { timestamp, location });
      if (!savedRecord) {
        startLocationTracking();
        setFeedback({
          tone: "warning",
          text: t("attendance.saveFailed", "Could not save attendance. Please try again.")
        });
        setActiveAction("");
        return;
      }
      setFeedback({
        tone: messageKey ? "warning" : "success",
        text: messageKey
          ? t("attendance.endSavedWithoutLocation", { reason: t(messageKey) })
          : t("attendance.trackingStoppedNotice")
      });
    }

    setActiveAction("");
  };

  if (!worker) {
    return (
      <Card>
        <SectionHeader title={t("attendance.title")} subtitle={t("attendance.subtitle")} />
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-10 text-sm text-slate-500">
          {t("attendance.noWorkerProfile")}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <SectionHeader title={t("attendance.title")} subtitle={t("attendance.subtitle")} />

      <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-slate-500">{t("attendance.currentStatus")}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <StatusBadge value={currentStatus} />
              <span className="break-anywhere text-sm text-slate-500">
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

        {isOnSite ? (
          <div className="mt-4 rounded-lg border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800">
            <p>{isTrackingLocation ? t("attendance.trackingActiveNotice") : t("attendance.trackingPendingNotice")}</p>
            <p className="mt-1 text-xs leading-5 text-brand-700">{t("attendance.trackingPrivacyNotice")}</p>
          </div>
        ) : null}

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
