export function getLocalizedValue(t, key, fallback = "") {
  return key ? t(key, fallback) : fallback;
}

export function getUserTitle(t, user) {
  return getLocalizedValue(t, user?.titleKey, user?.title ?? "");
}

export function getWorkerPosition(t, worker) {
  return getLocalizedValue(t, worker?.positionKey ?? worker?.tradeKey, worker?.position ?? worker?.trade ?? "");
}

export function getProjectName(t, project) {
  return getLocalizedValue(t, project?.nameKey, project?.name ?? "");
}

export function getTaskTitle(t, task) {
  return getLocalizedValue(t, task?.titleKey, task?.title ?? "");
}

export function getTaskLocation(t, task) {
  return getLocalizedValue(t, task?.locationKey, task?.location ?? "");
}

export function getTaskProjectName(t, task) {
  return getLocalizedValue(t, task?.projectNameKey, task?.projectName ?? "");
}

export function getProjectPhase(t, project) {
  return getLocalizedValue(t, project?.phaseKey, project?.phase ?? "");
}

export function getProjectNotes(t, project) {
  return getLocalizedValue(t, project?.notesKey, project?.notes ?? "");
}

export function getMaterialRequestItem(t, request) {
  return getLocalizedValue(t, request?.itemNameKey, request?.itemName ?? "");
}

export function getMaterialRequestNote(t, request) {
  return getLocalizedValue(t, request?.noteKey, request?.note ?? "");
}

export function getMaterialRequestProjectName(t, request) {
  return getLocalizedValue(t, request?.projectNameKey, request?.projectName ?? "");
}

export function getStoreProductName(t, store) {
  return getLocalizedValue(t, store?.productNameKey, store?.productName ?? "");
}

export function getStoreCategory(t, store) {
  return getLocalizedValue(t, store?.categoryKey, store?.category ?? "");
}

export function getStoreAddress(t, store) {
  return getLocalizedValue(t, store?.addressKey, store?.address ?? "");
}

export function getStoreEta(t, store) {
  return getLocalizedValue(t, store?.etaKey, store?.eta ?? "");
}
