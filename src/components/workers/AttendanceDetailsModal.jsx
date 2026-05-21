import { useEffect, useState } from "react";
import { MapPinned } from "lucide-react";
import { attendanceApi } from "../../api/attendance.api";
import Modal from "../ui/Modal";
import RouteMap from "./RouteMap";
import StatusBadge from "../ui/StatusBadge";
import { useI18n } from "../../hooks/useI18n";
import { formatAttendanceCoordinates, formatAttendanceDateTime } from "../../utils/attendance";

export default function AttendanceDetailsModal({ worker, onClose }) {
  const { locale, t } = useI18n();
  const attendance = worker.attendance ?? {};
  const [showRoute, setShowRoute] = useState(false);
  const [routePoints, setRoutePoints] = useState([]);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");
  const canLoadRoute = Boolean(attendance.id && attendance.workStartTime);
  const isTrackingActive = attendance.currentStatus === "On Site";
  const locationPointCount = Number(attendance.locationPointCount ?? routePoints.length ?? 0);

  useEffect(() => {
    if (!showRoute || !canLoadRoute) {
      return;
    }

    let isMounted = true;
    setIsRouteLoading(true);
    setRouteError("");

    attendanceApi
      .listLocations(attendance.id)
      .then((response) => {
        if (isMounted) {
          setRoutePoints(response?.locationPoints ?? []);
        }
      })
      .catch(() => {
        if (isMounted) {
          setRouteError(t("attendance.routeLoadFailed"));
          setRoutePoints([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsRouteLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [attendance.id, canLoadRoute, showRoute, t]);

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

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("attendance.trackingStatus")}</p>
            <div className="mt-3">
              <StatusBadge value={isTrackingActive ? t("attendance.trackingActive") : t("attendance.trackingInactive")} />
            </div>
          </div>
          <div className="rounded-[24px] bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("attendance.gpsPoints")}</p>
            <p className="mt-3 text-sm text-slate-700">
              {t("attendance.gpsPointsRecorded", { count: locationPointCount }, "{{count}} GPS points")}
            </p>
          </div>
          <div className="rounded-[24px] bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("attendance.lastLocationUpdate")}</p>
            <p className="mt-3 text-sm text-slate-700">
              {formatAttendanceDateTime(attendance.lastKnownLocationAt, locale) ?? t("attendance.noRecord")}
            </p>
          </div>
        </div>

        <div className="rounded-[24px] bg-slate-50/90 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("attendance.lastKnownLocation")}</p>
              <p className="mt-3 text-sm text-slate-700">
                {formatAttendanceCoordinates(attendance.lastKnownLocation) ?? t("attendance.locationUnavailableShort")}
              </p>
              {attendance.lastKnownLocationAt ? (
                <p className="mt-1 text-xs text-slate-500">
                  {formatAttendanceDateTime(attendance.lastKnownLocationAt, locale)}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setShowRoute((current) => !current)}
              disabled={!canLoadRoute}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <MapPinned size={16} />
              {t("attendance.viewRoute")}
            </button>
          </div>

          {showRoute ? (
            <div className="mt-4 rounded-[22px] border border-dashed border-slate-200 bg-white/75 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-slate-900">{t("attendance.routeHistory")}</p>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">
                  {t("attendance.routePointCount", { count: routePoints.length }, "{{count}} points")}
                </span>
              </div>

              {isRouteLoading ? (
                <p className="mt-4 text-sm text-slate-500">{t("attendance.routeLoading")}</p>
              ) : routeError ? (
                <p className="mt-4 text-sm text-amber-700">{routeError}</p>
              ) : routePoints.length ? (
                <RouteMap points={routePoints} />
              ) : (
                <p className="mt-4 text-sm text-slate-500">{t("attendance.noRoutePoints")}</p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
