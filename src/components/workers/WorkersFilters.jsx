import { Search } from "lucide-react";
import { attendanceStatusOptions } from "../../data/options";
import { useI18n } from "../../hooks/useI18n";
import { getProjectName } from "../../utils/localizedValue";

export default function WorkersFilters({
  projectFilter,
  projectOptions,
  search,
  setProjectFilter,
  setSearch,
  setStatusFilter,
  statusFilter
}) {
  const { t } = useI18n();

  return (
    <div className="mb-6 grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px_240px]">
      <label className="flex items-center gap-3 rounded-[24px] border border-white/70 bg-white/90 px-4 py-3">
        <Search size={18} className="text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("workers.searchPlaceholder")}
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
      </label>

      <select
        value={statusFilter}
        onChange={(event) => setStatusFilter(event.target.value)}
        className="rounded-[24px] border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none"
      >
        <option value="all">{t("workers.allStatuses")}</option>
        {attendanceStatusOptions.map((status) => (
          <option key={status} value={status.toLowerCase()}>
            {t(`statusLabels.${status.toLowerCase()}`, status)}
          </option>
        ))}
      </select>

      <select
        value={projectFilter}
        onChange={(event) => setProjectFilter(event.target.value)}
        className="rounded-[24px] border border-white/70 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none"
      >
        <option value="all">{t("workers.allProjects")}</option>
        {projectOptions.map((project) => (
          <option key={project.id} value={project.id}>
            {getProjectName(t, project)}
          </option>
        ))}
      </select>
    </div>
  );
}
