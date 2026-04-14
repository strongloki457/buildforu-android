import { createAttendanceActions } from "./attendanceActions";
import { createChatActions } from "./chatActions";
import { createMaterialActions } from "./materialActions";
import { createProjectActions } from "./projectActions";
import { createTaskActions } from "./taskActions";
import { createWorkerActions } from "./workerActions";

export function createAppDataActions({ attendanceByWorkerId, dispatch, projectsById, state, workersById }) {
  return {
    ...createAttendanceActions({ attendanceByWorkerId, dispatch }),
    ...createChatActions({ dispatch }),
    ...createMaterialActions({ dispatch, projectsById, state, workersById }),
    ...createProjectActions({ dispatch, projectsById }),
    ...createTaskActions({ dispatch, projectsById, state, workersById }),
    ...createWorkerActions({ attendanceByWorkerId, dispatch, projectsById, state })
  };
}
