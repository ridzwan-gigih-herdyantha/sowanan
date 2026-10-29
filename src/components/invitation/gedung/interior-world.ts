import { boothFootprint, type BoothKind, type BoothTone } from "./booth";
import { makeWorld, type Area, type Point } from "./world";

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

// Perabot bawaan gambar yang berdiri di lantai: meja di depan sekat kayu dan meja kado di kanan bawah.
const FURNITURE: Area[] = [
  [[770, 295], [710, 265], [590, 325], [650, 355]],
  [[1370, 715], [1310, 685], [1190, 745], [1250, 775]],
];

// Gambar kios jadi (PNG transparan) pengganti kios gambar kode. w dan h ukuran tampil dalam piksel peta, ax dan
// ay titik pada gambar (0 sampai 1) yang menapak di pusat kios.
export type BoothArt = { src: string; w: number; h: number; ax: number; ay: number };

// Jenis kios yang sudah punya gambar jadi. Gambarnya menghadap ke depan, jadi tamu berdiri tepat di bawah
// mejanya, dan meja pada gambar sedikit di atas titik tapaknya sehingga jejak rintangannya digeser naik.
const ART: Partial<Record<BoothKind, BoothArt>> = {
  rsvp: { src: "/img/rafi-kayla/rsv-both.png", w: 230, h: 191, ax: 0.55, ay: 0.92 },
  dresscode: { src: "/img/rafi-kayla/drescode-both.png", w: 230, h: 169, ax: 0.54, ay: 0.93 },
};
const ART_FRONT = { x: 15, y: 47 };
const ART_LIFT = 22;

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
const FRONT = { x: 62, y: 31 };

const at = (id: PoiId, label: string, c: Point, kind: BoothKind, tone: BoothTone): Poi => ({ id, label, at: c, booth: { c, kind, tone } });

const POIS: Poi[] = [
  { id: "pelaminan", label: "Pelaminan", at: { x: 1190, y: 352 } },
  at("mempelai", "Mempelai", { x: 955, y: 320 }, "mempelai", "accent"),
  at("galeri", "Galeri", { x: 780, y: 410 }, "galeri", "gold"),
  at("slot1", "Bagian tambahan", { x: 615, y: 495 }, "slot", "roof"),
  at("rsvp", "Penerima tamu", { x: 380, y: 615 }, "rsvp", "accent"),
  at("cerita", "Cerita", { x: 1215, y: 470 }, "cerita", "gold"),
  at("acara", "Acara", { x: 1085, y: 540 }, "acara", "accent"),
  at("slot2", "Bagian tambahan", { x: 910, y: 625 }, "slot", "roof"),
  at("angpao", "Kotak angpao", { x: 730, y: 705 }, "angpao", "gold"),
];

export type PlacedPoi = Poi;

// Pos yang benar-benar dipasang, dengan nama dan jenis kios dari panelnya (bagian tambahan berganti-ganti
// isinya), gambar jadi bila jenisnya punya, dan titik berdiri yang sesuai bentuk kiosnya.
export function placePois(panels: { id: PoiId; label?: string; icon?: BoothKind }[]): PlacedPoi[] {
  return POIS.flatMap((p) => {
    const own = panels.find((x) => x.id === p.id);
    if (!own) return [];
    if (!p.booth) return [{ ...p, label: own.label ?? p.label }];
    const kind = own.icon ?? p.booth.kind;
    const art = ART[kind];
    const c = p.booth.c;
    const stand = art ? { x: c.x + ART_FRONT.x, y: c.y + ART_FRONT.y } : { x: c.x + FRONT.x, y: c.y + FRONT.y };
    return [{ ...p, label: own.label ?? p.label, at: stand, booth: { ...p.booth, kind, art } }];
  });
}

// Rintangan: perabot gambar ditambah kios yang dipasang.
export const obstacles = (pois: PlacedPoi[]): Area[] => [
  ...FURNITURE,
  ...pois.flatMap((p) => (p.booth ? [boothFootprint(p.booth.art ? { x: p.booth.c.x, y: p.booth.c.y - ART_LIFT } : p.booth.c)] : [])),
];
export const interiorWorld = (pois: PlacedPoi[]) => makeWorld([FLOOR_OUTLINE], 12, obstacles(pois));

// Muncul tepat di dalam pintu, di atas karpet merah.
export const IN_SPAWN: Point = { x: 490, y: 700 };
// Jarak dari titik pos, dalam piksel gambar, sampai tombol "Buka" muncul.
export const IN_NEAR = 80;
