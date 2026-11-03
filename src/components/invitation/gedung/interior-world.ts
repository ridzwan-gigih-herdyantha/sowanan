import { BOOTH, type BoothKind } from "./booth";
import { makeWorld, type Area, type Point } from "./world";

// Peta dalam gedung (hall.png, digambar scripts/isometrik-assets.ts): koordinat dalam piksel peta 2420 x 1540, jadi
// tetap pas di ukuran layar apa pun. Buka undangan dengan ?gdebug di alamat untuk melihat lantai (biru), rintangan
// (merah), dan jangkauan tiap pos (kuning) di atas gambar saat menyetel ulang titik-titik di bawah.
export const IN_W = 2420;
export const IN_H = 1540;

// Aula persegi panjang. l sejajar karpet dari pintu ke pelaminan, s melintang karpet: negatif ke arah dinding
// belakang, positif ke arah tembok rendah. Sumbu karpet ada di s = 0, jadi kanan dan kirinya simetris.
const HALL = { x0: 460, y0: 1300, L: 1500, S: 400, stageL: 1270, stageS: 280, stageZ: 26, stepL: 1236, stepS: 130 };
export const hallAt = (l: number, s: number, z = 0): Point => ({ x: HALL.x0 + l + s, y: HALL.y0 + (s - l) / 2 - z });
const area = (...pts: Point[]): Area => pts.map((p) => [p.x, p.y]);
const rect = (l0: number, l1: number, s0: number, s1: number, z = 0): Area => area(hallAt(l0, s0, z), hallAt(l1, s0, z), hallAt(l1, s1, z), hallAt(l0, s1, z));

// pembuka bukan pos di peta: papan sambutan yang terbuka sekali saat tamu masuk aula.
export type PoiId = "pembuka" | "pelaminan" | "mempelai" | "cerita" | "galeri" | "acara" | "slot1" | "slot2" | "rsvp" | "angpao";

// Lantai aula yang boleh dilalui: seluruh lantai di dalam tembok, kecuali panggung di ujung sumbu. Kaki karakter
// tidak boleh menempel dinding belakang supaya tidak terlihat menembusnya.
const M = 26;
export const FLOOR_OUTLINE: Area = rect(M, HALL.stepL, -HALL.S + M, HALL.S - M);
// Lorong di kanan dan kiri panggung, sampai dinding ujung.
const SIDES: Area[] = [rect(HALL.stepL - 6, HALL.L - M, -HALL.S + M, -HALL.stageS - 14), rect(HALL.stepL - 6, HALL.L - M, HALL.stageS + 14, HALL.S - M)];

// Tangga karpet dan lantai panggung, digeser naik setinggi panggung. Tangga menyambung lantai aula tanpa celah.
export const STAGE: Area = rect(HALL.stageL - 6, HALL.L - 34, -HALL.stageS + 8, HALL.stageS - 8, HALL.stageZ);
const STEPS: Area = area(hallAt(HALL.stepL - 8, -HALL.stepS + 8), hallAt(HALL.stageL + 4, -HALL.stepS + 8, HALL.stageZ), hallAt(HALL.stageL + 4, HALL.stepS - 8, HALL.stageZ), hallAt(HALL.stepL - 8, HALL.stepS - 8));

// Pengantin berdiri di tengah panggung, tepat di sumbu karpet dan di depan sofa. x dan y titik kaki (tengah bawah
// gambar), w dan h ukuran tampil dalam piksel peta. Bukan rintangan: tamu boleh menembus semua karakter.
const COUPLE_AT = hallAt(HALL.L - 56, 0, HALL.stageZ);
export const COUPLE = { src: "/img/rafi-kayla/couple-sprite.png", x: COUPLE_AT.x, y: COUPLE_AT.y, w: 154, h: 106 };

// Perabot bawaan gambar yang berdiri di lantai: sofa di panggung dan pot di kaki tangga.
const FURNITURE: Area[] = [
  rect(HALL.L - 34, HALL.L, -70, 70, HALL.stageZ),
  ...[-1, 1].map((k) => rect(HALL.stepL - 26, HALL.stepL - 2, k * 150 - 12, k * 150 + 12)),
];

type Poi = {
  id: PoiId;
  label: string;
  // Titik berdiri di depan pos. Tombol "Buka" muncul bila karakter dalam IN_NEAR dari titik ini.
  at: Point;
  // Pusat kios di lantai dan jenisnya. Pos tanpa kios (pelaminan) memakai perabot bawaan gambar.
  booth?: { c: Point; kind: BoothKind };
};

// Dua baris kios mengapit karpet, urutannya mengikuti bagan: penerima tamu dan angpao paling dekat pintu,
// lalu bagian tambahan, galeri dan acara, dan paling jauh mempelai dan cerita di dekat pelaminan. Semua kios
// menghadap ke kanan bawah, jadi tamu berdiri di sisi s yang lebih besar.
const ROW_S = 190;
const ROW_FROM = 360;
const ROW_TO = 1120;
const FRONT_S = 50;

const at = (id: PoiId, label: string, c: Point, kind: BoothKind): Poi => ({ id, label, at: c, booth: { c, kind } });

const POIS: Poi[] = [
  // Di panggung, tepat di depan pengantin.
  { id: "pelaminan", label: "Pelaminan", at: hallAt(HALL.L - 130, 0, HALL.stageZ) },
  at("mempelai", "Mempelai", hallAt(ROW_TO, -ROW_S), "mempelai"),
  at("galeri", "Galeri", hallAt(867, -ROW_S), "galeri"),
  at("slot1", "Bagian tambahan", hallAt(613, -ROW_S), "slot"),
  at("rsvp", "Penerima tamu", hallAt(ROW_FROM, -ROW_S), "rsvp"),
  at("cerita", "Cerita", hallAt(ROW_TO, ROW_S), "cerita"),
  at("acara", "Acara", hallAt(867, ROW_S), "acara"),
  at("slot2", "Bagian tambahan", hallAt(613, ROW_S), "slot"),
  at("angpao", "Kotak angpao", hallAt(ROW_FROM, ROW_S), "angpao"),
];

// Urutan kios tiap baris, dari pelaminan ke pintu.
const ROWS: PoiId[][] = [
  ["mempelai", "galeri", "slot1", "rsvp"],
  ["cerita", "acara", "slot2", "angpao"],
];

// Kios yang dipasang dibagi rata sepanjang barisnya, dari titik kios pertama sampai terakhir, supaya baris
// tidak bolong saat bagian tambahan atau bagian lain tidak dipakai.
function spread(ids: Set<PoiId>): Map<PoiId, Point> {
  const out = new Map<PoiId, Point>();
  for (const row of ROWS) {
    const ends = [row[0], row[row.length - 1]].map((id) => POIS.find((p) => p.id === id)!.booth!.c);
    const shown = row.filter((id) => ids.has(id));
    shown.forEach((id, i) => {
      const t = shown.length > 1 ? i / (shown.length - 1) : 0;
      out.set(id, { x: ends[0].x + (ends[1].x - ends[0].x) * t, y: ends[0].y + (ends[1].y - ends[0].y) * t });
    });
  }
  return out;
}

export type PlacedPoi = Poi;

// Pos yang benar-benar dipasang, dengan nama dan jenis kios dari panelnya (bagian tambahan berganti-ganti
// isinya) dan titik berdiri di depan kiosnya.
export function placePois(panels: { id: PoiId; label?: string; icon?: BoothKind }[]): PlacedPoi[] {
  const spots = spread(new Set(panels.map((x) => x.id)));
  return POIS.flatMap((p) => {
    const own = panels.find((x) => x.id === p.id);
    if (!own) return [];
    if (!p.booth) return [{ ...p, label: own.label ?? p.label }];
    const c = spots.get(p.id) ?? p.booth.c;
    const stand = { x: c.x + FRONT_S, y: c.y + FRONT_S / 2 };
    return [{ ...p, label: own.label ?? p.label, at: stand, booth: { c, kind: own.icon ?? p.booth.kind } }];
  });
}

// Rintangan: perabot gambar ditambah kios yang dipasang. Jejak kios mengikuti sumbu aula.
function footprint(b: NonNullable<Poi["booth"]>): Area {
  const { halfL: hl, halfS: hs, shiftS: m } = BOOTH;
  const corner = (l: number, s: number): [number, number] => [b.c.x + l + s, b.c.y + (s - l) / 2];
  return [corner(-hl, m - hs), corner(hl, m - hs), corner(hl, m + hs), corner(-hl, m + hs)];
}

export const obstacles = (pois: PlacedPoi[]): Area[] => [...FURNITURE, ...pois.flatMap((p) => (p.booth ? [footprint(p.booth)] : []))];
export const interiorWorld = (pois: PlacedPoi[]) => makeWorld([FLOOR_OUTLINE, ...SIDES, STEPS, STAGE], 12, obstacles(pois));

// Jarak tamu ke pos: ke titik berdirinya, atau ke tepi kios dari sisi mana pun, mana yang lebih dekat. Jadi
// tombol "Buka" juga muncul saat tamu menempel di samping atau belakang kios.
export function poiDistance(poi: PlacedPoi, p: Point): number {
  const toStand = Math.hypot(p.x - poi.at.x, p.y - poi.at.y);
  if (!poi.booth) return toStand;
  const f = footprint(poi.booth);
  let edge = Infinity;
  f.forEach(([ax, ay], i) => {
    const [bx, by] = f[(i + 1) % f.length];
    const dx = bx - ax;
    const dy = by - ay;
    const t = Math.max(0, Math.min(1, ((p.x - ax) * dx + (p.y - ay) * dy) / (dx * dx + dy * dy)));
    edge = Math.min(edge, Math.hypot(p.x - (ax + t * dx), p.y - (ay + t * dy)));
  });
  return Math.min(toStand, edge + IN_NEAR - IN_EDGE);
}

// Muncul tepat di dalam pintu, di atas karpet merah.
export const IN_SPAWN: Point = hallAt(70, 0);
// Jarak dari titik pos, dalam piksel gambar, sampai tombol "Buka" muncul.
export const IN_NEAR = 80;
// Jarak dari tepi kios sampai tombol "Buka" muncul, untuk tamu yang datang dari samping atau belakang.
const IN_EDGE = 60;
