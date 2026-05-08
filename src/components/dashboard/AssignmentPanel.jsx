import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../hooks/useI18n";
import { getLocalDateKey } from "../../utils/date";
import { getProjectName, getWorkerPosition } from "../../utils/localizedValue";
import Button from "../ui/Button";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";

export default function AssignmentPanel({
  title,
  subtitle,
  workers,
  projects,
  onAssign,
  initialDate = getLocalDateKey(),
  embedded = false
}) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    employeeId: workers[0]?.id ?? "",
    projectId: workers[0]?.projectIds?.[0] ?? projects[0]?.id ?? "",
    title: "",
    location: "",
    date: initialDate
  });

  const selectedWorker = useMemo(
    () => workers.find((worker) => worker.id === form.employeeId) ?? null,
    [form.employeeId, workers]
  );
  const suggestedProjectId = selectedWorker?.projectIds?.[0] ?? projects[0]?.id ?? "";

  const handleChange = (key, value) => {
    if (key === "employeeId") {
      const nextWorker = workers.find((worker) => worker.id === value);
      setForm((current) => ({
        ...current,
        employeeId: value,
        projectId: nextWorker?.projectIds?.[0] ?? current.projectId
      }));
      return;
    }

    setForm((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    setForm((current) => ({
      ...current,
      employeeId: workers.some((worker) => worker.id === current.employeeId) ? current.employeeId : workers[0]?.id ?? "",
      projectId: projects.some((project) => project.id === current.projectId)
        ? current.projectId
        : workers[0]?.projectIds?.[0] ?? projects[0]?.id ?? ""
    }));
  }, [projects, workers]);

  useEffect(() => {
    if (!selectedWorker) {
      return;
    }

    if (!form.projectId && suggestedProjectId) {
      setForm((current) => ({
        ...current,
        projectId: suggestedProjectId
      }));
    }
  }, [form.projectId, selectedWorker, suggestedProjectId]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const title = form.title.trim();
    const location = form.location.trim();

    if (!form.employeeId || !form.projectId || !title || !form.date) {
      return;
    }

    const assignee = workers.find((worker) => worker.id === form.employeeId);
    const project = projects.find((item) => item.id === form.projectId);

    onAssign({
      ...form,
      title,
      location: location || project?.location || project?.name || "",
      assignee: assignee?.name ?? t("calendar.unknownWorker"),
      projectName: project?.name ?? ""
    });

    setForm((current) => ({
      ...current,
      title: "",
      location: ""
    }));
  };

  const content = (
    <>
      {title ? <SectionHeader title={title} subtitle={subtitle} /> : null}

      <form onSubmit={handleSubmit} className="grid gap-4">
        {(!workers.length || !projects.length) ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {t("calendar.taskRequiresSetup", "Create at least one worker and one project before assigning calendar tasks.")}
          </div>
        ) : null}

        <select
          value={form.employeeId}
          onChange={(event) => handleChange("employeeId", event.target.value)}
          disabled={!workers.length}
          className="rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          {workers.length ? (
            workers.map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.name} - {getWorkerPosition(t, worker)}
              </option>
            ))
          ) : (
            <option value="">{t("calendar.emptyWorker")}</option>
          )}
        </select>

        <select
          value={form.projectId}
          onChange={(event) => handleChange("projectId", event.target.value)}
          disabled={!projects.length}
          className="rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          {projects.length ? (
            <>
              <option value="">{t("calendar.selectProject")}</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {getProjectName(t, project)}
                </option>
              ))}
            </>
          ) : (
            <option value="">{t("workers.noProjectsAvailable")}</option>
          )}
        </select>

        <input
          value={form.title}
          onChange={(event) => handleChange("title", event.target.value)}
          placeholder={t("calendar.taskTitle")}
          required
          className="rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none"
        />

        <input
          value={form.location}
          onChange={(event) => handleChange("location", event.target.value)}
          placeholder={t("calendar.taskLocation")}
          className="rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none"
        />

        <input
          type="date"
          value={form.date}
          onChange={(event) => handleChange("date", event.target.value)}
          required
          className="rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none"
        />

        <Button
          type="submit"
          className="w-full disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!workers.length || !projects.length}
        >
          {t("calendar.assignTaskButton")}
        </Button>
      </form>
    </>
  );

  return embedded ? content : <Card>{content}</Card>;
}
