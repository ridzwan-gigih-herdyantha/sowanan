// pnpm isometrik-assets
// Menggambar aset pixel art tema Isometrik ke public/img/rafi-kayla: aula, kios, dan sprite. Aula dan kios digambar
// langsung per piksel supaya layoutnya rapi, simetris, dan bebas lambang. Sampul dan sprite berasal dari gambar di
// scripts/isometrik-src yang dikecilkan, dikurangi warnanya, dan selnya diluruskan.
// Geometri aula di sini harus sama dengan src/components/invitation/gedung/interior-world.ts.
import sharp from "sharp";

const ROOT = new URL("../", import.meta.url).pathname.replace(/^\/([A-Z]:)/i, "$1");
const SRC = `${ROOT}scripts/isometrik-src/`;
const OUT = `${ROOT}public/img/rafi-kayla/`;

// Satu piksel gambar sama dengan dua piksel peta.
const ART = 2;

type Rgb = [number, number, number];
const hex = (c: string): Rgb => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];

const C = {
  line: hex("#3a2730"),
  slab: hex("#8d7663"),
  slabDark: hex("#6d5849"),
  wall: hex("#f1dfbd"),
  wallLight: hex("#fbf0d8"),
  wallDark: hex("#dcc49b"),
  wallSide: hex("#e6d0a8"),
  cap: hex("#fff6e2"),
  wood: hex("#8f5e36"),
  woodLight: hex("#b07c4a"),
  woodDark: hex("#5f3b23"),
  gold: hex("#e0ae4c"),
  goldDark: hex("#a9762c"),
  goldLight: hex("#f6d98a"),
  floorA: hex("#f4e6c9"),
  floorB: hex("#ecd9b6"),
  floorC: hex("#fbf3df"),
  grout: hex("#dbc59d"),
  red: hex("#c9463d"),
  redDark: hex("#a23330"),
  redLight: hex("#de6a56"),
  glass: hex("#7db2cc"),
  glassLight: hex("#b5dbe6"),
  purple: hex("#8569b5"),
  purpleDark: hex("#654d94"),
  white: hex("#fff8ea"),
  cloth: hex("#fbf2e0"),
  clothDark: hex("#e5d6bb"),
  blush: hex("#f4c6b4"),
  rose: hex("#e58f8f"),
  leaf: hex("#5c9a56"),
  leafLight: hex("#8abf6c"),
  leafDark: hex("#2f6243"),
  stone: hex("#dcd3c2"),
  stoneDark: hex("#b5a993"),
  sky: hex("#bfe0ea"),
  hill: hex("#88b878"),
  skin: hex("#eab98f"),
  suit: hex("#3b3644"),
  screen: hex("#2d3b52"),
  screenLight: hex("#5d7ea3"),
};

// Bayer 4 x 4 untuk gradasi berpola kotak-kotak khas pixel art.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (x: number, y: number) => (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

class Canvas {
  readonly w: number;
  readonly h: number;
  readonly data: Uint8Array;
  constructor(w: number, h: number, fill?: Rgb) {
    this.w = w;
    this.h = h;
    this.data = new Uint8Array(w * h * 4);
    if (fill) for (let i = 0; i < w * h; i++) this.data.set([...fill, 255], i * 4);
  }
  set(x: number, y: number, c: Rgb) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    this.data.set([c[0], c[1], c[2], 255], (Math.floor(y) * this.w + Math.floor(x)) * 4);
  }
  line(x0: number, y0: number, x1: number, y1: number, c: Rgb) {
    const n = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)));
    for (let i = 0; i <= n; i++) this.set(Math.floor(x0 + ((x1 - x0) * i) / (n || 1)), Math.floor(y0 + ((y1 - y0) * i) / (n || 1)), c);
  }
  // Mengisi poligon per baris; warna tiap piksel dari fn, null berarti dilewati.
  poly(pts: [number, number][], fn: (x: number, y: number) => Rgb | null) {
    const ys = pts.map((p) => p[1]);
    for (let y = Math.max(0, Math.floor(Math.min(...ys))); y <= Math.min(this.h - 1, Math.ceil(Math.max(...ys))); y++) {
      const cross: number[] = [];
      pts.forEach((a, i) => {
        const b = pts[(i + 1) % pts.length];
        if (a[1] > y + 0.5 !== b[1] > y + 0.5) cross.push(a[0] + ((y + 0.5 - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
      });
      cross.sort((a, b) => a - b);
      for (let i = 0; i + 1 < cross.length; i += 2) {
        for (let x = Math.max(0, Math.round(cross[i])); x < Math.min(this.w, Math.round(cross[i + 1])); x++) {
          const c = fn(x, y);
          if (c) this.set(x, y, c);
        }
      }
    }
  }
  disc(cx: number, cy: number, r: number, fn: (dx: number, dy: number, x: number, y: number) => Rgb | null) {
    for (let y = Math.floor(cy - r); y <= cy + r; y++) {
      for (let x = Math.floor(cx - r); x <= cx + r; x++) {
        if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 > r * r) continue;
        const c = fn(x + 0.5 - cx, y + 0.5 - cy, x, y);
        if (c) this.set(x, y, c);
      }
    }
  }
  async save(file: string) {
    await sharp(Buffer.from(this.data), { raw: { width: this.w, height: this.h, channels: 4 } }).png({ compressionLevel: 9, palette: true, colours: 256, dither: 0 }).toFile(OUT + file);
  }
}

// Bidang isometrik 2:1. l sejajar karpet (ke kanan atas), s melintang karpet (ke kanan bawah), z ke atas. Semua
// ukuran dalam piksel peta, (ox, oy) titik l = s = z = 0.
class Iso {
  readonly c: Canvas;
  readonly ox: number;
  readonly oy: number;
  constructor(c: Canvas, ox: number, oy: number) {
    this.c = c;
    this.ox = ox;
    this.oy = oy;
  }
  xy(l: number, s: number, z = 0): [number, number] {
    return [(this.ox + l + s) / ART, (this.oy + (s - l) / 2 - z) / ART];
  }
  // Bidang tegak di s tetap: dinding yang menghadap ke kanan bawah.
  planeS(s: number, l0: number, l1: number, z0: number, z1: number, fn: (l: number, z: number, x: number, y: number) => Rgb | null) {
    this.c.poly([this.xy(l0, s, z0), this.xy(l1, s, z0), this.xy(l1, s, z1), this.xy(l0, s, z1)], (x, y) => {
      const l = (x + 0.5) * ART - this.ox - s;
      return fn(l, this.oy + (s - l) / 2 - (y + 0.5) * ART, x, y);
    });
  }
  // Bidang tegak di l tetap: dinding yang menghadap ke kiri bawah.
  planeL(l: number, s0: number, s1: number, z0: number, z1: number, fn: (s: number, z: number, x: number, y: number) => Rgb | null) {
    this.c.poly([this.xy(l, s0, z0), this.xy(l, s1, z0), this.xy(l, s1, z1), this.xy(l, s0, z1)], (x, y) => {
      const s = (x + 0.5) * ART - this.ox - l;
      return fn(s, this.oy + (s - l) / 2 - (y + 0.5) * ART, x, y);
    });
  }
  // Bidang datar di ketinggian z.
  planeZ(z: number, l0: number, l1: number, s0: number, s1: number, fn: (l: number, s: number, x: number, y: number) => Rgb | null) {
    this.c.poly([this.xy(l0, s0, z), this.xy(l1, s0, z), this.xy(l1, s1, z), this.xy(l0, s1, z)], (x, y) => {
      const a = (x + 0.5) * ART - this.ox;
      const b = 2 * ((y + 0.5) * ART - this.oy + z);
      return fn((a - b) / 2, (a + b) / 2, x, y);
    });
  }
  box(l0: number, l1: number, s0: number, s1: number, z0: number, z1: number, top: Rgb, left: Rgb, right: Rgb, outline: Rgb | null = C.line) {
    this.planeL(l0, s0, s1, z0, z1, () => left);
    this.planeS(s1, l0, l1, z0, z1, () => right);
    this.planeZ(z1, l0, l1, s0, s1, () => top);
    if (outline) {
      const seg = (a: [number, number], b: [number, number]) => this.c.line(a[0], a[1], b[0], b[1], outline);
      seg(this.xy(l0, s0, z1), this.xy(l1, s0, z1));
      seg(this.xy(l1, s0, z1), this.xy(l1, s1, z1));
      seg(this.xy(l1, s1, z1), this.xy(l0, s1, z1));
      seg(this.xy(l0, s1, z1), this.xy(l0, s0, z1));
      seg(this.xy(l0, s0, z0), this.xy(l0, s1, z0));
      seg(this.xy(l0, s1, z0), this.xy(l1, s1, z0));
      seg(this.xy(l0, s0, z0), this.xy(l0, s0, z1));
      seg(this.xy(l0, s1, z0), this.xy(l0, s1, z1));
      seg(this.xy(l1, s1, z0), this.xy(l1, s1, z1));
    }
  }
}

// Bunga netral lima kelopak di bidang apa pun: u dan v jarak dari pusatnya, r jari-jari.
function flower(u: number, v: number, r: number, petal: Rgb, core: Rgb): Rgb | null {
  const d = Math.hypot(u, v);
  if (d < r * 0.3) return core;
  const a = Math.atan2(v, u);
  return d < r * (0.62 + 0.38 * Math.abs(Math.cos(2.5 * a))) ? petal : null;
}

// Gerombol daun dan bunga tampak samping: dasar gelap, puncak terang, bintik bunga acak.
function bush(c: Canvas, cx: number, cy: number, r: number, seed: number, bloom: Rgb = C.white, rate = 0.1) {
  const rand = rng(seed);
  const lobes = Array.from({ length: 5 }, () => ({ x: (rand() - 0.5) * r * 1.1, y: (rand() - 0.5) * r * 0.9, r: r * (0.5 + rand() * 0.25) }));
  for (const lobe of [{ x: 0, y: 0, r: r * 0.85 }, ...lobes]) {
    c.disc(cx + lobe.x, cy + lobe.y, lobe.r + 1, () => C.leafDark);
  }
  for (const lobe of [{ x: 0, y: 0, r: r * 0.85 }, ...lobes]) {
    c.disc(cx + lobe.x, cy + lobe.y, lobe.r, (dx, dy, x, y) => {
      const lit = 0.5 - (dy + dx * 0.4) / (lobe.r * 2);
      if (lit + (bayer(x, y) - 0.5) * 0.35 > 0.72) return C.leafLight;
      return lit + (bayer(x, y) - 0.5) * 0.35 > 0.3 ? C.leaf : C.leafDark;
    });
  }
  const dots = Math.round(r * r * rate * 2);
  for (let i = 0; i < dots; i++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * r * 0.95;
    const x = Math.round(cx + Math.cos(a) * d);
    const y = Math.round(cy + Math.sin(a) * d);
    c.set(x, y, bloom);
    c.set(x + 1, y, bloom);
    c.set(x, y + 1, bloom);
    c.set(x + 1, y + 1, C.gold);
  }
}

// Pot batu berisi semak berbunga.
function planter(iso: Iso, l: number, s: number, seed: number, size = 1, bloom: Rgb = C.white) {
  const h = 16 * size;
  iso.box(l - 9 * size, l + 9 * size, s - 9 * size, s + 9 * size, 0, h, C.stone, C.stoneDark, C.stone);
  const [x, y] = iso.xy(l, s, h + 14 * size);
  bush(iso.c, x, y, 8.5 * size, seed, bloom);
}

function lantern(iso: Iso, l: number, s: number) {
  iso.box(l - 4, l + 4, s - 4, s + 4, 0, 26, C.woodDark, C.woodDark, C.wood, null);
  iso.box(l - 6, l + 6, s - 6, s + 6, 26, 42, C.goldLight, C.gold, C.goldLight, C.goldDark);
  iso.box(l - 7, l + 7, s - 7, s + 7, 42, 45, C.goldDark, C.goldDark, C.gold, null);
}

// Foto berbingkai kecil pada dinding: pemandangan, siluet berdua, atau hati, dipilih dari nomor bingkai.
function photo(u: number, v: number, w: number, h: number, kind: number): Rgb {
  const cu = u - w / 2;
  if (u < 2.5 || u > w - 2.5 || v < 2.5 || v > h - 2.5) return C.gold;
  if (u < 4.5 || u > w - 4.5 || v < 4.5 || v > h - 4.5) return C.white;
  const t = (v - 4.5) / (h - 9);
  if (kind % 3 === 0) {
    if (v < h * 0.3 + Math.sin(u * 0.45) * 2.5) return C.hill;
    return t > 0.7 && Math.hypot(cu - w * 0.2, v - h * 0.78) < h * 0.09 ? C.goldLight : C.sky;
  }
  if (kind % 3 === 1) {
    const a = Math.hypot(cu + w * 0.13, v - h * 0.62) < h * 0.13 || (Math.abs(cu + w * 0.13) < w * 0.13 && v < h * 0.5);
    const b = Math.hypot(cu - w * 0.13, v - h * 0.58) < h * 0.13 || (Math.abs(cu - w * 0.13) < w * 0.15 && v < h * 0.46);
    return a ? C.suit : b ? C.white : C.blush;
  }
  const x = cu / (w * 0.22);
  const y = (v - h * 0.5) / (h * 0.22);
  return (x * x + y * y - 1) ** 3 - x * x * y * y * y < 0 ? C.rose : C.cloth;
}

// Geometri aula, sama dengan interior-world.ts.
const H = { x0: 300, y0: 792.5, L: 1060, S: 260, wall: 118, stageL: 860, stageS: 200, stageZ: 26, stepL: 826, stepS: 110 };

function wallBase(z: number, top: number): Rgb | null {
  if (z < 12) return C.woodDark;
  if (z < 40) return C.wallDark;
  if (z < 43) return C.goldDark;
  if (z > top - 8) return C.wallLight;
  if (z > top - 11) return C.goldDark;
  return C.wall;
}

// Jendela lengkung: u dari tengah, v dari ambang bawah.
function windowAt(u: number, v: number, w: number, h: number): Rgb | null {
  const inside = Math.abs(u) <= w && v >= 0 && (v <= h - w || Math.hypot(u, v - (h - w)) <= w);
  if (!inside) return null;
  const inner = Math.abs(u) <= w - 3 && v >= 3 && (v <= h - w || Math.hypot(u, v - (h - w)) <= w - 3);
  if (!inner) return C.wood;
  if (Math.abs(u) < 1.3 || Math.abs(v - (h - w)) < 1.3) return C.wood;
  return (u + v * 0.7) % 26 < 8 && (u + v * 0.7) % 26 > -8 ? C.glassLight : C.glass;
}

function bannerAt(u: number, v: number, w: number, h: number): Rgb | null {
  if (Math.abs(u) > w || v < 0 || v > h) return null;
  // Ujung bawah berbentuk V.
  if (v < 10 - Math.abs(u) * (10 / w) + 0) return null;
  if (Math.abs(u) > w - 2 || v > h - 2) return C.gold;
  if (v > h - 5) return C.purpleDark;
  return flower(u, v - h * 0.55, w * 0.72, C.white, C.goldLight) ?? C.purple;
}

function drawHall() {
  const c = new Canvas(836, 471);
  const iso = new Iso(c, H.x0, H.y0);
  const { L, S, wall: W } = H;

  // Lempeng lantai dan sisi luarnya.
  iso.box(0, L, -S, S, -14, 0, C.floorA, C.slabDark, C.slab);

  // Lantai: petak catur dengan pantulan cahaya memanjang di tengah aula.
  const TILE = 52;
  iso.planeZ(0, 0, L, -S, S, (l, s, x, y) => {
    const a = Math.floor((l + 2) / TILE);
    const b = Math.floor((s + S) / TILE);
    const gl = (l + 2) % TILE;
    const gs = (s + S) % TILE;
    if (gl < 2 || gs < 2) return C.grout;
    const pool = 0.55 + 0.45 * Math.cos((Math.abs(s) / S) * Math.PI) * Math.cos(((l % 212) / 212) * Math.PI * 2);
    const base = (a + b) % 2 ? C.floorA : C.floorB;
    return pool + (bayer(x, y) - 0.5) * 0.4 > 0.92 ? C.floorC : base;
  });
  // Bayangan dinding belakang di lantai.
  iso.planeZ(0, 0, L, -S, -S + 22, (l, s, x, y) => (bayer(x, y) < 0.5 ? C.grout : null));
  iso.planeZ(0, L - 22, L, -S, S, (l, s, x, y) => (bayer(x, y) < 0.5 ? C.grout : null));

  // Karpet merah lurus dari pintu sampai tangga panggung, dengan bunga di sepanjang sumbunya.
  iso.planeZ(0, -22, H.stepL + 2, -46, 46, (l, s) => {
    const e = Math.abs(s);
    if (e > 43) return C.goldDark;
    if (e > 38 && e < 41) return C.gold;
    const k = ((l - 120) % 210 + 210) % 210 - 105;
    return flower(k, s, 19, C.goldLight, C.gold) ?? (Math.abs(((l + 22) % 44) - 22) < 1.5 && e < 34 ? C.redDark : C.red);
  });

  // Dinding belakang panjang (s = -S): jendela dan spanduk bergantian, bagian tengahnya dinding foto penuh.
  const BAY = L / 8;
  iso.planeS(-S, 0, L, 0, W, (l, z) => {
    const i = Math.min(7, Math.floor(l / BAY));
    const u = l - (i + 0.5) * BAY;
    const base = wallBase(z, W);
    if (Math.abs(u) > BAY / 2 - 7) return z < 12 ? C.woodDark : Math.abs(u) > BAY / 2 - 2 ? C.wallDark : z > W - 11 ? C.wallLight : C.wallLight;
    if (i >= 3 && i <= 5) {
      if (z < 45 || z > W - 12) return base;
      // Dinding foto: kolom bingkai rapat di atas panel kayu.
      const col = Math.floor((u + BAY / 2) / 30);
      const rowZ = z - 47;
      const row = rowZ < 25 ? 0 : 1;
      const pu = (u + BAY / 2) % 30;
      const pv = row ? rowZ - 26 : rowZ;
      if (pu > 1 && pu < 29 && pv > 0 && pv < 24) return photo(pu - 1, pv, 28, 24, i * 7 + col * 3 + row * 5);
      return C.woodLight;
    }
    if (i === 1 || i === 6) return bannerAt(u, z - 26, 20, 68) ?? base;
    if (z > 44) return windowAt(u, z - 48, 24, 44) ?? base;
    return base;
  });

  // Dinding ujung (l = L): latar pelaminan tepat di sumbu karpet, kanan dan kirinya sama.
  iso.planeL(L, -S, S, 0, W, (s, z) => {
    const base = wallBase(z, W);
    const a = Math.abs(s);
    if (a < 180) {
      if (z < 12) return C.woodDark;
      if (z > W - 11) return base;
      // Panel kayu terang dengan tirai di dua sisi.
      if (a > 138) return (Math.floor(a / 7) % 2 ? C.rose : C.blush);
      if (a > 134) return C.gold;
      return flower(s, z - 90, 15, C.gold, C.goldLight) ?? (Math.floor((s + 200) / 16) % 2 ? C.wallLight : C.cap);
    }
    if (a > 240 || (a > 180 && a < 186)) return z < 12 ? C.woodDark : C.wallLight;
    if (a > 186) return (z > 44 ? windowAt(a - 213, z - 48, 22, 44) : null) ?? base;
    return base;
  });

  // Tepi atas dinding.
  iso.box(-14, L + 14, -S - 14, -S, W, W + 8, C.cap, C.wallSide, C.wallDark);
  iso.box(L, L + 14, -S, S + 14, W, W + 8, C.cap, C.wallDark, C.wallSide);

  // Pilar di ujung dinding belakang.
  for (let i = 0; i <= 8; i++) {
    const l = i * BAY;
    iso.box(l - 7, l + 7, -S - 4, -S + 5, W + 8, W + 14, C.cap, C.wallSide, C.wallDark, C.goldDark);
  }

  // Panggung pelaminan di ujung sumbu.
  const { stageL: SL, stageS: SS, stageZ: SZ, stepL: TL, stepS: TS } = H;
  iso.box(SL, L, -SS, SS, 0, SZ, C.floorC, C.wood, C.woodDark);
  iso.planeZ(SZ, SL, L, -SS, SS, (l, s) => {
    if (l < SL + 3 || Math.abs(s) > SS - 3) return C.gold;
    const k = Math.abs(s);
    if (k < 140 && l < L - 8) {
      if (k > 136 || l < SL + 7) return C.goldDark;
      return flower(l - 950, s, 22, C.goldLight, C.gold) ?? C.red;
    }
    return (Math.floor(l / 26) + Math.floor(s / 26)) % 2 ? C.floorA : C.floorC;
  });
  // Dua anak tangga selebar karpet.
  iso.box(TL, SL, -TS, TS, 0, SZ / 2, C.red, C.redDark, C.redDark);
  iso.box(TL + 17, SL, -TS, TS, SZ / 2, SZ, C.red, C.redDark, C.redDark);

  // Sofa pengantin dan dua meja bunga mengapitnya.
  const sofa = (l0: number, l1: number, s0: number, s1: number, z0: number, z1: number) => iso.box(l0 + 0, l1, s0, s1, SZ + z0, SZ + z1, C.cloth, C.clothDark, C.cloth, C.goldDark);
  sofa(1022, 1042, -56, 56, 0, 14);
  sofa(1036, 1044, -56, 56, 14, 30);
  sofa(1022, 1042, -64, -54, 0, 20);
  sofa(1022, 1042, 54, 64, 0, 20);

  // Lengkung bunga di atas latar, simetris terhadap sumbu.
  for (let i = -12; i <= 12; i++) {
    const t = i / 12;
    const [x, y] = iso.xy(L - 3, t * 136, 36 + Math.sqrt(1 - t * t * 0.98) * 66);
    bush(c, x, y, i % 2 ? 6 : 7, 40 + Math.abs(i), Math.abs(i) % 3 ? C.white : C.blush, 0.2);
  }
  const onStage = new Iso(c, H.x0, H.y0 - SZ);
  for (const k of [-1, 1]) {
    planter(onStage, 1036, k * 92, 7, 1.15);
    planter(onStage, 1030, k * 172, 11, 1.2, C.blush);
    lantern(onStage, 880, k * 182);
  }
  // Tanaman di kaki tangga: dua pasang, tepat kanan dan kiri karpet.
  for (const k of [-1, 1]) planter(iso, TL - 14, k * 128, 21, 1.25);

  // Tanaman dan lentera di kaki dinding belakang, mengikuti pilar.
  for (let i = 1; i < 8; i++) {
    if (i === 4) continue;
    const l = i * BAY;
    if (i % 2) planter(iso, l, -S + 16, 100 + i, 1, i % 4 === 1 ? C.white : C.blush);
    else lantern(iso, l, -S + 14);
  }

  // Tembok rendah di sisi dekat kamera, supaya isi aula tetap terlihat. Kanan dan kiri pintu sama panjang.
  const LOW = 22;
  iso.box(0, L + 14, S, S + 14, -14, LOW, C.cap, C.wallDark, C.wallSide);
  iso.box(-14, 0, 58, S + 14, -14, LOW, C.cap, C.wallSide, C.wallDark);
  iso.box(-14, 0, -S - 14, -58, -14, LOW, C.cap, C.wallSide, C.wallDark);
  // Tiang pintu dan keset karpet keluar.
  for (const k of [-1, 1]) {
    iso.box(-16, 2, k * 62 - 8, k * 62 + 8, -14, 58, C.cap, C.wallSide, C.wallDark);
    const [x, y] = iso.xy(-7, k * 62, 66);
    c.disc(x, y, 3.5, () => C.goldLight);
    c.set(x, y - 1, C.white);
  }
  // Pot bunga di atas tembok rendah, berjarak rata.
  for (let i = 0; i <= 6; i++) {
    const l = 75 + i * 150;
    const lowIso = new Iso(c, H.x0, H.y0 - LOW);
    const [x, y] = lowIso.xy(l, S + 7, 7);
    bush(c, x, y, 7, 200 + i, i % 2 ? C.blush : C.white, 0.16);
  }
  return c.save("hall.png");
}

// Kios: karpet kecil, panel belakang bergambar, meja bertaplak, dan pot di dua sisi. Semua menghadap ke kanan bawah
// dengan bentuk yang sama, jadi bedanya ada di gambar panel dan benda di atas meja. Ukuran sama dengan BOOTH di
// interior-world.ts: titik pusat kios ada di (110, 150) pada gambar 220 x 200 piksel peta.
const BOOTH = { w: 220, h: 200, cx: 110, cy: 150 };
type Kind = "mempelai" | "galeri" | "cerita" | "acara" | "rsvp" | "angpao" | "dresscode" | "rundown" | "denah" | "imbauan" | "siaran" | "video" | "slot";
const inBox = (u: number, v: number, u0: number, u1: number, v0: number, v1: number) => u >= u0 && u <= u1 && v >= v0 && v <= v1;

function portrait(u: number, v: number, cu: number, bride: boolean): Rgb | null {
  const x = u - cu;
  if (!inBox(x, v, -13, 13, 32, 72)) return null;
  if (!inBox(x, v, -11, 11, 34, 70)) return C.gold;
  if (Math.hypot(x, v - 58) < 6.5) return v > 60 ? (bride ? C.woodDark : C.suit) : C.skin;
  if (bride) {
    if (v > 53 && Math.abs(x) < 8) return C.woodDark;
    return Math.abs(x) < 3 + (52 - v) * 0.32 && v < 52 ? C.white : C.blush;
  }
  if (Math.abs(x) < 8 && v < 51) return Math.abs(x) < 2 && v > 42 ? C.white : C.suit;
  return C.sky;
}

function panelArt(kind: Kind, u: number, v: number): Rgb | null {
  switch (kind) {
    case "mempelai": {
      const hx = u / 6;
      const hy = (v - 54) / 6;
      if ((hx * hx + hy * hy - 1) ** 3 - hx * hx * hy ** 3 < 0) return C.rose;
      return portrait(u, v, -32, false) ?? portrait(u, v, 32, true);
    }
    case "galeri": {
      if (!inBox(u, v, -52, 52, 30, 96)) return null;
      const pu = (u + 52) % 26;
      const pv = (v - 30) % 33;
      return pu > 1 && pu < 25 && pv > 1 && pv < 32 ? photo(pu - 1, pv - 1, 24, 30, Math.floor((u + 52) / 26) * 3 + Math.floor((v - 30) / 33) * 4 + 1) : C.woodLight;
    }
    case "cerita": {
      for (const [cu, n] of [[-36, 2], [0, 1], [36, 3]]) {
        if (inBox(u - cu, v, -14, 14, 42, 70)) return photo(u - cu + 14, v - 42, 28, 28, n);
      }
      return Math.abs(v - 36) < 1.5 && Math.abs(u) < 50 && Math.round(u / 5) % 2 === 0 ? C.goldDark : null;
    }
    case "acara": {
      if (!inBox(u, v, -28, 28, 34, 74)) return null;
      if (v > 64) return C.red;
      if (Math.abs(u) > 26 || v < 36) return C.goldDark;
      if ((u + 28) % 11 >= 7 || (v - 36) % 9 >= 6) return C.white;
      return u > 2 && u < 14 && v > 45 && v < 54 ? C.red : C.wallDark;
    }
    case "rsvp": {
      if (!inBox(u, v, -24, 24, 32, 74)) return null;
      if (Math.abs(u) > 22 || v < 34 || v > 72) return C.wood;
      const row = (v - 36) % 11;
      if (u < -12) return row < 5 && u > -18 ? C.leaf : C.white;
      return row > 1 && row < 4 ? C.stoneDark : C.white;
    }
    case "angpao": {
      if (!inBox(u, v, -30, 30, 36, 72)) return null;
      if (Math.abs(u) > 28 || v < 38 || v > 70) return C.goldDark;
      if (Math.hypot(u, v - 54) < 6) return C.gold;
      return 70 - v < 16 - Math.abs(u) * 0.55 ? C.redLight : C.red;
    }
    case "dresscode": {
      if (Math.abs(u + 30) < (v > 60 ? 9 : 11) && v > 36 && v < 68) return Math.abs(u + 30) < 2 && v > 54 ? C.white : C.suit;
      if (Math.abs(u - 30) < 3 + (66 - v) * 0.32 && v > 36 && v < 68) return C.red;
      if (inBox(u, v, -42, -18, 34, 70) || inBox(u, v, 18, 42, 34, 70)) return C.white;
      return inBox(u, v, -44, -16, 32, 72) || inBox(u, v, 16, 44, 32, 72) ? C.gold : null;
    }
    case "rundown": {
      const d = Math.hypot(u, v - 54);
      if (d >= 21) return null;
      if (d > 18) return C.goldDark;
      return (Math.abs(u) < 1.5 && v > 54 && v < 69) || (Math.abs(v - 54) < 1.5 && u > 0 && u < 11) ? C.line : C.white;
    }
    case "denah": {
      if (!inBox(u, v, -34, 34, 34, 74)) return null;
      if (Math.abs(u) > 32 || v < 36 || v > 72) return C.wood;
      if (Math.hypot(u - 4, v - 60) < 6 || (Math.abs(u - 4) < (v - 44) * 0.4 && v < 60 && v > 44)) return Math.hypot(u - 4, v - 60) < 2 ? C.white : C.red;
      if (Math.abs(u + v * 0.6 - 30) < 2.5) return C.goldLight;
      return (u + 34) % 24 < 2 || (v - 36) % 18 < 2 ? C.white : C.hill;
    }
    case "imbauan": {
      const d = Math.hypot(u, v - 54);
      if (d > 21) return null;
      if (d > 18) return C.goldDark;
      return Math.hypot(u, v - 65) < 3 || (Math.abs(u) < 2.5 && v > 42 && v < 58) ? C.white : C.purple;
    }
    case "siaran":
    case "video": {
      if (!inBox(u, v, -36, 36, 32, 76)) return null;
      if (Math.abs(u) > 34 || v < 34 || v > 74) return C.line;
      if (u > -8 && Math.abs(v - 54) < (11 - u) * 0.75) return C.white;
      return ((u - v + 300) % 30) > 22 ? C.screenLight : C.screen;
    }
    case "slot": {
      const d = Math.hypot(u, v - 54);
      return d < 12 + 9 * Math.abs(Math.cos(2.5 * Math.atan2(u, v - 54))) ? (d < 7 ? C.goldLight : C.gold) : null;
    }
  }
}

function tableProps(iso: Iso, kind: Kind) {
  const Z = 28;
  const book = (l: number, s: number) => {
    iso.box(l - 11, l + 11, s - 7, s + 7, Z, Z + 3, C.white, C.clothDark, C.clothDark);
    iso.planeZ(Z + 3, l - 1, l + 1, s - 7, s + 7, () => C.goldDark);
  };
  const gift = (l: number, s: number, tone: Rgb, h = 12) => {
    iso.box(l - 6, l + 6, s - 6, s + 6, Z, Z + h, tone, tone, tone);
    iso.planeL(l - 6, s - 1.5, s + 1.5, Z, Z + h, () => C.goldLight);
    iso.planeS(s + 6, l - 1.5, l + 1.5, Z, Z + h, () => C.goldLight);
    iso.planeZ(Z + h, l - 6, l + 6, s - 1.5, s + 1.5, () => C.goldLight);
    iso.planeZ(Z + h, l - 1.5, l + 1.5, s - 6, s + 6, () => C.goldLight);
  };
  if (kind === "rsvp" || kind === "cerita" || kind === "mempelai" || kind === "dresscode" || kind === "denah" || kind === "imbauan" || kind === "slot") book(-22, 8);
  if (kind === "rsvp") iso.box(24, 32, 4, 12, Z, Z + 10, C.gold, C.goldDark, C.gold);
  if (kind === "angpao") {
    gift(-30, 8, C.red, 13);
    gift(-14, 8, C.purple, 9);
    gift(30, 8, C.red, 10);
  }
  if (kind === "acara" || kind === "rundown") {
    iso.box(-34, -18, 2, 14, Z, Z + 2, C.white, C.clothDark, C.clothDark);
    iso.box(24, 34, 4, 12, Z, Z + 9, C.gold, C.goldDark, C.gold);
  }
  if (kind === "video" || kind === "siaran") {
    iso.box(24, 30, 4, 10, Z, Z + 7, C.line, C.line, C.suit, null);
    iso.box(20, 34, 2, 12, Z + 7, Z + 16, C.suit, C.line, C.suit);
  }
  if (kind === "galeri") {
    iso.box(-32, -20, 4, 12, Z, Z + 13, C.gold, C.goldDark, C.white);
    iso.box(20, 32, 4, 12, Z, Z + 10, C.gold, C.goldDark, C.white);
    book(-2, 8);
  }
  const [x, y] = iso.xy(2, 8, Z + 6);
  if (kind !== "galeri" && kind !== "angpao") bush(iso.c, x, y, 5, 300, C.blush, 0.3);
}

function drawBooth(kind: Kind, tone: Rgb, toneDark: Rgb) {
  const c = new Canvas(BOOTH.w / ART, BOOTH.h / ART);
  const iso = new Iso(c, BOOTH.cx, BOOTH.cy);
  // Kios galeri lebih tinggi dan penuh foto, supaya menyambung dengan dinding foto di belakangnya.
  const special = kind === "galeri";
  const PANEL = special ? 100 : 80;
  const HW = special ? 58 : 56;

  iso.planeZ(0, -72, 72, -36, 38, (l, s) => {
    if (Math.abs(l) > 69 || s < -33 || s > 35) return C.goldDark;
    return Math.abs(l) > 65 || s < -29 || s > 31 ? tone : Math.abs(l) > 62 || s < -26 || s > 28 ? C.gold : tone;
  });
  iso.box(-HW, HW, -30, -24, 0, PANEL, C.cap, C.woodDark, C.wall);
  iso.planeS(-24, -HW, HW, 0, PANEL, (u, v) => {
    if (Math.abs(u) > HW - 3 || v > PANEL - 3 || v < 4) return C.wood;
    return v < 30 ? C.woodLight : (panelArt(kind, u, v) ?? C.wall);
  });
  if (special) for (const k of [-1, 1]) lantern(iso, k * 64, -22);

  iso.box(-50, 50, -4, 22, 0, 28, C.cloth, C.clothDark, C.cloth);
  iso.planeS(22, -50, 50, 1, 28, (l, z, x) => {
    if (Math.abs(l) >= 15) return x % 3 === 0 ? C.clothDark : C.cloth;
    return z > 25 ? C.gold : (flower(l, z - 13, 10, C.goldLight, C.gold) ?? (Math.abs(l) > 13 ? C.gold : tone));
  });
  iso.planeZ(28, -15, 15, -4, 22, () => toneDark);
  iso.planeZ(28, -13, 13, -4, 22, () => tone);
  tableProps(iso, kind);
  for (const k of [-1, 1]) planter(iso, k * 62, 16, 500 + k, 1.05, k > 0 ? C.white : C.blush);
  return c.save(`booth-${kind}.png`);
}

const TONES: Record<Kind, [Rgb, Rgb]> = {
  mempelai: [C.red, C.redDark],
  galeri: [C.purple, C.purpleDark],
  cerita: [C.purple, C.purpleDark],
  acara: [C.red, C.redDark],
  rsvp: [C.red, C.redDark],
  angpao: [C.goldDark, C.wood],
  dresscode: [C.purple, C.purpleDark],
  rundown: [C.goldDark, C.wood],
  denah: [C.goldDark, C.wood],
  imbauan: [C.purple, C.purpleDark],
  siaran: [C.red, C.redDark],
  video: [C.red, C.redDark],
  slot: [C.goldDark, C.wood],
};

// Sprite: lembar 3 x 3 sel (baris menghadap bawah, samping, atas). Tiap sel diluruskan: kaki di dasar sel dan badan
// bagian atas di tengah, supaya gambar tidak melompat saat berganti langkah atau arah. Warna rambut, kulit, dan
// baju bisa diganti untuk membuat tamu yang berbeda-beda dari lembar yang sama. Ukuran sel sama dengan CELL di door.tsx.
const SPRITE = { w: 44, h: 64 };
type Recipe = { hair?: string; skin?: string; cloth?: string; clothLum?: number; band?: [number, number] };

function hsv(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) h = max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: h * 60, s: max ? d / max : 0, v: max / 255 };
}

function recolor(px: Uint8Array, w: number, x: number, y: number, top: number, height: number, r: Recipe) {
  const i = (y * w + x) * 4;
  const { h, s, v } = hsv(px[i], px[i + 1], px[i + 2]);
  const lum = (px[i] * 0.3 + px[i + 1] * 0.59 + px[i + 2] * 0.11) / 255;
  const tint = (t: Rgb, ref: number) => {
    px[i] = Math.min(255, t[0] * (lum / ref));
    px[i + 1] = Math.min(255, t[1] * (lum / ref));
    px[i + 2] = Math.min(255, t[2] * (lum / ref));
  };
  const warm = h < 50 || h > 340;
  if ((y - top) / height < 0.5 && warm && v < 0.56 && s > 0.2) {
    if (r.hair) tint(hex(r.hair), 0.2);
  } else if (warm && v > 0.62 && s > 0.28 && s < 0.68) {
    if (r.skin) tint(hex(r.skin), 0.76);
  } else if (r.cloth && r.band && h >= r.band[0] && h <= r.band[1]) {
    tint(hex(r.cloth), r.clothLum ?? 0.6);
  }
}

async function drawSheet(src: string, out: string, r: Recipe = {}) {
  const { data, info } = await sharp(SRC + src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = new Uint8Array(data);
  const W = info.width;
  const solid = (x: number, y: number) => px[(y * W + x) * 4 + 3] > 40;
  const cw = Math.floor(W / 3);
  const ch = Math.floor(info.height / 3);
  const cells: { x0: number; x1: number; y0: number; y1: number; cx: number }[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      let [x0, x1, y0, y1] = [1e9, -1, 1e9, -1];
      const ox = col * cw;
      const oy = row * ch;
      for (let y = oy; y < oy + ch; y++) {
        const hits: number[] = [];
        for (let x = ox; x < ox + cw; x++) if (solid(x, y)) hits.push(x);
        // Baris yang hanya berisi sisa bayangan tipis tidak dihitung.
        if (hits.length < 6) continue;
        x0 = Math.min(x0, hits[0]);
        x1 = Math.max(x1, hits[hits.length - 1]);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      }
      // Tengah badan: rata-rata kolom pada 40 persen bagian atas (kepala dan bahu).
      let sum = 0;
      let cnt = 0;
      for (let y = y0; y < y0 + (y1 - y0) * 0.4; y++) {
        for (let x = x0; x <= x1; x++) {
          if (solid(x, y)) {
            sum += x;
            cnt++;
          }
        }
      }
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (solid(x, y)) recolor(px, W, x, y, y0, y1 - y0 + 1, r);
      cells.push({ x0, x1, y0, y1, cx: sum / cnt });
    }
  }
  const tallest = Math.max(...cells.map((c) => c.y1 - c.y0 + 1));
  const reach = Math.max(...cells.map((c) => Math.max(c.cx - c.x0, c.x1 - c.cx)));
  const scale = Math.min((SPRITE.h - 3) / tallest, (SPRITE.w / 2 - 2) / reach);
  const full = sharp(Buffer.from(px), { raw: { width: W, height: info.height, channels: 4 } });
  const parts = await Promise.all(
    cells.map(async (c, i) => {
      const w = Math.max(1, Math.round((c.x1 - c.x0 + 1) * scale));
      const h = Math.max(1, Math.round((c.y1 - c.y0 + 1) * scale));
      const input = await full.clone().extract({ left: c.x0, top: c.y0, width: c.x1 - c.x0 + 1, height: c.y1 - c.y0 + 1 }).resize(w, h, { kernel: "lanczos2" }).png().toBuffer();
      return { input, left: (i % 3) * SPRITE.w + Math.round(SPRITE.w / 2 - (c.cx - c.x0) * scale), top: Math.floor(i / 3) * SPRITE.h + SPRITE.h - 2 - h };
    }),
  );
  const raw = await sharp({ create: { width: SPRITE.w * 3, height: SPRITE.h * 3, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite(parts).raw().toBuffer();
  await finishSprite(raw, SPRITE.w * 3, SPRITE.h * 3, out);
}

// Tepi dibuat keras lalu diberi garis gelap satu piksel, ciri pixel art.
async function finishSprite(raw: Buffer, w: number, h: number, out: string, colours = 28) {
  const px = new Uint8Array(raw);
  for (let i = 3; i < px.length; i += 4) px[i] = px[i] > 110 ? 255 : 0;
  const near = (a: number, b: number) => a >= 0 && b >= 0 && a < w && b < h && px[(b * w + a) * 4 + 3] > 0;
  const line: number[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!near(x, y) && (near(x - 1, y) || near(x + 1, y) || near(x, y - 1) || near(x, y + 1))) line.push((y * w + x) * 4);
    }
  }
  for (const i of line) px.set([...C.line, 255], i);
  await sharp(Buffer.from(px), { raw: { width: w, height: h, channels: 4 } }).png({ palette: true, colours, dither: 0, compressionLevel: 9 }).toFile(OUT + out);
}

async function drawSprites() {
  const tan: [number, number] = [15, 50];
  const blue: [number, number] = [190, 250];
  await drawSheet("male-guest.webp", "guest-male.png");
  await drawSheet("female-guest.webp", "guest-female.png");
  await drawSheet("npc-1.png", "npc-pria.png");
  await drawSheet("npc-1.png", "npc-pria-hijau.png", { cloth: "#4f7a5c", clothLum: 0.62, band: tan, skin: "#c98f62", hair: "#2a2230" });
  await drawSheet("npc-3.png", "npc-bapak.png");
  await drawSheet("npc-3.png", "npc-kakek.png", { cloth: "#7c3f46", clothLum: 0.33, band: blue, hair: "#c9c6c4" });
  await drawSheet("npc-3.png", "npc-anak.png", { cloth: "#d98a3d", clothLum: 0.33, band: blue, skin: "#d9a177" });
  await drawSheet("npc-2.png", "npc-wanita.png");
  await drawSheet("npc-2.png", "npc-gadis.png", { cloth: "#c9806d", clothLum: 0.72, band: blue, hair: "#7a4427", skin: "#e0a980" });
  await drawSheet("npc-2.png", "npc-ibu.png", { cloth: "#7f5a9e", clothLum: 0.72, band: blue, hair: "#8b8a90" });
  await drawSheet("npc-2.png", "npc-kebaya.png", { cloth: "#5f9a8a", clothLum: 0.72, band: blue, hair: "#5a3420", skin: "#b97f55" });
}

// Pengantin dan sampul: dikecilkan ke resolusi yang sama lalu warnanya dikurangi. Lambang di segitiga atap gedung
// ditutup warna dinding di sekitarnya supaya sampul tetap netral.
async function drawCouple() {
  const none = { r: 0, g: 0, b: 0, alpha: 0 };
  const raw = await sharp(SRC + "newlyweds.png").ensureAlpha().trim({ threshold: 5 }).resize(62, 60, { fit: "contain", position: "bottom", kernel: "lanczos2", background: none }).extend({ top: 1, bottom: 1, left: 1, right: 1, background: none }).raw().toBuffer();
  await finishSprite(raw, 64, 62, "couple-sprite.png", 40);
}

async function drawCover() {
  const { data, info } = await sharp(SRC + "cover-map.png").removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = new Uint8Array(data);
  const at = (x: number, y: number) => (y * info.width + x) * 3;
  const EMBLEM = { x: 1027, y: 254, rx: 34, ry: 28 };
  for (let y = EMBLEM.y - EMBLEM.ry; y <= EMBLEM.y + EMBLEM.ry; y++) {
    const from = at(EMBLEM.x - EMBLEM.rx - 26, y + 6);
    for (let x = EMBLEM.x - EMBLEM.rx; x <= EMBLEM.x + EMBLEM.rx; x++) {
      if (((x - EMBLEM.x) / EMBLEM.rx) ** 2 + ((y - EMBLEM.y) / EMBLEM.ry) ** 2 <= 1) px.set(px.subarray(from, from + 3), at(x, y));
    }
  }
  await sharp(Buffer.from(px), { raw: { width: info.width, height: info.height, channels: 3 } })
    .resize(836, 471, { kernel: "lanczos2" })
    .png({ palette: true, colours: 72, dither: 0, compressionLevel: 9 })
    .toFile(OUT + "cover-pixel.png");
}

await drawHall();
await Promise.all((Object.keys(TONES) as Kind[]).map((k) => drawBooth(k, TONES[k][0], TONES[k][1])));
await drawSprites();
await drawCouple();
await drawCover();
