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
  position: ""
};

function WorkerFormModal({ initialValues, mode, onClose, onSave }) {
  const [form, setForm] = useState(initialValues);

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(form);
  };

  const fields = [
    { key: "name", label: "Full name", type: "text", placeholder: "Emma Schneider" },
    { key: "email", label: "Email", type: "email", placeholder: "emma@buildforu.com" },
    { key: "phone", label: "Phone", type: "tel", placeholder: "+49 151 555 0111" },
    { key: "position", label: "Position", type: "text", placeholder: "Site Engineer" }
  ];

  return (
    <Modal
      onClose={onClose}
      title={mode === "edit" ? "Edit worker" : "Add new worker"}
      description="Update crew details in the local prototype state."
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <label key={field.key} className="grid gap-2">
              <span className="text-sm text-slate-600">{field.label}</span>
              <input
                type={field.type}
                value={form[field.key]}
                onChange={(event) => handleChange(field.key, event.target.value)}
                placeholder={field.placeholder}
                required
                className="rounded-2xl border border-white/70 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
              />
            </label>
          ))}
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{mode === "edit" ? "Save changes" : "Add worker"}</Button>
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
      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          Keep worker
        </Button>
        <Button onClick={onConfirm} className="bg-rose-600 text-white hover:bg-rose-500">
          Delete worker
        </Button>
      </div>
    </Modal>
  );
}

export default function WorkersPage() {
  const { workers, addWorker, updateWorker, deleteWorker } = useAppData();
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [formModal, setFormModal] = useState(null);
  const [workerToDelete, setWorkerToDelete] = useState(null);

  const filteredWorkers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return workers.filter((worker) => {
      const matchesSearch =
        !normalizedSearch ||
        [worker.name, worker.email, worker.phone, worker.position ?? worker.trade].some((value) =>
          String(value).toLowerCase().includes(normalizedSearch)
        );
      const matchesAvailability =
        availabilityFilter === "all" || String(worker.availability).toLowerCase() === availabilityFilter;

      return matchesSearch && matchesAvailability;
    });
  }, [availabilityFilter, search, workers]);

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

  const openCreateModal = () => setFormModal({ mode: "create", values: emptyWorkerForm });
  const openEditModal = (worker) =>
    setFormModal({
      mode: "edit",
      workerId: worker.id,
      values: {
        name: worker.name,
        email: worker.email ?? "",
        phone: worker.phone ?? "",
        position: worker.position ?? worker.trade ?? ""
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
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={Users} label="Active workers" value={workers.length} detail="All visible in the command center." />
        <MetricCard
          icon={BadgeCheck}
          label="Available now"
          value={availableCount}
          detail="Crew members ready to accept additional work."
        />
        <MetricCard
          icon={Activity}
          label="Avg. performance"
          value={averageCompletionRate}
          detail="Calculated from the current mock completion rate."
        />
      </div>

      <Card>
        <SectionHeader
          title={t("workers.title")}
          subtitle={t("workers.subtitle")}
          action={
            <Button className="gap-2" onClick={openCreateModal}>
              <Plus size={16} />
              Add worker
            </Button>
          }
        />

        <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_220px]">
          <label className="flex items-center gap-3 rounded-[24px] border border-white/70 bg-white/90 px-4 py-3">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search workers by name, email, phone or position"
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>

          <select
            value={availabilityFilter}
            onChange={(event) => setAvailabilityFilter(event.target.value)}
            className="rounded-[24px] border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none"
          >
            <option value="all">All availability</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
          </select>
        </div>

        {filteredWorkers.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {filteredWorkers.map((worker) => (
              <article
                key={worker.id}
                className="rounded-[28px] border border-white/60 bg-white/85 p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-brand-100"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-brand-50 text-lg text-brand-700">
                      {worker.name
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <p className="text-lg text-slate-900">{worker.name}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">
                          <BriefcaseBusiness size={12} className="mr-1 inline" />
                          {worker.position ?? worker.trade}
                        </span>
                        <StatusBadge value={worker.availability} />
                        <StatusBadge value={worker.status} />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="secondary" className="gap-2 px-3 py-2" onClick={() => openEditModal(worker)}>
                      <UserRoundPen size={16} />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      className="gap-2 bg-rose-50 px-3 py-2 text-rose-700 hover:bg-rose-100"
                      onClick={() => setWorkerToDelete(worker)}
                    >
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
                  <div className="rounded-[22px] bg-slate-50/90 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Contact</p>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-brand-600" />
                        <span>{worker.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-brand-600" />
                        <span>{worker.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[22px] bg-slate-50/90 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Operations</p>
                    <div className="mt-3 space-y-2">
                      <p>
                        <span className="text-slate-400">Location:</span> {worker.location}
                      </p>
                      <p>
                        <span className="text-slate-400">Next shift:</span> {worker.nextShift}
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
              Try a different search term or add a new crew member to get started.
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
