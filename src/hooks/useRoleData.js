import { useMemo } from "react";
import { useAppData } from "./useAppData";
import { useAuth } from "./useAuth";
import { sortByDateKey } from "../utils/date";

function buildProjectCalendarEvent(project) {
  return {
    id: `project-event-${project.id}`,
    entryType: "project",
    date: project.startDate,
    title: project.name,
    titleKey: project.nameKey,
    projectId: project.id,
    projectName: project.name,
    projectNameKey: project.nameKey,
    location: project.location,
    locationKey: project.locationKey,
    notes: project.notes,
    notesKey: project.notesKey,
    status: project.status
  };
}

function getCurrentWorkerId(user) {
  return user?.apiWorkerId || user?.workerId || user?.id || "";
}

export function useCurrentWorker() {
  const { user } = useAuth();
  const { workers } = useAppData();
  const currentWorkerId = getCurrentWorkerId(user);

  return useMemo(
    () => workers.find((worker) => worker.id === currentWorkerId) ?? null,
    [currentWorkerId, workers]
  );
}

export function useVisibleTasks() {
  const { user } = useAuth();
  const { tasks } = useAppData();
  const currentWorkerId = getCurrentWorkerId(user);

  return useMemo(
    () => (user?.role === "admin" ? tasks : tasks.filter((task) => task.employeeId === currentWorkerId)),
    [currentWorkerId, tasks, user?.role]
  );
}

export function useVisibleProjects() {
  const { user } = useAuth();
  const { projects } = useAppData();
  const currentWorkerId = getCurrentWorkerId(user);

  return useMemo(
    () =>
      user?.role === "admin"
        ? projects
        : projects.filter((project) => project.assignedWorkers.some((worker) => worker.id === currentWorkerId)),
    [currentWorkerId, projects, user?.role]
  );
}

export function useVisibleMaterialRequests() {
  const { user } = useAuth();
  const { materialRequests } = useAppData();
  const currentWorkerId = getCurrentWorkerId(user);

  return useMemo(() => {
    const visibleRequests =
      user?.role === "admin"
        ? materialRequests
        : materialRequests.filter((request) => request.requestedById === currentWorkerId);

    return [...visibleRequests].sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
  }, [currentWorkerId, materialRequests, user?.role]);
}

export function useVisibleCalendarEntries() {
  const visibleTasks = useVisibleTasks();
  const visibleProjects = useVisibleProjects();

  return useMemo(
    () =>
      sortByDateKey([
        ...visibleTasks.map((task) => ({ ...task, entryType: "task" })),
        ...visibleProjects.filter((project) => project.startDate).map((project) => buildProjectCalendarEvent(project))
      ]),
    [visibleProjects, visibleTasks]
  );
}
