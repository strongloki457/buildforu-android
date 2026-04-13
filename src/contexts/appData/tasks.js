import { hasOwnProperty, normalizeOptionValue, normalizeText, resolveProjectId } from "./domainUtils";
import { createEntityId } from "./ids";

const TASK_STATUS_OPTIONS = ["pending", "completed"];
const TASK_PRIORITY_OPTIONS = ["high", "medium", "low"];

export function normalizeTaskRecord(task = {}, workers, projects, currentTask) {
  const employeeId = hasOwnProperty(task, "employeeId") ? normalizeText(task.employeeId) : currentTask?.employeeId ?? "";
  const linkedWorker = workers.find((worker) => worker.id === employeeId);
  const projectId =
    hasOwnProperty(task, "projectId") || hasOwnProperty(task, "projectName")
      ? resolveProjectId(task.projectId ?? task.projectName, projects)
      : currentTask?.projectId ?? "";
  const linkedProject = projects.find((project) => project.id === projectId);
  const title = hasOwnProperty(task, "title") ? normalizeText(task.title) : currentTask?.title ?? "";
  const location = hasOwnProperty(task, "location")
    ? normalizeText(task.location)
    : currentTask?.location ?? linkedProject?.name ?? "";
  const date = hasOwnProperty(task, "date") ? normalizeText(task.date) : currentTask?.date ?? "";
  const priority = normalizeOptionValue(
    hasOwnProperty(task, "priority") ? task.priority : currentTask?.priority,
    TASK_PRIORITY_OPTIONS,
    currentTask?.priority ?? "medium"
  );
  const status = normalizeOptionValue(
    hasOwnProperty(task, "status") ? task.status : currentTask?.status,
    TASK_STATUS_OPTIONS,
    currentTask?.status ?? "pending"
  );

  return {
    id: currentTask?.id ?? task.id ?? createEntityId("task"),
    employeeId,
    assignee: linkedWorker?.name ?? (hasOwnProperty(task, "assignee") ? normalizeText(task.assignee) : currentTask?.assignee ?? ""),
    title,
    titleKey: hasOwnProperty(task, "title") && currentTask ? null : task.titleKey ?? currentTask?.titleKey ?? null,
    projectId,
    projectName:
      linkedProject?.name ?? (hasOwnProperty(task, "projectName") ? normalizeText(task.projectName) : currentTask?.projectName ?? ""),
    projectNameKey:
      linkedProject?.nameKey ??
      (hasOwnProperty(task, "projectName") && currentTask
        ? null
        : task.projectNameKey ?? currentTask?.projectNameKey ?? null),
    location,
    locationKey:
      hasOwnProperty(task, "location") && currentTask
        ? null
        : task.locationKey ?? currentTask?.locationKey ?? linkedProject?.nameKey ?? null,
    date,
    status,
    priority
  };
}

export function hydrateTaskRecord(task, workersById, projectsById) {
  const worker = workersById.get(task.employeeId) ?? null;
  const project = projectsById.get(task.projectId) ?? null;

  return {
    ...task,
    assignee: worker?.name ?? task.assignee,
    projectName: project?.name ?? task.projectName,
    projectNameKey: project?.nameKey ?? task.projectNameKey
  };
}
