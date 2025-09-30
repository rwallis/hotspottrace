"use client";

import dynamic from "next/dynamic";
import type { Hotspot } from "@/types";

const HotspotMap = dynamic(() => import("@/components/HotspotMap"), {
  ssr: false,
});

export default function HotspotMapClient({
  hotspots,
  initialView,
  fullHeight,
  selectedHotspotId,
  onSelectHotspot,
}: {
  hotspots: Hotspot[];
  initialView?: [number, number, number];
  fullHeight?: boolean;
  selectedHotspotId?: string | null;
  onSelectHotspot?: (id: string | null) => void;
}) {
  return (
    <HotspotMap
      hotspots={hotspots}
      initialView={initialView}
      fullHeight={fullHeight}
      selectedHotspotId={selectedHotspotId}
      onSelectHotspot={onSelectHotspot}
    />
  );
}
