import { Search } from "lucide-react";
import { materialRequestStatusOptions } from "../../data/options";
import { useI18n } from "../../hooks/useI18n";
import { getProjectName } from "../../utils/localizedValue";

export default function MaterialsFilters({
  projectFilter,
  projectOptions = [],
  search,
  setProjectFilter,
  setSearch,
  setStatusFilter,
  showProjectFilter = false,
  statusFilter
}) {
  const { t } = useI18n();

  return (
    <div
      className={`mb-6 grid gap-3 ${
        showProjectFilter ? "xl:grid-cols-[minmax(0,1fr)_220px_220px]" : "xl:grid-cols-[minmax(0,1fr)_220px]"
      }`}
    >
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
        {materialRequestStatusOptions.map((status) => (
          <option key={status} value={status.toLowerCase()}>
            {t(`statusLabels.${status.toLowerCase()}`, status)}
          </option>
        ))}
      </select>

      {showProjectFilter ? (
        <select
          value={projectFilter}
          onChange={(event) => setProjectFilter(event.target.value)}
          className="rounded-[24px] border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none"
        >
          <option value="all">{t("workers.allProjects", "All projects")}</option>
          {projectOptions.map((project) => (
            <option key={project.id} value={project.id}>
              {getProjectName(t, project)}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  );
}
