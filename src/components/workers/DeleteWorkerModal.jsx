import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { useI18n } from "../../hooks/useI18n";

export default function DeleteWorkerModal({ worker, onClose, onConfirm }) {
  const { t } = useI18n();

  return (
    <Modal
      onClose={onClose}
      title={t("workers.deleteWorkerTitle")}
      description={t("workers.deleteWorkerDescription", { name: worker.name })}
    >
      {worker.hasLinkedLogin ? (
        <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3 text-sm text-rose-700">
          {t("workers.deleteLoginWarning", "This worker has an employee login. It will also be permanently removed.")}
        </div>
      ) : null}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" className="w-full sm:w-auto" onClick={onClose}>
          {t("workers.keepWorker")}
        </Button>
        <Button onClick={onConfirm} className="w-full bg-rose-600 text-white hover:bg-rose-500 sm:w-auto">
          {t("workers.deleteWorkerConfirm")}
        </Button>
      </div>
    </Modal>
  );
}
