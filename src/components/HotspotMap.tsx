"use client";

import { useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Circle, Popup } from "react-leaflet";
import type { Hotspot } from "@/types";

type Props = {
  hotspots: Hotspot[];
  /** [lat, lon, zoom] */
  initialView?: [number, number, number];
  fullHeight?: boolean;
  /** currently selected hotspot id (controls popup) */
  selectedHotspotId?: string | null;
  /** notify parent when a circle is clicked */
  onSelectHotspot?: (id: string | null) => void;
};

export default function HotspotMap({
  hotspots,
  initialView,
  fullHeight,
  selectedHotspotId,
  onSelectHotspot,
}: Props) {
  const selected = useMemo(
    () => hotspots.find((h) => h.id === selectedHotspotId) || null,
    [hotspots, selectedHotspotId]
  );

  const center = useMemo<[number, number, number]>(() => {
    if (initialView) return initialView;
    if (hotspots.length) {
      const lat = hotspots.reduce((s, h) => s + h.lat, 0) / hotspots.length;
      const lon = hotspots.reduce((s, h) => s + h.lon, 0) / hotspots.length;
      return [lat, lon, 9];
    }
    return [30.495, -97.996, 8];
  }, [hotspots, initialView]);

  // If the currently selected id disappears due to filtering, clear it
  useEffect(() => {
    if (selectedHotspotId && !selected) {
      onSelectHotspot?.(null);
    }
  }, [selected, selectedHotspotId, onSelectHotspot]);

  return (
    <div
      className={
        fullHeight
          ? "h-full w-full"
          : "h-[70vh] w-full overflow-hidden rounded-2xl border shadow-sm"
      }
    >
      <MapContainer
        center={[center[0], center[1]]}
        zoom={center[2]}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />

        {hotspots.map((h) => {
          const radiusMeters = Math.max(180, 160 * h.avgClimbKts);
          const hue = [...h.pilot].reduce((a, c) => (a + c.charCodeAt(0)) % 360, 0);
          const color = `hsl(${hue} 90% 45%)`;

          return (
            <Circle
              key={h.id}
              center={[h.lat, h.lon]}
              radius={radiusMeters}
              pathOptions={{ color, weight: 2, fillColor: color, fillOpacity: 0.25 }}
              eventHandlers={{ click: () => onSelectHotspot?.(h.id) }}
            />
          );
        })}

        {selected && (
          <Popup
            position={[selected.lat, selected.lon]}
            eventHandlers={{ remove: () => onSelectHotspot?.(null) }}
          >
            <div className="text-sm">
              <div className="font-semibold">{selected.name}</div>
              <div>Avg climb: {selected.avgClimbKts.toFixed(2)} kt</div>
              <div>Occurrences: {selected.count}</div>
              <div>Pilot: {selected.pilot}</div>
              {selected.flights?.length ? (
                <div className="mt-1 text-xs opacity-70">
                  Flights: {selected.flights.join(", ")}
                </div>
              ) : null}
              <div className="mt-1 text-xs opacity-60">
                {selected.lat.toFixed(5)}, {selected.lon.toFixed(5)}
              </div>
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
}
