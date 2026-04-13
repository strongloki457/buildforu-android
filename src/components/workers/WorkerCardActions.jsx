import { Eye, Trash2, UserRoundPen } from "lucide-react";
import Button from "../ui/Button";
import { useI18n } from "../../hooks/useI18n";

export default function WorkerCardActions({ onDelete, onEdit, onViewAttendance, worker }) {
  const { t } = useI18n();

  return (
    <div className="flex w-full flex-wrap gap-2 sm:w-auto">
      <Button variant="ghost" className="flex-1 gap-2 px-3 py-2 sm:flex-none" onClick={() => onViewAttendance(worker)}>
        <Eye size={16} />
        {t("attendance.viewDetails")}
      </Button>
      <Button variant="secondary" className="flex-1 gap-2 px-3 py-2 sm:flex-none" onClick={() => onEdit(worker)}>
        <UserRoundPen size={16} />
        {t("common.edit")}
      </Button>
      <Button
        variant="ghost"
        className="flex-1 gap-2 bg-rose-50 px-3 py-2 text-rose-700 hover:bg-rose-100 sm:flex-none"
        onClick={() => onDelete(worker)}
      >
        <Trash2 size={16} />
        {t("common.delete")}
      </Button>
    </div>
  );
}
