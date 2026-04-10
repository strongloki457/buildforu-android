import {
  Activity,
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  Crosshair,
  Eye,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRoundPen,
  Users
} from "lucide-react";
import { useMemo, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import MetricCard from "../components/ui/MetricCard";
import Modal from "../components/ui/Modal";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";
import { attendanceStatusOptions } from "../data/options";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";
import { formatAttendanceCoordinates, formatAttendanceDateTime, hasAttendanceLocation } from "../utils/attendance";
import { getLocalizedValue, getProjectName, getWorkerPosition } from "../utils/localizedValue";

const emptyWorkerForm = {
  name: "",
  email: "",
  phone: "",
  position: "",
  projectIds: []
};

function WorkerFormModal({ initialValues, mode, onClose, onSave, projectOptions }) {
  const { t } = useI18n();
  const [form, setForm] = useState(initialValues);

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleProjectToggle = (projectId) => {
    setForm((current) => ({
      ...current,
      projectIds: current.projectIds.includes(projectId)
        ? current.projectIds.filter((item) => item !== projectId)
        : [...current.projectIds, projectId]
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(form);
  };

  return (
    <Modal
      onClose={onClose}
      title={mode === "edit" ? t("workers.editWorkerTitle") : t("workers.addWorkerTitle")}
      description={t("workers.workerModalDescription")}
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm text-slate-600">{t("workers.fullName")}</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder={t("workers.placeholderName")}
              required
              className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-600">{t("login.email")}</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => handleChange("email", event.target.value)}
              placeholder={t("workers.placeholderEmail")}
              className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-600">{t("workers.phone")}</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => handleChange("phone", event.target.value)}
              placeholder={t("workers.placeholderPhone")}
              className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-600">{t("workers.position")}</span>
            <input
              type="text"
              value={form.position}
              onChange={(event) => handleChange("position", event.target.value)}
              placeholder={t("workers.placeholderPosition")}
              className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <div className="grid gap-3 md:col-span-2">
            <span className="text-sm text-slate-600">{t("workers.assignedProjects", "Assigned projects")}</span>
            {projectOptions.length ? (
              <div className="flex flex-wrap gap-2 rounded-[24px] border border-white/70 bg-white/75 p-3">
                {projectOptions.map((project) => {
                  const isSelected = form.projectIds.includes(project.id);

                  return (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => handleProjectToggle(project.id)}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        isSelected ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {getProjectName(t, project)}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-4 text-sm text-slate-500">
                {t("workers.noProjectsAvailable", "Add a project first to connect this worker.")}
              </div>
            )}
            <p className="text-sm text-slate-500">
              {t(
                "workers.projectSelectionHint",
                "Select one or more projects to connect the worker with active jobs."
              )}
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-500">{t("workers.attendanceManagedByEmployee")}</p>

        <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" className="w-full sm:w-auto" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" className="w-full sm:w-auto">
            {mode === "edit" ? t("workers.saveChanges") : t("workers.addWorker")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function AttendanceDetailsModal({ worker, onClose }) {
  const { locale, t } = useI18n();
  const attendance = worker.attendance ?? {};

  return (
    <Modal
      onClose={onClose}
      title={t("attendance.detailsTitle", { name: worker.name })}
      description={t("attendance.detailsDescription")}
    >
      <div className="grid gap-4">
        <div className="rounded-[24px] bg-slate-50/90 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("attendance.currentStatus")}</p>
          <div className="mt-3">
            <StatusBadge value={attendance.currentStatus ?? worker.status} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("attendance.lastStart")}</p>
            <p className="mt-3 text-sm text-slate-700">
              {formatAttendanceDateTime(attendance.workStartTime, locale) ?? t("attendance.noRecord")}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {formatAttendanceCoordinates(attendance.workStartLocation) ?? t("attendance.locationUnavailableShort")}
            </p>
          </div>

          <div className="rounded-[24px] bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("attendance.lastEnd")}</p>
            <p className="mt-3 text-sm text-slate-700">
              {formatAttendanceDateTime(attendance.workEndTime, locale) ?? t("attendance.noRecord")}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {formatAttendanceCoordinates(attendance.workEndLocation) ?? t("attendance.locationUnavailableShort")}
            </p>
          </div>
        </div>

        <div className="rounded-[24px] bg-slate-50/90 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("attendance.locationIndicator")}</p>
          <div className="mt-3">
            <StatusBadge
              value={
                hasAttendanceLocation(attendance.workStartLocation) || hasAttendanceLocation(attendance.workEndLocation)
                  ? t("attendance.locationCaptured")
                  : t("attendance.locationUnavailableShort")
              }
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

function DeleteWorkerModal({ worker, onClose, onConfirm }) {
  const { t } = useI18n();

  return (
    <Modal
      onClose={onClose}
      title={t("workers.deleteWorkerTitle")}
      description={t("workers.deleteWorkerDescription", { name: worker.name })}
    >
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

export default function WorkersPage() {
  const { workers, projects, addWorker, updateWorker, deleteWorker } = useAppData();
  const { locale, t } = useI18n();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [formModal, setFormModal] = useState(null);
  const [workerToDelete, setWorkerToDelete] = useState(null);
  const [attendanceWorker, setAttendanceWorker] = useState(null);

  const projectOptions = useMemo(() => projects, [projects]);

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
          getWorkerPosition(t, worker),
          worker.assignedProjects.map((project) => getProjectName(t, project)).join(" "),
          workerStatus
        ].some((value) => String(value ?? "").toLowerCase().includes(normalizedSearch));
      const matchesStatus = statusFilter === "all" || workerStatus === statusFilter;
      const matchesProject = projectFilter === "all" || worker.projectIds.includes(projectFilter);

      return matchesSearch && matchesStatus && matchesProject;
    });
  }, [projectFilter, search, statusFilter, t, workers]);

  const availableCount = useMemo(
    () => workers.filter((worker) => String(worker.availability).toLowerCase() === "available").length,
    [workers]
  );

  const averageCompletionRate = useMemo(() => {
    if (!workers.length) {
      return "0%";
    }

    const total = workers.reduce((sum, worker) => sum + Number(worker.completionRate || 0), 0);
    return `${Math.round(total / workers.length)}%`;
  }, [workers]);

  const offSiteCount = useMemo(
    () =>
      workers.filter((worker) => String(worker.attendance?.currentStatus ?? worker.status).toLowerCase() === "off site")
        .length,
    [workers]
  );

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
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Users} label={t("workers.activeWorkers")} value={workers.length} detail={t("workers.activeWorkersDetail")} />
        <MetricCard
          icon={BadgeCheck}
          label={t("workers.availableNow")}
          value={availableCount}
          detail={t("workers.availableNowDetail")}
        />
        <MetricCard icon={Activity} label={t("workers.averagePerformance")} value={averageCompletionRate} detail={t("workers.averagePerformanceDetail")} />
        <MetricCard icon={BriefcaseBusiness} label={t("workers.offSite")} value={offSiteCount} detail={t("workers.offSiteDetail")} />
      </div>

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

        <div className="mb-6 grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_240px]">
          <label className="flex items-center gap-3 rounded-[24px] border border-white/70 bg-white/90 px-4 py-3">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("workers.searchPlaceholder")}
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-[24px] border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none"
          >
            <option value="all">{t("workers.allStatuses")}</option>
            {attendanceStatusOptions.map((status) => (
              <option key={status} value={status.toLowerCase()}>
                {t(`statusLabels.${status.toLowerCase()}`, status)}
              </option>
            ))}
          </select>

          <select
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
            className="rounded-[24px] border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none"
          >
            <option value="all">{t("workers.allProjects")}</option>
            {projectOptions.map((project) => (
              <option key={project.id} value={project.id}>
                {getProjectName(t, project)}
              </option>
            ))}
          </select>
        </div>

        {filteredWorkers.length ? (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {filteredWorkers.map((worker) => (
              <article
                key={worker.id}
                className="rounded-[28px] border border-white/60 bg-white/85 p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-brand-100"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-brand-50 text-lg text-brand-700">
                      {worker.name
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
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

                  <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                    <Button variant="ghost" className="flex-1 gap-2 px-3 py-2 sm:flex-none" onClick={() => setAttendanceWorker(worker)}>
                      <Eye size={16} />
                      {t("attendance.viewDetails")}
                    </Button>
                    <Button variant="secondary" className="flex-1 gap-2 px-3 py-2 sm:flex-none" onClick={() => openEditModal(worker)}>
                      <UserRoundPen size={16} />
                      {t("common.edit")}
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 gap-2 bg-rose-50 px-3 py-2 text-rose-700 hover:bg-rose-100 sm:flex-none"
                      onClick={() => setWorkerToDelete(worker)}
                    >
                      <Trash2 size={16} />
                      {t("common.delete")}
                    </Button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 text-sm text-slate-500">
                  <div className="rounded-[22px] bg-slate-50/90 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("workers.contact")}</p>
                    <div className="mt-3 grid gap-2">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-brand-600" />
                        <span className="min-w-0 truncate">{worker.email || t("workers.notProvided")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-brand-600" />
                        <span>{worker.phone || t("workers.notProvided")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[22px] bg-slate-50/90 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("workers.operations")}</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <p className="text-slate-400">{t("workers.assignedProjects", "Assigned projects")}:</p>
                        {worker.assignedProjects.length ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {worker.assignedProjects.map((project) => (
                              <span key={project.id} className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">
                                {getProjectName(t, project)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2">{t("workers.notProvided")}</p>
                        )}
                      </div>
                      <p>
                        <span className="text-slate-400">{t("workers.nextShift")}:</span>{" "}
                        {worker.nextShift === "Not scheduled" ? t("workers.notScheduled") : worker.nextShift}
                      </p>
                      <p>
                        <span className="text-slate-400">{t("common.location")}:</span>{" "}
                        {getLocalizedValue(t, worker.locationKey, worker.location) || t("workers.notProvided")}
                      </p>
                      <p>
                        <span className="text-slate-400">{t("workers.completionRate")}:</span> {worker.completionRate}%
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[22px] bg-slate-50/90 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("attendance.title")}</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="flex items-start gap-2">
                        <Clock3 size={14} className="mt-0.5 text-brand-600" />
                        <div>
                          <p className="text-xs text-slate-400">{t("attendance.lastStart")}</p>
                          <p className="text-sm text-slate-600">
                            {formatAttendanceDateTime(worker.attendance?.workStartTime, locale) ?? t("attendance.noRecord")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock3 size={14} className="mt-0.5 text-brand-600" />
                        <div>
                          <p className="text-xs text-slate-400">{t("attendance.lastEnd")}</p>
                          <p className="text-sm text-slate-600">
                            {formatAttendanceDateTime(worker.attendance?.workEndTime, locale) ?? t("attendance.noRecord")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Crosshair size={14} className="mt-0.5 text-brand-600" />
                        <div>
                          <p className="text-xs text-slate-400">{t("attendance.locationIndicator")}</p>
                          <p className="text-sm text-slate-600">
                            {hasAttendanceLocation(worker.attendance?.workStartLocation) ||
                            hasAttendanceLocation(worker.attendance?.workEndLocation)
                              ? t("attendance.locationCaptured")
                              : t("attendance.locationUnavailableShort")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="mt-0.5 text-brand-600" />
                        <div>
                          <p className="text-xs text-slate-400">{t("attendance.currentStatus")}</p>
                          <p className="text-sm text-slate-600">
                            {t(
                              `statusLabels.${String(worker.attendance?.currentStatus ?? worker.status).toLowerCase()}`,
                              worker.attendance?.currentStatus ?? worker.status
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
            <Users size={28} className="mx-auto text-brand-600" />
            <h3 className="mt-4 text-2xl text-slate-900">{t("workers.noWorkersFound")}</h3>
            <p className="mt-2 text-sm text-slate-500">{t("workers.noWorkersSubtitle")}</p>
            <Button className="mt-6 gap-2" onClick={openCreateModal}>
              <Plus size={16} />
              {t("workers.addFirstWorker")}
            </Button>
          </div>
        )}
      </Card>

      {formModal ? (
        <WorkerFormModal
          initialValues={formModal.values}
          mode={formModal.mode}
          onClose={() => setFormModal(null)}
          onSave={handleSaveWorker}
          projectOptions={projectOptions}
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
