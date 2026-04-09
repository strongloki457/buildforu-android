import {
  ArrowRight,
  BadgeEuro,
  Compass,
  Layers3,
  MapPinned,
  Search,
  SlidersHorizontal,
  Store,
  Trophy
} from "lucide-react";
import { useMemo, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import SectionHeader from "../components/ui/SectionHeader";
import StatusBadge from "../components/ui/StatusBadge";
import { mockStores } from "../data/mockStores";
import { useI18n } from "../hooks/useI18n";

function formatPrice(price) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2
  }).format(price);
}

function getMarkerStyle(stores, currentStore) {
  const latitudes = stores.map((store) => store.lat);
  const longitudes = stores.map((store) => store.lng);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const top = 14 + ((maxLat - currentStore.lat) / Math.max(maxLat - minLat, 0.001)) * 68;
  const left = 12 + ((currentStore.lng - minLng) / Math.max(maxLng - minLng, 0.001)) * 74;

  return { top: `${top}%`, left: `${left}%` };
}

function getAvailabilityScore(availability) {
  const scores = {
    "in stock": 0,
    limited: 0.45,
    preorder: 0.85,
    "out of stock": 1.2
  };

  return scores[String(availability).toLowerCase()] ?? 0.7;
}

function getBestOverallStore(stores) {
  if (!stores.length) {
    return null;
  }

  const minPrice = Math.min(...stores.map((store) => store.price));
  const minDistance = Math.min(...stores.map((store) => store.distance));

  return stores.reduce((best, store) => {
    const score = store.price / minPrice + store.distance / minDistance + getAvailabilityScore(store.availability);
    if (!best || score < best.score) {
      return { score, store };
    }

    return best;
  }, null)?.store ?? null;
}

export default function MarketMapPage() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [priceSort, setPriceSort] = useState("low");
  const [distanceSort, setDistanceSort] = useState("near");
  const [category, setCategory] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [selectedStoreId, setSelectedStoreId] = useState(mockStores[0]?.id ?? "");

  const categories = useMemo(() => ["all", ...new Set(mockStores.map((store) => store.category))], []);
  const availabilityOptions = useMemo(() => ["all", ...new Set(mockStores.map((store) => store.availability))], []);

  const filteredStores = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...mockStores]
      .filter((store) => {
        const matchesQuery =
          !normalizedQuery ||
          [store.productName, store.storeName, store.address].some((value) => value.toLowerCase().includes(normalizedQuery));
        const matchesCategory = category === "all" || store.category === category;
        const matchesAvailability = availability === "all" || store.availability === availability;
        return matchesQuery && matchesCategory && matchesAvailability;
      })
      .sort((left, right) => {
        const priceDelta = priceSort === "high" ? right.price - left.price : left.price - right.price;
        if (priceDelta !== 0) {
          return priceDelta;
        }

        return distanceSort === "far" ? right.distance - left.distance : left.distance - right.distance;
      });
  }, [availability, category, distanceSort, priceSort, query]);

  const selectedStore = filteredStores.find((store) => store.id === selectedStoreId) ?? filteredStores[0] ?? null;
  const cheapestStore = filteredStores.reduce((best, store) => (best === null || store.price < best.price ? store : best), null);
  const nearestStore = filteredStores.reduce((best, store) => (best === null || store.distance < best.distance ? store : best), null);
  const bestOverallStore = useMemo(() => getBestOverallStore(filteredStores), [filteredStores]);

  const comparisonCards = [
    {
      title: t("marketMap.cheapestOption"),
      icon: BadgeEuro,
      store: cheapestStore,
      detail: cheapestStore
        ? t("marketMap.cheapestDetail", { price: formatPrice(cheapestStore.price), store: cheapestStore.storeName })
        : t("marketMap.noOption")
    },
    {
      title: t("marketMap.nearestOption"),
      icon: Compass,
      store: nearestStore,
      detail: nearestStore
        ? t("marketMap.nearestDetail", { distance: nearestStore.distance.toFixed(1), store: nearestStore.storeName })
        : t("marketMap.noOption")
    },
    {
      title: t("marketMap.bestOverallOption"),
      icon: Trophy,
      store: bestOverallStore,
      detail: bestOverallStore ? t("marketMap.bestOverallDetail", { store: bestOverallStore.storeName }) : t("marketMap.noOption")
    }
  ];

  return (
    <div className="space-y-6">
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
              <select value={priceSort} onChange={(event) => setPriceSort(event.target.value)} className="w-full bg-transparent text-white outline-none">
                <option value="low" className="text-slate-900">{t("marketMap.lowestFirst")}</option>
                <option value="high" className="text-slate-900">{t("marketMap.highestFirst")}</option>
              </select>
            </label>

            <label className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/80">
              <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/55">
                <MapPinned size={14} />
                {t("marketMap.distance")}
              </span>
              <select value={distanceSort} onChange={(event) => setDistanceSort(event.target.value)} className="w-full bg-transparent text-white outline-none">
                <option value="near" className="text-slate-900">{t("marketMap.nearestFirst")}</option>
                <option value="far" className="text-slate-900">{t("marketMap.farthestFirst")}</option>
              </select>
            </label>

            <label className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/80">
              <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/55">
                <SlidersHorizontal size={14} />
                {t("marketMap.category")}
              </span>
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full bg-transparent text-white outline-none">
                {categories.map((option) => (
                  <option key={option} value={option} className="text-slate-900">
                    {option === "all" ? t("marketMap.allCategories") : option}
                  </option>
                ))}
              </select>
            </label>

            <label className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/80">
              <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/55">
                <Layers3 size={14} />
                {t("marketMap.availability")}
              </span>
              <select value={availability} onChange={(event) => setAvailability(event.target.value)} className="w-full bg-transparent text-white outline-none">
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {comparisonCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="bg-white/80">
              <div className="flex items-start gap-4">
                <div className="rounded-[20px] bg-brand-50 p-3 text-brand-700">
                  <Icon size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-400">{card.title}</p>
                  <p className="mt-2 truncate text-lg text-slate-900">{card.store?.productName ?? t("marketMap.noOption")}</p>
                  <p className="mt-1 text-sm text-slate-500">{card.detail}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
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
                      isSelected
                        ? "border-brand-200 bg-brand-50/80 shadow-lg shadow-brand-100/50"
                        : "border-white/70 bg-white/80"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-lg text-slate-900">{store.productName}</p>
                        <p className="mt-1 text-sm text-slate-500">{store.storeName}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">{store.category}</span>
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
                        <p className="mt-1 text-base text-slate-900">{store.address}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm text-slate-500">{t("marketMap.storeSupplyCheck")}</div>
                      <Button
                        variant={isSelected ? "primary" : "secondary"}
                        className="w-full gap-2 sm:w-auto"
                        onClick={() => setSelectedStoreId(store.id)}
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
                  onClick={() => setSelectedStoreId(store.id)}
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
                    <p className="truncate text-sm text-slate-500">{selectedStore.productName}</p>
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
      </div>
    </div>
  );
}
