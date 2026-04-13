import StatusBadge from "../ui/StatusBadge";
import { useI18n } from "../../hooks/useI18n";
import { getWorkerPosition } from "../../utils/localizedValue";

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
        <div key={worker.id} className="flex items-center justify-between gap-3 rounded-[20px] bg-white/85 px-4 py-3">
          <div>
            <p className="text-sm text-slate-900">{worker.name}</p>
            <p className="mt-1 text-xs text-slate-500">{getWorkerPosition(t, worker)}</p>
          </div>
          <StatusBadge value={worker.attendance?.currentStatus ?? worker.status} />
        </div>
      ))}
    </div>
  );
}
