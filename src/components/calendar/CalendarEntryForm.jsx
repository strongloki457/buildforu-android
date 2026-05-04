import { AlertTriangle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { projectStatusOptions } from "../../data/options";
import { useI18n } from "../../hooks/useI18n";
import { getProjectName, getWorkerPosition } from "../../utils/localizedValue";
import Button from "../ui/Button";

const taskPriorityOptions = ["low", "medium", "high"];

export default function CalendarEntryForm({
  initialDate,
  onCreateProject,
  onCreateTask,
  projects,
  workers
}) {
  const { t } = useI18n();
  const [entryType, setEntryType] = useState("task");
  const [taskForm, setTaskForm] = useState({
    title: "",
    date: initialDate,
    location: "",
    projectId: projects[0]?.id ?? "",
    employeeId: workers[0]?.id ?? "",
    priority: "medium"
  });
  const [projectForm, setProjectForm] = useState({
    name: "",
    startDate: initialDate,
    phase: "",
    location: "",
    notes: "",
    status: "To Start",
    assignedWorkerIds: []
  });

  const selectedTaskProject = useMemo(
    () => projects.find((project) => project.id === taskForm.projectId) ?? null,
    [projects, taskForm.projectId]
  );
  const selectedTaskWorker = useMemo(
    () => workers.find((worker) => worker.id === taskForm.employeeId) ?? null,
    [taskForm.employeeId, workers]
  );

  useEffect(() => {
    setTaskForm((current) => ({
      ...current,
      projectId: projects.some((project) => project.id === current.projectId) ? current.projectId : projects[0]?.id ?? "",
      employeeId: workers.some((worker) => worker.id === current.employeeId) ? current.employeeId : workers[0]?.id ?? ""
    }));
  }, [projects, workers]);

  const handleTaskChange = (key, value) => {
    setTaskForm((current) => ({ ...current, [key]: value }));
  };

  const handleProjectChange = (key, value) => {
    setProjectForm((current) => ({ ...current, [key]: value }));
  };

  const toggleAssignedWorker = (workerId) => {
    setProjectForm((current) => ({
      ...current,
      assignedWorkerIds: current.assignedWorkerIds.includes(workerId)
        ? current.assignedWorkerIds.filter((item) => item !== workerId)
        : [...current.assignedWorkerIds, workerId]
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (entryType === "task") {
      const title = taskForm.title.trim();
      const location = taskForm.location.trim();

      if (!title || !taskForm.date || !taskForm.projectId || !taskForm.employeeId) {
        return;
      }

      const createdTask = onCreateTask({
        title,
        date: taskForm.date,
        location: location || selectedTaskProject?.location || selectedTaskProject?.name || "",
        projectId: taskForm.projectId,
        projectName: selectedTaskProject?.name ?? "",
        employeeId: taskForm.employeeId,
        assignee: selectedTaskWorker?.name ?? "",
        priority: taskForm.priority
      });

      if (createdTask) {
        setTaskForm((current) => ({
          ...current,
          title: "",
          location: "",
          projectId: projects[0]?.id ?? "",
          employeeId: workers[0]?.id ?? "",
          priority: "medium",
          date: initialDate
        }));
      }

      return;
    }

    const name = projectForm.name.trim();
    const phase = projectForm.phase.trim();
    const location = projectForm.location.trim();
    const notes = projectForm.notes.trim();

    if (!name || !projectForm.startDate) {
      return;
    }

    const createdProject = onCreateProject({
      name,
      startDate: projectForm.startDate,
      phase,
      location,
      notes,
      status: projectForm.status,
      assignedWorkerIds: projectForm.assignedWorkerIds
    });

    if (createdProject) {
      setProjectForm({
        name: "",
        startDate: initialDate,
        phase: "",
        location: "",
        notes: "",
        status: "To Start",
        assignedWorkerIds: []
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-2 sm:grid-cols-2">
        {["task", "project"].map((type) => {
          const isActive = entryType === type;

          return (
            <button
              key={type}
              type="button"
              onClick={() => setEntryType(type)}
              className={`rounded-lg border px-4 py-4 text-left transition ${
                isActive
                  ? "border-brand-200 bg-brand-50 text-brand-900"
                  : "border-slate-200 bg-white text-slate-600 hover:border-brand-100 hover:bg-brand-50/40"
              }`}
            >
              <span className="block text-sm">{t(`calendar.entryTypes.${type}`, type === "task" ? "Task" : "Project")}</span>
              <span className="mt-1 block text-sm text-slate-500">
                {type === "task"
                  ? t("calendar.taskEntryDescription", "Create a dated task, optionally linked to a project or worker.")
                  : t("calendar.projectEntryDescription", "Create a real project entry that also shows up in Projects.")}
              </span>
            </button>
          );
        })}
      </div>

      {entryType === "task" ? (
        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm text-slate-600">{t("calendar.taskTitle")}</span>
            <input
              value={taskForm.title}
              onChange={(event) => handleTaskChange("title", event.target.value)}
              required
              className="rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm text-slate-600">{t("common.project", "Project")}</span>
              <select
                value={taskForm.projectId}
                onChange={(event) => handleTaskChange("projectId", event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none"
              >
                <option value="">{t("calendar.selectProject", "Select project")}</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {getProjectName(t, project)}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-slate-600">{t("common.assignedTo", "Assigned to")}</span>
              <select
                value={taskForm.employeeId}
                onChange={(event) => handleTaskChange("employeeId", event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none"
              >
                <option value="">{t("calendar.selectWorker", "Select worker")}</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name} - {getWorkerPosition(t, worker)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm text-slate-600">{t("common.location", "Location")}</span>
              <input
                value={taskForm.location}
                onChange={(event) => handleTaskChange("location", event.target.value)}
                placeholder={t("calendar.taskLocation")}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-slate-600">{t("common.date", "Date")}</span>
              <input
                type="date"
                value={taskForm.date}
                onChange={(event) => handleTaskChange("date", event.target.value)}
                required
                className="rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm text-slate-600">{t("tasks.priority", "Priority")}</span>
            <select
              value={taskForm.priority}
              onChange={(event) => handleTaskChange("priority", event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none"
            >
              {taskPriorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {t(`priorityLabels.${priority}`, priority)}
                </option>
              ))}
            </select>
          </label>

          {(!projects.length || !workers.length) ? (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>
                {t(
                  "calendar.taskRequiresSetup",
                  "Create at least one worker and one project before assigning calendar tasks."
                )}
              </span>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm text-slate-600">{t("projects.projectNameLabel", "Project name")}</span>
            <input
              value={projectForm.name}
              onChange={(event) => handleProjectChange("name", event.target.value)}
              required
              className="rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm text-slate-600">{t("projects.projectTypeLabel", "Type or category")}</span>
              <input
                value={projectForm.phase}
                onChange={(event) => handleProjectChange("phase", event.target.value)}
                placeholder={t("projects.projectTypePlaceholder", "Fit-out, shell, electrical...")}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-slate-600">{t("common.status", "Status")}</span>
              <select
                value={projectForm.status}
                onChange={(event) => handleProjectChange("status", event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none"
              >
                {projectStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {t(`statusLabels.${status.toLowerCase()}`, status)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm text-slate-600">{t("projects.startDate", "Start date")}</span>
              <input
                type="date"
                value={projectForm.startDate}
                onChange={(event) => handleProjectChange("startDate", event.target.value)}
                required
                className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm outline-none"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-slate-600">{t("common.location", "Location")}</span>
              <input
                value={projectForm.location}
                onChange={(event) => handleProjectChange("location", event.target.value)}
                placeholder={t("projects.projectLocation", "Location")}
                className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm outline-none"
              />
            </label>
          </div>

          <div className="grid gap-3">
            <span className="text-sm text-slate-600">{t("projects.teamAssigned", "Assigned team")}</span>
            {workers.length ? (
              <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-3">
                {workers.map((worker) => {
                  const isSelected = projectForm.assignedWorkerIds.includes(worker.id);

                  return (
                    <button
                      key={worker.id}
                      type="button"
                      onClick={() => toggleAssignedWorker(worker.id)}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        isSelected ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {worker.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/70 px-4 py-4 text-sm text-slate-500">
                {t("workers.noWorkersFound")}
              </div>
            )}
          </div>

          <label className="grid gap-2">
            <span className="text-sm text-slate-600">{t("projects.notes", "Note")}</span>
            <textarea
              rows={4}
              value={projectForm.notes}
              onChange={(event) => handleProjectChange("notes", event.target.value)}
              placeholder={t("projects.projectNotesPlaceholder", "Useful context for the team or next step.")}
              className="rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none"
            />
          </label>
        </div>
      )}

      <Button
        type="submit"
        className="w-full justify-center"
        disabled={entryType === "task" && (!projects.length || !workers.length)}
      >
        {entryType === "task"
          ? t("calendar.assignTaskButton")
          : t("calendar.createProjectButton", "Create project")}
      </Button>
    </form>
  );
}
