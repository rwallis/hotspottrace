"use client";

import dynamic from "next/dynamic";
import type { Hotspot } from "@/components/HotspotMap";

const HotspotMap = dynamic(() => import("@/components/HotspotMap"), {
  ssr: false,
});

export default function HotspotMapClient({
  hotspots,
  initialView,
}: {
  hotspots: Hotspot[];
  initialView?: [number, number, number];
}) {
  return <HotspotMap hotspots={hotspots} initialView={initialView} />;
}
