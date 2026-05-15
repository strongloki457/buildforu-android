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
      className={`mb-5 grid min-w-0 gap-3 sm:mb-6 ${
        showProjectFilter ? "lg:grid-cols-[minmax(0,1fr)_220px_220px]" : "lg:grid-cols-[minmax(0,1fr)_220px]"
      }`}
    >
      <label className="flex min-h-12 min-w-0 items-center gap-3 rounded-[22px] border border-white/70 bg-white/90 px-4 py-3 sm:rounded-[24px]">
        <Search size={18} className="text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("materials.searchPlaceholder", "Search by item, requester, note or project")}
          className="min-w-0 w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 sm:text-sm"
        />
      </label>

      <select
        value={statusFilter}
        onChange={(event) => setStatusFilter(event.target.value)}
        className="min-h-12 min-w-0 rounded-[22px] border border-white/70 bg-white/90 px-4 py-3 text-base text-slate-900 outline-none sm:rounded-[24px] sm:text-sm"
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
          className="min-h-12 min-w-0 rounded-[22px] border border-white/70 bg-white/90 px-4 py-3 text-base text-slate-900 outline-none sm:rounded-[24px] sm:text-sm"
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
