import { makePathing } from "../pathing";

// Dunia cover: koordinat dalam piksel peta (1672 x 941), jadi tetap pas di ukuran layar apa pun. Gambarnya town.png,
// digambar scripts/piksel-assets.ts dengan geometri yang sama. l sejajar jalan menuju pintu, s melintang jalan.
export const MAP_W = 1672;
export const MAP_H = 941;

export type Point = { x: number; y: number };
export type Area = [number, number][];

const TOWN = { x0: 480, y0: 740, gateL: 270, doorL: 520 };
export const townAt = (l: number, s: number, z = 0): Point => ({ x: TOWN.x0 + l + s, y: TOWN.y0 + (s - l) / 2 - z });
const rect = (l0: number, l1: number, s0: number, s1: number): Area => [townAt(l0, s0), townAt(l1, s0), townAt(l1, s1), townAt(l0, s1)].map((p) => [p.x, p.y]);

// Titik muncul di halaman dan titik tujuan tepat di depan tangga pintu gedung. Tombol masuk muncul bila karakter
// berada dalam NEAR_RADIUS dari titik tujuan.
export const SPAWN: Point = townAt(40, 0);
export const DOOR_TARGET: Point = townAt(474, 0);
export const NEAR_RADIUS = 80;
// Titik tengah daun pintu dan muka balok gapura, dalam piksel peta.
export const DOOR_AT: Point = townAt(TOWN.doorL, 0, 66);
export const SIGN_AT: Point = townAt(TOWN.gateL - 14, 0, 153);

// Area yang boleh dilalui: halaman paving, jalan di antara dua tiang gapura sampai depan pintu, dan pelataran di depan
// pilar kanopi. Di antara pilar hanya bagian tengah, jadi pilar tidak bisa ditembus.
const AREAS: Area[] = [rect(-100, 250, -245, 245), rect(240, 490, -62, 62), rect(440, 452, -100, 100)];
export function inside(p: Point, poly: [number, number][]) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > p.y !== yj > p.y && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

// Arah yang dicoba berurutan saat terhalang: lurus, lalu membelok makin tajam ke dua sisi supaya karakter
// meluncur di sepanjang dinding (gapura, semak) dan tidak macet di sudut.
const SLIDES = [0.4, -0.4, 0.8, -0.8, 1.2, -1.2];

// Dunia berisi himpunan area yang boleh dilalui. bodyR adalah setengah lebar badan karakter: titik di kiri dan
// kanan kakinya juga harus berada di area. holes adalah rintangan di dalam area, misalnya kios.
export function makeWorld(areas: Area[], bodyR = 11, holes: Area[] = []) {
  const bounded = (list: Area[]) =>
    list.map((poly) => {
      const xs = poly.map(([x]) => x);
      const ys = poly.map(([, y]) => y);
      return { poly, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
    });
  const areaBoxes = bounded(areas);
  const holeBoxes = bounded(holes);
  // Kotak pembatas diperiksa dulu, karena pencarian jalan memanggil ini ribuan kali.
  const hit = (p: Point, b: (typeof areaBoxes)[number]) => p.x >= b.x0 && p.x <= b.x1 && p.y >= b.y0 && p.y <= b.y1 && inside(p, b.poly);
  const walkable = (p: Point) => areaBoxes.some((b) => hit(p, b)) && !holeBoxes.some((b) => hit(p, b));
  const canStand = (p: Point) => walkable(p) && walkable({ x: p.x - bodyR, y: p.y }) && walkable({ x: p.x + bodyR, y: p.y });

  // Menggeser p sejauh (dx, dy) dalam langkah kecil supaya tidak melompati rintangan tipis. Mengembalikan true
  // bila bergerak.
  function move(p: Point, dx: number, dy: number) {
    const len = Math.hypot(dx, dy);
    if (!len) return false;
    const n = Math.ceil(len / 3);
    const base = Math.atan2(dy, dx);
    const step = len / n;
    let moved = false;
    for (let i = 0; i < n; i++) {
      let ok = false;
      // Dinding peta sejajar sumbu isometrik: lurus dulu, lalu meluncur sepanjang sumbu yang paling searah.
      const sx = (dx / len) * step;
      const sy = (dy / len) * step;
      // Sumbu l dan s tidak tegak lurus di layar, jadi gerak diuraikan di koordinat dunia, bukan dengan proyeksi layar.
      const glide = [
        { x: 1, y: -0.5, d: (sx - 2 * sy) / 2 },
        { x: 1, y: 0.5, d: (sx + 2 * sy) / 2 },
      ]
        .sort((a, b) => Math.abs(b.d) - Math.abs(a.d))
        .map((a) => {
          const k = (Math.sign(a.d) * step) / Math.hypot(a.x, a.y);
          return { x: a.x * k, y: a.y * k, d: Math.abs(a.d) };
        });
      if (canStand({ x: p.x + sx, y: p.y + sy })) {
        p.x += sx;
        p.y += sy;
        moved = true;
        continue;
      }
      for (const g of glide) {
        if (g.d < step * 0.05 || !canStand({ x: p.x + g.x, y: p.y + g.y })) continue;
        p.x += g.x;
        p.y += g.y;
        ok = moved = true;
        break;
      }
      if (ok) continue;
      for (const turn of SLIDES) {
        const a = base + turn;
        const next = { x: p.x + Math.cos(a) * step * Math.cos(turn), y: p.y + Math.sin(a) * step * Math.cos(turn) };
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

// Kecepatan jalan dalam piksel gambar per detik.
export const SPEED = 300;

// Tiang janur di kanan kiri gerbang.
const HOLES: Area[] = [rect(236, 256, 140, 160), rect(236, 256, -160, -140)];
const cover = makeWorld(AREAS, 11, HOLES);
export const { walkable, canStand, move, route, steer, walk } = cover;

// Karakter yang sudah melewati garis gapura berada di belakangnya, jadi tiang dan baloknya harus menutupi dia.
export const behindArch = (p: Point) => (p.x - TOWN.x0 - 2 * (p.y - TOWN.y0)) / 2 > TOWN.gateL;
