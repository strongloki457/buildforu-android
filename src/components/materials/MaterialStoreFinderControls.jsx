import { Search } from "lucide-react";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";
import { useI18n } from "../../hooks/useI18n";

export default function MaterialStoreFinderControls({
  availability,
  availabilityOptions,
  category,
  categories,
  query,
  setAvailability,
  setCategory,
  setQuery,
  setSortBy,
  sortBy
}) {
  const { t } = useI18n();

  return (
    <Card>
      <SectionHeader
        title={t("materials.findToBuyTitle", "Find to Buy")}
        subtitle={t(
          "materials.findToBuySubtitle",
          "Search mock suppliers, compare options fast, and keep this flow ready for future store or map integrations."
        )}
      />

      <div className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm text-slate-600">{t("common.search")}</span>
          <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/90 px-4 py-3">
            <Search size={18} className="text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("materials.findToBuyPlaceholder", "cement, toilet, tiles, screws, paint...")}
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
          <p className="text-xs text-slate-400">
            {t("materials.findToBuyExamples", "Try: cement, toilet, tiles, screws, paint")}
          </p>
        </label>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-2">
            <span className="text-sm text-slate-600">{t("materials.sortBy", "Sort by")}</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-2xl border border-white/70 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
            >
              <option value="nearest">{t("materials.sortNearest", "Nearest")}</option>
              <option value="cheapest">{t("materials.sortCheapest", "Cheapest")}</option>
              <option value="fastest">{t("materials.sortFastest", "Fastest available")}</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-600">{t("marketMap.category")}</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-2xl border border-white/70 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
            >
              <option value="all">{t("marketMap.allCategories")}</option>
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-slate-600">{t("marketMap.availability")}</span>
            <select
              value={availability}
              onChange={(event) => setAvailability(event.target.value)}
              className="rounded-2xl border border-white/70 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
            >
              <option value="all">{t("marketMap.allAvailability")}</option>
              {availabilityOptions.map((option) => (
                <option key={option} value={option}>
                  {t(`statusLabels.${option.toLowerCase()}`, option)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </Card>
  );
}
