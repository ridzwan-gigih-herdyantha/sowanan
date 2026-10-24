import type { CSSProperties } from "react";
import { shapes } from "./runs";

// Ikon piksel Co-op Adventure. Tiap sprite berupa baris huruf, satu huruf satu piksel, titik berarti kosong.
// Digambar sebagai SVG bertepi tajam, jadi tetap rapi di ukuran berapa pun.

const COLORS: Record<string, string> = {
  o: "#261B33",
  B: "#261B33",
  H: "#3B2A22",
  h: "#5E4536",
  S: "#F2C49B",
  s: "#D99F79",
  E: "#261B33",
  R: "#EE8E7A",
  K: "#34405C",
  k: "#252E45",
  W: "#FFFFFF",
  T: "var(--inv-accent)",
  F: "var(--inv-accent)",
  G: "#5DA352",
  V: "#FFFFFF",
  v: "#E4DDEE",
  D: "#FFF8EE",
  d: "#E6D8C3",
  M: "#6A4330",
  Y: "#F2C14E",
  y: "#C98F2A",
  N: "#9A5B34",
  n: "#6E3D22",
  L: "#E2434B",
  l: "#B32C3A",
  c: "#E8DFF0",
};

export type SpriteData = readonly string[];

export function Sprite({ data, scale = 4, className = "", style, colors }: { data: SpriteData; scale?: number; className?: string; style?: CSSProperties; colors?: Record<string, string> }) {
  const w = Math.max(...data.map((r) => r.length));
  const h = data.length;
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${w} ${h}`}
      width={w * scale}
      height={h * scale}
      shapeRendering="crispEdges"
      className={`block shrink-0 overflow-visible ${className}`}
      style={style}
    >
      {shapes(data).map((r) => (
        <path key={r.c} d={r.d} style={{ fill: colors?.[r.c] ?? COLORS[r.c] ?? r.c }} />
      ))}
    </svg>
  );
}

export const HEART: SpriteData = [
  ".oo.oo.",
  "oLLoLLo",
  "oWLLLLo",
  "oLLLLlo",
  ".oLLlo.",
  "..olo..",
  "...o...",
];

export const COIN: SpriteData = ["..oooo..", ".oYYYyo.", "oYWYYYyo", "oYWYYYyo", "oYYYYYyo", "oYYYYYyo", ".oyyyyo.", "..oooo.."];

export const CHEST: SpriteData = [
  "..oooooo..",
  ".oNNNNNNo.",
  "oNNNNNNNNo",
  "oooooooooo",
  "oNNNYYNNNo",
  "onnnYynnno",
  "oNNNNNNNNo",
  "oNNNNNNNNo",
  "oooooooooo",
];

export const LETTER: SpriteData = [
  "oooooooooo",
  "ooWWWWWWoo",
  "oWoWWWWoWo",
  "oWWoLLoWWo",
  "oWWWooWWWo",
  "oWWWWWWWWo",
  "oooooooooo",
];

// Garis kecil dari kotak-kotak untuk pemisah judul.
export function PixelRule({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex items-center justify-center gap-1.5 ${className}`}>
      {[0.35, 0.6, 1, 0.6, 0.35].map((o, i) => (
        <span key={i} className={`block bg-current ${i === 2 ? "size-2.5" : "size-1.5"}`} style={{ opacity: o }} />
      ))}
    </div>
  );
}
