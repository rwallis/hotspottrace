"use client";

import { useMemo, useState } from "react";
import HotspotMapClient from "@/components/HotspotMapClient";
import type { Hotspot, Thermal } from "@/types";
import hotspotsJson from "@/data/hotspots.json";
import thermalsJson from "@/data/thermals.json";

export default function Page() {
  // default hidden (full-screen map)
  const [showList, setShowList] = useState(false);
  const [selectedPilots, setSelectedPilots] = useState<string[]>([]);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);

  const thermals = thermalsJson as Thermal[];

  // Base hotspots with ≤ 15 kt
  const baseHotspots = useMemo(
    () =>
      (hotspotsJson as Hotspot[])
        .filter((h) => h.avgClimbKts <= 15)
        .sort((a, b) => b.avgClimbKts - a.avgClimbKts || b.count - a.count),
    []
  );

  // All pilot tags
  const allPilots = useMemo(
    () => Array.from(new Set(baseHotspots.map((h) => h.pilot))),
    [baseHotspots]
  );

  // Filter by selected pilots (if any)
  const filteredHotspots = useMemo(() => {
    if (selectedPilots.length === 0) return baseHotspots;
    const set = new Set(selectedPilots);
    return baseHotspots.filter((h) => set.has(h.pilot));
  }, [baseHotspots, selectedPilots]);

  // Tag interactions
  function togglePilot(p: string) {
    setSelectedPilots((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
    setSelectedHotspotId(null);
  }
  function clearPilots() {
    setSelectedPilots([]);
    setSelectedHotspotId(null);
  }

  // Shared tag bar (shown below header in both modes)
  const TagBar = (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium">Pilots:</span>
      {allPilots.map((p) => {
        const active = selectedPilots.includes(p);
        return (
          <button
            key={p}
            onClick={() => togglePilot(p)}
            className={[
              "rounded-full border px-3 py-1 text-sm transition",
              active ? "bg-black text-white" : "bg-white hover:shadow",
            ].join(" ")}
            title={active ? "Click to unselect" : "Click to select"}
            aria-pressed={active}
          >
            {p}
          </button>
        );
      })}
      <button
        onClick={clearPilots}
        className="ml-1 rounded-full border px-3 py-1 text-sm hover:shadow disabled:opacity-50"
        disabled={selectedPilots.length === 0}
        title="Clear all filters"
      >
        All
      </button>

      <span className="ml-2 text-xs opacity-60">
        Showing {filteredHotspots.length} of {baseHotspots.length} hotspots · {thermals.length} thermals
      </span>
    </div>
  );

  return (
    <main className="min-h-dvh">
      {/* Fixed header (so map can be full-screen behind it in hidden-list mode) */}
      <header className="fixed inset-x-0 top-0 z-30 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Hotspots</h1>
            <div className="hidden text-sm opacity-70 md:block">Thermal Hotspots Explorer</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowList((s) => !s)}
              className="rounded-md border px-3 py-1.5 text-sm font-medium hover:shadow"
              title={showList ? "Hide list" : "Show list"}
            >
              {showList ? "Hide List" : "Show List"}
            </button>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-3">{TagBar}</div>
      </header>

      {/* CONTENT */}
      {!showList ? (
        /* Full-browser map below the fixed header + tag bar */
        <div className="fixed inset-0 z-10">
          {/* top padding to clear header + tag bar (tweak if your header height changes) */}
          <div className="absolute inset-0 pt-[104px] md:pt-[108px]">
            <HotspotMapClient
              hotspots={filteredHotspots}
              fullHeight
              selectedHotspotId={selectedHotspotId}
              onSelectHotspot={setSelectedHotspotId}
            />
          </div>
        </div>
      ) : (
        /* Split layout: scrollable left column, sticky map on right */
        <section className="mx-auto max-w-6xl px-4 pt-[120px] pb-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* LEFT: scrollable cards (independent scrolling) */}
            <div
              className="lg:col-span-1"
              /* make the column a scroll container that fits under the header+tags */
              style={{
                maxHeight: "calc(100dvh - 120px)",
                overflowY: "auto",
              }}
            >
              <div className="space-y-3">
                {filteredHotspots.map((h) => {
                  const hue = [...h.pilot].reduce((a, c) => (a + c.charCodeAt(0)) % 360, 0);
                  const color = `hsl(${hue} 90% 45%)`;
                  const isSelected = h.id === selectedHotspotId;

                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setSelectedHotspotId(h.id)}
                      className={[
                        "w-full text-left rounded-2xl border p-4 shadow-sm transition",
                        isSelected ? "ring-2 ring-black" : "hover:shadow-md",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold">{h.name}</h3>
                        <span
                          className="ml-3 inline-flex items-center rounded-full px-2 py-0.5 text-xs text-white"
                          style={{ backgroundColor: color }}
                          title={`Pilot: ${h.pilot}`}
                        >
                          {h.pilot}
                        </span>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <div className="opacity-60">Avg climb</div>
                          <div className="font-semibold">{h.avgClimbKts.toFixed(2)} kt</div>
                        </div>
                        <div>
                          <div className="opacity-60">Occurrences</div>
                          <div className="font-semibold">{h.count}</div>
                        </div>
                      </div>

                      {h.flights?.length ? (
                        <div className="mt-2 text-xs opacity-70 truncate">Flights: {h.flights.join(", ")}</div>
                      ) : null}
                    </button>
                  );
                })}

                {filteredHotspots.length === 0 && (
                  <div className="rounded-xl border p-4 text-sm opacity-70">
                    No hotspots match the current pilot filter.
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: sticky map that stays on screen */}
            <div className="lg:col-span-2">
              <div
                className="sticky"
                style={{
                  top: "120px",                       // same as the section's top padding
                  height: "calc(100dvh - 120px)",     // fill remaining viewport height
                }}
              >
                <HotspotMapClient
                  hotspots={filteredHotspots}
                  selectedHotspotId={selectedHotspotId}
                  onSelectHotspot={setSelectedHotspotId}
                  fullHeight
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
