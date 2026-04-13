import Button from "../ui/Button";
import { useI18n } from "../../hooks/useI18n";

export default function AttendanceActionButton({ activeAction, isOnSite, onStatusAction }) {
  const { t } = useI18n();

  if (isOnSite) {
    return (
      <Button
        variant="secondary"
        className="w-full border border-slate-200 bg-white px-5 py-3 text-slate-900 hover:bg-slate-50 sm:w-auto"
        disabled={activeAction === "end"}
        onClick={() => onStatusAction("end")}
      >
        {activeAction === "end" ? t("attendance.endingWork") : t("attendance.endWork")}
      </Button>
    );
  }

  return (
    <Button
      className="w-full px-5 py-3 sm:w-auto"
      disabled={activeAction === "start"}
      onClick={() => onStatusAction("start")}
    >
      {activeAction === "start" ? t("attendance.startingWork") : t("attendance.startWork")}
    </Button>
  );
}
