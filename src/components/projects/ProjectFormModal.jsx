import { useState } from "react";
import { projectStatusOptions } from "../../data/options";
import { useI18n } from "../../hooks/useI18n";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

const initialProjectForm = {
  name: "",
  phase: "",
  location: "",
  startDate: "",
  deadline: "",
  notes: "",
  status: "To Start"
};

export default function ProjectFormModal({ onClose, onSave }) {
  const { t } = useI18n();
  const [form, setForm] = useState(initialProjectForm);

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
      title={t("projects.addProjectTitle", "Add project")}
      description={t("projects.addProjectSubtitle", "Create a new project entry for the team board.")}
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm text-slate-600">{t("projects.projectNameLabel", "Project name")}</span>
          <input
            type="text"
            value={form.name}
            onChange={(event) => handleChange("name", event.target.value)}
            required
            className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm text-slate-600">{t("projects.projectTypeLabel", "Type or phase")}</span>
            <input
              type="text"
              value={form.phase}
              onChange={(event) => handleChange("phase", event.target.value)}
              placeholder={t("projects.projectTypePlaceholder", "Interior fit-out, electrical, planning...")}
              className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-600">{t("common.status", "Status")}</span>
            <select
              value={form.status}
              onChange={(event) => handleChange("status", event.target.value)}
              className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
            >
              {projectStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {t(`statusLabels.${status.toLowerCase()}`, status)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm text-slate-600">{t("projects.projectLocation", "Location")}</span>
          <input
            type="text"
            value={form.location}
            onChange={(event) => handleChange("location", event.target.value)}
            className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm text-slate-600">{t("projects.startDate", "Start date")}</span>
            <input
              type="date"
              value={form.startDate}
              onChange={(event) => handleChange("startDate", event.target.value)}
              className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-600">{t("projects.deadline", "Deadline")}</span>
            <input
              type="date"
              value={form.deadline}
              onChange={(event) => handleChange("deadline", event.target.value)}
              className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm text-slate-600">{t("projects.notes", "Notes")}</span>
          <textarea
            rows={4}
            value={form.notes}
            onChange={(event) => handleChange("notes", event.target.value)}
            placeholder={t("projects.projectNotesPlaceholder", "Useful context for the team, scope or next step.")}
            className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" className="w-full sm:w-auto" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" className="w-full sm:w-auto">
            {t("projects.addProjectAction", "Add project")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
