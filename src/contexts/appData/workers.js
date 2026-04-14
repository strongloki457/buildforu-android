import { buildAttendanceStateRecord } from "./attendance";
import { clampProgress, hasOwnProperty, normalizeText, sanitizeProjectIds } from "./domainUtils";
import { createEntityId } from "./ids";

export function normalizeWorkerRecord(worker = {}, currentWorker, projects) {
  const companyId = hasOwnProperty(worker, "companyId")
    ? normalizeText(worker.companyId)
    : currentWorker?.companyId ?? "company-1";
  const workspaceId = hasOwnProperty(worker, "workspaceId")
    ? normalizeText(worker.workspaceId)
    : currentWorker?.workspaceId ?? "workspace-1";
  const name = hasOwnProperty(worker, "name") ? normalizeText(worker.name) : currentWorker?.name ?? "";
  const email = hasOwnProperty(worker, "email") ? normalizeText(worker.email) : currentWorker?.email ?? "";
  const phone = hasOwnProperty(worker, "phone") ? normalizeText(worker.phone) : currentWorker?.phone ?? "";
  const position = hasOwnProperty(worker, "position") ? normalizeText(worker.position) : currentWorker?.position ?? "";
  const notes = hasOwnProperty(worker, "notes") ? normalizeText(worker.notes) : currentWorker?.notes ?? "";
  const availability = hasOwnProperty(worker, "availability")
    ? normalizeText(worker.availability) || "Available"
    : currentWorker?.availability ?? "Available";
  const nextShift = hasOwnProperty(worker, "nextShift")
    ? normalizeText(worker.nextShift) || "Not scheduled"
    : currentWorker?.nextShift ?? "Not scheduled";
  const completionRate = hasOwnProperty(worker, "completionRate")
    ? clampProgress(worker.completionRate, currentWorker?.completionRate ?? 0)
    : currentWorker?.completionRate ?? 0;

  let projectIds = currentWorker?.projectIds ?? [];

  if (hasOwnProperty(worker, "projectIds")) {
    projectIds = sanitizeProjectIds(worker.projectIds, projects);
  } else if (hasOwnProperty(worker, "assignedProject")) {
    projectIds = sanitizeProjectIds(worker.assignedProject ? [worker.assignedProject] : [], projects);
  }

  return {
    id: currentWorker?.id ?? worker.id ?? createEntityId("worker"),
    companyId,
    workspaceId,
    name,
    email,
    phone,
    position,
    notes,
    positionKey:
      hasOwnProperty(worker, "position") && currentWorker
        ? null
        : worker.positionKey ?? worker.tradeKey ?? currentWorker?.positionKey ?? currentWorker?.tradeKey ?? null,
    availability,
    completionRate,
    nextShift,
    projectIds
  };
}

export function hydrateWorkerRecord(worker, projectsById, attendanceByWorkerId) {
  const assignedProjects = worker.projectIds.map((projectId) => projectsById.get(projectId)).filter(Boolean);
  const primaryProject = assignedProjects[0] ?? null;
  const attendance = attendanceByWorkerId.get(worker.id) ?? buildAttendanceStateRecord({ workerId: worker.id });

  return {
    ...worker,
    attendance,
    assignedProject: primaryProject?.name ?? "",
    assignedProjectKey: primaryProject?.nameKey ?? null,
    assignedProjects,
    location: primaryProject?.name ?? "",
    locationKey: primaryProject?.nameKey ?? null,
    status: attendance.currentStatus,
    trade: worker.position,
    tradeKey: worker.positionKey
  };
}
