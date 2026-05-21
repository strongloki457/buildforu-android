import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ExternalLink, Locate, MapPin, RotateCcw, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNearbyStores } from "../../hooks/useNearbyStores";
import { useI18n } from "../../hooks/useI18n";

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

const STORE_SEARCH_URLS = {
  castorama: (q) => `https://www.castorama.pl/search?query=${encodeURIComponent(q)}`,
  "leroy merlin": (q) => `https://www.leroymerlin.pl/szukaj/${encodeURIComponent(q)}`,
  obi: (q) => `https://www.obi.pl/search?term=${encodeURIComponent(q)}`,
  "brico depot": (q) => `https://www.bricodepot.pl/catalogsearch/result/?q=${encodeURIComponent(q)}`,
  bricomarche: (q) => `https://www.bricomarche.com.pl/szukaj?s=${encodeURIComponent(q)}`
};

function getSearchUrl(store, query) {
  if (!query) return null;
  const brand = (store.brand || store.storeName || "").toLowerCase();
  for (const [key, fn] of Object.entries(STORE_SEARCH_URLS)) {
    if (brand.includes(key)) return fn(query);
  }
  return `https://www.google.com/search?q=${encodeURIComponent(`${query} ${store.storeName}`)}`;
}

function MiniMap({ stores, userLocation, selectedId, onSelect }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    mapRef.current = L.map(ref.current);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a>'
    }).addTo(mapRef.current);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};
    const points = [];

    if (userLocation) {
      L.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 8, color: "#2563eb", fillColor: "#3b82f6", fillOpacity: 1, weight: 2
      }).bindPopup("Ty").addTo(map);
      points.push([userLocation.lat, userLocation.lng]);
    }

    stores.forEach((s) => {
      const isSelected = s.id === selectedId;
      const m = L.circleMarker([s.lat, s.lng], {
        radius: isSelected ? 10 : 7,
        color: isSelected ? "#16a34a" : "#64748b",
        fillColor: isSelected ? "#22c55e" : "#94a3b8",
        fillOpacity: 1,
        weight: 2
      })
        .bindPopup(`<b>${s.storeName}</b><br/>${s.distance.toFixed(1)} km`)
        .on("click", () => onSelect(s.id))
        .addTo(map);
      markersRef.current[s.id] = m;
      points.push([s.lat, s.lng]);
    });

    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [24, 24], maxZoom: 13 });
    }
  }, [stores, userLocation, selectedId, onSelect]);

  useEffect(() => () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } }, []);

  return (
    <div ref={ref} className="h-64 w-full overflow-hidden rounded-[22px] border border-slate-200 sm:h-full" style={{ zIndex: 0, minHeight: 220 }} />
  );
}

export default function MaterialsStoreFinderTab() {
  const { t } = useI18n();
  const { stores, userLocation, isLocating, isLoading, error, refresh } = useNearbyStores();
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const top10 = stores.slice(0, 10);
  const selectedStore = top10.find((s) => s.id === selectedId) ?? top10[0] ?? null;

  const handleSearch = (e) => {
    e.preventDefault();
    setSubmitted(query.trim());
  };

  const isSpinning = isLocating || isLoading;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Wpisz produkt: cement, farba, cegła…"
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-700 px-4 py-3 text-sm text-white transition hover:bg-brand-600"
        >
          <Search size={15} />
          Szukaj
        </button>
        <button
          type="button"
          onClick={refresh}
          disabled={isSpinning}
          title="Odśwież lokalizację"
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
        >
          {isLocating ? <Locate size={15} className="animate-pulse text-brand-600" /> : <RotateCcw size={15} />}
        </button>
      </form>

      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      ) : null}

      {submitted ? (
        <p className="text-sm text-slate-500">
          Wyniki dla <span className="font-medium text-slate-800">"{submitted}"</span> — top 10 najbliższych sklepów budowlanych
        </p>
      ) : null}

      {/* List + map */}
      <div className="grid gap-4 sm:grid-cols-[1fr_340px]">
        {/* Store list */}
        <div className="space-y-2">
          {isSpinning && !stores.length ? (
            <div className="flex h-40 items-center justify-center rounded-[22px] bg-white/80">
              <p className="text-sm text-slate-400">{isLocating ? "Pobieranie lokalizacji…" : "Szukam sklepów…"}</p>
            </div>
          ) : top10.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-[22px] bg-white/80">
              <p className="text-sm text-slate-400">Brak sklepów w okolicy</p>
            </div>
          ) : (
            top10.map((store, i) => {
              const isSelected = selectedStore?.id === store.id;
              const searchUrl = getSearchUrl(store, submitted);
              return (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => setSelectedId(store.id)}
                  className={`w-full rounded-[22px] p-4 text-left transition ${isSelected ? "bg-brand-50 ring-1 ring-brand-200" : "bg-white/80 hover:bg-slate-50"}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${isSelected ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-slate-900">{store.storeName}</p>
                        <span className="shrink-0 text-sm font-medium text-brand-700">{store.distance.toFixed(1)} km</span>
                      </div>
                      {store.address ? <p className="mt-0.5 truncate text-xs text-slate-500">{store.address}</p> : null}
                      {store.openingHours ? <p className="mt-0.5 truncate text-xs text-slate-400">{store.openingHours}</p> : null}
                      <div className="mt-2 flex flex-wrap gap-2">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 text-xs text-slate-600 transition hover:bg-slate-200"
                        >
                          <MapPin size={11} />
                          Nawiguj
                        </a>
                        {searchUrl ? (
                          <a
                            href={searchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 rounded-xl bg-brand-50 px-2.5 py-1 text-xs text-brand-700 transition hover:bg-brand-100"
                          >
                            <ExternalLink size={11} />
                            Szukaj w sklepie
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Mini map */}
        <div className="hidden sm:block">
          <MiniMap
            stores={top10}
            userLocation={userLocation}
            selectedId={selectedStore?.id}
            onSelect={setSelectedId}
          />
        </div>
      </div>
    </div>
  );
}
