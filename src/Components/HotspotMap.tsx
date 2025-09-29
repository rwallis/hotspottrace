"use client";

import { useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";

const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export type Hotspot = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  avgClimbKts: number;
  count: number;
  pilot: string;
};

export default function HotspotMap({
  hotspots,
  initialView,
}: {
  hotspots: Hotspot[];
  initialView?: [number, number, number];
}) {
  const center = useMemo<[number, number, number]>(() => {
    if (initialView) return initialView;
    if (hotspots.length) {
      const lat = hotspots.reduce((s, h) => s + h.lat, 0) / hotspots.length;
      const lon = hotspots.reduce((s, h) => s + h.lon, 0) / hotspots.length;
      return [lat, lon, 9];
    }
    return [30.495, -97.996, 8];
  }, [hotspots, initialView]);

  return (
    <div className="h-[70vh] w-full overflow-hidden rounded-2xl border shadow-sm">
      <MapContainer center={[center[0], center[1]]} zoom={center[2]} scrollWheelZoom className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />
        {hotspots.map((h) => {
          const radiusMeters = Math.max(150, 150 * h.avgClimbKts);
          const hue = [...h.pilot].reduce((a, c) => (a + c.charCodeAt(0)) % 360, 0);
          const color = `hsl(${hue} 90% 45%)`;
          return (
            <Marker key={h.id} position={[h.lat, h.lon]}>
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{h.name}</div>
                  <div>Avg climb: {h.avgClimbKts.toFixed(1)} kt</div>
                  <div>Samples: {h.count}</div>
                  <div>Pilot: {h.pilot}</div>
                  <div className="mt-1 text-xs opacity-70">
                    {h.lat.toFixed(5)}, {h.lon.toFixed(5)}
                  </div>
                </div>
              </Popup>
              <Circle
                center={[h.lat, h.lon]}
                radius={radiusMeters}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.2 }}
              />
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
