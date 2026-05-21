import { useCallback, useEffect, useRef, useState } from "react";

const SEARCH_RADIUS_M = 25000;
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatAddress(tags) {
  const parts = [
    tags["addr:street"] && tags["addr:housenumber"]
      ? `${tags["addr:street"]} ${tags["addr:housenumber"]}`
      : tags["addr:street"],
    tags["addr:city"] || tags["addr:town"] || tags["addr:village"]
  ].filter(Boolean);
  return parts.join(", ") || null;
}

function normalizeElement(el, userLat, userLng) {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (!lat || !lng) return null;

  const tags = el.tags ?? {};
  const name = tags.name || tags.brand || tags["brand:en"] || "Sklep budowlany";

  return {
    id: `osm-${el.type}-${el.id}`,
    storeName: name,
    brand: tags.brand || tags["brand:en"] || null,
    address: formatAddress(tags) || tags["addr:full"] || null,
    lat,
    lng,
    distance: calcDistance(userLat, userLng, lat, lng),
    openingHours: tags.opening_hours || null,
    phone: tags.phone || tags["contact:phone"] || null,
    website: tags.website || tags["contact:website"] || null,
    category: tags.shop || "hardware"
  };
}

export function useNearbyStores() {
  const [stores, setStores] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const fetchStores = useCallback(async (lat, lng) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    const query = `
      [out:json][timeout:30];
      (
        node["shop"~"^(doityourself|hardware|building_materials)$"](around:${SEARCH_RADIUS_M},${lat},${lng});
        way["shop"~"^(doityourself|hardware|building_materials)$"](around:${SEARCH_RADIUS_M},${lat},${lng});
        relation["shop"~"^(doityourself|hardware|building_materials)$"](around:${SEARCH_RADIUS_M},${lat},${lng});
      );
      out body center;
    `;

    try {
      const res = await fetch(OVERPASS_URL, {
        method: "POST",
        body: query,
        signal: abortRef.current.signal
      });
      const data = await res.json();
      const normalized = (data.elements ?? [])
        .map((el) => normalizeElement(el, lat, lng))
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance);
      setStores(normalized);
    } catch (err) {
      if (err.name !== "AbortError") {
        setError("Nie udało się pobrać sklepów. Sprawdź połączenie i spróbuj ponownie.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolokalizacja nie jest obsługiwana przez tę przeglądarkę.");
      return;
    }
    setIsLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserLocation({ lat, lng });
        setIsLocating(false);
        fetchStores(lat, lng);
      },
      () => {
        setIsLocating(false);
        setError("Odmówiono dostępu do lokalizacji. Włącz GPS i spróbuj ponownie.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [fetchStores]);

  useEffect(() => {
    locate();
    return () => abortRef.current?.abort();
  }, [locate]);

  return { stores, userLocation, isLocating, isLoading, error, refresh: locate };
}
