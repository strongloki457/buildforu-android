import { useMemo, useState } from "react";
import MaterialRequestForm from "../components/materials/MaterialRequestForm";
import MaterialsStoreFinderTab from "../components/materials/MaterialsStoreFinderTab";
import MaterialWorkflowCard from "../components/materials/MaterialWorkflowCard";
import MaterialsFilters from "../components/materials/MaterialsFilters";
import MaterialsList from "../components/materials/MaterialsList";
import MaterialsMetrics from "../components/materials/MaterialsMetrics";
import Card from "../components/ui/Card";
import SectionHeader from "../components/ui/SectionHeader";
import { materialRequestStatusOptions } from "../data/mockMaterials";
import { useAuth } from "../hooks/useAuth";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";
import { useCurrentWorker, useVisibleMaterialRequests, useVisibleProjects } from "../hooks/useRoleData";
import {
  getMaterialRequestItem,
  getMaterialRequestNote,
  getMaterialRequestProjectName,
  getProjectName
} from "../utils/localizedValue";

const tabOptions = ["requests", "find"];

export default function MaterialsPage() {
  const { user } = useAuth();
  const {
    projects,
    materialRequests,
    addMaterialRequest,
    deleteMaterialRequest,
    updateMaterialRequestStatus
  } = useAppData();
  const { locale, t } = useI18n();
  const linkedWorker = useCurrentWorker();
  const visibleProjects = useVisibleProjects();
  const scopedRequests = useVisibleMaterialRequests();
  const [activeTab, setActiveTab] = useState("requests");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  const isAdmin = user.role === "admin";
  const requesterId = user.workerId || user.id;
  const workerProjects = useMemo(
    () => visibleProjects.filter((project) => linkedWorker?.projectIds?.includes(project.id)),
    [linkedWorker?.projectIds, visibleProjects]
  );
  const workerProjectLabel = useMemo(
    () => workerProjects.map((project) => getProjectName(t, project)).join(", "),
    [t, workerProjects]
  );
  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return scopedRequests.filter((request) => {
      const matchesStatus = statusFilter === "all" || String(request.status).toLowerCase() === statusFilter;
      const matchesProject = projectFilter === "all" || request.projectId === projectFilter;
      const matchesSearch =
        !normalizedSearch ||
        [
          getMaterialRequestItem(t, request),
          request.requestedBy,
          getMaterialRequestProjectName(t, request),
          request.quantity,
          getMaterialRequestNote(t, request),
          request.status
        ].some((value) => String(value ?? "").toLowerCase().includes(normalizedSearch));

      return matchesStatus && matchesProject && matchesSearch;
    });
  }, [projectFilter, scopedRequests, search, statusFilter, t]);
  const requestStatusCounts = useMemo(
    () =>
      materialRequestStatusOptions.reduce(
        (counts, status) => ({
          ...counts,
          [status]: scopedRequests.filter((request) => request.status === status).length
        }),
        {}
      ),
    [scopedRequests]
  );
  const projectLinkedCount = useMemo(
    () => scopedRequests.filter((request) => request.projectId).length,
    [scopedRequests]
  );

  const handleCreateRequest = (payload) =>
    addMaterialRequest({
      ...payload,
      requestedById: requesterId,
      requestedBy: user.name,
      projectName: payload.projectId ? projects.find((project) => project.id === payload.projectId)?.name ?? "" : ""
    });

  const handleDeleteRequest = (requestId) => {
    const request = materialRequests.find((item) => item.id === requestId);

    if (!request || request.requestedById !== requesterId) {
      return;
    }

    if (!["pending", "rejected"].includes(String(request.status).toLowerCase())) {
      return;
    }

    deleteMaterialRequest(requestId);
  };

  return (
    <div className="space-y-6">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.25em] text-brand-600">
          {t("materials.pageEyebrow", "Materials")}
        </p>
        <h1 className="mt-2 text-3xl text-slate-950">{t("materials.title", "Materials")}</h1>
        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          {t(
            "materials.dualPurposeSubtitle",
            "Track material requests by project so the office can approve, order and close them quickly."
          )}
        </p>
      </div>

      <div className="inline-flex w-full rounded-lg border border-slate-200 bg-white p-1 shadow-soft sm:w-auto">
        {tabOptions.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-lg px-4 py-3 text-sm transition sm:flex-none ${
                isActive ? "bg-brand-700 text-white shadow-lg shadow-brand-900/15" : "text-slate-600 hover:bg-brand-50"
              }`}
            >
              {tab === "requests" ? t("materials.requestsTab", "Requests") : t("materials.findToBuyTab", "Find to Buy")}
            </button>
          );
        })}
      </div>

      {activeTab === "requests" ? (
        <div className="space-y-6">
          <MaterialsMetrics isAdmin={isAdmin} scopedRequests={scopedRequests} />

          <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            {isAdmin ? (
              <MaterialWorkflowCard
                projectLinkedCount={projectLinkedCount}
                statusCounts={requestStatusCounts}
                totalRequests={scopedRequests.length}
              />
            ) : (
              <MaterialRequestForm
                projectName={workerProjectLabel}
                projectOptions={workerProjects}
                defaultProjectId={workerProjects[0]?.id ?? ""}
                onSubmit={handleCreateRequest}
              />
            )}

            <Card>
              <SectionHeader
                title={t("materials.requestsBoardTitle", "Material request board")}
                subtitle={t(
                  isAdmin ? "materials.requestsBoardSubtitleAdmin" : "materials.requestsBoardSubtitleEmployee",
                  isAdmin
                    ? "Review every request, filter by status or project, and update progress as buying moves forward."
                    : "Track your requests, filter them fast, and remove pending items before purchasing starts."
                )}
              />

              <MaterialsFilters
                projectFilter={projectFilter}
                projectOptions={visibleProjects}
                search={search}
                setProjectFilter={setProjectFilter}
                setSearch={setSearch}
                setStatusFilter={setStatusFilter}
                showProjectFilter={isAdmin}
                statusFilter={statusFilter}
              />

              <MaterialsList
                filteredRequests={filteredRequests}
                isAdmin={isAdmin}
                locale={locale}
                onDelete={handleDeleteRequest}
                onStatusChange={updateMaterialRequestStatus}
              />
            </Card>
          </div>
        </div>
      ) : (
        <MaterialsStoreFinderTab />
      )}
    </div>
  );
}
