// src/app/page.tsx
import HotspotMapClient from "@/components/HotspotMapClient";
import type { Hotspot, Thermal } from "@/types";
import hotspotsJson from "@/data/hotspots.json";
import thermalsJson from "@/data/thermals.json";

// Server Component: no React client hooks here.
// We read JSON at build/runtime (filesystem import) and pass it to a client island.

export default function Page() {
  const thermals = thermalsJson as Thermal[];
  const hotspots = (hotspotsJson as Hotspot[]).sort(
    (a, b) => b.avgClimbKts - a.avgClimbKts || b.count - a.count
  );
  const pilots = Array.from(new Set(hotspots.map((h) => h.pilot)));

  return (
    <main className="min-h-dvh">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <h1 className="text-2xl font-bold">hotspottrace</h1>
          <div className="text-sm opacity-70">Thermal Hotspots Explorer</div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6">
        {/* Summary */}
        <div className="mb-4 text-sm opacity-70">
          Loaded {thermals.length} thermals · {hotspots.length} hotspots
        </div>

        {/* (Optional) pilots list — static for now */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Pilots:</span>
          {pilots.map((p) => (
            <span key={p} className="rounded-full border bg-white px-3 py-1 text-sm">
              {p}
            </span>
          ))}
          <span className="ml-2 text-xs opacity-60">(static tags)</span>
        </div>

        {/* List + Map */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: hotspots list */}
          <div className="lg:col-span-1">
            <div className="space-y-3">
              {hotspots.map((h) => {
                // Color by pilot (deterministic hue)
                const hue = [...h.pilot].reduce((a, c) => (a + c.charCodeAt(0)) % 360, 0);
                const color = `hsl(${hue} 90% 45%)`;

                return (
                  <article key={h.id} className="rounded-2xl border p-4 shadow-sm">
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

                    <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <div className="opacity-60">Avg climb</div>
                        <div className="font-semibold">{h.avgClimbKts.toFixed(2)} kt</div>
                      </div>
                      <div>
                        <div className="opacity-60">Samples</div>
                        <div className="font-semibold">{h.count}</div>
                      </div>
                      <div>
                        <div className="opacity-60">Location</div>
                        <div className="font-semibold">
                          {h.lat.toFixed(2)}, {h.lon.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {h.flights?.length ? (
                      <div className="mt-2 text-xs opacity-70 truncate">
                        Flights: {h.flights.join(", ")}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>

          {/* Right: client-only Leaflet map */}
          <div className="lg:col-span-2">
            <HotspotMapClient hotspots={hotspots} />
          </div>
        </div>
      </section>
    </main>
  );
}
