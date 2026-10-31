import type { CSSProperties } from "react";

export type BoothKind = "mempelai" | "galeri" | "cerita" | "acara" | "rsvp" | "angpao" | "slot" | "dresscode" | "rundown" | "denah" | "imbauan" | "siaran";
export type BoothTone = "accent" | "gold" | "roof";

// Ukuran kios dalam piksel peta. Kios digambar isometrik 2:1, sama dengan peta: sumbu a ke kanan atas, sumbu b
// ke kanan bawah, z ke atas.
export const BOOTH = { w: 152, h: 130, cx: 76, cy: 100, halfA: 39, halfB: 23 };
// Kios digambar dalam satuan bebas lalu diskalakan supaya mejanya sebesar meja pada kios gambar jadi.
const S = 0.6;

const p = (a: number, b: number, z = 0) => `${(BOOTH.cx + (a + b) * S).toFixed(1)},${(BOOTH.cy + (-0.5 * a + 0.5 * b - z) * S).toFixed(1)}`;
const poly = (...pts: [number, number, number?][]) => pts.map(([a, b, z]) => p(a, b, z)).join(" ");

// Jejak kios di lantai, dipakai peta sebagai rintangan. Titik pusat c dalam piksel peta.
export const boothFootprint = (c: { x: number; y: number }): [number, number][] =>
  (
    [
      [BOOTH.halfA, -BOOTH.halfB],
      [BOOTH.halfA, BOOTH.halfB],
      [-BOOTH.halfA, BOOTH.halfB],
      [-BOOTH.halfA, -BOOTH.halfB],
    ] as const
  ).map(([a, b]) => [c.x + a + b, c.y - 0.5 * a + 0.5 * b]);

const ICONS: Record<BoothKind, string> = {
  mempelai: "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z",
  galeri: "M4 6h16v12H4z M6 16l4-5 3 3 2-2 3 4",
  cerita: "M5 5h6a2 2 0 0 1 1 .5A2 2 0 0 1 13 5h6v13h-6a2 2 0 0 0-1 .5A2 2 0 0 0 11 18H5z M12 5.5V18",
  acara: "M5 7h14v12H5z M5 11h14 M9 4v4 M15 4v4",
  rsvp: "M7 5h10v15H7z M10 3h4v4h-4z M9.5 13l2 2 3.5-4.5",
  angpao: "M4 7h16v11H4z M4 7l8 6 8-6",
  dresscode: "M9 4l3 2 3-2 5 3-2 4-2-1v9H8v-9l-2 1-2-4z",
  rundown: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z M12 8v4l3 2",
  denah: "M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z M12 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  imbauan: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z M12 11v5 M12 8h.01",
  siaran: "M5 6h14v12H5z M10 9.5v5l4-2.5z",
  slot: "M12 4l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z",
};

const COLOR: Record<BoothTone, string> = { accent: "var(--inv-accent)", gold: "var(--inv-gold)", roof: "var(--inv-roof)" };

const LINE = "var(--inv-line)";
const WOOD = "#9a6a3f";
const WOOD_TOP = "#d2a169";
const WOOD_SIDE = "#7a4f2c";
const POST = "#5a3a22";
const ROOF_Z = 100;
const ROOF_A = 74;
const ROOF_B = 44;
const STRIPES = 7;

// Kios kecil: meja dengan atap bergaris, tiang di empat sudut, dan lencana ikon di rumbai depan. Simetris, jadi
// tampak rapi dari sisi mana pun.
export function Booth({ kind, tone, className, style }: { kind: BoothKind; tone: BoothTone; className?: string; style?: CSSProperties }) {
  const color = COLOR[tone];
  const step = (ROOF_A * 2) / STRIPES;
  const stripe = (i: number) => (i % 2 ? "var(--inv-card)" : color);
  const badge = p(0, ROOF_B, ROOF_Z - 14).split(",").map(Number);

  const post = (a: number, b: number) => <polygon key={`${a}${b}`} points={poly([a - 3, b, 0], [a + 3, b, 0], [a + 3, b, ROOF_Z], [a - 3, b, ROOF_Z])} fill={POST} />;

  return (
    <svg viewBox={`0 0 ${BOOTH.w} ${BOOTH.h}`} aria-hidden="true" className={className} style={style}>
      <ellipse cx={BOOTH.cx} cy={BOOTH.cy} rx="66" ry="28" fill="rgba(0,0,0,.16)" />
      {post(-62, -34)}
      {post(62, -34)}
      {/* meja */}
      <polygon points={poly([-50, 14, 0], [50, 14, 0], [50, 14, 46], [-50, 14, 46])} fill={WOOD} stroke={LINE} strokeWidth="1.4" strokeLinejoin="round" />
      <polygon points={poly([-50, -14, 0], [-50, 14, 0], [-50, 14, 46], [-50, -14, 46])} fill={WOOD_SIDE} stroke={LINE} strokeWidth="1.4" strokeLinejoin="round" />
      <polygon points={poly([-50, -14, 46], [50, -14, 46], [50, 14, 46], [-50, 14, 46])} fill={WOOD_TOP} stroke={LINE} strokeWidth="1.4" strokeLinejoin="round" />
      <polygon points={poly([-44, -9, 47], [44, -9, 47], [44, 9, 47], [-44, 9, 47])} fill="var(--inv-card)" opacity=".9" />
      {post(-62, 34)}
      {post(62, 34)}
      {/* sisi kiri atap */}
      {Array.from({ length: 3 }, (_, i) => {
        const b0 = -ROOF_B + (i * ROOF_B * 2) / 3;
        const b1 = -ROOF_B + ((i + 1) * ROOF_B * 2) / 3;
        return <polygon key={`l${i}`} points={poly([-ROOF_A, b0, ROOF_Z], [-ROOF_A, b1, ROOF_Z], [-ROOF_A, b1, ROOF_Z - 14], [-ROOF_A, b0, ROOF_Z - 14])} fill={i % 2 ? "var(--inv-card)" : color} stroke={LINE} strokeWidth="1.1" strokeLinejoin="round" />;
      })}
      {/* rumbai depan */}
      {Array.from({ length: STRIPES }, (_, i) => {
        const a0 = -ROOF_A + i * step;
        const a1 = a0 + step;
        return <polygon key={`f${i}`} points={poly([a0, ROOF_B, ROOF_Z], [a1, ROOF_B, ROOF_Z], [a1, ROOF_B, ROOF_Z - 14], [a0, ROOF_B, ROOF_Z - 14])} fill={stripe(i)} stroke={LINE} strokeWidth="1.1" strokeLinejoin="round" />;
      })}
      {/* atap */}
      {Array.from({ length: STRIPES }, (_, i) => {
        const a0 = -ROOF_A + i * step;
        const a1 = a0 + step;
        return <polygon key={`t${i}`} points={poly([a0, -ROOF_B, ROOF_Z], [a1, -ROOF_B, ROOF_Z], [a1, ROOF_B, ROOF_Z], [a0, ROOF_B, ROOF_Z])} fill={stripe(i)} stroke={LINE} strokeWidth="1.1" strokeLinejoin="round" />;
      })}
      <polygon points={poly([-ROOF_A, -ROOF_B, ROOF_Z], [ROOF_A, -ROOF_B, ROOF_Z], [ROOF_A, ROOF_B, ROOF_Z], [-ROOF_A, ROOF_B, ROOF_Z])} fill="none" stroke={LINE} strokeWidth="1.6" strokeLinejoin="round" />
      {/* lencana ikon */}
      <g transform={`translate(${badge[0]} ${badge[1] + 3})`}>
        <circle r="12" fill={color} stroke={LINE} strokeWidth="1.6" />
        <path d={ICONS[kind]} transform="translate(-8.4 -8.4) scale(.7)" fill="none" stroke="var(--inv-paper)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
