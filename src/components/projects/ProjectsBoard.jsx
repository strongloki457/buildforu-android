import { ClipboardList, FolderKanban, PackageCheck, Plus, RotateCw, Users2 } from "lucide-react";
import { useMemo, useState } from "react";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { projectStatusOptions } from "../../data/options";
import { useI18n } from "../../hooks/useI18n";
import Button from "../ui/Button";
import SectionHeader from "../ui/SectionHeader";
import ProjectCard from "./ProjectCard";
import ProjectDetailsModal from "./ProjectDetailsModal";
import ProjectFormModal from "./ProjectFormModal";

function SummaryTile({ icon: Icon, label, value, detail }) {
  return (
    <div className="min-w-0 rounded-lg border border-white/70 bg-white/85 px-4 py-4 shadow-sm">
      <div className="flex min-w-0 items-center gap-2 text-xs uppercase text-slate-400">
        <Icon size={15} className="shrink-0 text-brand-600" />
        <span className="break-anywhere">{label}</span>
      </div>
      <p className="mt-3 text-2xl text-slate-950">{value}</p>
      {detail ? <p className="break-anywhere mt-1 text-xs leading-5 text-slate-500">{detail}</p> : null}
    </div>
  );
}

function ProjectsLoadingState() {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {[0, 1, 2].map((column) => (
        <div key={column} className="rounded-lg border border-white/70 bg-white/55 p-4">
          <div className="h-5 w-28 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-4 grid gap-4">
            {[0, 1].map((item) => (
              <div key={item} className="rounded-lg border border-slate-100 bg-white p-4">
                <div className="h-5 w-2/3 animate-pulse rounded-full bg-slate-200" />
                <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-slate-100" />
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <div className="h-16 animate-pulse rounded-lg bg-slate-100" />
                  <div className="h-16 animate-pulse rounded-lg bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DraggableProjectCard({ project, onStatusChange, onViewDetails }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: project.id });
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: "grab"
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <ProjectCard project={project} onStatusChange={onStatusChange} onViewDetails={onViewDetails} />
    </div>
  );
}

function DroppableColumn({ status, children, isOver }) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[120px] mt-4 grid gap-4 rounded-xl transition-colors duration-150 ${
        isOver ? "bg-brand-50/40 ring-2 ring-brand-300 ring-offset-2" : ""
      }`}
    >
      {children}
    </div>
  );
}

export default function ProjectsBoard({
  isLoading = false,
  loadError = "",
  onCreateProject,
  onEditProject,
  onRefresh,
  onStatusChange,
  projects,
  subtitle,
  title,
  workerOptions = []
}) {
  const { t } = useI18n();
  const [activeProjectId, setActiveProjectId] = useState("");
  const [projectModal, setProjectModal] = useState(null);
  const [draggedProjectId, setDraggedProjectId] = useState(null);
  const [overColumn, setOverColumn] = useState(null);

  const activeProject = projects.find((project) => project.id === activeProjectId) ?? null;
  const draggedProject = projects.find((p) => p.id === draggedProjectId) ?? null;
  const canCreateProject = Boolean(onCreateProject);
  const canEditProject = Boolean(onEditProject);
  const canDrag = Boolean(onStatusChange);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const groupedProjects = useMemo(
    () =>
      projectStatusOptions.map((status) => {
        const statusProjects = projects.filter((project) => project.status === status);
        const averageProgress = statusProjects.length
          ? Math.round(statusProjects.reduce((sum, project) => sum + Number(project.progress || 0), 0) / statusProjects.length)
          : 0;

        return { status, averageProgress, projects: statusProjects };
      }),
    [projects]
  );

  const summary = useMemo(() => {
    const activeProjects = projects.filter((project) => project.status !== "Completed");
    const workerIds = new Set(projects.flatMap((project) => project.assignedWorkers.map((worker) => worker.id)));
    const openTaskCount = projects.reduce((sum, project) => sum + Number(project.openTaskCount || 0), 0);
    const openMaterialCount = projects.reduce((sum, project) => sum + Number(project.openMaterialCount || 0), 0);
    const averageProgress = projects.length
      ? Math.round(projects.reduce((sum, project) => sum + Number(project.progress || 0), 0) / projects.length)
      : 0;

    return {
      activeProjects: activeProjects.length,
      averageProgress,
      openMaterialCount,
      openTaskCount,
      workerCount: workerIds.size
    };
  }, [projects]);

  function handleDragStart({ active }) {
    setDraggedProjectId(active.id);
  }

  function handleDragOver({ over }) {
    setOverColumn(over?.id ?? null);
  }

  function handleDragEnd({ active, over }) {
    setDraggedProjectId(null);
    setOverColumn(null);
    if (!over || !onStatusChange) return;
    const project = projects.find((p) => p.id === active.id);
    if (project && project.status !== over.id) {
      onStatusChange(active.id, over.id);
    }
  }

  const board = (
    <div className="grid gap-4 xl:grid-cols-3">
      {groupedProjects.map((group) => (
        <section key={group.status} className="min-w-0 rounded-lg border border-white/70 bg-white/55 p-3 sm:p-4">
          <div className="flex min-w-0 items-start justify-between gap-3 border-b border-white/80 pb-4">
            <div className="min-w-0">
              <h3 className="break-anywhere text-sm text-slate-900">
                {t(`statusLabels.${group.status.toLowerCase()}`, group.status)}
              </h3>
              <p className="mt-1 text-xs uppercase text-slate-400">
                {t("projects.projectCount", { count: group.projects.length }, "{{count}} projects")}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs text-slate-500">
              {group.averageProgress}%
            </span>
          </div>

          <DroppableColumn status={group.status} isOver={overColumn === group.status && draggedProject?.status !== group.status}>
            {group.projects.length ? (
              group.projects.map((project) =>
                canDrag ? (
                  <DraggableProjectCard
                    key={project.id}
                    project={project}
                    onStatusChange={onStatusChange}
                    onViewDetails={setActiveProjectId}
                  />
                ) : (
                  <ProjectCard
                    key={project.id}
                    onStatusChange={onStatusChange}
                    onViewDetails={setActiveProjectId}
                    project={project}
                  />
                )
              )
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 bg-white/75 px-4 py-5 text-sm text-slate-500">
                <p>{t("projects.emptyStatusGroup", "No projects in this status yet.")}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  {canDrag
                    ? t("projects.dragHere", "Drag a project card here to change its status.")
                    : t("projects.emptyStatusHint", "Move a project here when the site reaches this stage.")}
                </p>
              </div>
            )}
          </DroppableColumn>
        </section>
      ))}
    </div>
  );

  return (
    <section className="min-w-0">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        action={
          canCreateProject ? (
            <Button className="w-full gap-2 sm:w-auto" onClick={() => setProjectModal({ mode: "create" })}>
              <Plus size={16} />
              {t("projects.addProjectAction", "Create project")}
            </Button>
          ) : null
        }
      />

      {loadError ? (
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <span className="break-anywhere">{t("projects.loadFailed", "Projects could not be loaded. Try again.")}</span>
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-medium text-amber-900 shadow-sm"
            >
              <RotateCw size={14} />
              {t("common.retry", "Retry")}
            </button>
          ) : null}
        </div>
      ) : null}

      {isLoading && !projects.length ? (
        <ProjectsLoadingState />
      ) : projects.length ? (
        <div className="grid gap-5">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
            <SummaryTile
              icon={FolderKanban}
              label={t("projects.activeBuilds", "Active builds")}
              value={summary.activeProjects}
              detail={t("projects.activeBuildsDetail", "Current live portfolio.")}
            />
            <SummaryTile
              icon={Users2}
              label={t("projects.peopleAssigned", "People assigned")}
              value={summary.workerCount}
              detail={t("projects.peopleAssignedDetail", "Workers currently mapped to active project work.")}
            />
            <SummaryTile
              icon={ClipboardList}
              label={t("projects.openTasks", "Open tasks")}
              value={summary.openTaskCount}
              detail={t("projects.openTasksDetail", "Tasks still waiting for completion.")}
            />
            <SummaryTile
              icon={PackageCheck}
              label={t("projects.openMaterials", "Open materials")}
              value={summary.openMaterialCount}
              detail={t("projects.openMaterialsDetail", "Material requests still waiting for closure.")}
            />
            <SummaryTile
              icon={FolderKanban}
              label={t("projects.averageProgress", "Avg. progress")}
              value={`${summary.averageProgress}%`}
              detail={t("projects.averageProgressDetail", "Portfolio completion midpoint.")}
            />
          </div>

          {canDrag ? (
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              {board}
              <DragOverlay>
                {draggedProject ? (
                  <div className="rotate-1 opacity-90 shadow-xl">
                    <ProjectCard project={draggedProject} onStatusChange={null} onViewDetails={null} />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          ) : (
            board
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white/75 px-5 py-10 text-center">
          <FolderKanban className="mx-auto text-brand-600" size={34} />
          <h3 className="mt-4 text-base text-slate-950">{t("projects.emptyTitle", "No projects yet")}</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            {t(
              "projects.emptySubtitle",
              "Create the first job site record to connect workers, tasks and material requests."
            )}
          </p>
          {canCreateProject ? (
            <Button className="mt-5 gap-2" onClick={() => setProjectModal({ mode: "create" })}>
              <Plus size={16} />
              {t("projects.addProjectAction", "Create project")}
            </Button>
          ) : null}
        </div>
      )}

      {activeProject ? (
        <ProjectDetailsModal
          onClose={() => setActiveProjectId("")}
          onEdit={
            canEditProject
              ? () => {
                  setProjectModal({ mode: "edit", project: activeProject });
                  setActiveProjectId("");
                }
              : null
          }
          onStatusChange={onStatusChange}
          project={activeProject}
        />
      ) : null}

      {projectModal ? (
        <ProjectFormModal
          initialValues={projectModal.project}
          mode={projectModal.mode}
          onClose={() => setProjectModal(null)}
          onSave={async (payload) => {
            const savedProject =
              projectModal.mode === "edit" && projectModal.project
                ? await onEditProject?.(projectModal.project.id, payload)
                : await onCreateProject?.(payload);

            if (savedProject) {
              setProjectModal(null);
              setActiveProjectId(savedProject.id);
            }
          }}
          workerOptions={workerOptions}
        />
      ) : null}
    </section>
  );
}
