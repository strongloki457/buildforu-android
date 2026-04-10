import { CalendarDays, ClipboardList, MapPin, Users2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useI18n } from "../../hooks/useI18n";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Modal from "../ui/Modal";
import SectionHeader from "../ui/SectionHeader";
import StatusBadge from "../ui/StatusBadge";
import { getLocalizedValue, getProjectName, getProjectNotes, getProjectPhase, getWorkerPosition } from "../../utils/localizedValue";

function formatProjectDate(value, locale) {
  if (!value) {
    return "-";
  }

  const [year, month, day] = String(value).split("-").map(Number);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale, {
    dateStyle: "medium"
  }).format(new Date(year, month - 1, day));
}

function ProjectDetailsModal({ project, onClose }) {
  const { locale, t } = useI18n();

  return (
    <Modal
      onClose={onClose}
      title={getProjectName(t, project)}
      description={t("projects.detailsDescription", "Project team, timeline and operational notes in one place.")}
    >
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-slate-50/90 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              {t("projects.currentPhase", "Current phase")}
            </p>
            <p className="mt-2 text-base text-slate-900">{getProjectPhase(t, project)}</p>
          </div>
          <StatusBadge value={project.status} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              {t("projects.projectLocation", "Location")}
            </p>
            <p className="mt-3 text-sm text-slate-700">{getLocalizedValue(t, project.locationKey, project.location) || "-"}</p>
          </div>

          <div className="rounded-[24px] bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("projects.budget", "Budget")}</p>
            <p className="mt-3 text-sm text-slate-700">{project.budget || "-"}</p>
          </div>

          <div className="rounded-[24px] bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              {t("projects.startDate", "Start date")}
            </p>
            <p className="mt-3 text-sm text-slate-700">{formatProjectDate(project.startDate, locale)}</p>
          </div>

          <div className="rounded-[24px] bg-slate-50/90 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("projects.deadline", "Deadline")}</p>
            <p className="mt-3 text-sm text-slate-700">{formatProjectDate(project.deadline, locale)}</p>
          </div>
        </div>

        <div className="rounded-[24px] bg-slate-50/90 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
              {t("projects.progressLabel", "Progress")}
            </p>
            <p className="text-sm text-slate-600">{t("projects.progressComplete", { value: project.progress })}</p>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-700 to-brand-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        <div className="rounded-[24px] bg-slate-50/90 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            {t("projects.teamAssigned", "Assigned team")}
          </p>

          {project.assignedWorkers.length ? (
            <div className="mt-3 grid gap-3">
              {project.assignedWorkers.map((worker) => (
                <div key={worker.id} className="flex items-center justify-between gap-3 rounded-[20px] bg-white/85 px-4 py-3">
                  <div>
                    <p className="text-sm text-slate-900">{worker.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{getWorkerPosition(t, worker)}</p>
                  </div>
                  <StatusBadge value={worker.attendance?.currentStatus ?? worker.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              {t("projects.noAssignedWorkers", "No workers are assigned to this project yet.")}
            </p>
          )}
        </div>

        <div className="rounded-[24px] bg-slate-50/90 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("projects.notes", "Notes")}</p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{getProjectNotes(t, project) || "-"}</p>
        </div>
      </div>
    </Modal>
  );
}

export default function ProjectsBoard({ title, subtitle, projects }) {
  const { locale, t } = useI18n();
  const [activeProjectId, setActiveProjectId] = useState("");

  const projectsWithAssignments = useMemo(() => projects, [projects]);

  const activeProject = projectsWithAssignments.find((project) => project.id === activeProjectId) ?? null;

  return (
    <Card>
      <SectionHeader title={title} subtitle={subtitle} />

      <div className="grid gap-4 xl:grid-cols-2">
        {projectsWithAssignments.map((project) => (
          <article
            key={project.id}
            className="rounded-[28px] border border-white/60 bg-white/85 p-5 shadow-soft transition hover:-translate-y-0.5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg text-slate-950">{getProjectName(t, project)}</p>
                <p className="mt-1 text-sm text-slate-500">{getProjectPhase(t, project)}</p>
              </div>
              <StatusBadge value={project.status} />
            </div>

            <div className="mt-4 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-[20px] bg-slate-50/90 px-4 py-3">
                <MapPin size={14} className="text-brand-600" />
                <span>{getLocalizedValue(t, project.locationKey, project.location) || "-"}</span>
              </div>
              <div className="flex items-center gap-2 rounded-[20px] bg-slate-50/90 px-4 py-3">
                <CalendarDays size={14} className="text-brand-600" />
                <span>{formatProjectDate(project.deadline, locale)}</span>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  {t("projects.teamAssigned", "Assigned team")}
                </p>
                <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                  <Users2 size={14} />
                  <span>{project.assignedWorkers.length}</span>
                </div>
              </div>

              {project.assignedWorkers.length ? (
                <div className="flex flex-wrap gap-2">
                  {project.assignedWorkers.map((worker) => (
                    <span
                      key={worker.id}
                      className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs text-brand-700"
                    >
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] text-brand-700">
                        {worker.name
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <span>{worker.name}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="rounded-[20px] border border-dashed border-slate-200 bg-slate-50/60 px-4 py-4 text-sm text-slate-500">
                  {t("projects.noAssignedWorkers", "No workers are assigned to this project yet.")}
                </div>
              )}
            </div>

            <div className="mt-5 rounded-[22px] bg-slate-50/90 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                  <ClipboardList size={14} className="text-brand-600" />
                  <span>{t("projects.progressLabel", "Progress")}</span>
                </div>
                <span className="text-sm text-slate-700">{t("projects.progressComplete", { value: project.progress })}</span>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-700 to-brand-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-slate-500">
                {t("projects.startDate", "Start date")}: {formatProjectDate(project.startDate, locale)}
              </div>
              <Button variant="secondary" className="gap-2" onClick={() => setActiveProjectId(project.id)}>
                {t("projects.viewDetails", "View details")}
              </Button>
            </div>
          </article>
        ))}
      </div>

      {activeProject ? <ProjectDetailsModal project={activeProject} onClose={() => setActiveProjectId("")} /> : null}
    </Card>
  );
}
