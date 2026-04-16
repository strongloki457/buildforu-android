import { useEffect, useMemo, useState } from "react";
import MaterialRequestForm from "../components/materials/MaterialRequestForm";
import MaterialStoreFinderControls from "../components/materials/MaterialStoreFinderControls";
import MaterialStoreFinderHighlights from "../components/materials/MaterialStoreFinderHighlights";
import MaterialStoreFinderMap from "../components/materials/MaterialStoreFinderMap";
import MaterialStoreFinderResults from "../components/materials/MaterialStoreFinderResults";
import MaterialWorkflowCard from "../components/materials/MaterialWorkflowCard";
import MaterialsFilters from "../components/materials/MaterialsFilters";
import MaterialsList from "../components/materials/MaterialsList";
import MaterialsMetrics from "../components/materials/MaterialsMetrics";
import {
  filterMaterialStoreResults,
  formatStoreDistance,
  formatStorePrice,
  getCheapestStore,
  getFastestStore,
  getNearestStore,
  sortMaterialStoreResults
} from "../components/materials/materialStoreUtils";
import Card from "../components/ui/Card";
import SectionHeader from "../components/ui/SectionHeader";
import { materialRequestStatusOptions } from "../data/mockMaterials";
import { mockStores } from "../data/mockStores";
import { useAuth } from "../hooks/useAuth";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";
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
    workers,
    projects,
    materialRequests,
    addMaterialRequest,
    deleteMaterialRequest,
    updateMaterialRequestStatus
  } = useAppData();
  const { locale, t } = useI18n();
  const [activeTab, setActiveTab] = useState("requests");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [finderQuery, setFinderQuery] = useState("");
  const [finderSortBy, setFinderSortBy] = useState("nearest");
  const [finderCategory, setFinderCategory] = useState("all");
  const [finderAvailability, setFinderAvailability] = useState("all");
  const [selectedStoreId, setSelectedStoreId] = useState(mockStores[0]?.id ?? "");

  const isAdmin = user.role === "admin";
  const requesterId = user.workerId || user.id;
  const linkedWorker = useMemo(
    () => workers.find((worker) => worker.id === requesterId) ?? null,
    [requesterId, workers]
  );
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
      : materialRequests.filter((request) => request.requestedById === requesterId);

    return [...requests].sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
  }, [isAdmin, materialRequests, requesterId]);
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

  const finderCategories = useMemo(
    () => Array.from(new Set(mockStores.map((store) => store.category))),
    []
  );
  const finderAvailabilityOptions = useMemo(
    () => Array.from(new Set(mockStores.map((store) => store.availability))),
    []
  );
  const finderResults = useMemo(() => {
    const filteredStores = filterMaterialStoreResults(mockStores, {
      availability: finderAvailability,
      category: finderCategory,
      query: finderQuery,
      t
    });

    return sortMaterialStoreResults(filteredStores, finderSortBy);
  }, [finderAvailability, finderCategory, finderQuery, finderSortBy, t]);

  useEffect(() => {
    if (!finderResults.some((store) => store.id === selectedStoreId)) {
      setSelectedStoreId(finderResults[0]?.id ?? "");
    }
  }, [finderResults, selectedStoreId]);

  const selectedStore = finderResults.find((store) => store.id === selectedStoreId) ?? finderResults[0] ?? null;
  const comparisonCards = useMemo(() => {
    const cheapestStore = getCheapestStore(finderResults);
    const nearestStore = getNearestStore(finderResults);
    const fastestStore = getFastestStore(finderResults);

    return [
      {
        key: "cheapest",
        title: t("materials.cheapestOption", "Cheapest option"),
        store: cheapestStore,
        detail: cheapestStore
          ? t(
              "materials.cheapestOptionDetail",
              {
                price: formatStorePrice(cheapestStore.price, locale),
                store: cheapestStore.storeName
              },
              "{{price}} at {{store}}"
            )
          : ""
      },
      {
        key: "nearest",
        title: t("materials.nearestOption", "Nearest option"),
        store: nearestStore,
        detail: nearestStore
          ? t(
              "materials.nearestOptionDetail",
              {
                distance: formatStoreDistance(nearestStore.distance, locale),
                store: nearestStore.storeName
              },
              "{{distance}} from {{store}}"
            )
          : ""
      },
      {
        key: "fastest",
        title: t("materials.fastestOption", "Fastest option"),
        store: fastestStore,
        detail: fastestStore
          ? t(
              "materials.fastestOptionDetail",
              {
                eta: fastestStore.eta,
                store: fastestStore.storeName
              },
              "{{eta}} at {{store}}"
            )
          : ""
      }
    ];
  }, [finderResults, locale, t]);

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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.25em] text-brand-600">
            {t("materials.pageEyebrow", "Materials")}
          </p>
          <h1 className="mt-2 text-3xl text-slate-950">{t("materials.title", "Materials")}</h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            {t(
              "materials.dualPurposeSubtitle",
              "Handle internal material requests and compare nearby buying options before anything gets ordered."
            )}
          </p>
        </div>

        <div className="inline-flex w-full rounded-[24px] border border-white/70 bg-white/80 p-1 shadow-soft lg:w-auto">
          {tabOptions.map((tab) => {
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-[20px] px-4 py-3 text-sm transition lg:flex-none ${
                  isActive ? "bg-brand-700 text-white shadow-lg shadow-brand-900/15" : "text-slate-600 hover:bg-white"
                }`}
              >
                {tab === "requests"
                  ? t("materials.requestsTab", "Requests")
                  : t("materials.findToBuyTab", "Find to Buy")}
              </button>
            );
          })}
        </div>
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
                projectOptions={projects}
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
        <div className="space-y-6">
          <MaterialStoreFinderControls
            availability={finderAvailability}
            availabilityOptions={finderAvailabilityOptions}
            categories={finderCategories}
            category={finderCategory}
            query={finderQuery}
            setAvailability={setFinderAvailability}
            setCategory={setFinderCategory}
            setQuery={setFinderQuery}
            setSortBy={setFinderSortBy}
            sortBy={finderSortBy}
          />

          <MaterialStoreFinderHighlights cards={comparisonCards} locale={locale} />

          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <MaterialStoreFinderResults
              locale={locale}
              onSelectStore={setSelectedStoreId}
              results={finderResults}
              selectedStore={selectedStore}
            />
            <MaterialStoreFinderMap
              locale={locale}
              onSelectStore={setSelectedStoreId}
              results={finderResults}
              selectedStore={selectedStore}
            />
          </div>
        </div>
      )}
    </div>
  );
}
