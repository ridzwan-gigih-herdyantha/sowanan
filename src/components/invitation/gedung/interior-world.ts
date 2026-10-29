import { boothFootprint, type BoothKind, type BoothTone } from "./booth";
import { makeWorld, type Area, type Point } from "./world";
import { npcObstacles } from "./interior-npcs";

// Peta dalam gedung (inside-map.webp): koordinat dalam piksel gambar 1672 x 941, jadi tetap pas di ukuran layar
// apa pun. Buka undangan dengan ?gdebug di alamat untuk melihat lantai (biru), rintangan (merah), dan jangkauan
// tiap pos (kuning) di atas gambar saat menyetel ulang titik-titik di bawah.
export const IN_W = 1672;
export const IN_H = 941;

// pembuka bukan pos di peta: papan sambutan yang terbuka sekali saat tamu masuk aula.
export type PoiId = "pembuka" | "pelaminan" | "mempelai" | "cerita" | "galeri" | "acara" | "slot1" | "slot2" | "rsvp" | "angpao";

// Lantai aula yang boleh dilalui, digambar mengikuti tepi dinding, panggung, dan dinding foto di kanan.
export const FLOOR_OUTLINE: Area = [
  [135, 598], [400, 466], [700, 316], [985, 172], [1005, 212], [1110, 262], [1230, 320], [1340, 375], [1340, 545], [1590, 670], [1230, 840],
  [1195, 830], [1100, 790], [950, 865], [760, 768], [570, 835], [430, 755], [300, 690],
];

// Tangga karpet merah dan panggung pelaminan, sampai depan sofa dan kursi. Sisi bawahnya sedikit menumpuk
// lantai aula supaya keduanya tersambung tanpa celah.
export const STAGE: Area = [
  [1105, 272], [1120, 232], [1170, 207], [1215, 205], [1335, 230], [1340, 270], [1290, 300], [1235, 332],
];

// Pengantin berdiri di panggung pelaminan, di depan sofa. x dan y titik kaki (tengah bawah gambar), w dan h ukuran
// tampil dalam piksel peta, sedikit lebih tinggi dari karakter tamu.
export const COUPLE = { src: "/img/rafi-kayla/newlyweds.png", x: 1290, y: 245, w: 112, h: 109 };

// Perabot bawaan gambar yang berdiri di lantai: meja di depan sekat kayu dan meja kado di kanan bawah, ditambah
// tempat pengantin berdiri.
const FURNITURE: Area[] = [
  [[770, 295], [710, 265], [590, 325], [650, 355]],
  [[1370, 715], [1310, 685], [1190, 745], [1250, 775]],
  [[COUPLE.x - 38, COUPLE.y - 20], [COUPLE.x + 36, COUPLE.y - 20], [COUPLE.x + 36, COUPLE.y + 4], [COUPLE.x - 38, COUPLE.y + 4]],
];

// Gambar kios jadi (PNG transparan) pengganti kios gambar kode. w dan h ukuran tampil dalam piksel peta, ax dan
// ay titik pada gambar (0 sampai 1) yang menapak di pusat kios. foot adalah jejak rintangannya: dari l sampai r
// piksel di kiri kanan pusat, dan d piksel ke belakang (atas) dari pusat, karena gambarnya menghadap ke depan.
// front menggeser titik berdiri tamu dari pusat kios bila gambarnya tidak menghadap lurus ke depan (ART_FRONT).
export type BoothArt = { src: string; w: number; h: number; ax: number; ay: number; foot: { l: number; r: number; d: number }; front?: Point };

// Jenis kios yang sudah punya gambar jadi. Gambarnya menghadap ke depan, jadi tamu berdiri tepat di bawah
// mejanya, dan meja pada gambar sedikit di atas titik tapaknya sehingga jejak rintangannya digeser naik.
// Ukuran tampil disetel supaya tiap kios tampak sebesar dinding foto galeri.
const ART: Partial<Record<BoothKind, BoothArt>> = {
  rsvp: { src: "/img/rafi-kayla/rsv-both.png", w: 180, h: 132, ax: 0.53, ay: 0.93, foot: { l: -82, r: 79, d: 30 } },
  dresscode: { src: "/img/rafi-kayla/drescode-both.png", w: 180, h: 132, ax: 0.54, ay: 0.93, foot: { l: -82, r: 75, d: 31 } },
  angpao: { src: "/img/rafi-kayla/gift-booth.png", w: 200, h: 154, ax: 0.5, ay: 0.93, foot: { l: -96, r: 96, d: 35 } },
  // Meja miring isometrik: sisi panjangnya sejajar karpet dan menghadap ke kanan bawah, jadi tamu berdiri di
  // depan sisi itu.
  acara: { src: "/img/rafi-kayla/acara-booth.png", w: 300, h: 200, ax: 0.54, ay: 0.81, foot: { l: -80, r: 80, d: 46 }, front: { x: 25, y: 52 } },
  cerita: { src: "/img/rafi-kayla/story-booth.png", w: 217, h: 145, ax: 0.54, ay: 0.84, foot: { l: -84, r: 80, d: 40 }, front: { x: 20, y: 46 } },
  mempelai: { src: "/img/rafi-kayla/mempelai.png", w: 200, h: 162, ax: 0.48, ay: 0.87, foot: { l: -93, r: 93, d: 51 } },
  galeri: { src: "/img/rafi-kayla/gallery-both.png", w: 200, h: 150, ax: 0.52, ay: 0.86, foot: { l: -95, r: 90, d: 50 } },
};
const ART_FRONT = { x: 15, y: 47 };

type Poi = {
  id: PoiId;
  label: string;
  // Titik berdiri di depan pos. Tombol "Buka" muncul bila karakter dalam IN_NEAR dari titik ini.
  at: Point;
  // Pusat kios di lantai dan jenisnya. Pos tanpa kios (pelaminan) memakai perabot bawaan gambar.
  booth?: { c: Point; kind: BoothKind; tone: BoothTone; art?: BoothArt };
};

// Dua baris kios mengapit karpet, urutannya mengikuti bagan: penerima tamu dan angpao paling dekat pintu,
// lalu bagian tambahan, galeri dan acara, dan paling jauh mempelai dan cerita di dekat pelaminan. Kios gambar
// kode dilayani dari sisi kanan bawahnya (FRONT).
const FRONT = { x: 57, y: 29 };

const at = (id: PoiId, label: string, c: Point, kind: BoothKind, tone: BoothTone): Poi => ({ id, label, at: c, booth: { c, kind, tone } });

const POIS: Poi[] = [
  // Di panggung, di kiri depan pengantin.
  { id: "pelaminan", label: "Pelaminan", at: { x: 1225, y: 265 } },
  // Kedua baris sejajar karpet (y + x / 2 tetap) dengan jarak antarkios yang sama, 170 piksel ke samping.
  // Sisi kiri karpet, dari pelaminan ke pintu: Mempelai, Galeri, bagian tambahan pertama, Penerima tamu.
  at("mempelai", "Mempelai", { x: 920, y: 340 }, "mempelai", "accent"),
  at("galeri", "Galeri", { x: 750, y: 425 }, "galeri", "gold"),
  at("slot1", "Bagian tambahan", { x: 580, y: 510 }, "slot", "roof"),
  at("rsvp", "Penerima tamu", { x: 410, y: 595 }, "rsvp", "accent"),
  at("cerita", "Cerita", { x: 1230, y: 470 }, "cerita", "gold"),
  at("acara", "Acara", { x: 1060, y: 555 }, "acara", "accent"),
  at("slot2", "Bagian tambahan", { x: 890, y: 640 }, "slot", "roof"),
  at("angpao", "Kotak angpao", { x: 720, y: 725 }, "angpao", "gold"),
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
// isinya), gambar jadi bila jenisnya punya, dan titik berdiri yang sesuai bentuk kiosnya.
export function placePois(panels: { id: PoiId; label?: string; icon?: BoothKind }[]): PlacedPoi[] {
  const spots = spread(new Set(panels.map((x) => x.id)));
  return POIS.flatMap((p) => {
    const own = panels.find((x) => x.id === p.id);
    if (!own) return [];
    if (!p.booth) return [{ ...p, label: own.label ?? p.label }];
    const kind = own.icon ?? p.booth.kind;
    const art = ART[kind];
    const c = spots.get(p.id) ?? p.booth.c;
    const off = art ? (art.front ?? ART_FRONT) : FRONT;
    const stand = { x: c.x + off.x, y: c.y + off.y };
    return [{ ...p, label: own.label ?? p.label, at: stand, booth: { ...p.booth, c, kind, art } }];
  });
}

// Rintangan: perabot gambar ditambah kios yang dipasang.
function footprint(b: NonNullable<Poi["booth"]>): Area {
  const { c, art } = b;
  if (!art) return boothFootprint(c);
  const { l, r, d } = art.foot;
  return [[c.x + l, c.y - d], [c.x + r, c.y - d], [c.x + r, c.y], [c.x + l, c.y]];
}

export const obstacles = (pois: PlacedPoi[]): Area[] => [...FURNITURE, ...npcObstacles(), ...pois.flatMap((p) => (p.booth ? [footprint(p.booth)] : []))];
export const interiorWorld = (pois: PlacedPoi[]) => makeWorld([FLOOR_OUTLINE, STAGE], 12, obstacles(pois));

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
export const IN_SPAWN: Point = { x: 490, y: 700 };
// Jarak dari titik pos, dalam piksel gambar, sampai tombol "Buka" muncul.
export const IN_NEAR = 80;
// Jarak dari tepi kios sampai tombol "Buka" muncul, untuk tamu yang datang dari samping atau belakang.
const IN_EDGE = 60;
