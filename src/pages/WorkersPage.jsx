import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import AttendanceDetailsModal from "../components/workers/AttendanceDetailsModal";
import DeleteWorkerModal from "../components/workers/DeleteWorkerModal";
import WorkerFormModal from "../components/workers/WorkerFormModal";
import WorkersFilters from "../components/workers/WorkersFilters";
import WorkersList from "../components/workers/WorkersList";
import WorkersMetrics from "../components/workers/WorkersMetrics";
import { emptyWorkerForm } from "../components/workers/workerFormState";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import SectionHeader from "../components/ui/SectionHeader";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";
import { getProjectName, getWorkerPosition } from "../utils/localizedValue";

export default function WorkersPage() {
  const { workers, projects, addWorker, updateWorker, deleteWorker } = useAppData();
  const { locale, t } = useI18n();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [formModal, setFormModal] = useState(null);
  const [workerToDelete, setWorkerToDelete] = useState(null);
  const [attendanceWorker, setAttendanceWorker] = useState(null);

  const filteredWorkers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return workers.filter((worker) => {
      const workerStatus = String(worker.attendance?.currentStatus ?? worker.status).toLowerCase();
      const matchesSearch =
        !normalizedSearch ||
        [
          worker.name,
          worker.email,
          worker.phone,
          worker.notes,
          getWorkerPosition(t, worker),
          worker.assignedProjects.map((project) => getProjectName(t, project)).join(" "),
          workerStatus
        ].some((value) => String(value ?? "").toLowerCase().includes(normalizedSearch));
      const matchesStatus = statusFilter === "all" || workerStatus === statusFilter;
      const matchesProject = projectFilter === "all" || worker.projectIds.includes(projectFilter);

      return matchesSearch && matchesStatus && matchesProject;
    });
  }, [projectFilter, search, statusFilter, t, workers]);

  const openCreateModal = () => setFormModal({ mode: "create", values: emptyWorkerForm });
  const openEditModal = (worker) =>
    setFormModal({
      mode: "edit",
      workerId: worker.id,
      values: {
        name: worker.name,
        email: worker.email ?? "",
        phone: worker.phone ?? "",
        position: worker.position ?? worker.trade ?? "",
        notes: worker.notes ?? "",
        projectIds: worker.projectIds ?? []
      }
    });

  const handleSaveWorker = (payload) => {
    if (formModal?.mode === "edit") {
      updateWorker(formModal.workerId, payload);
    } else {
      addWorker(payload);
    }

    setFormModal(null);
  };

  const handleDeleteWorker = () => {
    if (!workerToDelete) {
      return;
    }

    deleteWorker(workerToDelete.id);
    setWorkerToDelete(null);
  };

  return (
    <div className="space-y-6">
      <WorkersMetrics workers={workers} />

      <Card>
        <SectionHeader
          title={t("workers.title")}
          subtitle={t("workers.subtitle")}
          action={
            <Button className="w-full gap-2 sm:w-auto" onClick={openCreateModal}>
              <Plus size={16} />
              {t("workers.addWorker")}
            </Button>
          }
        />

        <WorkersFilters
          projectFilter={projectFilter}
          projectOptions={projects}
          search={search}
          setProjectFilter={setProjectFilter}
          setSearch={setSearch}
          setStatusFilter={setStatusFilter}
          statusFilter={statusFilter}
        />

        <WorkersList
          filteredWorkers={filteredWorkers}
          locale={locale}
          onCreate={openCreateModal}
          onDelete={setWorkerToDelete}
          onEdit={openEditModal}
          onViewAttendance={setAttendanceWorker}
        />
      </Card>

      {formModal ? (
        <WorkerFormModal
          initialValues={formModal.values}
          mode={formModal.mode}
          onClose={() => setFormModal(null)}
          onSave={handleSaveWorker}
          projectOptions={projects}
        />
      ) : null}

      {workerToDelete ? (
        <DeleteWorkerModal
          worker={workerToDelete}
          onClose={() => setWorkerToDelete(null)}
          onConfirm={handleDeleteWorker}
        />
      ) : null}

      {attendanceWorker ? (
        <AttendanceDetailsModal worker={attendanceWorker} onClose={() => setAttendanceWorker(null)} />
      ) : null}
    </div>
  );
}
