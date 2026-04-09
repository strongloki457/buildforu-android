import {
  Activity,
  BadgeCheck,
  BriefcaseBusiness,
  Mail,
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
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";

const emptyWorkerForm = {
  name: "",
  email: "",
  phone: "",
  position: "",
  assignedProject: "",
  status: "On site"
};

const statusOptions = ["On site", "In transit", "Off shift"];

function WorkerFormModal({ initialValues, mode, onClose, onSave, projectOptions }) {
  const [form, setForm] = useState(initialValues);

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(form);
  };

  return (
    <Modal
      onClose={onClose}
      title={mode === "edit" ? "Edit worker" : "Add new worker"}
      description="Update crew details in local mock state without affecting the current auth flow."
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm text-slate-600">Full name</span>
            <input
              type="text"
              value={form.name}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder="Emma Schneider"
              required
              className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-600">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => handleChange("email", event.target.value)}
              placeholder="emma@buildforu.com"
              required
              className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-600">Phone</span>
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => handleChange("phone", event.target.value)}
              placeholder="+49 151 555 0111"
              required
              className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-600">Position</span>
            <input
              type="text"
              value={form.position}
              onChange={(event) => handleChange("position", event.target.value)}
              placeholder="Site Engineer"
              required
              className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-600">Assigned project</span>
            <select
              value={form.assignedProject}
              onChange={(event) => handleChange("assignedProject", event.target.value)}
              required
              className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
            >
              <option value="">Select a project</option>
              {projectOptions.map((project) => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-600">Status</span>
            <select
              value={form.status}
              onChange={(event) => handleChange("status", event.target.value)}
              required
              className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" className="w-full sm:w-auto" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="w-full sm:w-auto">
            {mode === "edit" ? "Save changes" : "Add worker"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteWorkerModal({ worker, onClose, onConfirm }) {
  return (
    <Modal
      onClose={onClose}
      title="Delete worker"
      description={`Are you sure you want to remove ${worker.name} from the crew list? This only affects local mock data.`}
    >
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="ghost" className="w-full sm:w-auto" onClick={onClose}>
          Keep worker
        </Button>
        <Button onClick={onConfirm} className="w-full bg-rose-600 text-white hover:bg-rose-500 sm:w-auto">
          Delete worker
        </Button>
      </div>
    </Modal>
  );
}

export default function WorkersPage() {
  const { workers, projects, addWorker, updateWorker, deleteWorker } = useAppData();
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [formModal, setFormModal] = useState(null);
  const [workerToDelete, setWorkerToDelete] = useState(null);

  const projectOptions = useMemo(() => projects.map((project) => project.name), [projects]);

  const filteredWorkers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return workers.filter((worker) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          worker.name,
          worker.email,
          worker.phone,
          worker.position ?? worker.trade,
          worker.assignedProject,
          worker.status
        ].some((value) => String(value).toLowerCase().includes(normalizedSearch));
      const matchesStatus = statusFilter === "all" || String(worker.status).toLowerCase() === statusFilter;
      const matchesProject = projectFilter === "all" || worker.assignedProject === projectFilter;

      return matchesSearch && matchesStatus && matchesProject;
    });
  }, [projectFilter, search, statusFilter, workers]);

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

  const offShiftCount = useMemo(
    () => workers.filter((worker) => String(worker.status).toLowerCase() === "off shift").length,
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
        assignedProject: worker.assignedProject ?? worker.location ?? "",
        status: worker.status ?? "On site"
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
        <MetricCard icon={Users} label="Active workers" value={workers.length} detail="All visible in the command center." />
        <MetricCard
          icon={BadgeCheck}
          label="Available now"
          value={availableCount}
          detail="Crew members ready to accept additional work."
        />
        <MetricCard icon={Activity} label="Avg. performance" value={averageCompletionRate} detail="Based on current mock completion rates." />
        <MetricCard icon={BriefcaseBusiness} label="Off shift" value={offShiftCount} detail="Workers currently outside the active site rotation." />
      </div>

      <Card>
        <SectionHeader
          title={t("workers.title")}
          subtitle={t("workers.subtitle")}
          action={
            <Button className="w-full gap-2 sm:w-auto" onClick={openCreateModal}>
              <Plus size={16} />
              Add worker
            </Button>
          }
        />

        <div className="mb-6 grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_240px]">
          <label className="flex items-center gap-3 rounded-[24px] border border-white/70 bg-white/90 px-4 py-3">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search workers by name, email, project or status"
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-[24px] border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none"
          >
            <option value="all">All statuses</option>
            <option value="on site">On site</option>
            <option value="in transit">In transit</option>
            <option value="off shift">Off shift</option>
          </select>

          <select
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
            className="rounded-[24px] border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none"
          >
            <option value="all">All projects</option>
            {projectOptions.map((project) => (
              <option key={project} value={project}>
                {project}
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
                          {worker.position ?? worker.trade}
                        </span>
                        <StatusBadge value={worker.status} />
                        <StatusBadge value={worker.availability} />
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full gap-2 sm:w-auto">
                    <Button variant="secondary" className="flex-1 gap-2 px-3 py-2 sm:flex-none" onClick={() => openEditModal(worker)}>
                      <UserRoundPen size={16} />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 gap-2 bg-rose-50 px-3 py-2 text-rose-700 hover:bg-rose-100 sm:flex-none"
                      onClick={() => setWorkerToDelete(worker)}
                    >
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 text-sm text-slate-500">
                  <div className="rounded-[22px] bg-slate-50/90 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Contact</p>
                    <div className="mt-3 grid gap-2">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-brand-600" />
                        <span className="min-w-0 truncate">{worker.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-brand-600" />
                        <span>{worker.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[22px] bg-slate-50/90 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Operations</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <p>
                        <span className="text-slate-400">Assigned project:</span> {worker.assignedProject}
                      </p>
                      <p>
                        <span className="text-slate-400">Next shift:</span> {worker.nextShift}
                      </p>
                      <p>
                        <span className="text-slate-400">Location:</span> {worker.location}
                      </p>
                      <p>
                        <span className="text-slate-400">Completion rate:</span> {worker.completionRate}%
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
            <Users size={28} className="mx-auto text-brand-600" />
            <h3 className="mt-4 text-2xl text-slate-900">No workers found</h3>
            <p className="mt-2 text-sm text-slate-500">
              Try another filter combination or add a new crew member to get started.
            </p>
            <Button className="mt-6 gap-2" onClick={openCreateModal}>
              <Plus size={16} />
              Add first worker
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
    </div>
  );
}
