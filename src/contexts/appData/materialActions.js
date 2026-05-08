import { materialRequestStatusOptions } from "../../data/mockMaterials";
import { normalizeOptionValue } from "./domainUtils";
import { hydrateMaterialRequestRecord, normalizeMaterialRequestRecord } from "./materials";

function applyWorkspaceScope(payload, currentUser) {
  return {
    ...payload,
    companyId: payload.companyId ?? currentUser?.companyId,
    workspaceId: payload.workspaceId ?? currentUser?.workspaceId
  };
}

export function createMaterialActions({ currentUser, dispatch, projectsById, state, workersById }) {
  const addMaterialRequest = (request) => {
    const normalizedRequest = normalizeMaterialRequestRecord(
      applyWorkspaceScope(request, currentUser),
      state.workers,
      state.projects
    );

    if (!normalizedRequest.itemName || !normalizedRequest.requestedById) {
      return null;
    }

    dispatch({
      type: "ADD_MATERIAL_REQUEST",
      payload: normalizedRequest
    });

    return hydrateMaterialRequestRecord(normalizedRequest, workersById, projectsById);
  };

  const deleteMaterialRequest = (requestId) => {
    if (currentUser?.role === "employee") {
      const currentWorkerId = currentUser?.apiWorkerId || currentUser?.workerId;
      const request = state.materialRequests.find((item) => item.id === requestId);

      if (!request || request.requestedById !== currentWorkerId) {
        return null;
      }
    }

    dispatch({
      type: "DELETE_MATERIAL_REQUEST",
      payload: { requestId }
    });
  };

  const updateMaterialRequestStatus = (requestId, status) => {
    if (currentUser?.role && currentUser.role !== "admin") {
      return null;
    }

    const normalizedStatus = normalizeOptionValue(status, materialRequestStatusOptions, "");

    if (!normalizedStatus) {
      return null;
    }

    dispatch({
      type: "UPDATE_MATERIAL_REQUEST_STATUS",
      payload: {
        requestId,
        status: normalizedStatus
      }
    });

    return normalizedStatus;
  };

  return {
    addMaterialRequest,
    deleteMaterialRequest,
    updateMaterialRequestStatus
  };
}
