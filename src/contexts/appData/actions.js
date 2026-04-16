import { createAttendanceActions } from "./attendanceActions";
import { createChatActions } from "./chatActions";
import { createMaterialActions } from "./materialActions";
import { createProjectActions } from "./projectActions";
import { createTaskActions } from "./taskActions";
import { createWorkerActions } from "./workerActions";

export function createAppDataActions({ attendanceByWorkerId, currentUser, dispatch, projectsById, state, workersById }) {
  return {
    ...createAttendanceActions({ attendanceByWorkerId, currentUser, dispatch }),
    ...createChatActions({ dispatch }),
    ...createMaterialActions({ currentUser, dispatch, projectsById, state, workersById }),
    ...createProjectActions({ currentUser, dispatch, projectsById }),
    ...createTaskActions({ currentUser, dispatch, projectsById, state, workersById }),
    ...createWorkerActions({ attendanceByWorkerId, currentUser, dispatch, projectsById, state })
  };
}
