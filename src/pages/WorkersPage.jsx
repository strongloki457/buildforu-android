import { Link2, Plus, RotateCw } from "lucide-react";
import { useMemo, useState } from "react";
import AttendanceDetailsModal from "../components/workers/AttendanceDetailsModal";
import DeleteWorkerModal from "../components/workers/DeleteWorkerModal";
import WorkerFormModal from "../components/workers/WorkerFormModal";
import WorkerAccessModal from "../components/workers/WorkerAccessModal";
import WorkersFilters from "../components/workers/WorkersFilters";
import WorkersList from "../components/workers/WorkersList";
import WorkersMetrics from "../components/workers/WorkersMetrics";
import { emptyWorkerForm } from "../components/workers/workerFormState";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import SectionHeader from "../components/ui/SectionHeader";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";
import { getProjectName, getWorkerPosition } from "../utils/localizedValue";
import { ApiError } from "../api/client";

function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

function LinkAccountModal({ existingUserName, onConfirm, onCancel, isLinking }) {
  const { t } = useI18n();
  return (
    <Modal
      onClose={onCancel}
      title="Podlinkuj istniejące konto"
      description={`Konto ${existingUserName} jest już zarejestrowane w innej firmie.`}
    >
      <div className="grid gap-4">
        <div className="rounded-2xl bg-brand-50 px-4 py-4 text-sm text-brand-900">
          <p className="flex items-center gap-2 font-medium">
            <Link2 size={15} />
            {existingUserName}
          </p>
          <p className="mt-2 text-brand-700">
            Ta osoba ma już konto (jest bossem / pracownikiem w innej firmie). Możesz podlinkować to konto — będą mogli się logować
            jednym emailem i wybierać firmę po zalogowaniu.
          </p>
        </div>
        <p className="text-sm text-slate-500">Nie zostanie utworzone nowe hasło — osoba loguje się swoim dotychczasowym hasłem.</p>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" className="w-full sm:w-auto" onClick={onCancel} disabled={isLinking}>
            {t("common.cancel")}
          </Button>
          <Button className="w-full gap-2 sm:w-auto" onClick={onConfirm} disabled={isLinking}>
            <Link2 size={15} />
            {isLinking ? "Linkuję..." : "Podlinkuj konto"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function WorkersPage() {
  const { workers, projects, addWorker, updateWorker, deleteWorker, dataError, isDataLoading, refreshData, getLastMutationError } = useAppData();
  const { locale, t } = useI18n();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [formModal, setFormModal] = useState(null);
  const [formError, setFormError] = useState("");
  const [workerToDelete, setWorkerToDelete] = useState(null);
  const [attendanceWorker, setAttendanceWorker] = useState(null);
  const [workerAccess, setWorkerAccess] = useState(null);
  const [linkPrompt, setLinkPrompt] = useState(null); // { existingUserId, existingUserName, pendingPayload, mode, workerId }
  const [isLinking, setIsLinking] = useState(false);

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

  const openCreateModal = () => {
    setFormError("");
    setFormModal({ mode: "create", values: emptyWorkerForm });
  };
  const openEditModal = (worker) => {
    setFormError("");
    const hasLinkedLogin = Boolean(worker.hasLinkedLogin);
    setFormModal({
      mode: "edit",
      workerId: worker.id,
      values: {
        name: worker.name,
        email: worker.email ?? "",
        phone: worker.phone ?? "",
        position: worker.position ?? worker.trade ?? "",
        notes: worker.notes ?? "",
        projectIds: worker.projectIds ?? [],
        createLogin: hasLinkedLogin,
        hasLinkedLogin
      }
    });
  };

  const finalizeSave = (savedWorker, normalizedEmail, shouldSyncLogin) => {
    if (shouldSyncLogin && savedWorker._temporaryPassword) {
      setWorkerAccess({
        email: normalizedEmail,
        temporaryPassword: savedWorker._temporaryPassword
      });
    }
    setFormError("");
    setFormModal(null);
  };

  const handleSaveWorker = async (payload) => {
    const normalizedEmail = normalizeEmail(payload.email);
    const shouldSyncLogin = Boolean(payload.createLogin || payload.hasLinkedLogin);
    const conflictingUser = shouldSyncLogin
      ? workers.find((worker) => normalizeEmail(worker.email) === normalizedEmail && worker.id !== formModal?.workerId)
      : null;

    if (!String(payload.name ?? "").trim()) {
      setFormError(t("workers.workerNameRequired", "Full name is required."));
      return;
    }

    if (shouldSyncLogin && !normalizedEmail) {
      setFormError(t("workers.workerEmailRequired", "Email is required to create an employee login."));
      return;
    }

    if (shouldSyncLogin && conflictingUser) {
      setFormError(t("workers.workerEmailDuplicate", "This email is already used by another company user."));
      return;
    }

    try {
      let savedWorker = null;

      if (formModal?.mode === "edit") {
        savedWorker = await updateWorker(formModal.workerId, payload);
      } else {
        savedWorker = await addWorker(payload);
      }

      if (!savedWorker) {
        setFormError(getLastMutationError() || t("workers.saveError", "Could not save. Please check your input and try again."));
        return;
      }

      finalizeSave(savedWorker, normalizedEmail, shouldSyncLogin);
    } catch (error) {
      if (error instanceof ApiError && error.code === "EMAIL_EXISTS_OTHER_COMPANY") {
        // Email belongs to a user in another company — offer to link
        setLinkPrompt({
          existingUserId: error.details?.existingUserId,
          existingUserName: error.details?.existingUserName ?? "ten użytkownik",
          pendingPayload: payload,
          mode: formModal?.mode,
          workerId: formModal?.workerId
        });
        return;
      }
      setFormError(error.message || t("workers.saveError", "Could not save. Please check your input and try again."));
    }
  };

  const handleConfirmLink = async () => {
    if (!linkPrompt) return;
    setIsLinking(true);
    try {
      const payloadWithLink = { ...linkPrompt.pendingPayload, linkExistingUserId: linkPrompt.existingUserId, createLogin: true };
      let savedWorker = null;

      if (linkPrompt.mode === "edit") {
        savedWorker = await updateWorker(linkPrompt.workerId, payloadWithLink);
      } else {
        savedWorker = await addWorker(payloadWithLink);
      }

      if (!savedWorker) {
        setFormError(getLastMutationError() || t("workers.saveError", "Could not link account. Please try again."));
        setLinkPrompt(null);
        return;
      }

      setLinkPrompt(null);
      // Linked account — no temporary password
      setFormError("");
      setFormModal(null);
    } catch {
      setFormError(t("workers.saveError", "Could not link account. Please try again."));
      setLinkPrompt(null);
    } finally {
      setIsLinking(false);
    }
  };

  const handleDeleteWorker = async () => {
    if (!workerToDelete) {
      return;
    }

    await deleteWorker(workerToDelete.id);
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

        {dataError ? (
          <div className="mb-4 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <span className="break-anywhere">{dataError}</span>
            <button
              type="button"
              onClick={refreshData}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-medium text-amber-900 shadow-sm"
            >
              <RotateCw size={14} />
              {t("common.retry", "Retry")}
            </button>
          </div>
        ) : null}

        {isDataLoading && !workers.length ? (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="rounded-[28px] border border-slate-100 bg-white/70 p-5">
                <div className="h-5 w-2/3 animate-pulse rounded-full bg-slate-200" />
                <div className="mt-4 h-4 w-1/2 animate-pulse rounded-full bg-slate-100" />
                <div className="mt-6 h-20 animate-pulse rounded-2xl bg-slate-100" />
              </div>
            ))}
          </div>
        ) : (
          <WorkersList
            filteredWorkers={filteredWorkers}
            totalWorkers={workers.length}
            locale={locale}
            onCreate={openCreateModal}
            onDelete={setWorkerToDelete}
            onEdit={openEditModal}
            onViewAttendance={setAttendanceWorker}
          />
        )}
      </Card>

      {formModal ? (
        <WorkerFormModal
          errorMessage={formError}
          initialValues={formModal.values}
          mode={formModal.mode}
          onClose={() => {
            setFormError("");
            setFormModal(null);
          }}
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

      {workerAccess ? <WorkerAccessModal access={workerAccess} onClose={() => setWorkerAccess(null)} /> : null}

      {linkPrompt ? (
        <LinkAccountModal
          existingUserName={linkPrompt.existingUserName}
          onConfirm={handleConfirmLink}
          onCancel={() => setLinkPrompt(null)}
          isLinking={isLinking}
        />
      ) : null}
    </div>
  );
}
