import { Store } from "lucide-react";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";
import { useI18n } from "../../hooks/useI18n";
import { getStoreProductName } from "../../utils/localizedValue";
import { formatPrice, getMarkerStyle } from "./marketMapUtils";

export default function StoreMapPreview({ filteredStores, onSelectStore, selectedStore }) {
  const { t } = useI18n();

  return (
    <Card className="overflow-hidden">
      <SectionHeader title={t("marketMap.mapPreview")} subtitle={t("marketMap.mapPreviewSubtitle")} />

      <div className="relative h-[320px] rounded-[28px] border border-emerald-100 bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.22),_transparent_34%),linear-gradient(135deg,_rgba(240,253,244,0.95),_rgba(220,252,231,0.9)_45%,_rgba(187,247,208,0.7))] p-4 sm:h-[380px]">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.08)_1px,transparent_1px)] [background-size:40px_40px]" />
        <div className="absolute inset-x-8 top-16 h-3 rounded-full bg-sky-200/80" />
        <div className="absolute left-[18%] top-[18%] h-28 w-28 rounded-full border border-white/40 bg-white/30 blur-md sm:h-32 sm:w-32" />
        <div className="absolute bottom-[16%] right-[14%] h-20 w-20 rounded-full border border-white/40 bg-white/25 blur-md sm:h-24 sm:w-24" />

        {filteredStores.map((store) => {
          const position = getMarkerStyle(filteredStores, store);
          const isSelected = selectedStore?.id === store.id;

          return (
            <button
              key={store.id}
              type="button"
              onClick={() => onSelectStore(store.id)}
              style={position}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white p-2 shadow-lg transition ${
                isSelected ? "scale-110 bg-brand-700 text-white" : "bg-white text-brand-700 hover:scale-105"
              }`}
              aria-label={`${t("common.viewOnMap")} ${store.storeName}`}
            >
              <Store size={16} />
            </button>
          );
        })}

        {selectedStore ? (
          <div className="absolute bottom-4 left-4 right-4 rounded-[24px] border border-white/60 bg-white/85 p-4 shadow-soft backdrop-blur">
            <p className="text-xs uppercase tracking-[0.22em] text-brand-600">{t("marketMap.focusedStore")}</p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-lg text-slate-900">{selectedStore.storeName}</p>
                <p className="truncate text-sm text-slate-500">{getStoreProductName(t, selectedStore)}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-sm text-slate-500">{selectedStore.distance.toFixed(1)} km</p>
                <p className="text-base text-slate-900">{formatPrice(selectedStore.price)}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
