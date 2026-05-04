import { MapPinned, Search } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";
import StatusBadge from "../ui/StatusBadge";
import { useI18n } from "../../hooks/useI18n";
import {
  getStoreAddress,
  getStoreCategory,
  getStoreEta,
  getStoreProductName
} from "../../utils/localizedValue";
import {
  formatStoreDistance,
  formatStorePrice
} from "./materialStoreUtils";

export default function MaterialStoreFinderResults({
  locale,
  onSelectStore,
  results,
  selectedStore
}) {
  const { t } = useI18n();

  return (
    <Card>
      <SectionHeader
        title={t("materials.finderResultsTitle", "Buying options")}
        subtitle={t(
          "materials.finderResultsSubtitle",
          { count: results.length },
          "{{count}} frontend-only options ready for comparison."
        )}
      />

      {results.length ? (
        <div className="space-y-4">
          {results.map((store) => {
            const isSelected = selectedStore?.id === store.id;

            return (
              <article
                key={store.id}
                className={`rounded-[28px] border p-5 transition duration-300 ${
                  isSelected ? "border-brand-200 bg-brand-50/70 shadow-lg shadow-brand-100/50" : "border-white/70 bg-white/80"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-lg text-slate-900">{getStoreProductName(t, store)}</p>
                    <p className="mt-1 text-sm text-slate-500">{store.storeName}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700">
                      {getStoreCategory(t, store)}
                    </span>
                    <StatusBadge value={store.availability} />
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
                  <div className="rounded-[20px] bg-slate-50/90 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("marketMap.price")}</p>
                    <p className="mt-1 text-base text-slate-900">{formatStorePrice(store.price, locale)}</p>
                  </div>
                  <div className="rounded-[20px] bg-slate-50/90 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("marketMap.distance")}</p>
                    <p className="mt-1 text-base text-slate-900">{formatStoreDistance(store.distance, locale)}</p>
                  </div>
                  <div className="rounded-[20px] bg-slate-50/90 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                      {t("materials.etaLabel", "Pickup / delivery")}
                    </p>
                    <p className="mt-1 text-base text-slate-900">{getStoreEta(t, store)}</p>
                  </div>
                  <div className="rounded-[20px] bg-slate-50/90 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("common.location")}</p>
                    <p className="mt-1 text-base text-slate-900">{getStoreAddress(t, store)}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    {t("materials.finderResultHint", "Mock store result ready for future live price and availability data.")}
                  </p>
                  <Button
                    variant={isSelected ? "primary" : "secondary"}
                    className="w-full gap-2 sm:w-auto"
                    onClick={() => onSelectStore(store.id)}
                  >
                    <MapPinned size={16} />
                    {t("common.viewOnMap")}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
          <Search size={26} className="mx-auto text-brand-600" />
          <h3 className="mt-4 text-xl text-slate-900">{t("materials.noFinderResultsTitle", "No stores match this search")}</h3>
          <p className="mt-2 text-sm text-slate-500">
            {t("materials.noFinderResultsSubtitle", "Try another product name or relax the current filters.")}
          </p>
        </div>
      )}
    </Card>
  );
}
