import { ClipboardList, PackageCheck, PackagePlus, Search, ShoppingCart } from "lucide-react";
import { useMemo, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import MetricCard from "../components/ui/MetricCard";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";
import { useAuth } from "../hooks/useAuth";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";
import { getMaterialRequestItem, getMaterialRequestNote } from "../utils/localizedValue";

const requestStatusOptions = ["Pending", "Ordered", "Purchased", "Rejected"];

function formatRequestDate(value, locale) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : locale, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function MaterialRequestForm({ projectName, onSubmit }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    itemName: "",
    quantity: "",
    note: ""
  });

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const itemName = form.itemName.trim();
    const quantity = form.quantity.trim();
    const note = form.note.trim();

    if (!itemName) {
      return;
    }

    const createdRequest = onSubmit({
      itemName,
      quantity,
      note
    });

    if (createdRequest) {
      setForm({
        itemName: "",
        quantity: "",
        note: ""
      });
    }
  };

  return (
    <Card>
      <SectionHeader
        title={t("materials.requestFormTitle", "Create a material request")}
        subtitle={t(
          "materials.requestFormSubtitle",
          "Submit what you need for work so the office can track and purchase it."
        )}
      />

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="rounded-[24px] bg-slate-50/90 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            {t("materials.yourProject", "Assigned project")}
          </p>
          <p className="mt-3 text-sm text-slate-700">
            {projectName || t("materials.noProjectAssigned", "No project assigned right now.")}
          </p>
        </div>

        <label className="grid gap-2">
          <span className="text-sm text-slate-600">{t("materials.itemName", "Item name")}</span>
          <input
            value={form.itemName}
            onChange={(event) => handleChange("itemName", event.target.value)}
            placeholder={t("materials.itemPlaceholder", "Paint, screws, cement, toilet, tiles...")}
            required
            className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-600">{t("materials.quantity", "Quantity")}</span>
          <input
            value={form.quantity}
            onChange={(event) => handleChange("quantity", event.target.value)}
            placeholder={t("materials.quantityPlaceholder", "Optional, e.g. 20 bags or 2 boxes")}
            className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-600">{t("materials.note", "Note")}</span>
          <textarea
            value={form.note}
            onChange={(event) => handleChange("note", event.target.value)}
            placeholder={t("materials.notePlaceholder", "Optional context for the office or purchasing flow")}
            rows={4}
            className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <Button type="submit" className="w-full justify-center gap-2">
          <PackagePlus size={16} />
          {t("materials.submitRequest", "Submit request")}
        </Button>
      </form>
    </Card>
  );
}

function MaterialRequestCard({ request, isAdmin, locale, onStatusChange }) {
  const { t } = useI18n();

  return (
    <article className="rounded-[28px] border border-white/60 bg-white/85 p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg text-slate-950">{getMaterialRequestItem(t, request)}</p>
          <p className="mt-1 text-sm text-slate-500">
            {t("materials.requestedBy", "Requested by")}: {request.requestedBy}
          </p>
        </div>
        <StatusBadge value={request.status} />
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
        {request.projectName ? (
          <div className="rounded-[20px] bg-slate-50/90 px-4 py-3">
            <span className="text-slate-400">{t("workers.assignedProject")}:</span> {request.projectName}
          </div>
        ) : null}

        {request.quantity ? (
          <div className="rounded-[20px] bg-slate-50/90 px-4 py-3">
            <span className="text-slate-400">{t("materials.quantity", "Quantity")}:</span> {request.quantity}
          </div>
        ) : null}

        <div className="rounded-[20px] bg-slate-50/90 px-4 py-3 sm:col-span-2">
          <span className="text-slate-400">{t("materials.createdOn", "Created")}:</span>{" "}
          {formatRequestDate(request.createdAt, locale)}
        </div>

        {request.note ? (
          <div className="rounded-[20px] bg-slate-50/90 px-4 py-3 sm:col-span-2">
            <p className="text-slate-400">{t("materials.note", "Note")}</p>
            <p className="mt-2 text-slate-600">{getMaterialRequestNote(t, request)}</p>
          </div>
        ) : null}
      </div>

      {isAdmin ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-500">{t("materials.updateStatus", "Update request status")}</p>
          <select
            value={request.status}
            onChange={(event) => onStatusChange(request.id, event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
          >
            {requestStatusOptions.map((status) => (
              <option key={status} value={status}>
                {t(`statusLabels.${status.toLowerCase()}`, status)}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </article>
  );
}

function MaterialWorkflowCard() {
  const { t } = useI18n();

  return (
    <Card>
      <SectionHeader
        title={t("materials.adminScope", "Admin material board")}
        subtitle={t(
          "materials.adminScopeSubtitle",
          "Review requests from the field and move them through purchasing statuses."
        )}
      />

      <div className="grid gap-3">
        {requestStatusOptions.map((status) => (
          <div key={status} className="rounded-[22px] bg-slate-50/90 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-900">{t(`statusLabels.${status.toLowerCase()}`, status)}</p>
              <StatusBadge value={status} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function MaterialsPage() {
  const { user } = useAuth();
  const { workers, materialRequests, addMaterialRequest, updateMaterialRequestStatus } = useAppData();
  const { locale, t } = useI18n();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const isAdmin = user.role === "admin";
  const linkedWorker = useMemo(() => workers.find((worker) => worker.id === user.id) ?? null, [user.id, workers]);
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
          request.projectName,
          request.quantity,
          getMaterialRequestNote(t, request),
          request.status
        ].some((value) => String(value ?? "").toLowerCase().includes(normalizedSearch));

      return matchesStatus && matchesSearch;
    });
  }, [scopedRequests, search, statusFilter, t]);

  const pendingCount = useMemo(
    () => scopedRequests.filter((request) => String(request.status).toLowerCase() === "pending").length,
    [scopedRequests]
  );
  const orderedCount = useMemo(
    () => scopedRequests.filter((request) => String(request.status).toLowerCase() === "ordered").length,
    [scopedRequests]
  );
  const purchasedCount = useMemo(
    () => scopedRequests.filter((request) => String(request.status).toLowerCase() === "purchased").length,
    [scopedRequests]
  );

  const handleCreateRequest = (payload) =>
    addMaterialRequest({
      ...payload,
      requestedById: user.id,
      requestedBy: user.name,
      projectName: linkedWorker?.assignedProject ?? ""
    });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={ClipboardList}
          label={isAdmin ? t("materials.requestsVisible", "All requests") : t("materials.requestsVisible", "My requests")}
          value={scopedRequests.length}
          detail={t(
            "materials.requestsVisibleDetail",
            isAdmin ? "Every request submitted by field teams." : "Your submitted material requests."
          )}
        />
        <MetricCard
          icon={PackagePlus}
          label={t("materials.pendingRequests", "Pending")}
          value={pendingCount}
          detail={t("materials.pendingRequestsDetail", "Waiting for admin review or purchasing action.")}
        />
        <MetricCard
          icon={ShoppingCart}
          label={t("materials.orderedRequests", "Ordered")}
          value={orderedCount}
          detail={t("materials.orderedRequestsDetail", "Already sent to suppliers or stores.")}
        />
        <MetricCard
          icon={PackageCheck}
          label={t("materials.purchasedRequests", "Purchased")}
          value={purchasedCount}
          detail={t("materials.purchasedRequestsDetail", "Ready to reach the crew or site.")}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        {isAdmin ? (
          <MaterialWorkflowCard />
        ) : (
          <MaterialRequestForm projectName={linkedWorker?.assignedProject ?? ""} onSubmit={handleCreateRequest} />
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

          <div className="mb-6 grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px]">
            <label className="flex items-center gap-3 rounded-[24px] border border-white/70 bg-white/90 px-4 py-3">
              <Search size={18} className="text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("materials.searchPlaceholder", "Search by item, requester, note or project")}
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-[24px] border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none"
            >
              <option value="all">{t("common.all")}</option>
              {requestStatusOptions.map((status) => (
                <option key={status} value={status.toLowerCase()}>
                  {t(`statusLabels.${status.toLowerCase()}`, status)}
                </option>
              ))}
            </select>
          </div>

          {filteredRequests.length ? (
            <div className="grid gap-4">
              {filteredRequests.map((request) => (
                <MaterialRequestCard
                  key={request.id}
                  request={request}
                  isAdmin={isAdmin}
                  locale={locale}
                  onStatusChange={updateMaterialRequestStatus}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
              <ClipboardList size={28} className="mx-auto text-brand-600" />
              <h3 className="mt-4 text-2xl text-slate-900">{t("materials.emptyTitle", "No requests found")}</h3>
              <p className="mt-2 text-sm text-slate-500">
                {t(
                  "materials.emptySubtitle",
                  "Try a different search or status filter, or create a new request to get started."
                )}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
