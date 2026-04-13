import { projectStatusOptions } from "../../data/options";
import { clampProgress, hasOwnProperty, normalizeOptionValue, normalizeText } from "./domainUtils";
import { createEntityId } from "./ids";

export function normalizeProjectRecord(project = {}, currentProject) {
  const name = hasOwnProperty(project, "name") ? normalizeText(project.name) : currentProject?.name ?? "";
  const phase = hasOwnProperty(project, "phase") ? normalizeText(project.phase) : currentProject?.phase ?? "";
  const budget = hasOwnProperty(project, "budget") ? normalizeText(project.budget) : currentProject?.budget ?? "";
  const health = hasOwnProperty(project, "health") ? normalizeText(project.health) : currentProject?.health ?? "Healthy";
  const location = hasOwnProperty(project, "location") ? normalizeText(project.location) : currentProject?.location ?? "";
  const startDate = hasOwnProperty(project, "startDate")
    ? normalizeText(project.startDate)
    : currentProject?.startDate ?? "";
  const deadline = hasOwnProperty(project, "deadline")
    ? normalizeText(project.deadline)
    : currentProject?.deadline ?? "";
  const notes = hasOwnProperty(project, "notes") ? normalizeText(project.notes) : currentProject?.notes ?? "";
  const status = normalizeOptionValue(
    hasOwnProperty(project, "status") ? project.status : currentProject?.status,
    projectStatusOptions,
    currentProject?.status ?? "Not Started"
  );

  return {
    id: currentProject?.id ?? project.id ?? createEntityId("project"),
    name,
    nameKey: hasOwnProperty(project, "name") && currentProject ? null : project.nameKey ?? currentProject?.nameKey ?? null,
    status,
    phase,
    phaseKey:
      hasOwnProperty(project, "phase") && currentProject ? null : project.phaseKey ?? currentProject?.phaseKey ?? null,
    progress: hasOwnProperty(project, "progress")
      ? clampProgress(project.progress, currentProject?.progress ?? 0)
      : currentProject?.progress ?? 0,
    budget,
    health,
    location,
    locationKey:
      hasOwnProperty(project, "location") && currentProject
        ? null
        : project.locationKey ?? currentProject?.locationKey ?? null,
    startDate,
    deadline,
    notes,
    notesKey:
      hasOwnProperty(project, "notes") && currentProject ? null : project.notesKey ?? currentProject?.notesKey ?? null,
    assignedWorkerIds: Array.isArray(project.assignedWorkerIds)
      ? Array.from(new Set(project.assignedWorkerIds.map((item) => normalizeText(item)).filter(Boolean)))
      : currentProject?.assignedWorkerIds ?? []
  };
}

export function syncProjectsWithWorkers(projects, workers) {
  return projects.map((project) => ({
    ...project,
    assignedWorkerIds: workers.filter((worker) => worker.projectIds.includes(project.id)).map((worker) => worker.id)
  }));
}
