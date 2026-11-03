// pnpm isometrik-assets
// Menggambar semua aset pixel art tema Isometrik ke public/img/rafi-kayla langsung per piksel: halaman gedung di tengah
// kota, gapura, aula, kios, tamu, dan pengantin. Gayanya piksel besar dengan garis cokelat tua dan warna hangat, berisi
// jalan aspal, trotoar, dan gedung bertingkat. Bebas lambang, dan layout aula simetris.
// Geometri di sini harus sama dengan src/components/invitation/gedung/world.ts dan interior-world.ts.
import sharp from "sharp";

const ROOT = new URL("../", import.meta.url).pathname.replace(/^\/([A-Z]:)/i, "$1");
const OUT = `${ROOT}public/img/rafi-kayla/`;

type Rgb = [number, number, number];
const hex = (c: string): Rgb => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];

const C = {
  line: hex("#2b1a1d"),
  dark: hex("#3f2626"),
  timber: hex("#573430"),
  wood: hex("#7a4a34"),
  woodLight: hex("#a06a44"),
  woodPale: hex("#c79660"),
  tile: hex("#b4553b"),
  tileLight: hex("#d4744a"),
  tilePale: hex("#e79a62"),
  tileDark: hex("#853b30"),
  plaster: hex("#ecd9b0"),
  plasterLight: hex("#f7eacb"),
  plasterDark: hex("#cfb78c"),
  stone: hex("#e4d3ad"),
  stoneLight: hex("#f1e4c4"),
  stoneMid: hex("#cdb995"),
  stoneDark: hex("#a08e75"),
  mortar: hex("#7d6c5c"),
  rock: hex("#8d7b6c"),
  rockDark: hex("#615249"),
  moss: hex("#c9b632"),
  mossLight: hex("#e8d84f"),
  mossMid: hex("#94a032"),
  leaf: hex("#5f8034"),
  leafDark: hex("#3b5a33"),
  leafDeep: hex("#2a4030"),
  water: hex("#3cb4a4"),
  waterLight: hex("#86e0c8"),
  waterDark: hex("#23807e"),
  glow: hex("#f8cf6a"),
  glowLight: hex("#fff0a8"),
  glowDark: hex("#d9913f"),
  wine: hex("#7c2f3c"),
  wineDark: hex("#5a2130"),
  wineLight: hex("#a8434a"),
  white: hex("#fff6e0"),
  cloth: hex("#f6e8c8"),
  clothDark: hex("#d6c196"),
  blush: hex("#f2b39b"),
  rose: hex("#d9626a"),
  teal: hex("#2f8f8a"),
  sky: hex("#a9dbdc"),
  hill: hex("#94a032"),
  suit: hex("#332a38"),
  screen: hex("#253a4c"),
  screenLight: hex("#4f8596"),
  goldBar: hex("#e0ae4c"),
  parking: hex("#6a6470"),
  asphalt: hex("#4b4650"),
  asphaltLight: hex("#5b5660"),
  asphaltDark: hex("#3b3640"),
  lane: hex("#ece2c6"),
  curb: hex("#b9ad99"),
  walk: hex("#cdbfa6"),
  walkDark: hex("#ad9f88"),
  concrete: hex("#d9ccb4"),
  concreteDark: hex("#a99c86"),
  glass: hex("#3e6d84"),
  glassLight: hex("#7cb4c0"),
  glassDark: hex("#2c4c60"),
  brick: hex("#a9553f"),
  brickDark: hex("#7f3f33"),
  steel: hex("#39424d"),
  steelLight: hex("#5a6672"),
};

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bayer = (x: number, y: number) => (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const hash = (x: number, y: number) => {
  const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
// Noise halus untuk tepi lumut dan petak rumput yang tidak beraturan.
function noise(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  return (hash(ix, iy) * (1 - u) + hash(ix + 1, iy) * u) * (1 - v) + (hash(ix, iy + 1) * (1 - u) + hash(ix + 1, iy + 1) * u) * v;
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
    const px = Math.floor(x);
    const py = Math.floor(y);
    if (px < 0 || py < 0 || px >= this.w || py >= this.h) return;
    this.data.set([c[0], c[1], c[2], 255], (py * this.w + px) * 4);
  }
  rect(x: number, y: number, w: number, h: number, c: Rgb) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
  }
  line(x0: number, y0: number, x1: number, y1: number, c: Rgb) {
    const n = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)));
    for (let i = 0; i <= n; i++) this.set(x0 + ((x1 - x0) * i) / (n || 1), y0 + ((y1 - y0) * i) / (n || 1), c);
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
  async save(file: string, colours = 128) {
    await sharp(Buffer.from(this.data), { raw: { width: this.w, height: this.h, channels: 4 } }).png({ compressionLevel: 9, palette: true, colours, dither: 0 }).toFile(OUT + file);
  }
}

type P3 = [number, number, number];

// Dunia isometrik 2:1. l sejajar sumbu jalan (ke kanan atas), s melintang (ke kanan bawah), z ke atas. Semua ukuran
// dalam piksel peta, (ox, oy) titik l = s = z = 0, art piksel peta per piksel gambar.
class Iso {
  readonly c: Canvas;
  readonly ox: number;
  readonly oy: number;
  readonly art: number;
  constructor(c: Canvas, ox: number, oy: number, art: number) {
    this.c = c;
    this.ox = ox;
    this.oy = oy;
    this.art = art;
  }
  xy(l: number, s: number, z = 0): [number, number] {
    return [(this.ox + l + s) / this.art, (this.oy + (s - l) / 2 - z) / this.art];
  }
  raised(z: number) {
    return new Iso(this.c, this.ox, this.oy - z, this.art);
  }
  // Mengisi jajar genjang dari titik a, ke b (arah u) dan ke d (arah v); fn menerima u dan v dalam 0..1.
  face(a: P3, b: P3, d: P3, fn: (u: number, v: number, x: number, y: number) => Rgb | null) {
    const [ax, ay] = this.xy(...a);
    const [bx, by] = this.xy(...b);
    const [dx, dy] = this.xy(...d);
    const ux = bx - ax;
    const uy = by - ay;
    const vx = dx - ax;
    const vy = dy - ay;
    const det = ux * vy - uy * vx;
    if (Math.abs(det) < 1e-6) return;
    const xs = [ax, bx, dx, bx + vx];
    const ys = [ay, by, dy, by + vy];
    for (let y = Math.max(0, Math.floor(Math.min(...ys))); y <= Math.min(this.c.h - 1, Math.ceil(Math.max(...ys))); y++) {
      for (let x = Math.max(0, Math.floor(Math.min(...xs))); x <= Math.min(this.c.w - 1, Math.ceil(Math.max(...xs))); x++) {
        const px = x + 0.5 - ax;
        const py = y + 0.5 - ay;
        const u = (px * vy - py * vx) / det;
        const v = (ux * py - uy * px) / det;
        if (u < 0 || u > 1 || v < 0 || v > 1) continue;
        const col = fn(u, v, x, y);
        if (col) this.c.set(x, y, col);
      }
    }
  }
  // Dinding di s tetap, menghadap kanan bawah.
  wallS(s: number, l0: number, l1: number, z0: number, z1: number, fn: (l: number, z: number, x: number, y: number) => Rgb | null) {
    this.face([l0, s, z0], [l1, s, z0], [l0, s, z1], (u, v, x, y) => fn(l0 + (l1 - l0) * u, z0 + (z1 - z0) * v, x, y));
  }
  // Dinding di l tetap, menghadap kiri bawah.
  wallL(l: number, s0: number, s1: number, z0: number, z1: number, fn: (s: number, z: number, x: number, y: number) => Rgb | null) {
    this.face([l, s0, z0], [l, s1, z0], [l, s0, z1], (u, v, x, y) => fn(s0 + (s1 - s0) * u, z0 + (z1 - z0) * v, x, y));
  }
  floor(z: number, l0: number, l1: number, s0: number, s1: number, fn: (l: number, s: number, x: number, y: number) => Rgb | null) {
    this.face([l0, s0, z], [l1, s0, z], [l0, s1, z], (u, v, x, y) => fn(l0 + (l1 - l0) * u, s0 + (s1 - s0) * v, x, y));
  }
  seg(a: P3, b: P3, c: Rgb = C.line) {
    const [x0, y0] = this.xy(...a);
    const [x1, y1] = this.xy(...b);
    this.c.line(x0, y0, x1, y1, c);
  }
  box(l0: number, l1: number, s0: number, s1: number, z0: number, z1: number, top: Rgb, left: Rgb, right: Rgb, outline: Rgb | null = C.line) {
    this.wallL(l0, s0, s1, z0, z1, () => left);
    this.wallS(s1, l0, l1, z0, z1, () => right);
    this.floor(z1, l0, l1, s0, s1, () => top);
    if (!outline) return;
    this.seg([l0, s0, z1], [l1, s0, z1], outline);
    this.seg([l1, s0, z1], [l1, s1, z1], outline);
    this.seg([l1, s1, z1], [l0, s1, z1], outline);
    this.seg([l0, s1, z1], [l0, s0, z1], outline);
    this.seg([l0, s0, z0], [l0, s1, z0], outline);
    this.seg([l0, s1, z0], [l1, s1, z0], outline);
    this.seg([l0, s0, z0], [l0, s0, z1], outline);
    this.seg([l0, s1, z0], [l0, s1, z1], outline);
    this.seg([l1, s1, z0], [l1, s1, z1], outline);
  }
}

function flower(u: number, v: number, r: number, petal: Rgb, core: Rgb): Rgb | null {
  const d = Math.hypot(u, v);
  if (d < r * 0.32) return core;
  return d < r * (0.62 + 0.38 * Math.abs(Math.cos(2.5 * Math.atan2(v, u)))) ? petal : null;
}

// Rumpun daun tampak samping: siluet gelap, lalu lapisan makin terang ke arah kiri atas dengan tepi bergerigi.
function bush(c: Canvas, cx: number, cy: number, r: number, seed: number, bloom: Rgb | null = null, tones: Rgb[] = [C.leafDark, C.leaf, C.mossMid, C.moss, C.mossLight]) {
  const rand = rng(seed * 7 + 3);
  const tufts = Math.round(8 + r * 1.2);
  const lobes = [
    { x: 0, y: 0, r: r * 0.8 },
    ...Array.from({ length: tufts }, () => {
      const a = rand() * Math.PI * 2;
      const d = r * (0.5 + rand() * 0.42);
      return { x: Math.cos(a) * d * 1.08, y: Math.sin(a) * d * 0.84, r: Math.max(1.6, r * (0.16 + rand() * 0.2)) };
    }),
  ];
  for (const b of lobes) c.disc(cx + b.x, cy + b.y, b.r + 1.2, () => C.leafDeep);
  for (const b of lobes) {
    c.disc(cx + b.x, cy + b.y, b.r, (dx, dy, x, y) => {
      const lit = 0.5 - ((b.y + dy) * 0.9 + (b.x + dx) * 0.5) / (r * 2) + (noise(x * 0.5 + seed, y * 0.5) - 0.5) * 0.7;
      return tones[Math.max(0, Math.min(tones.length - 1, Math.floor(lit * tones.length)))];
    });
  }
  if (!bloom) return;
  for (let i = 0; i < r * r * 0.14; i++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * r * 0.95;
    const x = Math.round(cx + Math.cos(a) * d);
    const y = Math.round(cy + Math.sin(a) * d);
    c.set(x, y, bloom);
    c.set(x + 1, y, bloom);
    c.set(x, y + 1, bloom);
    c.set(x + 1, y + 1, C.glow);
  }
}

// Paving batu besar berbentuk bata tidak rata, nadanya berbeda tiap keping.
function paving(l: number, s: number, size: number, seed = 0): Rgb {
  const row = Math.floor(s / size);
  const off = hash(row, seed) * size;
  const a = l + off;
  const col = Math.floor(a / (size * 1.4));
  const gl = a - col * size * 1.4;
  const gs = s - row * size;
  if (gl < 2.6 || gs < 2.6) return C.mortar;
  if (gl < 5.5 || gs < 5.5) return C.stoneDark;
  const t = hash(col + seed, row);
  if (t < 0.28) return C.stoneMid;
  return t > 0.8 ? C.stoneLight : C.stone;
}

// Pohon kota kecil di kotak tanam.
function streetTree(iso: Iso, l: number, s: number, seed: number) {
  iso.box(l - 15, l + 15, s - 15, s + 15, 0, 8, C.leafDark, C.curb, C.walkDark);
  const [x, y] = iso.xy(l, s, 8);
  const h = 42 / iso.art;
  for (let i = 0; i < h; i++) {
    c3(iso.c, x, y - i);
  }
  bush(iso.c, x, y - h - 8 / iso.art, 26 / iso.art, seed);
  bush(iso.c, x - 10 / iso.art, y - h + 4 / iso.art, 18 / iso.art, seed + 1);
  bush(iso.c, x + 11 / iso.art, y - h + 2 / iso.art, 18 / iso.art, seed + 2);
}
function c3(c: Canvas, x: number, y: number) {
  c.set(x - 2, y, C.line);
  c.set(x - 1, y, C.woodLight);
  c.set(x, y, C.wood);
  c.set(x + 1, y, C.timber);
  c.set(x + 2, y, C.line);
}

// Lampu jalan: tiang besi dengan lengan dan lampu menyala.
function streetLamp(iso: Iso, l: number, s: number, h = 112) {
  iso.box(l - 6, l + 6, s - 6, s + 6, 0, 8, C.steelLight, C.steel, C.asphaltDark);
  iso.box(l - 2.5, l + 2.5, s - 2.5, s + 2.5, 8, h, C.steelLight, C.steelLight, C.steel, null);
  iso.seg([l - 2.5, s + 2.5, 8], [l - 2.5, s + 2.5, h]);
  iso.box(l - 2.5, l + 2.5, s - 2, s + 24, h, h + 4, C.steelLight, C.steel, C.steel, C.line);
  iso.box(l - 6, l + 6, s + 14, s + 28, h - 5, h, C.glowLight, C.glow, C.glowLight, C.line);
}

// Mobil parkir: badan rendah dan kabin kaca, memanjang sepanjang arah l atau s.
function car(iso: Iso, l: number, s: number, tone: Rgb, alongS = false) {
  const hl = alongS ? 18 : 34;
  const hs = alongS ? 34 : 18;
  const dark = shade(tone, -0.28);
  iso.box(l - hl, l + hl, s - hs, s + hs, 5, 20, shade(tone, 0.12), tone, dark);
  const cl = alongS ? 15 : 20;
  const cs = alongS ? 20 : 15;
  iso.box(l - cl, l + cl, s - cs, s + cs, 20, 34, tone, C.glassLight, C.glass);
  // Roda.
  for (const [a, b] of alongS ? [[-hl, -18], [-hl, 18]] : [[-22, hl], [22, hl]]) {
    const [x, y] = iso.xy(l + a, s + b, 4);
    iso.c.disc(x, y, 3, () => C.line);
  }
}

const shade = (c: Rgb, t: number): Rgb => (t < 0 ? mix(c, C.line, -t) : mix(c, C.white, t));

type Block = "kantor" | "apartemen" | "ruko";
const BLOCK_TONES: [Rgb, Rgb, Rgb][] = [
  [C.concrete, C.concreteDark, C.stoneMid],
  [C.brick, C.brickDark, C.tileLight],
  [hex("#8f9aa0"), hex("#6e7a82"), hex("#a8b2b6")],
  [hex("#c9a77f"), hex("#9f8160"), hex("#dcc09a")],
  [hex("#7f6a78"), hex("#5e4e5c"), hex("#98828f")],
];

// Jendela gedung pada satu bidang: u mendatar, z dari tanah. Sebagian menyala hangat.
function facade(kind: Block, u: number, z: number, h: number, base: Rgb, seed: number): Rgb {
  if (z > h - 7) return C.concreteDark;
  if (kind === "kantor") {
    if (z < 26) return ((u + 400) % 34 < 3 ? C.steel : hash(Math.floor((u + 400) / 34), seed) > 0.5 ? C.glowDark : C.glass);
    const col = Math.floor((u + 400) / 22);
    const row = Math.floor(z / 22);
    if ((u + 400) % 22 < 2.5 || z % 22 < 2.5) return C.steel;
    const n = hash(col + seed, row);
    return n > 0.82 ? C.glow : n > 0.45 ? C.glass : C.glassDark;
  }
  if (kind === "apartemen") {
    const ku = (u + 400) % 40;
    const kz = z % 34;
    if (kz < 4) return shade(base, -0.2);
    if (ku > 8 && ku < 32 && kz > 10 && kz < 28) {
      if (ku < 11 || ku > 29 || kz < 13 || kz > 25) return C.line;
      return hash(Math.floor((u + 400) / 40) + seed, Math.floor(z / 34)) > 0.62 ? C.glow : C.glass;
    }
    return base;
  }
  // Ruko: lantai bawah toko kaca dengan tenda, lantai atas jendela.
  if (z < 34) {
    const ku = (u + 400) % 62;
    if (ku < 4) return C.timber;
    return z < 5 ? C.dark : hash(Math.floor((u + 400) / 62), seed) > 0.5 ? C.glow : C.glowDark;
  }
  if (z < 40) return Math.floor((u + 400) / 10) % 2 ? C.wine : C.cloth;
  const ku = (u + 400) % 31;
  const kz = (z - 40) % 34;
  if (ku > 8 && ku < 24 && kz > 8 && kz < 26) return ku < 10 || ku > 22 || kz < 10 ? C.line : C.glass;
  return base;
}

function cityBlock(iso: Iso, l0: number, l1: number, s0: number, s1: number, h: number, seed: number) {
  const kinds: Block[] = ["kantor", "apartemen", "ruko"];
  const kind = kinds[Math.floor(hash(seed, 3) * 3)];
  const [base, dark] = BLOCK_TONES[Math.floor(hash(seed, 9) * BLOCK_TONES.length)];
  iso.wallS(s1, l0, l1, 0, h, (l, z) => {
    const c = facade(kind, l - l0, z, h, shade(base, -0.08), seed);
    return c === C.glow ? C.glowDark : shade(c, -0.08);
  });
  iso.wallL(l0, s0, s1, 0, h, (s, z) => facade(kind, s - s0, z, h, base, seed + 1));
  iso.floor(h, l0, l1, s0, s1, (l, s) => (l < l0 + 6 || l > l1 - 6 || s < s0 + 6 || s > s1 - 6 ? C.concrete : Math.floor(l / 26 + s / 26) % 2 ? dark : shade(dark, -0.1)));
  iso.seg([l0, s0, h], [l1, s0, h]);
  iso.seg([l1, s0, h], [l1, s1, h]);
  iso.seg([l1, s1, h], [l0, s1, h]);
  iso.seg([l0, s1, h], [l0, s0, h]);
  iso.seg([l0, s1, 0], [l0, s1, h]);
  iso.seg([l0, s0, 0], [l0, s0, h]);
  iso.seg([l1, s1, 0], [l1, s1, h]);
  // Mesin dan tangki di atap.
  const al = l0 + (l1 - l0) * (0.25 + hash(seed, 5) * 0.4);
  const as = s0 + (s1 - s0) * (0.25 + hash(seed, 6) * 0.4);
  iso.box(al - 14, al + 14, as - 11, as + 11, h, h + 14, C.stoneLight, C.stoneMid, C.stoneDark);
  if (hash(seed, 7) > 0.55) {
    iso.box(al + 34, al + 54, as - 10, as + 10, h, h + 26, C.steelLight, C.steel, C.asphaltDark);
  }
}

// Tiang lentera batu beratap gelap.
function lanternPost(iso: Iso, l: number, s: number, h = 62) {
  iso.box(l - 11, l + 11, s - 11, s + 11, 0, 9, C.stoneMid, C.rock, C.stoneDark);
  iso.box(l - 6, l + 6, s - 6, s + 6, 9, h, C.stoneMid, C.rock, C.stoneDark);
  iso.box(l - 10, l + 10, s - 10, s + 10, h, h + 18, C.glowLight, C.glow, C.glowLight, C.dark);
  iso.box(l - 14, l + 14, s - 14, s + 14, h + 18, h + 24, C.timber, C.dark, C.timber);
  iso.box(l - 8, l + 8, s - 8, s + 8, h + 24, h + 32, C.timber, C.dark, C.timber);
}

function terracottaPot(iso: Iso, l: number, s: number, seed: number, size = 1, bloom: Rgb | null = null) {
  const c = iso.c;
  const [x, y] = iso.xy(l, s, 0);
  const r = (15 * size) / iso.art;
  const h = (22 * size) / iso.art;
  for (let i = 0; i <= h; i++) {
    const w = r * (0.75 + 0.3 * Math.sin((i / h) * Math.PI));
    for (let k = -w; k <= w; k++) {
      const t = (k + w) / (2 * w);
      c.set(x + k, y - i, t < 0.2 ? C.tilePale : t < 0.6 ? C.tileLight : t < 0.85 ? C.tile : C.tileDark);
    }
    c.set(x - w - 1, y - i, C.line);
    c.set(x + w + 1, y - i, C.line);
  }
  c.rect(x - r - 1, y - h - 1, 2 * r + 3, 2, C.tilePale);
  c.rect(x - r - 2, y - h - 2, 2 * r + 5, 1, C.line);
  c.rect(x - r, y + 1, 2 * r + 1, 1, C.line);
  bush(c, x, y - h - (16 * size) / iso.art, (15 * size) / iso.art, seed, bloom);
}

function archWindow(u: number, v: number, w: number, h: number, frame: Rgb = C.timber): Rgb | null {
  const inside = (m: number) => Math.abs(u) <= w - m && v >= m && (v <= h - w || Math.hypot(u, v - (h - w)) <= w - m);
  if (!inside(0)) return null;
  if (!inside(5)) return frame;
  if (Math.abs(u) < 2.2 || Math.abs(v - (h - w)) < 2.2) return frame;
  return (v + u * 0.4) / h > 0.55 ? C.glowLight : C.glow;
}

// Atap pelana terakota dengan bubungan sepanjang l. Genteng besar berbaris, ada lumut dan tepi bayangan.
// ---------------------------------------------------------------------------------------------------------------
// Halaman gedung di tengah kota. Sama dengan world.ts.
const TOWN = { x0: 480, y0: 740, art: 3, plazaL0: -120, plazaL1: 250, plazaS: 268, pathS: 70, doorL: 520, gateL: 270, gateS: 104, gateZ: 118, bl1: 770, bs: 190, wall: 250, lobby: 92 };

// Gerbang beton dan balok baja. Papan nama digambar di atas baloknya oleh door.tsx.
function drawGate(iso: Iso) {
  const { gateL: L, gateS: S, gateZ: Z } = TOWN;
  for (const k of [-1, 1]) {
    iso.box(L - 18, L + 18, k * S - 18, k * S + 18, 0, 12, C.concrete, C.concreteDark, C.stoneDark);
    iso.wallL(L - 12, k * S - 12, k * S + 12, 12, Z, (_, z) => (z % 30 < 3 ? C.steel : C.concrete));
    iso.wallS(k * S + 12, L - 12, L + 12, 12, Z, (l, z) => (z % 30 < 3 ? C.steel : Math.abs(l - L) < 3 && z > 30 ? C.glow : C.concreteDark));
    iso.seg([L - 12, k * S - 12, 12], [L - 12, k * S - 12, Z]);
    iso.seg([L - 12, k * S + 12, 12], [L - 12, k * S + 12, Z]);
    iso.seg([L + 12, k * S + 12, 12], [L + 12, k * S + 12, Z]);
  }
  iso.box(L - 14, L + 14, -S - 28, S + 28, Z, Z + 60, C.steelLight, C.steel, C.asphaltDark);
  iso.box(L - 18, L + 18, -S - 34, S + 34, Z + 60, Z + 66, C.concrete, C.concreteDark, C.stoneDark);
  // Lampu di bawah balok, dan kotak bunga di atasnya.
  iso.wallL(L - 14, -S - 28, S + 28, Z, Z + 4, () => C.glow);
  iso.box(L - 12, L + 12, -S - 26, S + 26, Z + 66, Z + 74, C.stoneLight, C.stoneMid, C.stoneDark);
  for (let s = -S - 14; s <= S + 14; s += 34) {
    const [x, y] = iso.xy(L, s, Z + 80);
    bush(iso.c, x, y, 3.8, Math.round(s + 500), Math.round(s) % 4 ? C.white : C.blush);
  }
}

// Gedung pernikahan: gedung kota bertingkat dengan lobi kaca menyala, dinding kaca di atasnya, dan kanopi pintu.
function mainHall(iso: Iso) {
  const { doorL: L0, bl1: L1, bs: S, wall: W, lobby: B } = TOWN;
  const upper = (u: number, z: number) => {
    if (z > W - 10) return C.concrete;
    if ((z - B) % 36 < 4) return C.concrete;
    if ((u + 800) % 40 < 3) return C.steel;
    const n = hash(Math.floor((u + 800) / 40), Math.floor((z - B) / 36));
    return n > 0.72 ? C.glow : n > 0.4 ? C.glassLight : C.glass;
  };
  iso.wallS(S, L0, L1, 0, W, (l, z) => {
    const u = l - L0;
    if (z < 8) return C.rockDark;
    if (z < B - 12) return u % 68 < 5 ? C.concreteDark : z > B - 30 ? C.glowLight : C.glow;
    if (z < B) return C.concreteDark;
    return shade(upper(u, z), -0.1);
  });
  iso.wallL(L0, -S, S, 0, W, (s, z) => {
    const a = Math.abs(s);
    if (z < 8) return C.rockDark;
    if (z < B - 12) {
      if (a < 62) {
        if (a < 2 || z > B - 20) return C.steel;
        if (a > 58) return C.steel;
        if (a > 6 && a < 10 && z > 32 && z < 54) return C.goldBar;
        return z > 60 ? C.glowLight : C.glow;
      }
      return (a + 800) % 58 < 5 ? C.concrete : z > B - 30 ? C.glowLight : C.glow;
    }
    if (z < B) return C.concrete;
    // Bidang tengah polos dengan bunga netral, kaca di kanan dan kirinya.
    if (a < 60 && z < W - 10) {
      if (a > 56) return C.concreteDark;
      return flower(s, z - (B + W) / 2, 26, C.white, C.glow) ?? C.wine;
    }
    return upper(a, z);
  });
  iso.seg([L0, S, 0], [L0, S, W]);
  iso.seg([L0, -S, 0], [L0, -S, W]);
  // Atap datar dengan tembok tepi dan mesin.
  iso.floor(W, L0, L1, -S, S, (l, s) => (l < L0 + 8 || l > L1 - 8 || Math.abs(s) > S - 8 ? C.stoneLight : Math.floor(l / 30 + s / 30) % 2 ? C.stoneDark : C.rock));
  iso.seg([L0, -S, W], [L1, -S, W]);
  iso.seg([L1, -S, W], [L1, S, W]);
  iso.seg([L1, S, W], [L0, S, W]);
  iso.seg([L0, S, W], [L0, -S, W]);
  iso.box(L1 - 140, L1 - 90, 40, 90, W, W + 24, C.stoneLight, C.stoneMid, C.stoneDark);
  iso.box(L1 - 240, L1 - 200, -110, -70, W, W + 34, C.steelLight, C.steel, C.asphaltDark);

  // Tangga, karpet, dan kanopi di atas pintu.
  iso.box(L0 - 34, L0, -96, 96, 0, 8, C.stoneLight, C.stoneMid, C.stoneDark);
  iso.box(L0 - 17, L0, -80, 80, 8, 16, C.stoneLight, C.stoneMid, C.stoneDark);
  iso.floor(9, L0 - 34, L0 - 17, -44, 44, (_, s) => (Math.abs(s) > 40 ? C.glowDark : C.wine));
  iso.floor(17, L0 - 17, L0, -44, 44, (_, s) => (Math.abs(s) > 40 ? C.glowDark : C.wineLight));
  iso.wallL(L0 - 34, -44, 44, 0, 8, () => C.wineDark);
  iso.wallL(L0 - 17, -44, 44, 8, 16, () => C.wineDark);
  for (const k of [-1, 1]) iso.box(L0 - 62, L0 - 50, k * 86 - 6, k * 86 + 6, 0, B + 4, C.concrete, C.concrete, C.concreteDark);
  iso.box(L0 - 70, L0, -100, 100, B + 4, B + 16, C.stoneLight, C.steel, C.asphaltDark);
  iso.wallL(L0 - 70, -100, 100, B + 4, B + 7, () => C.glow);
  for (const s of [-140, 140]) terracottaPot(iso, L0 - 20, s, Math.round(s + 300), 1.3, s > 0 ? C.white : C.blush);
  // Kotak tanam memanjang di sisi gedung.
  iso.box(L0 + 10, L1 - 10, S + 8, S + 30, 0, 12, C.leafDark, C.curb, C.walkDark);
  for (let l = L0 + 26; l < L1 - 10; l += 40) {
    const [x, y] = iso.xy(l, S + 19, 22);
    bush(iso.c, x, y, 7, Math.round(l), hash(l, 7) > 0.55 ? C.white : null);
  }
}

async function drawTown() {
  const W = 558;
  const H = 314;
  const c = new Canvas(W, H, C.walk);
  const iso = new Iso(c, TOWN.x0, TOWN.y0, TOWN.art);
  const { plazaL0: PL0, plazaL1: PL1, plazaS: PS, pathS: AS, doorL: DL, gateL: GL } = TOWN;
  const ROADS = { s1: [-470, -320], s2: [350, 490], l1: [-340, -190], l2: [880, 1020] };
  const within = (v: number, r: number[], m = 0) => v > r[0] - m && v < r[1] + m;

  // Tanah: aspal, garis jalan, zebra cross, trotoar, parkiran, dan jalan masuk berpaving.
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const a = (x + 0.5) * TOWN.art - TOWN.x0;
      const b = 2 * ((y + 0.5) * TOWN.art - TOWN.y0);
      const l = (a - b) / 2;
      const s = (a + b) / 2;
      const inS = within(s, ROADS.s1) || within(s, ROADS.s2);
      const inL = within(l, ROADS.l1) || within(l, ROADS.l2);
      if (inS || inL) {
        let col = noise(x * 0.5, y * 0.5) > 0.7 ? C.asphaltLight : noise(x * 0.31 + 9, y * 0.31) > 0.72 ? C.asphaltDark : C.asphalt;
        const midS = within(s, ROADS.s1) ? -395 : 420;
        const midL = within(l, ROADS.l1) ? -265 : 950;
        if (inS && !inL && Math.abs(s - midS) < 3 && ((l + 2000) % 90) < 48) col = C.lane;
        if (inL && !inS && Math.abs(l - midL) < 3 && ((s + 2000) % 90) < 48) col = C.lane;
        // Zebra cross di depan halaman.
        if (within(s, ROADS.s1) && l > 40 && l < 120 && (s + 2000) % 26 < 13) col = C.lane;
        if (within(s, ROADS.s2) && l > 300 && l < 380 && (s + 2000) % 26 < 13) col = C.lane;
        c.set(x, y, col);
        continue;
      }
      const curb = within(s, ROADS.s1, 5) || within(s, ROADS.s2, 5) || within(l, ROADS.l1, 5) || within(l, ROADS.l2, 5);
      if (curb) {
        c.set(x, y, C.curb);
        continue;
      }
      if (l > PL0 && l < PL1 && Math.abs(s) < PS) {
        // Parkiran: aspal halus dengan garis petak di kanan dan kiri.
        const e = Math.abs(s);
        let col = noise(x * 0.5, y * 0.5) > 0.74 ? C.asphaltLight : C.parking;
        if (Math.abs(e - 200) < 2.5) col = C.lane;
        if (e < 3 && ((l + 2000) % 70) < 36) col = C.lane;
        if (e > 200 && ((l + 2000) % 84) < 4) col = C.lane;
        if (l < PL0 + 5 || l > PL1 - 5 || e > PS - 5) col = C.curb;
        c.set(x, y, col);
        continue;
      }
      if ((l >= PL1 - 5 && l < DL && Math.abs(s) < AS + 12) || (l > DL - 80 && l < DL && Math.abs(s) < 130)) {
        c.set(x, y, Math.abs(s) < AS + 12 && Math.abs(s) > AS + 7 ? C.curb : paving(l, s, 40, 1));
        continue;
      }
      // Trotoar berpetak.
      c.set(x, y, (l + 2000) % 44 < 2.4 || (s + 2000) % 44 < 2.4 ? C.walkDark : C.walk);
    }
  }

  const items: { d: number; draw: () => void }[] = [];
  const at = (l: number, s: number, draw: () => void) => items.push({ d: s - l, draw });
  const block = (l0: number, l1: number, s0: number, s1: number, h: number, seed: number) => at((l0 + l1) / 2, (s0 + s1) / 2, () => cityBlock(iso, l0, l1, s0, s1, h, seed));

  // Deretan gedung di seberang jalan.
  [-230, 70, 370, 670, 970].forEach((l, i) => block(l, l + 270, -770, -510, 210 + hash(i, 1) * 130, 10 + i));
  [-230, 100, 430, 760].forEach((l, i) => block(l, l + 300, -1100, -820, 240 + hash(i, 2) * 140, 20 + i));
  [-280, 40, 340].forEach((s, i) => block(-640, -380, s, s + 280, 110 + hash(i, 3) * 60, 30 + i));
  [-300, 10].forEach((s, i) => block(1060, 1330, s, s + 280, 230 + hash(i, 4) * 90, 40 + i));
  [-140, 170, 480, 790].forEach((l, i) => block(l, l + 280, 530, 790, 70 + hash(i, 5) * 30, 50 + i));

  // Pohon dan lampu sepanjang trotoar.
  for (let l = -130, i = 0; l < 860; l += 165, i++) {
    if (i % 2) at(l, -290, () => streetLamp(iso, l, -290));
    else at(l, -290, () => streetTree(iso, l, -290, 60 + i));
    if (l < 500 && l > 240) continue;
    if (i % 2) at(l, 312, () => streetTree(iso, l, 312, 80 + i));
    else at(l, 312, () => streetLamp(iso, l, 312));
  }
  // Mobil parkir di petak kanan kiri halaman dan yang lewat di jalan.
  const tones = [hex("#b4553b"), hex("#3e6d84"), hex("#e4d3ad"), hex("#5f8034"), hex("#39424d"), hex("#7c2f3c")];
  [-78, 6, 90, 174].forEach((l, i) => {
    if (i !== 1) at(l + 20, -232, () => car(iso, l + 20, -232, tones[i], true));
    if (i !== 2) at(l + 20, 232, () => car(iso, l + 20, 232, tones[(i + 3) % tones.length], true));
  });
  at(620, -360, () => car(iso, 620, -360, tones[3]));
  at(240, -435, () => car(iso, 240, -435, tones[1]));
  at(620, 385, () => car(iso, 620, 385, tones[5]));
  at(-300, 80, () => car(iso, -300, 80, tones[2], true));

  // Air mancur kecil di taman samping jalan masuk.
  at(385, 245, () => {
    const [x, y] = iso.xy(385, 245, 0);
    const rx = 25;
    const ry = 13;
    const ring = (dx: number, dy: number, grow: number) => (dx / (rx + grow)) ** 2 + (dy / (ry + grow / 2)) ** 2 <= 1;
    for (let j = -ry - 6; j <= ry + 6; j++) {
      for (let i = -rx - 6; i <= rx + 6; i++) {
        if (!ring(i, j, 5)) continue;
        if (!ring(i, j, 4)) c.set(x + i, y + j, C.line);
        else if (!ring(i, j, 0)) c.set(x + i, y + j, j > 0 ? C.concreteDark : C.stoneLight);
        else if (!ring(i, j, -1)) c.set(x + i, y + j, C.waterDark);
        else c.set(x + i, y + j, noise((x + i) * 0.22, (y + j) * 0.5) > 0.68 ? C.waterLight : j < -ry * 0.45 ? C.waterDark : C.water);
      }
    }
    c.rect(x - 2, y - 12, 4, 12, C.concreteDark);
    c.disc(x, y - 13, 3, () => C.waterLight);
  });

  // Kotak bunga sepanjang jalan masuk, dan pot di kaki gerbang.
  for (let l = PL1 + 40; l < DL - 90; l += 44) {
    for (const k of [-1, 1]) {
      const s = k * (AS + 24);
      at(l, s, () => {
        iso.box(l - 18, l + 18, s - 9, s + 9, 0, 10, C.leafDark, C.curb, C.walkDark);
        const [x, y] = iso.xy(l, s, 18);
        bush(c, x, y, 7, Math.round(l) + k, hash(l, k) > 0.5 ? (k > 0 ? C.white : C.blush) : null);
      });
    }
  }
  at(440, -165, () => streetTree(iso, 440, -165, 89));
  at(DL, 0, () => mainHall(iso));
  at(GL, 0, () => drawGate(iso));

  items.sort((a, b) => a.d - b.d);
  for (const it of items) it.draw();
  await c.save("town.png", 110);
  // Gerbang digambar sekali lagi di atas karakter saat dia lewat di belakangnya, jadi disimpan sebagai lapisan sendiri.
  const front = new Canvas(W, H);
  drawGate(new Iso(front, TOWN.x0, TOWN.y0, TOWN.art));
  await front.save("town-gate.png", 48);
}

// ---------------------------------------------------------------------------------------------------------------
// Aula. Sama dengan interior-world.ts.
const HALL_ART = 2.4;
const H = { x0: 460, y0: 1300, L: 1500, S: 400, wall: 150, stageL: 1270, stageS: 280, stageZ: 26, stepL: 1236, stepS: 130, w: 2420, h: 1540 };

function hallWall(z: number, top: number): Rgb {
  if (z < 10) return C.rockDark;
  if (z < 40) return (Math.floor(z / 8) % 2 ? C.wood : C.timber);
  if (z < 44) return C.dark;
  if (z > top - 7) return C.dark;
  if (z > top - 12) return C.wood;
  return C.plaster;
}

function bannerAt(u: number, v: number, w: number, h: number): Rgb | null {
  if (Math.abs(u) > w || v < 0 || v > h) return null;
  if (v < 10 - Math.abs(u) * (10 / w)) return null;
  if (Math.abs(u) > w - 2.4 || v > h - 2.4) return C.glowDark;
  if (v > h - 6) return C.wineDark;
  return flower(u, v - h * 0.56, w * 0.74, C.white, C.glow) ?? C.wine;
}

function photo(u: number, v: number, w: number, h: number, kind: number): Rgb {
  const cu = u - w / 2;
  if (u < 2.8 || u > w - 2.8 || v < 2.8 || v > h - 2.8) return C.timber;
  if (u < 5 || u > w - 5 || v < 5 || v > h - 5) return C.cloth;
  if (kind % 3 === 0) {
    if (v < h * 0.34 + Math.sin(u * 0.45) * 2.5) return C.hill;
    return Math.hypot(cu - w * 0.15, v - h * 0.72) < h * 0.1 ? C.glow : C.sky;
  }
  if (kind % 3 === 1) {
    const a = Math.hypot(cu + w * 0.13, v - h * 0.62) < h * 0.13 || (Math.abs(cu + w * 0.13) < w * 0.13 && v < h * 0.5);
    const b = Math.hypot(cu - w * 0.13, v - h * 0.58) < h * 0.13 || (Math.abs(cu - w * 0.13) < w * 0.15 && v < h * 0.46);
    return a ? C.suit : b ? C.white : C.blush;
  }
  const x = cu / (w * 0.24);
  const y = (v - h * 0.5) / (h * 0.24);
  return (x * x + y * y - 1) ** 3 - x * x * y * y * y < 0 ? C.rose : C.cloth;
}

function hallFloor(l: number, s: number, x: number, y: number): Rgb {
  const base = paving(l + 300, s + 300, 46, 5);
  const light = Math.cos((s / H.S) * Math.PI * 0.5) * (0.6 + 0.4 * Math.cos((l / 212) * Math.PI * 2));
  if (base === C.mortar || base === C.stoneDark) return base;
  if (light + (bayer(x, y) - 0.5) * 0.3 > 0.82) return C.stoneLight;
  return base;
}

// Karpet tenun merah dengan pola segitiga di tepinya.
function carpet(l: number, s: number): Rgb {
  const e = Math.abs(s);
  if (e > 43) return C.dark;
  if (e > 37) return ((l + 2000) % 16) / 16 < (e - 37) / 6 ? C.wineDark : C.tilePale;
  if (e > 34) return C.tilePale;
  const k = (((l - 120) % 210) + 210) % 210 - 105;
  return flower(k, s, 20, C.tilePale, C.glow) ?? (Math.abs(((l + 22) % 44) - 22) < 1.6 && e < 30 ? C.wineDark : C.wine);
}

// Kota di balik dinding belakang dan dinding ujung: jalan dan gedung bertingkat. Sisi dekat kamera tetap kosong.
function hallCity(c: Canvas, iso: Iso) {
  const { L, S } = H;
  const CL = 400;
  const CS = 340;
  const GAP = 96;
  const behind = (l: number, s: number) => s < -S - 16 || l > L + 16;
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      const a = (x + 0.5) * HALL_ART - H.x0;
      const b = 2 * ((y + 0.5) * HALL_ART - H.y0);
      const l = (a - b) / 2;
      const s = (a + b) / 2;
      if (!behind(l, s)) continue;
      const kl = ((l % CL) + CL) % CL;
      const ks = ((s % CS) + CS) % CS;
      if (kl < GAP || ks < GAP) {
        let col = noise(x * 0.5, y * 0.5) > 0.72 ? C.asphaltLight : C.asphalt;
        if (kl >= GAP && Math.abs(ks - GAP / 2) < 2.5 && ((l + 8000) % 80) < 40) col = C.lane;
        if (ks >= GAP && Math.abs(kl - GAP / 2) < 2.5 && ((s + 8000) % 80) < 40) col = C.lane;
        c.set(x, y, col);
      } else {
        c.set(x, y, kl < GAP + 6 || ks < GAP + 6 ? C.curb : (l + 8000) % 40 < 2.4 || (s + 8000) % 40 < 2.4 ? C.walkDark : C.walk);
      }
    }
  }
  const blocks: { d: number; draw: () => void }[] = [];
  for (let i = -6; i < 12; i++) {
    for (let j = -10; j < 8; j++) {
      const l0 = i * CL + GAP + 22;
      const l1 = (i + 1) * CL - 22;
      const s0 = j * CS + GAP + 22;
      const s1 = (j + 1) * CS - 22;
      // Hanya blok yang utuh di belakang dinding.
      if (!(s1 < -S - 30 || l0 > L + 30)) continue;
      const seed = (i + 20) * 31 + (j + 20) * 7;
      const h = 150 + hash(i, j) * 210;
      const [x0, yb] = iso.xy(l0, s1, 0);
      const [x1] = iso.xy(l1, s0, 0);
      const [, yt] = iso.xy(l1, s0, h + 40);
      if (x1 < 0 || x0 > c.w || yb < 0 || yt > c.h) continue;
      blocks.push({ d: (s0 + s1) / 2 - (l0 + l1) / 2, draw: () => cityBlock(iso, l0, l1, s0, s1, h, seed) });
    }
  }
  blocks.sort((a, b) => a.d - b.d);
  for (const b of blocks) b.draw();
}

async function drawHall() {
  const c = new Canvas(Math.round(H.w / HALL_ART), Math.round(H.h / HALL_ART));
  const iso = new Iso(c, H.x0, H.y0, HALL_ART);
  const { L, S, wall: W } = H;
  hallCity(c, iso);

  iso.box(0, L, -S, S, -18, 0, C.stone, C.rockDark, C.rock);
  iso.floor(0, 0, L, -S, S, hallFloor);
  // Bayangan dinding di lantai.
  iso.floor(0, 0, L, -S, -S + 30, (l, s, x, y) => (bayer(x, y) < 0.55 ? C.stoneDark : null));
  iso.floor(0, L - 30, L, -S, S, (l, s, x, y) => (bayer(x, y) < 0.55 ? C.stoneDark : null));
  iso.floor(0, -24, H.stepL + 2, -46, 46, carpet);

  // Dinding belakang: tiang kayu, jendela lengkung, spanduk, dan bagian tengahnya dinding foto penuh.
  const BAY = L / 8;
  iso.wallS(-S, 0, L, 0, W, (l, z) => {
    const i = Math.min(7, Math.floor(l / BAY));
    const u = l - (i + 0.5) * BAY;
    const base = hallWall(z, W);
    if (Math.abs(u) > BAY / 2 - 10) return z < 10 ? C.rockDark : Math.abs(u) > BAY / 2 - 3 ? C.dark : C.wood;
    if (i >= 3 && i <= 4) {
      if (z < 46 || z > W - 13) return base;
      const pu = (u + BAY / 2) % 34;
      const zz = z - 47;
      const row = Math.floor(zz / 30);
      const pv = zz % 30;
      if (pu > 1 && pu < 33 && pv > 1 && pv < 29) return photo(pu - 1, pv - 1, 32, 28, i * 7 + Math.floor((u + BAY / 2) / 34) * 3 + row * 5);
      return C.timber;
    }
    if (i === 1 || i === 6) return bannerAt(u, z - 34, 28, 92) ?? base;
    return z > 44 ? (archWindow(u, z - 48, 34, 82) ?? base) : base;
  });

  // Dinding ujung: latar pelaminan di sumbu karpet, jendela di kanan dan kirinya.
  iso.wallL(L, -S, S, 0, W, (s, z) => {
    const a = Math.abs(s);
    const base = hallWall(z, W);
    if (a < 210) {
      if (z < 10) return C.rockDark;
      if (z > W - 12) return base;
      if (a > 174) return Math.floor(a / 7) % 2 ? C.wine : C.wineLight;
      if (a > 170) return C.glowDark;
      return flower(s, z - 112, 18, C.glow, C.white) ?? (Math.floor((s + 300) / 18) % 2 ? C.plasterLight : C.plaster);
    }
    if (a > 386 || a < 222) return z < 10 ? C.rockDark : a > 386 || a < 216 ? C.wood : C.dark;
    return z > 44 ? (archWindow(a - 304, z - 48, 44, 82) ?? base) : base;
  });

  // Balok atas dinding, seperti atap yang dibuka.
  iso.box(-16, L + 16, -S - 16, -S, W, W + 8, C.timber, C.dark, C.wood);
  iso.box(L, L + 16, -S, S + 16, W, W + 8, C.timber, C.wood, C.dark);

  // Panggung kayu.
  const { stageL: SL, stageS: SS, stageZ: SZ, stepL: TL, stepS: TS } = H;
  iso.box(SL, L, -SS, SS, 0, SZ, C.woodPale, C.timber, C.dark);
  iso.floor(SZ, SL, L, -SS, SS, (l, s) => {
    if (l < SL + 3 || Math.abs(s) > SS - 3) return C.dark;
    const k = Math.abs(s);
    if (k < 190 && l < L - 8) {
      if (k > 184 || l < SL + 8) return k > 187 || l < SL + 5 ? C.dark : C.tilePale;
      return flower(l - (SL + L) / 2, s, 26, C.tilePale, C.glow) ?? C.wine;
    }
    const b = Math.floor((s + 900) / 22);
    return (l + b * 37) % 90 < 3 || (s + 900) % 22 < 2 ? C.wood : b % 3 ? C.woodPale : C.woodLight;
  });
  iso.box(TL, SL, -TS, TS, 0, SZ / 2, C.wineLight, C.wineDark, C.wineDark);
  iso.box(TL + 17, SL, -TS, TS, SZ / 2, SZ, C.wine, C.wineDark, C.wineDark);

  // Sofa kayu berbantal krem.
  const onStage = iso.raised(SZ);
  onStage.box(L - 38, L - 18, -56, 56, 0, 14, C.cloth, C.clothDark, C.cloth);
  onStage.box(L - 24, L - 16, -56, 56, 14, 30, C.cloth, C.clothDark, C.cloth);
  onStage.box(L - 38, L - 18, -64, -54, 0, 20, C.woodLight, C.wood, C.woodLight);
  onStage.box(L - 38, L - 18, 54, 64, 0, 20, C.woodLight, C.wood, C.woodLight);

  // Lengkung sulur berbunga, simetris terhadap sumbu.
  for (let i = -14; i <= 14; i++) {
    const t = i / 14;
    const [x, y] = iso.xy(L - 3, t * 164, 44 + Math.sqrt(1 - t * t * 0.98) * 84);
    bush(c, x, y, i % 2 ? 6.5 : 8, 40 + Math.abs(i), Math.abs(i) % 3 ? C.white : C.blush);
  }
  for (const k of [-1, 1]) {
    terracottaPot(onStage, L - 24, k * 110, 7 + k, 1.25, C.white);
    terracottaPot(onStage, L - 30, k * 240, 11 + k, 1.4, C.blush);
    lanternPost(onStage, SL + 20, k * 262, 40);
    terracottaPot(iso, TL - 14, k * 150, 21 + k, 1.4, C.white);
  }

  // Pot dan lentera di kaki dinding belakang, mengikuti tiang.
  for (let i = 1; i < 8; i++) {
    if (i === 4) continue;
    const l = i * BAY;
    if (i % 2) terracottaPot(iso, l, -S + 20, 100 + i, 1.15, i % 4 === 1 ? C.white : C.blush);
    else lanternPost(iso, l, -S + 18, 44);
  }

  // Tembok batu rendah di sisi dekat kamera, supaya isi aula tetap terlihat. Kanan dan kiri pintu sama panjang.
  const LOW = 22;
  const brick = (a: number, z: number): Rgb => ((Math.floor((z + 40) / 11) * 11 + a + 2000) % 34 < 3 || (z + 40) % 11 < 2 ? C.rockDark : hash(Math.floor(a / 34), Math.floor((z + 40) / 11)) > 0.5 ? C.stoneDark : C.rock);
  iso.box(0, L + 16, S, S + 16, -18, LOW, C.stoneMid, C.rock, C.rock);
  iso.wallS(S + 16, 0, L + 16, -18, LOW, (l, z) => brick(l, z));
  for (const [a, b] of [[58, S + 16], [-S - 16, -58]]) {
    iso.box(-16, 0, a, b, -18, LOW, C.stoneMid, C.rock, C.rockDark);
    iso.wallL(-16, a, b, -18, LOW, (s, z) => brick(s, z));
  }
  for (const k of [-1, 1]) {
    iso.box(-18, 2, k * 62 - 9, k * 62 + 9, -18, 58, C.stoneMid, C.stone, C.stoneDark);
    iso.box(-20, 4, k * 62 - 12, k * 62 + 12, 58, 64, C.timber, C.dark, C.timber);
    const [x, y] = iso.xy(-8, k * 62, 72);
    c.disc(x, y, 3.2, () => C.glow);
    c.set(x - 1, y - 1, C.glowLight);
  }
  const low = iso.raised(LOW);
  for (let i = 0; i <= 9; i++) {
    const [x, y] = low.xy(75 + i * 150, S + 8, 6);
    bush(c, x, y, 7.5, 200 + i, i % 2 ? C.blush : C.white);
  }
  await c.save("hall.png", 160);
}

// ---------------------------------------------------------------------------------------------------------------
// Kios tanpa atap: karpet, papan gambar berbingkai kayu, dan meja bertaplak. Semua menghadap ke kanan bawah dengan
// bentuk yang sama. Ukuran sama dengan BOOTH di booth.tsx: titik pusat kios ada di (108, 158) pada gambar 216 x 216.
const BOOTH = { w: 216, h: 216, cx: 108, cy: 158 };
type Kind = "mempelai" | "galeri" | "cerita" | "acara" | "rsvp" | "angpao" | "dresscode" | "rundown" | "denah" | "imbauan" | "siaran" | "video" | "slot";
const inBox = (u: number, v: number, u0: number, u1: number, v0: number, v1: number) => u >= u0 && u <= u1 && v >= v0 && v <= v1;

function portrait(u: number, v: number, cu: number, bride: boolean): Rgb | null {
  const x = u - cu;
  if (!inBox(x, v, -14, 14, 30, 74)) return null;
  if (!inBox(x, v, -11, 11, 33, 71)) return C.timber;
  if (Math.hypot(x, v - 58) < 7.5) return v > 60 ? (bride ? C.wood : C.suit) : C.blush;
  if (bride) {
    if (v > 52 && Math.abs(x) < 9) return C.wood;
    return Math.abs(x) < 3 + (52 - v) * 0.34 && v < 52 ? C.white : C.sky;
  }
  if (Math.abs(x) < 9 && v < 51) return Math.abs(x) < 2.4 && v > 42 ? C.white : C.suit;
  return C.sky;
}

function panelArt(kind: Kind, u: number, v: number): Rgb | null {
  switch (kind) {
    case "mempelai": {
      const hx = u / 7;
      const hy = (v - 54) / 7;
      if ((hx * hx + hy * hy - 1) ** 3 - hx * hx * hy ** 3 < 0) return C.rose;
      return portrait(u, v, -32, false) ?? portrait(u, v, 32, true);
    }
    case "galeri": {
      if (!inBox(u, v, -52, 52, 28, 78)) return null;
      const pu = (u + 52) % 26;
      const pv = (v - 28) % 25;
      return pu > 1 && pu < 25 && pv > 1 && pv < 24 ? photo(pu - 1, pv - 1, 24, 23, Math.floor((u + 52) / 26) * 3 + Math.floor((v - 28) / 25) * 4 + 1) : C.timber;
    }
    case "cerita": {
      for (const [cu, n] of [[-36, 2], [0, 1], [36, 3]]) {
        if (inBox(u - cu, v, -15, 15, 40, 70)) return photo(u - cu + 15, v - 40, 30, 30, n);
      }
      return Math.abs(v - 34) < 2 && Math.abs(u) < 50 && Math.round(u / 6) % 2 === 0 ? C.timber : null;
    }
    case "acara": {
      if (!inBox(u, v, -30, 30, 30, 76)) return null;
      if (v > 64) return C.wine;
      if (Math.abs(u) > 28 || v < 32) return C.timber;
      if ((u + 30) % 12 >= 8 || (v - 34) % 10 >= 7) return C.white;
      return u > 3 && u < 16 && v > 44 && v < 55 ? C.rose : C.plasterDark;
    }
    case "rsvp": {
      if (!inBox(u, v, -26, 26, 30, 76)) return null;
      if (Math.abs(u) > 24 || v < 32 || v > 74) return C.wood;
      const row = (v - 35) % 12;
      if (u < -13) return row < 6 && u > -20 ? C.leaf : C.white;
      return row > 1 && row < 5 ? C.stoneDark : C.white;
    }
    case "angpao": {
      if (!inBox(u, v, -32, 32, 34, 74)) return null;
      if (Math.abs(u) > 30 || v < 36 || v > 72) return C.glowDark;
      if (Math.hypot(u, v - 54) < 7) return C.glow;
      return 72 - v < 17 - Math.abs(u) * 0.55 ? C.wineLight : C.wine;
    }
    case "dresscode": {
      if (Math.abs(u + 30) < (v > 60 ? 9 : 12) && v > 36 && v < 68) return Math.abs(u + 30) < 2.4 && v > 54 ? C.white : C.suit;
      if (Math.abs(u - 30) < 4 + (66 - v) * 0.36 && v > 36 && v < 68) return C.rose;
      if (inBox(u, v, -44, -16, 33, 71) || inBox(u, v, 16, 44, 33, 71)) return C.white;
      return inBox(u, v, -47, -13, 30, 74) || inBox(u, v, 13, 47, 30, 74) ? C.timber : null;
    }
    case "rundown": {
      const d = Math.hypot(u, v - 54);
      if (d >= 22) return null;
      if (d > 18.5) return C.timber;
      return (Math.abs(u) < 2 && v > 54 && v < 70) || (Math.abs(v - 54) < 2 && u > 0 && u < 12) ? C.line : C.white;
    }
    case "denah": {
      if (!inBox(u, v, -36, 36, 30, 76)) return null;
      if (Math.abs(u) > 34 || v < 32 || v > 74) return C.wood;
      if (Math.hypot(u - 4, v - 60) < 7 || (Math.abs(u - 4) < (v - 42) * 0.4 && v < 60 && v > 42)) return Math.hypot(u - 4, v - 60) < 2.4 ? C.white : C.rose;
      if (Math.abs(u + v * 0.6 - 30) < 3) return C.glowLight;
      return (u + 36) % 24 < 2.4 || (v - 32) % 18 < 2.4 ? C.white : C.hill;
    }
    case "imbauan": {
      const d = Math.hypot(u, v - 54);
      if (d > 22) return null;
      if (d > 18.5) return C.timber;
      return Math.hypot(u, v - 66) < 3.4 || (Math.abs(u) < 3 && v > 42 && v < 59) ? C.white : C.teal;
    }
    case "siaran":
    case "video": {
      if (!inBox(u, v, -38, 38, 30, 78)) return null;
      if (Math.abs(u) > 35 || v < 33 || v > 75) return C.line;
      if (u > -8 && Math.abs(v - 54) < (12 - u) * 0.75) return C.white;
      return (u - v + 300) % 30 > 22 ? C.screenLight : C.screen;
    }
    case "slot": {
      const d = Math.hypot(u, v - 54);
      return d < 13 + 9 * Math.abs(Math.cos(2.5 * Math.atan2(u, v - 54))) ? (d < 7 ? C.glowLight : C.glowDark) : null;
    }
  }
}

function tableProps(iso: Iso, kind: Kind) {
  const Z = 28;
  const book = (l: number, s: number) => {
    iso.box(l - 12, l + 12, s - 8, s + 8, Z, Z + 3, C.white, C.clothDark, C.clothDark);
    iso.floor(Z + 3, l - 1.5, l + 1.5, s - 8, s + 8, () => C.timber);
  };
  const gift = (l: number, s: number, tone: Rgb, h = 12) => {
    iso.box(l - 7, l + 7, s - 7, s + 7, Z, Z + h, tone, tone, tone);
    iso.wallL(l - 7, s - 2, s + 2, Z, Z + h, () => C.glow);
    iso.wallS(s + 7, l - 2, l + 2, Z, Z + h, () => C.glow);
    iso.floor(Z + h, l - 7, l + 7, s - 2, s + 2, () => C.glow);
    iso.floor(Z + h, l - 2, l + 2, s - 7, s + 7, () => C.glow);
  };
  if (["rsvp", "cerita", "mempelai", "dresscode", "denah", "imbauan", "slot"].includes(kind)) book(-24, 8);
  if (kind === "rsvp") iso.box(24, 32, 4, 12, Z, Z + 10, C.glow, C.glowDark, C.glow);
  if (kind === "angpao") {
    gift(-30, 8, C.wine, 13);
    gift(-13, 8, C.teal, 9);
    gift(30, 8, C.wine, 10);
  }
  if (kind === "acara" || kind === "rundown") {
    iso.box(-36, -18, 2, 14, Z, Z + 2, C.white, C.clothDark, C.clothDark);
    iso.box(24, 34, 4, 12, Z, Z + 9, C.glow, C.glowDark, C.glow);
  }
  if (kind === "video" || kind === "siaran") iso.box(20, 36, 2, 12, Z + 2, Z + 14, C.suit, C.line, C.suit);
  if (kind === "galeri") {
    iso.box(-34, -20, 4, 12, Z, Z + 13, C.timber, C.dark, C.white);
    iso.box(20, 34, 4, 12, Z, Z + 10, C.timber, C.dark, C.white);
    book(-2, 8);
  }
  if (kind !== "galeri" && kind !== "angpao") {
    const [x, y] = iso.xy(4, 8, Z + 7);
    bush(iso.c, x, y, 4.5, 300, C.blush);
  }
}

function drawBooth(kind: Kind, tone: Rgb, toneDark: Rgb) {
  const a = HALL_ART;
  const c = new Canvas(Math.round(BOOTH.w / a), Math.round(BOOTH.h / a));
  const iso = new Iso(c, BOOTH.cx, BOOTH.cy, a);
  const HW = 56;
  const TOP = 92;

  // Karpet tenun di lantai, warnanya mengikuti kios.
  iso.floor(0, -72, 72, -38, 40, (l, s) => {
    const e = Math.min(72 - Math.abs(l), Math.min(s + 38, 40 - s));
    if (e < 2.5) return C.dark;
    if (e < 6) return C.tilePale;
    if (e < 10) return ((l + s + 400) % 14) / 14 < 0.5 ? toneDark : C.tilePale;
    return Math.abs(((s + 400) % 18) - 9) < 1.4 ? toneDark : tone;
  });

  // Papan tegak berbingkai kayu dengan lengkung di puncak, tanpa atap.
  iso.wallS(-24, -26, 26, TOP, TOP + 16, (u, v) => {
    const d = Math.hypot(u, v - TOP);
    if (d > 26) return null;
    if (d > 22) return C.timber;
    return flower(u, v - TOP - 5, 9, C.white, C.glow) ?? tone;
  });
  iso.box(-HW, HW, -30, -24, 0, TOP, C.woodLight, C.dark, C.wood);
  iso.wallS(-24, -HW, HW, 0, TOP, (u, v) => {
    if (Math.abs(u) > HW - 4 || v > TOP - 3 || v < 4) return C.timber;
    if (v > TOP - 12) return Math.abs(((u + 300) % 12) - 6) < 1.4 ? toneDark : tone;
    if (v > TOP - 14) return C.timber;
    if (v < 26) return Math.floor((u + 300) / 14) % 2 ? C.wood : C.woodLight;
    return panelArt(kind, u, v) ?? C.plaster;
  });
  // Tiang kecil dengan lentera di dua ujung papan.
  for (const k of [1, -1]) {
    iso.box(k * 60 - 4, k * 60 + 4, -31, -23, 0, TOP + 2, C.woodPale, C.woodLight, C.wood);
    iso.box(k * 60 - 6, k * 60 + 6, -33, -21, TOP + 2, TOP + 12, C.glowLight, C.glow, C.glowLight, C.dark);
    iso.box(k * 60 - 7, k * 60 + 7, -34, -20, TOP + 12, TOP + 15, C.timber, C.dark, C.timber);
  }
  // Rangkaian daun di sudut atas papan.
  for (const k of [-1, 1]) {
    const [x, y] = iso.xy(k * 36, -23, TOP + 1);
    bush(c, x, y, 5, 610 + k, k > 0 ? C.white : C.blush);
  }

  terracottaPot(iso, 66, 8, 501, 0.85, C.white);
  // Meja.
  iso.box(-50, 50, -4, 22, 0, 28, C.cloth, C.clothDark, C.cloth);
  iso.wallS(22, -50, 50, 1, 28, (l, z, x) => {
    if (Math.abs(l) >= 16) return x % 3 === 0 ? C.clothDark : C.cloth;
    return z > 25 ? C.line : (flower(l, z - 13, 10, C.glowLight, C.glow) ?? (Math.abs(l) > 13.5 ? C.glowDark : tone));
  });
  iso.floor(28, -16, 16, -4, 22, () => toneDark);
  iso.floor(28, -13.5, 13.5, -4, 22, () => tone);
  tableProps(iso, kind);
  terracottaPot(iso, -66, 8, 499, 0.85, C.blush);
  return c.save(`booth-${kind}.png`, 64);
}

const TONES: Record<Kind, [Rgb, Rgb]> = {
  mempelai: [C.wine, C.wineDark],
  galeri: [C.teal, C.leafDeep],
  cerita: [C.teal, C.leafDeep],
  acara: [C.tile, C.tileDark],
  rsvp: [C.wine, C.wineDark],
  angpao: [C.tile, C.tileDark],
  dresscode: [C.teal, C.leafDeep],
  rundown: [C.mossMid, C.leaf],
  denah: [C.mossMid, C.leaf],
  imbauan: [C.teal, C.leafDeep],
  siaran: [C.wine, C.wineDark],
  video: [C.wine, C.wineDark],
  slot: [C.mossMid, C.leaf],
};

// ---------------------------------------------------------------------------------------------------------------
// Karakter chibi digambar langsung: kepala besar, badan kecil. Lembar 3 x 3 sel (baris menghadap bawah, samping kanan,
// dan atas; kolom diam dan dua langkah). Kaki selalu di dasar sel dan badan di tengah, jadi tidak melompat saat
// berganti langkah. Ukuran sel sama dengan CELL di door.tsx.
const CELL = { w: 32, h: 40 };
type Hair = "pendek" | "rapi" | "panjang" | "sanggul" | "ikal" | "botak" | "hijab";
type Spec = {
  skin: string;
  hair: Hair;
  hairColor: string;
  outfit: "jas" | "kemeja" | "gaun" | "kebaya";
  main: string;
  second?: string;
  tie?: string;
  // Penambah tinggi kaki dan badan, bisa negatif, dan lebar badan.
  tall?: number;
  torso?: number;
  wide?: number;
  glasses?: boolean;
  mustache?: boolean;
  peci?: boolean;
  bow?: string;
  batik?: boolean;
};


function character(c: Canvas, ox: number, oy: number, dir: 0 | 1 | 2, frame: 0 | 1 | 2, sp: Spec, flare = 0) {
  const skin = hex(sp.skin);
  const hair = hex(sp.hairColor);
  const main = hex(sp.main);
  const second = hex(sp.second ?? sp.main);
  const R = (x: number, y: number, w: number, h: number, col: Rgb) => c.rect(ox + x, oy + y, w, h, col);
  const cx = 16;
  const foot = 38;
  const leg = 6 + (sp.tall ?? 0);
  const torso = 10 + (sp.torso ?? 0);
  const wide = sp.wide ?? 0;
  const bob = frame ? 1 : 0;
  const hip = foot - leg - bob;
  const shoulder = hip - torso;
  const headH = 15;
  const headW = 16;
  const headTop = shoulder - headH + 1;
  const hw = 5 + wide;
  const longSkirt = sp.outfit === "gaun" || sp.outfit === "kebaya";
  const pants = sp.outfit === "jas" || sp.outfit === "kemeja" ? (sp.second ? second : shade(main, -0.3)) : hex("#3a2a2c");

  // Kaki.
  if (!longSkirt) {
    if (dir === 1) {
      const a = frame === 1 ? 4 : frame === 2 ? -4 : 1;
      R(cx - 3 - a, hip, 3, foot - hip - 1, shade(pants, -0.22));
      R(cx - 4 - a, foot - 2, 5, 2, C.dark);
      R(cx + a - 1, hip, 3, foot - hip - 1, pants);
      R(cx + a - 1, foot - 2, 5, 2, C.line);
    } else {
      for (const k of [-1, 1]) {
        const up = (frame === 1 && k < 0) || (frame === 2 && k > 0) ? 2 : 0;
        R(cx + (k < 0 ? -4 : 1), hip, 3, foot - hip - 1 - up, pants);
        R(cx + (k < 0 ? -5 : 1), foot - 2 - up, 4, 2, C.line);
      }
    }
  }
  // Badan.
  if (longSkirt) {
    const skirt = sp.outfit === "kebaya" ? second : main;
    const sway = frame === 1 ? 1 : frame === 2 ? -1 : 0;
    const top = shoulder + 6;
    for (let y = top; y < foot - 1; y++) {
      const t = (y - top) / (foot - 1 - top);
      const w = Math.round(hw + t * (3 + flare));
      const off = Math.round(sway * t);
      R(cx - w + off, y, w * 2, 1, skirt);
      R(cx + off + w - 3, y, 3, 1, shade(skirt, -0.25));
      R(cx - w + off, y, 2, 1, shade(skirt, 0.2));
      if (sp.batik && (y + Math.floor(ox / 3)) % 3 === 0) for (let k = -w + 1; k < w; k += 3) R(cx + k + off, y, 1, 1, shade(skirt, -0.45));
    }
    R(cx - 4 + sway, foot - 2, 3, 2, C.dark);
    R(cx + 1 + sway, foot - 2, 3, 2, C.dark);
    R(cx - hw, shoulder, hw * 2, 7, main);
    R(cx + hw - 3, shoulder, 3, 7, shade(main, -0.25));
    if (sp.outfit === "kebaya" && dir === 0) R(cx - 1, shoulder + 1, 2, 5, shade(main, 0.35));
  } else {
    R(cx - hw, shoulder, hw * 2, torso, main);
    R(cx + hw - 3, shoulder, 3, torso, shade(main, -0.25));
    R(cx - hw, shoulder, 2, torso, shade(main, 0.14));
    if (sp.batik) {
      for (let y = shoulder + 1; y < hip; y += 3) for (let x = cx - hw + 1 + (y % 2); x < cx + hw; x += 3) R(x, y, 1, 1, shade(main, -0.45));
    }
    if (dir === 0) {
      if (sp.outfit === "jas") {
        R(cx - 2, shoulder, 4, 5, C.white);
        R(cx - 1, shoulder + 1, 2, 3, hex(sp.tie ?? "#7c2f3c"));
        R(cx - 3, shoulder + 4, 1, 3, shade(main, -0.4));
        R(cx + 2, shoulder + 4, 1, 3, shade(main, -0.4));
      } else {
        R(cx - 2, shoulder, 4, 2, shade(main, 0.4));
        R(cx - 1, shoulder + 2, 2, torso - 3, shade(main, 0.18));
      }
    }
    if (dir === 1 && sp.outfit === "jas") R(cx + 2, shoulder + 1, 2, 3, C.white);
  }
  // Lengan.
  const armY = shoulder + 1;
  const sleeve = sp.outfit === "kebaya" ? main : main;
  if (dir === 1) {
    const a = frame === 1 ? -2 : frame === 2 ? 2 : 0;
    R(cx - 1 + a, armY, 3, torso - 2, shade(sleeve, -0.2));
    R(cx - 1 + a, armY + torso - 2, 3, 2, skin);
  } else {
    for (const k of [-1, 1]) {
      const y = armY + ((frame === 1 && k > 0) || (frame === 2 && k < 0) ? -1 : 0);
      const x = cx + (k < 0 ? -hw - 2 : hw);
      R(x, y, 2, Math.min(7, torso - 1), k < 0 ? shade(sleeve, 0.1) : shade(sleeve, -0.3));
      R(x, y + Math.min(7, torso - 1), 2, 2, skin);
    }
  }
  // Kepala bulat: tiap baris punya lekuk sendiri di atas dan di dagu.
  const hx = cx - headW / 2;
  const inset = (r: number) => (r === 0 ? 4 : r === 1 ? 2 : r === 2 ? 1 : r === headH - 1 ? 4 : r === headH - 2 ? 2 : r === headH - 3 ? 1 : 0);
  const rows = (from: number, to: number, col: Rgb) => {
    for (let r = from; r < to; r++) R(hx + inset(r), headTop + r, headW - 2 * inset(r), 1, col);
  };
  rows(0, headH, skin);
  for (let r = 3; r < headH - 2; r++) R(hx + headW - 2 - inset(r), headTop + r, 2, 1, shade(skin, -0.14));
  const ey = headTop + 8;
  if (dir === 0) {
    R(cx - 5, ey, 2, 3, C.line);
    R(cx + 3, ey, 2, 3, C.line);
    R(cx - 5, ey, 1, 1, C.white);
    R(cx + 3, ey, 1, 1, C.white);
    R(cx - 7, ey + 3, 2, 1, C.blush);
    R(cx + 5, ey + 3, 2, 1, C.blush);
    R(cx - 1, ey + 4, 2, 1, shade(skin, -0.5));
    if (sp.mustache) R(cx - 3, ey + 3, 6, 1, C.dark);
    if (sp.glasses) {
      R(cx - 7, ey - 1, 5, 1, C.line);
      R(cx - 7, ey + 3, 5, 1, C.line);
      R(cx + 2, ey - 1, 5, 1, C.line);
      R(cx + 2, ey + 3, 5, 1, C.line);
      R(cx - 2, ey, 4, 1, C.line);
    }
  }
  if (dir === 1) {
    R(cx + 4, ey, 2, 3, C.line);
    R(cx + 4, ey, 1, 1, C.white);
    R(cx + 2, ey + 3, 2, 1, C.blush);
    R(cx + 8, ey + 2, 1, 2, shade(skin, -0.14));
    if (sp.mustache) R(cx + 4, ey + 4, 4, 1, C.dark);
    if (sp.glasses) {
      R(cx + 2, ey - 1, 6, 1, C.line);
      R(cx + 2, ey + 3, 6, 1, C.line);
      R(cx - 2, ey, 5, 1, C.line);
    }
  }
  // Rambut menurut model dan arah hadap.
  const light = shade(hair, 0.24);
  const shadow = shade(hair, -0.3);
  const shine = () => {
    R(hx + 4, headTop, 4, 1, light);
    R(hx + 2, headTop + 1, 5, 1, light);
    R(hx + 2, headTop + 2, 2, 1, light);
  };
  if (sp.hair === "hijab") {
    if (dir === 2) {
      rows(0, headH, hair);
      R(cx - hw - 1, shoulder - 1, hw * 2 + 2, 8, hair);
      R(cx + hw - 2, shoulder - 1, 3, 8, shadow);
    } else if (dir === 1) {
      rows(0, 5, hair);
      R(hx, headTop + 3, 8, headH - 4, hair);
      R(hx + 8, headTop + headH - 3, 6, 3, hair);
      R(cx - hw - 1, shoulder, hw * 2 + 2, 6, hair);
      R(cx + 2, shoulder, 4, 6, shadow);
    } else {
      rows(0, 5, hair);
      R(hx, headTop + 3, 3, headH - 4, hair);
      R(hx + headW - 3, headTop + 3, 3, headH - 4, shadow);
      R(hx + 2, headTop + headH - 3, headW - 4, 3, hair);
      R(cx - hw - 1, shoulder, hw * 2 + 2, 6, hair);
      R(cx - 3, shoulder + 2, 6, 2, shadow);
    }
    shine();
  } else if (sp.hair === "botak") {
    if (dir === 2) {
      R(hx + 1, headTop + 10, headW - 2, 2, hair);
      R(hx + 2, headTop + 12, headW - 4, 1, shadow);
    } else if (dir === 1) {
      R(hx, headTop + 6, 5, 5, hair);
    } else {
      R(hx, headTop + 6, 2, 5, hair);
      R(hx + headW - 2, headTop + 6, 2, 5, shadow);
    }
    if (!sp.peci) R(hx + 4, headTop + 1, 4, 1, shade(skin, 0.4));
  } else {
    R(hx + 5, headTop - 1, headW - 10, 1, hair);
    if (dir === 2) {
      rows(0, headH, hair);
      for (let r = 3; r < headH - 1; r++) R(hx + headW - 3 - inset(r), headTop + r, 3, 1, shadow);
    } else if (dir === 1) {
      rows(0, 6, hair);
      R(hx, headTop + 5, 7, 5, hair);
      R(hx + 1, headTop + 10, 4, 2, hair);
      R(hx + 7, headTop + 6, 6, 1, hair);
      R(hx + 11, headTop + 7, 2, 1, hair);
    } else {
      rows(0, 6, hair);
      R(hx, headTop + 5, 2, 5, hair);
      R(hx + headW - 2, headTop + 5, 2, 5, shadow);
      if (sp.hair === "rapi") {
        R(hx + 2, headTop + 6, 7, 1, hair);
        R(hx + 2, headTop + 7, 4, 1, hair);
      } else if (sp.hair === "pendek") {
        for (let i = 2; i < headW - 3; i += 3) R(hx + i, headTop + 6, 2, 2, hair);
      } else if (sp.hair === "sanggul") {
        R(hx + 2, headTop + 6, 4, 1, hair);
        R(hx + headW - 6, headTop + 6, 4, 1, shadow);
      } else {
        R(hx + 2, headTop + 6, headW - 4, 1, hair);
        for (let i = 2; i < headW - 3; i += 4) R(hx + i, headTop + 7, 2, 1, hair);
      }
    }
    shine();
    if (sp.hair === "panjang") {
      if (dir === 2) {
        R(hx, headTop + 8, headW, 11, hair);
        R(hx + 2, headTop + 19, headW - 4, 2, hair);
        R(hx + 4, headTop + 9, 2, 8, light);
        R(hx + headW - 3, headTop + 8, 3, 11, shadow);
      } else if (dir === 1) {
        R(hx, headTop + 8, 6, 10, hair);
        R(hx + 1, headTop + 18, 4, 2, hair);
        R(hx + 1, headTop + 9, 1, 7, light);
      } else {
        R(hx - 1, headTop + 6, 3, 13, hair);
        R(hx, headTop + 19, 2, 2, hair);
        R(hx + headW - 2, headTop + 6, 3, 13, shadow);
        R(hx + headW - 2, headTop + 19, 2, 2, shadow);
      }
    }
    if (sp.hair === "ikal") {
      for (let i = 0; i < headW; i += 3) R(hx + i - 1, headTop - 2 + (i % 2 ? 1 : 0), 3, 3, i % 6 ? hair : light);
      R(hx - 1, headTop + 2, 2, 6, hair);
      if (dir !== 1) R(hx + headW - 1, headTop + 2, 2, 6, shadow);
    }
    if (sp.hair === "sanggul") {
      R(cx - 3, headTop - 5, 6, 5, hair);
      R(cx - 4, headTop - 4, 8, 3, hair);
      R(cx - 3, headTop - 4, 3, 1, light);
      R(cx - 4, headTop - 1, 8, 1, hex("#e0ae4c"));
    }
  }
  if (sp.peci) {
    R(hx + 2, headTop - 3, headW - 4, 7, C.suit);
    R(hx + 1, headTop, headW - 2, 4, C.suit);
    R(hx + 3, headTop - 3, 6, 1, shade(C.suit, 0.28));
  }
  if (sp.bow) {
    const col = hex(sp.bow);
    const bx = dir === 1 ? hx + 2 : hx + 9;
    R(bx, headTop - 3, 3, 3, col);
    R(bx + 4, headTop - 3, 3, 3, col);
    R(bx + 3, headTop - 2, 1, 1, shade(col, -0.4));
  }
}

// Garis gelap satu piksel di sekeliling sosok.
function outline(c: Canvas) {
  const on = (x: number, y: number) => x >= 0 && y >= 0 && x < c.w && y < c.h && c.data[(y * c.w + x) * 4 + 3] > 0;
  const pts: [number, number][] = [];
  for (let y = 0; y < c.h; y++) for (let x = 0; x < c.w; x++) if (!on(x, y) && (on(x - 1, y) || on(x + 1, y) || on(x, y - 1) || on(x, y + 1))) pts.push([x, y]);
  for (const [x, y] of pts) c.set(x, y, C.line);
}

async function drawSheet(file: string, sp: Spec) {
  const c = new Canvas(CELL.w * 3, CELL.h * 3);
  for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) character(c, col * CELL.w, row * CELL.h, row as 0 | 1 | 2, col as 0 | 1 | 2, sp);
  outline(c);
  await c.save(file, 32);
}

const SKIN = { terang: "#f0c49a", sawo: "#d9a077", gelap: "#a96f4d" };
const SHEETS: Record<string, Spec> = {
  "guest-male.png": { skin: SKIN.terang, hair: "rapi", hairColor: "#3a2626", outfit: "jas", main: "#3b3342", second: "#2c2531", tie: "#a8434a" },
  "guest-female.png": { skin: SKIN.terang, hair: "panjang", hairColor: "#a84e34", outfit: "gaun", main: "#3f9c94", bow: "#f6e8c8" },
  "npc-pria.png": { skin: SKIN.sawo, hair: "pendek", hairColor: "#4a2c22", outfit: "jas", main: "#b99a70", second: "#8f7554", tie: "#5f8034", tall: 1 },
  "npc-pria-hijau.png": { skin: SKIN.gelap, hair: "pendek", hairColor: "#241a20", outfit: "kemeja", main: "#5f8034", second: "#3a2a2c", batik: true, peci: true, tall: 1, torso: 1 },
  "npc-bapak.png": { skin: SKIN.sawo, hair: "rapi", hairColor: "#2f2428", outfit: "jas", main: "#34506b", second: "#b4a07a", tie: "#c9b632", wide: 2, glasses: true, mustache: true },
  "npc-kakek.png": { skin: SKIN.terang, hair: "botak", hairColor: "#b9b4ab", outfit: "kemeja", main: "#7c2f3c", second: "#5a4a48", batik: true, mustache: true, glasses: true, tall: -1, torso: -1 },
  "npc-anak.png": { skin: SKIN.sawo, hair: "ikal", hairColor: "#3a2626", outfit: "kemeja", main: "#d98a3d", second: "#3f6d78", tall: -3, torso: -3 },
  "npc-wanita.png": { skin: SKIN.terang, hair: "panjang", hairColor: "#2d2024", outfit: "gaun", main: "#6f97b8", bow: "#fff6e0" },
  "npc-gadis.png": { skin: SKIN.sawo, hair: "hijab", hairColor: "#c9806d", outfit: "gaun", main: "#e6d2a8" },
  "npc-ibu.png": { skin: SKIN.terang, hair: "sanggul", hairColor: "#8e8a8c", outfit: "kebaya", main: "#8a6aa0", second: "#5a3a4a", batik: true, wide: 2, glasses: true },
  "npc-kebaya.png": { skin: SKIN.gelap, hair: "sanggul", hairColor: "#2b1e22", outfit: "kebaya", main: "#3f9c94", second: "#7a4a34", batik: true },
};

// Pengantin berdiri berdampingan di tengah panggung: gaun lebar, kerudung, dan buket.
async function drawCouple() {
  const c = new Canvas(64, 44);
  character(c, 2, 4, 0, 0, { skin: SKIN.terang, hair: "rapi", hairColor: "#3a2626", outfit: "jas", main: "#2f2836", second: "#2c2531", tie: "#d9626a", tall: 1 });
  const bride: Spec = { skin: SKIN.terang, hair: "sanggul", hairColor: "#5a3420", outfit: "gaun", main: "#fff6e0", tall: 1 };
  // Kerudung di belakang pengantin perempuan.
  for (let y = 12; y < 40; y++) {
    const w = Math.round(8 + ((y - 12) / 28) * 6);
    c.rect(32 + 16 - w, y, w * 2, 1, hex("#e6ecec"));
  }
  character(c, 32, 4, 0, 0, bride, 5);
  // Buket di depan badan.
  bush(c, 32 + 16, 4 + 29, 3.4, 77, C.white);
  outline(c);
  await c.save("couple-sprite.png", 40);
}

await drawTown();
await drawHall();
await Promise.all((Object.keys(TONES) as Kind[]).map((k) => drawBooth(k, TONES[k][0], TONES[k][1])));
await Promise.all(Object.entries(SHEETS).map(([file, sp]) => drawSheet(file, sp)));
await drawCouple();
