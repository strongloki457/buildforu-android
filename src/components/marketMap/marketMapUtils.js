export function formatPrice(price) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2
  }).format(price);
}

export function getMarkerStyle(stores, currentStore) {
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

export function getBestOverallStore(stores) {
  if (!stores.length) {
    return null;
  }

  const minPrice = Math.min(...stores.map((store) => store.price));
  const minDistance = Math.min(...stores.map((store) => store.distance));

  return (
    stores.reduce((best, store) => {
      const score = store.price / minPrice + store.distance / minDistance + getAvailabilityScore(store.availability);
      if (!best || score < best.score) {
        return { score, store };
      }

      return best;
    }, null)?.store ?? null
  );
}
