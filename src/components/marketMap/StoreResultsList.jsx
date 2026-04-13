import { ArrowRight, Search } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";
import StatusBadge from "../ui/StatusBadge";
import { useI18n } from "../../hooks/useI18n";
import { getStoreAddress, getStoreCategory, getStoreProductName } from "../../utils/localizedValue";
import { formatPrice } from "./marketMapUtils";

export default function StoreResultsList({ filteredStores, onSelectStore, selectedStore }) {
  const { t } = useI18n();

  return (
    <Card>
      <SectionHeader title={t("marketMap.resultsTitle")} subtitle={t("marketMap.resultsSubtitle", { count: filteredStores.length })} />

      {filteredStores.length ? (
        <div className="space-y-4">
          {filteredStores.map((store) => {
            const isSelected = selectedStore?.id === store.id;

            return (
              <article
                key={store.id}
                className={`rounded-[28px] border p-5 transition duration-300 hover:-translate-y-0.5 ${
                  isSelected ? "border-brand-200 bg-brand-50/80 shadow-lg shadow-brand-100/50" : "border-white/70 bg-white/80"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-lg text-slate-900">{getStoreProductName(t, store)}</p>
                    <p className="mt-1 text-sm text-slate-500">{store.storeName}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
                      {getStoreCategory(t, store)}
                    </span>
                    <StatusBadge value={store.availability} />
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-500 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("marketMap.price")}</p>
                    <p className="mt-1 text-base text-slate-900">{formatPrice(store.price)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("marketMap.distance")}</p>
                    <p className="mt-1 text-base text-slate-900">{store.distance.toFixed(1)} km</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("common.location")}</p>
                    <p className="mt-1 text-base text-slate-900">{getStoreAddress(t, store)}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-slate-500">{t("marketMap.storeSupplyCheck")}</div>
                  <Button
                    variant={isSelected ? "primary" : "secondary"}
                    className="w-full gap-2 sm:w-auto"
                    onClick={() => onSelectStore(store.id)}
                  >
                    {t("common.viewOnMap")}
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
          <Search size={26} className="mx-auto text-brand-600" />
          <h3 className="mt-4 text-xl text-slate-900">{t("marketMap.noStoresTitle")}</h3>
          <p className="mt-2 text-sm text-slate-500">{t("marketMap.noStoresSubtitle")}</p>
        </div>
      )}
    </Card>
  );
}
