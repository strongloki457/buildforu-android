import {
  getStoreAddress,
  getStoreCategory,
  getStoreProductName
} from "../../utils/localizedValue";

const availabilityPriority = {
  "in stock": 0,
  "low stock": 0.2,
  limited: 0.45,
  preorder: 0.85,
  "out of stock": 1.2
};

function getLocale(locale) {
  return locale === "en" ? "en-GB" : locale;
}

function getAvailabilityScore(value) {
  return availabilityPriority[String(value ?? "").toLowerCase()] ?? 0.7;
}

function compareWithFallback(primary, secondary) {
  if (primary !== 0) {
    return primary;
  }

  return secondary;
}

export function formatStorePrice(price, locale) {
  return new Intl.NumberFormat(getLocale(locale), {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2
  }).format(price);
}

export function formatStoreDistance(distance, locale) {
  return `${new Intl.NumberFormat(getLocale(locale), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(distance)} km`;
}

export function filterMaterialStoreResults(stores, { availability, category, query, t }) {
  const normalizedQuery = String(query ?? "").trim().toLowerCase();

  return stores.filter((store) => {
    const matchesCategory = category === "all" || getStoreCategory(t, store) === category;
    const matchesAvailability = availability === "all" || store.availability === availability;
    const matchesQuery =
      !normalizedQuery ||
      [
        getStoreProductName(t, store),
        getStoreCategory(t, store),
        store.storeName,
        getStoreAddress(t, store),
        store.availability
      ].some((value) => String(value ?? "").toLowerCase().includes(normalizedQuery));

    return matchesCategory && matchesAvailability && matchesQuery;
  });
}

export function sortMaterialStoreResults(stores, sortBy) {
  return [...stores].sort((left, right) => {
    if (sortBy === "cheapest") {
      return compareWithFallback(left.price - right.price, left.distance - right.distance);
    }

    if (sortBy === "fastest") {
      return compareWithFallback(
        compareWithFallback(
          getAvailabilityScore(left.availability) - getAvailabilityScore(right.availability),
          (left.etaMinutes ?? Number.POSITIVE_INFINITY) - (right.etaMinutes ?? Number.POSITIVE_INFINITY)
        ),
        left.distance - right.distance
      );
    }

    return compareWithFallback(left.distance - right.distance, left.price - right.price);
  });
}

export function getCheapestStore(stores) {
  return sortMaterialStoreResults(stores, "cheapest")[0] ?? null;
}

export function getNearestStore(stores) {
  return sortMaterialStoreResults(stores, "nearest")[0] ?? null;
}

export function getFastestStore(stores) {
  return sortMaterialStoreResults(stores, "fastest")[0] ?? null;
}

export function getStoreMarkerStyle(stores, currentStore) {
  if (!stores.length || !currentStore) {
    return { left: "50%", top: "50%" };
  }

  const latitudes = stores.map((store) => store.lat);
  const longitudes = stores.map((store) => store.lng);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const top = 14 + ((maxLat - currentStore.lat) / Math.max(maxLat - minLat, 0.001)) * 68;
  const left = 12 + ((currentStore.lng - minLng) / Math.max(maxLng - minLng, 0.001)) * 74;

  return {
    left: `${left}%`,
    top: `${top}%`
  };
}
