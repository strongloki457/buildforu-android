import { materialRequestStatusOptions } from "../../data/mockMaterials";
import { normalizeOptionValue } from "./domainUtils";
import { hydrateMaterialRequestRecord, normalizeMaterialRequestRecord } from "./materials";

export function createMaterialActions({ dispatch, projectsById, state, workersById }) {
  const addMaterialRequest = (request) => {
    const normalizedRequest = normalizeMaterialRequestRecord(request, state.workers, state.projects);

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
    dispatch({
      type: "DELETE_MATERIAL_REQUEST",
      payload: { requestId }
    });
  };

  const updateMaterialRequestStatus = (requestId, status) => {
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
