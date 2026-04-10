import { ArrowRight, Clock3, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";
import StatusBadge from "../ui/StatusBadge";
import { useI18n } from "../../hooks/useI18n";
import { formatAttendanceDateTime, hasAttendanceLocation } from "../../utils/attendance";
import { getLocalizedValue, getWorkerPosition } from "../../utils/localizedValue";

export default function WorkersPanel({ title, subtitle, workers }) {
  const { locale, t } = useI18n();

  return (
    <Card>
      <SectionHeader title={title} subtitle={subtitle} />

      {workers.length ? (
        <div className="space-y-3">
          {workers.map((worker) => (
            <div key={worker.id} className="rounded-[24px] bg-white/80 p-4 transition hover:-translate-y-0.5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base text-slate-900">{worker.name}</p>
                  <p className="text-sm text-slate-500">{getWorkerPosition(t, worker)}</p>
                </div>
                <StatusBadge value={worker.status} />
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <MapPin size={14} />
                  <span>{getLocalizedValue(t, worker.locationKey, worker.location)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 size={14} />
                  <span>
                    {t("workers.nextShift")}{" "}
                    {worker.nextShift === "Not scheduled" ? t("workers.notScheduled") : worker.nextShift}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 size={14} />
                  <span>
                    {t("attendance.lastStart")}{" "}
                    {formatAttendanceDateTime(worker.attendance?.workStartTime, locale) ?? t("attendance.noRecord")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} />
                  <span>
                    {hasAttendanceLocation(worker.attendance?.workStartLocation)
                      ? t("attendance.locationCaptured")
                      : t("attendance.locationUnavailableShort")}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  {t("workers.completionRate")}: {worker.completionRate}%
                </div>
                <Link to="/workers" className="inline-flex items-center gap-2 text-sm text-brand-700">
                  {t("common.viewProfile")}
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/60 px-5 py-10 text-center text-sm text-slate-500">
          {t("workers.noWorkersFound")}
        </div>
      )}
    </Card>
  );
}
