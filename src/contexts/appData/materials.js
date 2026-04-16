import { materialRequestStatusOptions } from "../../data/mockMaterials";
import { hasOwnProperty, normalizeOptionValue, normalizeText, resolveProjectId } from "./domainUtils";
import { createEntityId } from "./ids";

export function normalizeMaterialRequestRecord(request = {}, workers, projects, currentRequest) {
  const companyId = hasOwnProperty(request, "companyId")
    ? normalizeText(request.companyId)
    : currentRequest?.companyId ?? "company-1";
  const workspaceId = hasOwnProperty(request, "workspaceId")
    ? normalizeText(request.workspaceId)
    : currentRequest?.workspaceId ?? "workspace-1";
  const requestedById = hasOwnProperty(request, "requestedById")
    ? normalizeText(request.requestedById)
    : currentRequest?.requestedById ?? "";
  const linkedWorker = workers.find((worker) => worker.id === requestedById);
  const projectId =
    hasOwnProperty(request, "projectId") || hasOwnProperty(request, "projectName")
      ? resolveProjectId(request.projectId ?? request.projectName, projects)
      : currentRequest?.projectId ?? "";
  const linkedProject = projects.find((project) => project.id === projectId);
  const status = normalizeOptionValue(
    hasOwnProperty(request, "status") ? request.status : currentRequest?.status,
    materialRequestStatusOptions,
    currentRequest?.status ?? "Pending"
  );

  return {
    id: currentRequest?.id ?? request.id ?? createEntityId("request"),
    companyId,
    workspaceId,
    itemName: hasOwnProperty(request, "itemName") ? normalizeText(request.itemName) : currentRequest?.itemName ?? "",
    itemNameKey:
      hasOwnProperty(request, "itemName") && currentRequest
        ? null
        : request.itemNameKey ?? currentRequest?.itemNameKey ?? null,
    quantity: hasOwnProperty(request, "quantity") ? normalizeText(request.quantity) : currentRequest?.quantity ?? "",
    note: hasOwnProperty(request, "note") ? normalizeText(request.note) : currentRequest?.note ?? "",
    noteKey: hasOwnProperty(request, "note") && currentRequest ? null : request.noteKey ?? currentRequest?.noteKey ?? null,
    status,
    requestedById,
    requestedBy:
      linkedWorker?.name ??
      (hasOwnProperty(request, "requestedBy") ? normalizeText(request.requestedBy) : currentRequest?.requestedBy ?? ""),
    projectId,
    projectName:
      linkedProject?.name ??
      (hasOwnProperty(request, "projectName") ? normalizeText(request.projectName) : currentRequest?.projectName ?? ""),
    projectNameKey:
      linkedProject?.nameKey ??
      (hasOwnProperty(request, "projectName") && currentRequest
        ? null
        : request.projectNameKey ?? currentRequest?.projectNameKey ?? null),
    createdAt: hasOwnProperty(request, "createdAt")
      ? request.createdAt ?? currentRequest?.createdAt ?? new Date().toISOString()
      : currentRequest?.createdAt ?? new Date().toISOString()
  };
}

export function hydrateMaterialRequestRecord(request, workersById, projectsById) {
  const worker = workersById.get(request.requestedById) ?? null;
  const project = projectsById.get(request.projectId) ?? null;

  return {
    ...request,
    requestedBy: worker?.name ?? request.requestedBy,
    projectName: project?.name ?? request.projectName,
    projectNameKey: project?.nameKey ?? request.projectNameKey
  };
}
