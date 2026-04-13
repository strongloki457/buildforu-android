import { BadgeEuro, Compass, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import StoreComparisonCards from "../components/marketMap/StoreComparisonCards";
import StoreMapPreview from "../components/marketMap/StoreMapPreview";
import StoreResultsList from "../components/marketMap/StoreResultsList";
import StoreSearchBar from "../components/marketMap/StoreSearchBar";
import { formatPrice, getBestOverallStore } from "../components/marketMap/marketMapUtils";
import { mockStores } from "../data/mockStores";
import { useI18n } from "../hooks/useI18n";
import { getStoreAddress, getStoreCategory, getStoreProductName } from "../utils/localizedValue";

export default function MarketMapPage() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [priceSort, setPriceSort] = useState("low");
  const [distanceSort, setDistanceSort] = useState("near");
  const [category, setCategory] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [selectedStoreId, setSelectedStoreId] = useState(mockStores[0]?.id ?? "");

  const categories = useMemo(() => ["all", ...new Set(mockStores.map((store) => getStoreCategory(t, store)))], [t]);
  const availabilityOptions = useMemo(() => ["all", ...new Set(mockStores.map((store) => store.availability))], []);

  const filteredStores = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...mockStores]
      .filter((store) => {
        const matchesQuery =
          !normalizedQuery ||
          [getStoreProductName(t, store), store.storeName, getStoreAddress(t, store)].some((value) =>
            String(value ?? "").toLowerCase().includes(normalizedQuery)
          );
        const matchesCategory = category === "all" || getStoreCategory(t, store) === category;
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
  }, [availability, category, distanceSort, priceSort, query, t]);

  useEffect(() => {
    if (!filteredStores.some((store) => store.id === selectedStoreId)) {
      setSelectedStoreId(filteredStores[0]?.id ?? "");
    }
  }, [filteredStores, selectedStoreId]);

  const selectedStore = filteredStores.find((store) => store.id === selectedStoreId) ?? filteredStores[0] ?? null;
  const cheapestStore = filteredStores.reduce((best, store) => (best === null || store.price < best.price ? store : best), null);
  const nearestStore = filteredStores.reduce(
    (best, store) => (best === null || store.distance < best.distance ? store : best),
    null
  );
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
      <StoreSearchBar
        availability={availability}
        availabilityOptions={availabilityOptions}
        categories={categories}
        category={category}
        distanceSort={distanceSort}
        priceSort={priceSort}
        query={query}
        setAvailability={setAvailability}
        setCategory={setCategory}
        setDistanceSort={setDistanceSort}
        setPriceSort={setPriceSort}
        setQuery={setQuery}
      />

      <StoreComparisonCards cards={comparisonCards} />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <StoreResultsList
          filteredStores={filteredStores}
          onSelectStore={setSelectedStoreId}
          selectedStore={selectedStore}
        />
        <StoreMapPreview
          filteredStores={filteredStores}
          onSelectStore={setSelectedStoreId}
          selectedStore={selectedStore}
        />
      </div>
    </div>
  );
}
