import StatusBadge from "../ui/StatusBadge";
import { useI18n } from "../../hooks/useI18n";
import { getWorkerPosition } from "../../utils/localizedValue";
import { getInitials } from "../../utils/people";

export default function ProjectTeamList({ workers }) {
  const { t } = useI18n();

  if (!workers.length) {
    return (
      <p className="mt-3 text-sm text-slate-500">
        {t("projects.noAssignedWorkers", "No workers are assigned to this project yet.")}
      </p>
    );
  }

  return (
    <div className="mt-3 grid gap-3">
      {workers.map((worker) => (
        <div key={worker.id} className="flex min-w-0 items-center justify-between gap-3 rounded-lg bg-white px-3 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm text-brand-700">
              {getInitials(worker.name)}
            </span>
            <div className="min-w-0">
              <p className="break-anywhere text-sm text-slate-900">{worker.name}</p>
              <p className="break-anywhere mt-1 text-xs text-slate-500">{getWorkerPosition(t, worker)}</p>
            </div>
          </div>
          <StatusBadge value={worker.attendance?.currentStatus ?? worker.status} />
        </div>
      ))}
    </div>
  );
}
