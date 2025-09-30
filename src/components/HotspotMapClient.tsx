"use client";

import dynamic from "next/dynamic";
import type { Hotspot } from "@/types"; // ← use shared type

const HotspotMap = dynamic(() => import("@/components/HotspotMap"), { ssr: false });

export default function HotspotMapClient({
  hotspots,
  initialView,
  fullHeight,
}: {
  hotspots: Hotspot[];
  initialView?: [number, number, number];
  fullHeight?: boolean;
}) {
  return <HotspotMap hotspots={hotspots} initialView={initialView} fullHeight={fullHeight} />;
}
