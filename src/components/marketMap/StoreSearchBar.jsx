import { BadgeEuro, Layers3, MapPinned, Search, SlidersHorizontal } from "lucide-react";
import Card from "../ui/Card";
import { useI18n } from "../../hooks/useI18n";

const categoryTranslationKeys = {
  Concrete: "seed.stores.categories.concrete",
  Sanitary: "seed.stores.categories.sanitary",
  Finishing: "seed.stores.categories.finishing",
  Fasteners: "seed.stores.categories.fasteners",
  Paint: "seed.stores.categories.paint"
};

export default function StoreSearchBar({
  availability,
  availabilityOptions,
  categories,
  category,
  distanceSort,
  priceSort,
  query,
  setAvailability,
  setCategory,
  setDistanceSort,
  setPriceSort,
  setQuery
}) {
  const { t } = useI18n();

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 text-white">
      <div className="relative">
        <div className="absolute inset-y-0 right-0 hidden w-72 rounded-full bg-white/10 blur-3xl lg:block" />
        <p className="text-xs uppercase tracking-[0.25em] text-white/55">{t("marketMap.eyebrow")}</p>
        <h2 className="mt-3 text-3xl text-white sm:text-4xl">{t("marketMap.title")}</h2>
        <p className="mt-3 max-w-3xl text-sm text-white/72 sm:text-base">{t("marketMap.subtitle")}</p>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <label className="group flex items-center gap-3 rounded-[28px] border border-white/15 bg-white/10 px-5 py-4 transition hover:bg-white/15">
          <Search size={18} className="text-white/70" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("marketMap.searchPlaceholder")}
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/55"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
          <label className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/80">
            <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/55">
              <BadgeEuro size={14} />
              {t("marketMap.price")}
            </span>
            <select
              value={priceSort}
              onChange={(event) => setPriceSort(event.target.value)}
              className="w-full bg-transparent text-white outline-none"
            >
              <option value="low" className="text-slate-900">
                {t("marketMap.lowestFirst")}
              </option>
              <option value="high" className="text-slate-900">
                {t("marketMap.highestFirst")}
              </option>
            </select>
          </label>

          <label className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/80">
            <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/55">
              <MapPinned size={14} />
              {t("marketMap.distance")}
            </span>
            <select
              value={distanceSort}
              onChange={(event) => setDistanceSort(event.target.value)}
              className="w-full bg-transparent text-white outline-none"
            >
              <option value="near" className="text-slate-900">
                {t("marketMap.nearestFirst")}
              </option>
              <option value="far" className="text-slate-900">
                {t("marketMap.farthestFirst")}
              </option>
            </select>
          </label>

          <label className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/80">
            <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/55">
              <SlidersHorizontal size={14} />
              {t("marketMap.category")}
            </span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full bg-transparent text-white outline-none"
            >
              {categories.map((option) => (
                <option key={option} value={option} className="text-slate-900">
                  {option === "all" ? t("marketMap.allCategories") : t(categoryTranslationKeys[option], option)}
                </option>
              ))}
            </select>
          </label>

          <label className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/80">
            <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/55">
              <Layers3 size={14} />
              {t("marketMap.availability")}
            </span>
            <select
              value={availability}
              onChange={(event) => setAvailability(event.target.value)}
              className="w-full bg-transparent text-white outline-none"
            >
              {availabilityOptions.map((option) => (
                <option key={option} value={option} className="text-slate-900">
                  {option === "all" ? t("marketMap.allAvailability") : t(`statusLabels.${option.toLowerCase()}`, option)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </Card>
  );
}
