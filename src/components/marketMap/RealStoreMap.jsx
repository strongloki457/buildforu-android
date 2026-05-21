import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

const storeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const selectedIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [30, 46], iconAnchor: [15, 46], popupAnchor: [1, -38], shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

export default function RealStoreMap({ stores, userLocation, selectedStore, onSelectStore, height = "380px" }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (!containerRef.current) return;
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(mapRef.current);
    }
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous store markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    const points = [];

    if (userLocation) {
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .bindPopup("<b>Twoja lokalizacja</b>")
        .addTo(map);
      points.push([userLocation.lat, userLocation.lng]);
    }

    stores.forEach((store) => {
      const isSelected = selectedStore?.id === store.id;
      const marker = L.marker([store.lat, store.lng], { icon: isSelected ? selectedIcon : storeIcon })
        .bindPopup(
          `<b>${store.storeName}</b>${store.address ? `<br/>${store.address}` : ""}<br/><span style="color:#16a34a">${store.distance.toFixed(1)} km</span>`
        )
        .on("click", () => onSelectStore(store.id))
        .addTo(map);

      markersRef.current[store.id] = marker;
      points.push([store.lat, store.lng]);
    });

    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [32, 32], maxZoom: 14 });
    }
  }, [stores, userLocation, selectedStore, onSelectStore]);

  // Open popup for selected store
  useEffect(() => {
    if (selectedStore && markersRef.current[selectedStore.id]) {
      markersRef.current[selectedStore.id].openPopup();
    }
  }, [selectedStore]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden rounded-[28px] border border-slate-200"
      style={{ height, zIndex: 0 }}
    />
  );
}
