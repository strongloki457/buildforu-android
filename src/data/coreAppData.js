import { mockAttendance } from "./mockAttendance";
import { mockMaterialRequests } from "./mockMaterials";
import { mockProjects } from "./mockProjects";
import { mockTasks } from "./mockTasks";
import { mockWorkers } from "./mockWorkers";

export function getInitialCoreAppData() {
  return {
    attendance: mockAttendance.map((record) => ({ ...record })),
    materialRequests: mockMaterialRequests.map((request) => ({ ...request })),
    projects: mockProjects.map((project) => ({ ...project })),
    tasks: mockTasks.map((task) => ({ ...task })),
    workers: mockWorkers.map((worker) => ({ ...worker }))
  };
}
