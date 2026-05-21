import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";

// Fix default Leaflet icon paths broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

const startIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function RouteMap({ points }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || points.length === 0) return;

    const coords = points.map((p) => [p.latitude, p.longitude]);

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Clear previous layers except tile layer
    map.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) map.removeLayer(layer);
    });

    if (coords.length >= 2) {
      L.polyline(coords, { color: "#16a34a", weight: 3, opacity: 0.8 }).addTo(map);
    }

    // Start marker
    L.marker(coords[0], { icon: startIcon })
      .bindPopup(`<b>Start</b><br/>${coords[0][0].toFixed(5)}, ${coords[0][1].toFixed(5)}`)
      .addTo(map);

    // End marker (only if more than 1 point)
    if (coords.length > 1) {
      L.marker(coords[coords.length - 1], { icon: endIcon })
        .bindPopup(`<b>End</b><br/>${coords[coords.length - 1][0].toFixed(5)}, ${coords[coords.length - 1][1].toFixed(5)}`)
        .addTo(map);
    }

    // Fit map to show all points
    const bounds = L.latLngBounds(coords);
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 17 });

    return () => {};
  }, [points]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  if (points.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="mt-3 h-72 w-full overflow-hidden rounded-2xl border border-slate-200"
      style={{ zIndex: 0 }}
    />
  );
}
