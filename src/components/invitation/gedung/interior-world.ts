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
// ay titik pada gambar (0 sampai 1) yang menapak di pusat kios. foot adalah jejak rintangannya: dari l sampai r
// piksel di kiri kanan pusat, dan d piksel ke belakang (atas) dari pusat, karena gambarnya menghadap ke depan.
export type BoothArt = { src: string; w: number; h: number; ax: number; ay: number; foot: { l: number; r: number; d: number } };

// Jenis kios yang sudah punya gambar jadi. Gambarnya menghadap ke depan, jadi tamu berdiri tepat di bawah
// mejanya, dan meja pada gambar sedikit di atas titik tapaknya sehingga jejak rintangannya digeser naik.
// Ukuran tampil disetel supaya meja di tiap gambar sama lebar (sekitar 100 piksel peta). Gambar penerima tamu
// dan dress code digambar jauh lebih besar dari dinding foto, jadi tampilnya diperkecil.
const ART: Partial<Record<BoothKind, BoothArt>> = {
  rsvp: { src: "/img/rafi-kayla/rsv-both.png", w: 128, h: 94, ax: 0.53, ay: 0.93, foot: { l: -58, r: 56, d: 21 } },
  dresscode: { src: "/img/rafi-kayla/drescode-both.png", w: 120, h: 88, ax: 0.54, ay: 0.93, foot: { l: -55, r: 50, d: 21 } },
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
  { id: "pelaminan", label: "Pelaminan", at: { x: 1190, y: 352 } },
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
  ...pois.flatMap((p) => {
    if (!p.booth) return [];
    const { c, art } = p.booth;
    if (!art) return [boothFootprint(c)];
    const { l, r, d } = art.foot;
    return [[[c.x + l, c.y - d], [c.x + r, c.y - d], [c.x + r, c.y], [c.x + l, c.y]] as Area];
  }),
];
export const interiorWorld = (pois: PlacedPoi[]) => makeWorld([FLOOR_OUTLINE], 12, obstacles(pois));

// Muncul tepat di dalam pintu, di atas karpet merah.
export const IN_SPAWN: Point = { x: 490, y: 700 };
// Jarak dari titik pos, dalam piksel gambar, sampai tombol "Buka" muncul.
export const IN_NEAR = 80;
