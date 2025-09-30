"use client";

import { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Circle, Popup /* no LayersControl */ } from "react-leaflet";
import type { Hotspot } from "@/types";

type Props = {
  hotspots: Hotspot[];
  initialView?: [number, number, number];
  fullHeight?: boolean;
  selectedHotspotId?: string | null;
  onSelectHotspot?: (id: string | null) => void;
};

type BaseLayer = "street" | "satellite" | "topo" | "dark";

export default function HotspotMap({
  hotspots,
  initialView,
  fullHeight,
  selectedHotspotId,
  onSelectHotspot,
}: Props) {
  const [base, setBase] = useState<BaseLayer>("street");
  const [showHotspots, setShowHotspots] = useState(true);

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

  useEffect(() => {
    if (selectedHotspotId && !selected) onSelectHotspot?.(null);
  }, [selected, selectedHotspotId, onSelectHotspot]);

  const tile = (() => {
    switch (base) {
      case "satellite":
        return {
          url:
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          attribution:
            'Tiles &copy; Esri — Sources: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 19,
        };
      case "topo":
        return {
          url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
          attribution:
            "Map data: © OSM contributors, SRTM | Style: © OpenTopoMap (CC-BY-SA)",
          maxZoom: 17,
        };
      case "dark":
        return {
          url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
          attribution: "© OSM contributors © CARTO",
          maxZoom: 19,
        };
      case "street":
      default:
        return {
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        };
    }
  })();

  return (
    <div className={fullHeight ? "h-full w-full" : "h-[70vh] w-full overflow-hidden rounded-2xl border shadow-sm"}>
      <MapContainer
        center={[center[0], center[1]]}
        zoom={center[2]}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer url={tile.url} attribution={tile.attribution} maxZoom={tile.maxZoom} />

        {/* Simple on-map UI for base/overlay toggles (top-right) */}
        <div className="leaflet-top leaflet-right">
          <div className="leaflet-control p-2 rounded-md border bg-white/90 backdrop-blur space-y-2">
            <div className="text-xs font-semibold opacity-70">Basemap</div>
            <div className="flex gap-1">
              {(["street", "satellite", "topo", "dark"] as BaseLayer[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setBase(k)}
                  className={[
                    "rounded px-2 py-1 text-xs border",
                    base === k ? "bg-black text-white" : "bg-white hover:shadow",
                  ].join(" ")}
                  title={k}
                >
                  {k[0].toUpperCase() + k.slice(1)}
                </button>
              ))}
            </div>
            <label className="block text-xs mt-1">
              <input
                type="checkbox"
                className="mr-1 align-middle"
                checked={showHotspots}
                onChange={(e) => setShowHotspots(e.target.checked)}
              />
              Hotspots
            </label>
          </div>
        </div>

        {/* Hotspots overlay */}
        {showHotspots &&
          hotspots.map((h) => {
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

        {/* Single popup for selected hotspot */}
        {selected && (
          <Popup position={[selected.lat, selected.lon]} eventHandlers={{ remove: () => onSelectHotspot?.(null) }}>
            <div className="text-sm">
              <div className="font-semibold">{selected.name}</div>
              <div>Avg climb: {selected.avgClimbKts.toFixed(2)} kt</div>
              <div>Occurrences: {selected.count}</div>
              <div>Pilot: {selected.pilot}</div>
              {selected.flights?.length ? (
                <div className="mt-1 text-xs opacity-70">Flights: {selected.flights.join(", ")}</div>
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
