import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { useI18n } from "../../hooks/useI18n";
import { getProjectName } from "../../utils/localizedValue";

export default function WorkerFormModal({ errorMessage = "", initialValues, mode, onClose, onSave, projectOptions }) {
  const { t } = useI18n();
  const [form, setForm] = useState(initialValues);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      await onSave(form);
    } finally {
      setIsSaving(false);
    }
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
              required={Boolean(form.createLogin)}
              className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-4 py-4 md:col-span-2">
            <input
              type="checkbox"
              checked={Boolean(form.createLogin)}
              onChange={(event) => handleChange("createLogin", event.target.checked)}
              disabled={Boolean(form.hasLinkedLogin) || isSaving}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
            />
            <span className="min-w-0">
              <span className="block text-sm text-slate-900">
                {t("workers.createEmployeeLogin", "Create employee login")}
              </span>
              <span className="mt-1 block text-sm text-slate-500">
                {form.hasLinkedLogin
                  ? t("workers.loginAlreadyLinked", "This worker already has a linked employee login.")
                  : t("workers.createEmployeeLoginHint", "Enable this when the worker should sign in and see their own tasks.")}
              </span>
            </span>
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
              {t("workers.projectSelectionHint", "Select one or more projects to connect the worker with active jobs.")}
            </p>
          </div>

          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm text-slate-600">{t("projects.notes")}</span>
            <textarea
              rows={4}
              value={form.notes ?? ""}
              onChange={(event) => handleChange("notes", event.target.value)}
              className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
            />
          </label>
        </div>

        <p className="text-sm text-slate-500">{t("workers.attendanceManagedByEmployee")}</p>
        {form.createLogin ? (
          <p className="text-sm text-slate-500">
            {t(
              "workers.employeeLoginProvisioning",
              mode === "edit"
                ? "The linked employee login will stay synced with the worker email."
                : "A linked employee login will be created with a temporary password."
            )}
          </p>
        ) : null}
        {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}

        <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" className="w-full sm:w-auto" onClick={onClose} disabled={isSaving}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
            {isSaving
              ? t("common.saving", "Saving...")
              : mode === "edit"
                ? t("workers.saveChanges")
                : t("workers.addWorker")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
