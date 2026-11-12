import { makePathing } from "../pathing";
import {
  BLOCKS,
  MAP,
  NPCS,
  PIECES,
  SPAWN as SPAWN_AT,
  SPOTS,
  WALK,
  type Npc,
  type SpotId,
} from "./pantai-data";
import { inside, type Area, type Point } from "./world";

// Dunia gerak memakai piksel gambar taman (1024 x 1536) langsung.
export const PW = MAP.w;
export const PH = MAP.h;
export const SPAWN: Point = { ...SPAWN_AT };
// Kecepatan jalan dalam piksel peta per detik, sekitar tiga kali tinggi badan.
export const SPEED = 230;
// Tinggi tampil karakter dalam piksel peta.
export const HERO_H = 72;
// Tombol Buka sebuah pos muncul saat tamu berada sejauh ini dari titik berdirinya.
export const NEAR = 64;

export type PoiId = SpotId;
export type Poi = { id: PoiId; obj: Point; stand: Point };
export const POIS: Poi[] = (Object.keys(SPOTS) as PoiId[]).map((id) => ({
  id,
  obj: { ...SPOTS[id].obj },
  stand: { ...SPOTS[id].stand },
}));

export const poiDistance = (poi: Poi, p: Point) =>
  Math.hypot(p.x - poi.stand.x, p.y - poi.stand.y);

const AREAS: Area[] = WALK.map((poly) =>
  poly.map(([x, y]) => [x, y] as [number, number]),
);
const rect = ([x0, y0, x1, y1]: number[]): Area => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];

// Rintangan benda terpisah yang sedang tampil, dalam koordinat peta.
export function pieceBlocks(ids: SpotId[]): number[][] {
  return ids.flatMap((id) => {
    const piece = PIECES[id];
    if (!piece) return [];
    const { x, y } = SPOTS[id].obj;
    const [l, t, r, b] = piece.block;
    return [[x + l, y + t, x + r, y + b]];
  });
}

// Orang yang tampil: tanpa spot selalu ada, dengan spot hanya bila pos itu dipakai undangan.
export const npcsFor = (spots: SpotId[]) =>
  NPCS.filter((n) => !n.spot || spots.includes(n.spot));

// Rintangan orang yang padat: kotak kecil di sekitar kakinya.
export const npcBlocks = (npcs: Npc[]) =>
  npcs
    .filter((n) => n.solid)
    .map((n) => [n.x - 13, n.y - 12, n.x + 13, n.y + 2]);

// Saat terhalang, coba belok makin tajam ke dua sisi supaya karakter meluncur di sepanjang rintangan.
const SLIDES = [0.4, -0.4, 0.8, -0.8, 1.2, -1.2];

// Sama dengan makeWorld di world.ts, tapi peta ini tampak atas: gerak yang terhalang meluncur di sumbu x atau y,
// bukan di sumbu isometrik.
function makeTopWorld(areas: Area[], bodyR: number, holes: Area[]) {
  const bounded = (list: Area[]) =>
    list.map((poly) => {
      const xs = poly.map(([x]) => x);
      const ys = poly.map(([, y]) => y);
      return {
        poly,
        x0: Math.min(...xs),
        x1: Math.max(...xs),
        y0: Math.min(...ys),
        y1: Math.max(...ys),
      };
    });
  const areaBoxes = bounded(areas);
  const holeBoxes = bounded(holes);
  const hit = (p: Point, b: (typeof areaBoxes)[number]) =>
    p.x >= b.x0 &&
    p.x <= b.x1 &&
    p.y >= b.y0 &&
    p.y <= b.y1 &&
    inside(p, b.poly);
  const walkable = (p: Point) =>
    areaBoxes.some((b) => hit(p, b)) && !holeBoxes.some((b) => hit(p, b));
  const canStand = (p: Point) =>
    walkable(p) &&
    walkable({ x: p.x - bodyR, y: p.y }) &&
    walkable({ x: p.x + bodyR, y: p.y });

  function move(p: Point, dx: number, dy: number) {
    const len = Math.hypot(dx, dy);
    if (!len) return false;
    const n = Math.ceil(len / 3);
    const base = Math.atan2(dy, dx);
    const step = len / n;
    let moved = false;
    for (let i = 0; i < n; i++) {
      const sx = (dx / len) * step;
      const sy = (dy / len) * step;
      if (canStand({ x: p.x + sx, y: p.y + sy })) {
        p.x += sx;
        p.y += sy;
        moved = true;
        continue;
      }
      let ok = false;
      // Meluncur di sumbu yang paling searah dengan arah tekan.
      const glide = [
        { x: Math.sign(sx) * step, y: 0, d: Math.abs(sx) },
        { x: 0, y: Math.sign(sy) * step, d: Math.abs(sy) },
      ].sort((a, b) => b.d - a.d);
      for (const g of glide) {
        if (g.d < step * 0.05 || !canStand({ x: p.x + g.x, y: p.y + g.y }))
          continue;
        p.x += g.x;
        p.y += g.y;
        ok = moved = true;
        break;
      }
      if (ok) continue;
      for (const turn of SLIDES) {
        const a = base + turn;
        const next = {
          x: p.x + Math.cos(a) * step * Math.cos(turn),
          y: p.y + Math.sin(a) * step * Math.cos(turn),
        };
        if (!canStand(next)) continue;
        p.x = next.x;
        p.y = next.y;
        ok = moved = true;
        break;
      }
      if (!ok) break;
    }
    return moved;
  }

  return { walkable, canStand, move, ...makePathing(canStand, move, areas) };
}

// Dunia gerak dengan rintangan tetap ditambah rintangan benda terpisah dan orang yang sedang tampil.
export const pantaiWorld = (shown: SpotId[], npcs: Npc[]) =>
  makeTopWorld(
    AREAS,
    12,
    [...BLOCKS, ...pieceBlocks(shown), ...npcBlocks(npcs)].map(rect),
  );
