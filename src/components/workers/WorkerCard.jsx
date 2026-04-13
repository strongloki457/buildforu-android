import StatusBadge from "../ui/StatusBadge";
import { useI18n } from "../../hooks/useI18n";
import { getWorkerPosition } from "../../utils/localizedValue";
import { getInitials } from "../../utils/people";
import WorkerAttendanceSection from "./WorkerAttendanceSection";
import WorkerCardActions from "./WorkerCardActions";
import WorkerContactSection from "./WorkerContactSection";
import WorkerOperationsSection from "./WorkerOperationsSection";

export default function WorkerCard({ locale, onDelete, onEdit, onViewAttendance, worker }) {
  const { t } = useI18n();

  return (
    <article className="rounded-[28px] border border-white/60 bg-white/85 p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-brand-100">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-brand-50 text-lg text-brand-700">
            {getInitials(worker.name)}
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

        <WorkerCardActions
          onDelete={onDelete}
          onEdit={onEdit}
          onViewAttendance={onViewAttendance}
          worker={worker}
        />
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-500">
        <WorkerContactSection worker={worker} />
        <WorkerOperationsSection worker={worker} />
        <WorkerAttendanceSection locale={locale} worker={worker} />
      </div>
    </article>
  );
}
