import { Plus, Search, Users } from "lucide-react";
import Button from "../ui/Button";
import { useI18n } from "../../hooks/useI18n";
import WorkerCard from "./WorkerCard";

export default function WorkersList({ filteredWorkers, totalWorkers = 0, locale, onCreate, onDelete, onEdit, onViewAttendance }) {
  const { t } = useI18n();

  if (!filteredWorkers.length) {
    const isFiltered = totalWorkers > 0;
    return (
      <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
        {isFiltered ? (
          <>
            <Search size={28} className="mx-auto text-slate-400" />
            <h3 className="mt-4 text-xl text-slate-900">{t("workers.noMatchTitle", "No workers match your search")}</h3>
            <p className="mt-2 text-sm text-slate-500">
              {t("workers.noMatchSubtitle", "Try adjusting the search term or filters to find who you're looking for.")}
            </p>
          </>
        ) : (
          <>
            <Users size={28} className="mx-auto text-brand-600" />
            <h3 className="mt-4 text-2xl text-slate-900">{t("workers.noWorkersFound")}</h3>
            <p className="mt-2 text-sm text-slate-500">{t("workers.noWorkersSubtitle")}</p>
            <Button className="mt-6 gap-2" onClick={onCreate}>
              <Plus size={16} />
              {t("workers.addFirstWorker")}
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {filteredWorkers.map((worker) => (
        <WorkerCard
          key={worker.id}
          worker={worker}
          locale={locale}
          onDelete={onDelete}
          onEdit={onEdit}
          onViewAttendance={onViewAttendance}
        />
      ))}
    </div>
  );
}
