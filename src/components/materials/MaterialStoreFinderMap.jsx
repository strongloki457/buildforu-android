import { Building2, MapPinned } from "lucide-react";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";
import StatusBadge from "../ui/StatusBadge";
import { useI18n } from "../../hooks/useI18n";
import {
  getStoreAddress,
  getStoreProductName
} from "../../utils/localizedValue";
import {
  formatStoreDistance,
  formatStorePrice,
  getStoreMarkerStyle
} from "./materialStoreUtils";

export default function MaterialStoreFinderMap({
  locale,
  onSelectStore,
  results,
  selectedStore
}) {
  const { t } = useI18n();

  return (
    <Card className="overflow-hidden">
      <SectionHeader
        title={t("materials.finderMapTitle", "Map preview")}
        subtitle={t(
          "materials.finderMapSubtitle",
          "Frontend-only map mock with placeholder markers, ready for geolocation and store API connections later."
        )}
      />

      <div className="relative h-[320px] rounded-[28px] border border-emerald-100 bg-[linear-gradient(135deg,_rgba(240,253,244,0.98),_rgba(220,252,231,0.92)_55%,_rgba(187,247,208,0.82))] p-4 sm:h-[380px]">
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="absolute left-[12%] top-[18%] h-32 w-3 rounded-full bg-sky-200/80" />
        <div className="absolute left-[42%] top-[10%] h-4 w-40 rounded-full bg-slate-200/70" />
        <div className="absolute right-[18%] top-[28%] h-24 w-24 rounded-full border border-white/40 bg-white/30 blur-md" />
        <div className="absolute bottom-[18%] left-[24%] h-20 w-20 rounded-full border border-white/40 bg-white/25 blur-md" />

        <div className="absolute left-[14%] top-[56%] rounded-full border border-white/70 bg-slate-900 px-3 py-1.5 text-xs text-white shadow-soft">
          {t("materials.projectDropHint", "Project drop zone")}
        </div>

        {results.map((store) => {
          const isSelected = selectedStore?.id === store.id;

          return (
            <button
              key={store.id}
              type="button"
              onClick={() => onSelectStore(store.id)}
              style={getStoreMarkerStyle(results, store)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white p-2 shadow-lg transition ${
                isSelected ? "scale-110 bg-brand-700 text-white" : "bg-white text-brand-700 hover:scale-105"
              }`}
              aria-label={`${t("common.viewOnMap")} ${store.storeName}`}
            >
              <MapPinned size={16} />
            </button>
          );
        })}

        {selectedStore ? (
          <div className="absolute bottom-4 left-4 right-4 rounded-[24px] border border-white/60 bg-white/85 p-4 shadow-soft backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.22em] text-brand-600">
                  {t("materials.focusedStore", "Focused option")}
                </p>
                <p className="mt-2 text-lg text-slate-900">{selectedStore.storeName}</p>
                <p className="mt-1 text-sm text-slate-500">{getStoreProductName(t, selectedStore)}</p>
              </div>
              <StatusBadge value={selectedStore.availability} />
            </div>

            <div className="mt-4 grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
              <div className="rounded-[20px] bg-slate-50/90 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("marketMap.price")}</p>
                <p className="mt-1 text-base text-slate-900">{formatStorePrice(selectedStore.price, locale)}</p>
              </div>
              <div className="rounded-[20px] bg-slate-50/90 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("marketMap.distance")}</p>
                <p className="mt-1 text-base text-slate-900">{formatStoreDistance(selectedStore.distance, locale)}</p>
              </div>
              <div className="rounded-[20px] bg-slate-50/90 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                  {t("materials.etaLabel", "Pickup / delivery")}
                </p>
                <p className="mt-1 text-base text-slate-900">{selectedStore.eta}</p>
              </div>
              <div className="rounded-[20px] bg-slate-50/90 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("common.location")}</p>
                <p className="mt-1 text-base text-slate-900">{getStoreAddress(t, selectedStore)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-x-4 bottom-4 rounded-[24px] border border-dashed border-white/70 bg-white/70 p-5 text-center text-sm text-slate-500">
            <Building2 size={20} className="mx-auto text-brand-700" />
            <p className="mt-3">{t("materials.selectFinderResult", "Select a result to focus it on the map preview.")}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
