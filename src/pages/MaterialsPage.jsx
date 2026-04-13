import { useMemo, useState } from "react";
import MaterialRequestForm from "../components/materials/MaterialRequestForm";
import MaterialWorkflowCard from "../components/materials/MaterialWorkflowCard";
import MaterialsFilters from "../components/materials/MaterialsFilters";
import MaterialsList from "../components/materials/MaterialsList";
import MaterialsMetrics from "../components/materials/MaterialsMetrics";
import Card from "../components/ui/Card";
import SectionHeader from "../components/ui/SectionHeader";
import { useAuth } from "../hooks/useAuth";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";
import {
  getMaterialRequestItem,
  getMaterialRequestNote,
  getMaterialRequestProjectName,
  getProjectName
} from "../utils/localizedValue";

export default function MaterialsPage() {
  const { user } = useAuth();
  const { workers, projects, materialRequests, addMaterialRequest, deleteMaterialRequest, updateMaterialRequestStatus } =
    useAppData();
  const { locale, t } = useI18n();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const isAdmin = user.role === "admin";
  const linkedWorker = useMemo(() => workers.find((worker) => worker.id === user.id) ?? null, [user.id, workers]);
  const workerProjects = useMemo(
    () => projects.filter((project) => linkedWorker?.projectIds?.includes(project.id)),
    [linkedWorker?.projectIds, projects]
  );
  const workerProjectLabel = useMemo(
    () => workerProjects.map((project) => getProjectName(t, project)).join(", "),
    [t, workerProjects]
  );
  const scopedRequests = useMemo(() => {
    const requests = isAdmin
      ? materialRequests
      : materialRequests.filter((request) => request.requestedById === user.id);

    return [...requests].sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
  }, [isAdmin, materialRequests, user.id]);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return scopedRequests.filter((request) => {
      const matchesStatus = statusFilter === "all" || String(request.status).toLowerCase() === statusFilter;
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

      return matchesStatus && matchesSearch;
    });
  }, [scopedRequests, search, statusFilter, t]);

  const handleCreateRequest = (payload) =>
    addMaterialRequest({
      ...payload,
      requestedById: user.id,
      requestedBy: user.name,
      projectName: payload.projectId ? projects.find((project) => project.id === payload.projectId)?.name ?? "" : ""
    });

  return (
    <div className="space-y-6">
      <MaterialsMetrics isAdmin={isAdmin} scopedRequests={scopedRequests} />

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        {isAdmin ? (
          <MaterialWorkflowCard />
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
              "materials.requestsBoardSubtitle",
              isAdmin
                ? "Monitor all requests, filter the queue, and update statuses."
                : "Track your requests and see what the office has already handled."
            )}
          />

          <MaterialsFilters
            search={search}
            setSearch={setSearch}
            setStatusFilter={setStatusFilter}
            statusFilter={statusFilter}
          />

          <MaterialsList
            filteredRequests={filteredRequests}
            isAdmin={isAdmin}
            locale={locale}
            onDelete={deleteMaterialRequest}
            onStatusChange={updateMaterialRequestStatus}
          />
        </Card>
      </div>
    </div>
  );
}
