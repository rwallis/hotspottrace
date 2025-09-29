export type Thermal = {
  lat: number;
  lon: number;
  pilot: string;
  avgClimbKts: number | null;
  avgClimbFpm: number | null;
  altFt: number | null;
  flight: string;
};

export type Hotspot = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  avgClimbKts: number;
  count: number;
  pilot: string;
  flights?: string[] | null;
};
