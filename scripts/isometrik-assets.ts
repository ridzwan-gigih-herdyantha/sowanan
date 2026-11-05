// pnpm isometrik-assets
// Menggambar semua aset pixel art tema Isometrik ke public/img/rafi-kayla langsung per piksel: halaman gedung di tengah
// kota, gapura, aula, kios, tamu, dan pengantin. Gayanya piksel besar dengan garis cokelat tua dan warna hangat, berisi
// jalan aspal, trotoar, dan gedung bertingkat. Bebas lambang, dan layout aula simetris.
// Geometri di sini harus sama dengan src/components/invitation/gedung/world.ts dan interior-world.ts.
import { writeFile } from "node:fs/promises";
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

// Rumpun daun kecil yang menyatu dengan gambar: massa gelap dan gumpalan berbunga, sama dengan tanaman di area luar.
function bush(c: Canvas, cx: number, cy: number, r: number, seed: number, bloom: Rgb | null = null) {
  const ramp = seed % 2 ? WARM : FRESH;
  c.disc(cx, cy + 1, r + 0.8, (dx, dy) => ramp[dy > r * 0.45 ? 1 : dx < -r * 0.3 ? 1 : 2]);
  const flowers: [Rgb, Rgb] | undefined = bloom ? [bloom, C.glow] : undefined;
  [[-0.45, -0.05, 0.66], [0.45, -0.05, 0.66], [0, -0.42, 0.72]].forEach(([dx, dy, k], i) => {
    const rr = r * k;
    const size = Math.ceil(rr * 2 + 5);
    paste(c, leafClump(rr, ramp, seed * 3 + i, flowers, 0.3), Math.round(cx + dx * r - (size >> 1)), Math.round(cy + dy * r - (size >> 1)));
  });
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

const shade = (c: Rgb, t: number): Rgb => (t < 0 ? mix(c, C.line, -t) : mix(c, C.white, t));

type Block = "kantor" | "apartemen" | "ruko";
const BLOCK_TONES: [Rgb, Rgb, Rgb][] = [
  [C.concrete, C.concreteDark, C.stoneMid],
  [C.brick, C.brickDark, C.tileLight],
  [hex("#8f9aa0"), hex("#6e7a82"), hex("#a8b2b6")],
  [hex("#c9a77f"), hex("#9f8160"), hex("#dcc09a")],
  [hex("#7f6a78"), hex("#5e4e5c"), hex("#98828f")],
];

// Tiang lentera beton beratap baja.
function lanternPost(iso: Iso, l: number, s: number, h = 62) {
  iso.box(l - 11, l + 11, s - 11, s + 11, 0, 9, C.stoneLight, C.concreteDark, C.concrete);
  iso.box(l - 6, l + 6, s - 6, s + 6, 9, h, C.stoneLight, C.concreteDark, C.concrete);
  iso.box(l - 10, l + 10, s - 10, s + 10, h, h + 18, C.glowLight, C.glow, C.glowLight, C.steel);
  iso.box(l - 14, l + 14, s - 14, s + 14, h + 18, h + 24, C.steelLight, C.steel, C.steelLight);
  iso.box(l - 8, l + 8, s - 8, s + 8, h + 24, h + 32, C.steelLight, C.steel, C.steelLight);
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

// Atap pelana terakota dengan bubungan sepanjang l. Genteng besar berbaris, ada lumut dan tepi bayangan.
// ---------------------------------------------------------------------------------------------------------------
// Halaman gedung di tengah kota. Sama dengan world.ts.
const TOWN = { x0: 480, y0: 740, art: 2.4, plazaL0: -120, plazaL1: 250, plazaS: 330, pathS: 70, doorL: 520, gateL: 270, gateS: 104, gateZ: 118, bl1: 900, bs: 250, wall: 300, lobby: 136 };

// Matahari tinggi di arah jam 5, jadi bayangan jatuh ke arah jam 11. Sisi kanan benda terang, sisi kiri gelap.
const SUN = { x: -0.5, y: -0.866, k: 0.8 };
const tones = (...cs: string[]) => cs.map(hex);
const SHADOW = hex("#2b2440");

const BARK = tones("#2b2a3f", "#473340", "#6a4644", "#8f6249", "#b6875e");
const BARK_PALE = tones("#3a3340", "#5d5153", "#857567", "#ab9a82", "#cfc2a6");
const BAMBOO = tones("#3d3a2c", "#6d6a35", "#9c9440", "#c7b955", "#e6d97a");
const WARM = tones("#25342f", "#2f4a38", "#4c7436", "#7c9c3a", "#b4bf4a", "#dfdc6e");
const DEEP = tones("#1f3034", "#2a4a42", "#3c6f4c", "#5f9450", "#95b85e", "#c9d97a");
const FRESH = tones("#23362c", "#2f5532", "#4a8437", "#7bb03f", "#aed050", "#e2ec7c");
const PINK = tones("#4a2a48", "#6f3160", "#b44f86", "#e07ca6", "#f6b0c4", "#ffe4e4");
const RED = tones("#3a2233", "#6d2534", "#a8352f", "#d95a30", "#f28c3f", "#ffc866");
const MAGENTA = tones("#3d2340", "#6a2358", "#a32a78", "#d2409a", "#ee78bb", "#ffc2de");
const WHITE_BLOOM: [Rgb, Rgb] = [hex("#fff8e8"), hex("#f3c64e")];
const CREAM_BLOOM: [Rgb, Rgb] = [hex("#fff2d0"), hex("#eda94a")];
const RED_BLOOM: [Rgb, Rgb] = [hex("#ee5a3a"), hex("#ffc45a")];
const BLUE_BLOOM: [Rgb, Rgb] = [hex("#9db4f4"), hex("#eef2ff")];
const LILAC_BLOOM: [Rgb, Rgb] = [hex("#c7a4f0"), hex("#fff0ff")];
const YELLOW_BLOOM: [Rgb, Rgb] = [hex("#f9d84e"), hex("#e8862e")];
const PINK_BLOOM: [Rgb, Rgb] = [hex("#f7a3bc"), hex("#fff0e0")];

type Sprite = { id: number; ox: number; oy: number };
type Part = { s: Sprite; x: number; y: number; ax: number; ay: number; ph: number; frames?: number[]; fps?: number };
type Plant = { parts: Part[]; per: number; shadow: { h: number; rx: number; ry: number }; petal?: Sprite; petalColor?: Rgb };

const paste = (dst: Canvas, src: Canvas, ox: number, oy: number) => {
  for (let y = 0; y < src.h; y++) {
    for (let x = 0; x < src.w; x++) {
      const i = (y * src.w + x) * 4;
      if (src.data[i + 3]) dst.set(ox + x, oy + y, [src.data[i], src.data[i + 1], src.data[i + 2]]);
    }
  }
};
const filled = (c: Canvas, x: number, y: number) => x >= 0 && y >= 0 && x < c.w && y < c.h && c.data[(y * c.w + x) * 4 + 3] > 0;

// Semua potongan hidup dikumpulkan satu lembar. Komponen di browser menyusun dan menggoyangkannya di atas peta.
const sprites: Canvas[] = [];
function raw(c: Canvas) {
  sprites.push(c);
  return sprites.length - 1;
}
function sprite(c: Canvas): Sprite {
  let x0 = c.w;
  let y0 = c.h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      if (!filled(c, x, y)) continue;
      x0 = Math.min(x0, x);
      y0 = Math.min(y0, y);
      x1 = Math.max(x1, x);
      y1 = Math.max(y1, y);
    }
  }
  const t = new Canvas(Math.max(1, x1 - x0 + 1), Math.max(1, y1 - y0 + 1));
  paste(t, c, -x0, -y0);
  return { id: raw(t), ox: x0, oy: y0 };
}

async function saveAtlas(file: string, colours: number) {
  const W = 1024;
  const order = sprites.map((c, i) => ({ c, i })).sort((a, b) => b.c.h - a.c.h);
  const rects: number[][] = [];
  let x = 0;
  let y = 0;
  let row = 0;
  for (const { c, i } of order) {
    if (x + c.w + 1 > W) {
      x = 0;
      y += row + 1;
      row = 0;
    }
    rects[i] = [x, y, c.w, c.h];
    x += c.w + 1;
    row = Math.max(row, c.h);
  }
  const sheet = new Canvas(W, y + row + 1);
  for (const { c, i } of order) paste(sheet, c, rects[i][0], rects[i][1]);
  await sheet.save(file, colours);
  return rects;
}

// Gumpalan daun: atas kanan terang, bawah kiri larut jadi bercak. Bercak 2 x 1 piksel supaya tidak terlihat seperti kisi.
function leafClump(r: number, ramp: Rgb[], seed: number, bloom?: [Rgb, Rgb], rate = 0) {
  const size = Math.ceil(r * 2 + 5);
  const k = size >> 1;
  const c = new Canvas(size, size);
  const rand = rng(seed * 97 + 13);
  const cells = new Map<string, number>();
  const cell = (x: number, y: number) => {
    const key = `${(x + (y & 1)) >> 1},${y}`;
    if (!cells.has(key)) cells.set(key, rand());
    return cells.get(key) as number;
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - k;
      const dy = y - k;
      const f = cell(x, y);
      if (Math.hypot(dx, dy * 1.15) + (f - 0.5) * 1.8 > r) continue;
      const v = (dx * 0.42 - dy * 0.92) / r + (f - 0.5) * 0.62;
      if (v < -0.62 || (v < -0.3 && f < 0.55)) continue;
      c.set(x, y, ramp[v < 0.1 ? 2 : v < 0.42 ? 3 : v < 0.72 ? 4 : 5]);
    }
  }
  if (bloom) {
    const n = Math.round(r * r * rate);
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const d = Math.sqrt(rand()) * r * 0.82;
      const x = Math.round(k + Math.cos(a) * d);
      const y = Math.round(k + Math.sin(a) * d * 0.8 - r * 0.1);
      if (!filled(c, x, y)) continue;
      c.set(x - 1, y, bloom[0]);
      c.set(x + 1, y, bloom[0]);
      c.set(x, y - 1, bloom[0]);
      c.set(x, y + 1, bloom[0]);
      c.set(x, y, bloom[1]);
    }
  }
  return c;
}

function darkMass(w: number, h: number, lobes: number[][], ramp: Rgb[], seed: number) {
  const c = new Canvas(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const inside = lobes.some(([lx, ly, r]) => Math.hypot(x - lx, (y - ly) / 0.92) + (hash((x >> 1) + seed, y >> 1) - 0.5) * 2.2 <= r);
      if (!inside) continue;
      const top = lobes.reduce((m, [, ly, r]) => Math.min(m, ly - r), h);
      const bottom = lobes.reduce((m, [, ly, r]) => Math.max(m, ly + r), 0);
      const t = (y - top) / Math.max(1, bottom - top);
      c.set(x, y, ramp[hash(x + seed * 3, y) > 0.2 + t * 0.7 ? 1 : 0]);
    }
  }
  return c;
}

// Cabang atau batang dari dua titik, sisi kanan kena cahaya.
function limb(c: Canvas, ramp: Rgb[], x0: number, y0: number, x1: number, y1: number, w0: number, w1: number, seed: number) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1) * 2;
  for (let k = 0; k <= n; k++) {
    const t = k / n;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;
    const w = w0 + (w1 - w0) * t;
    for (let dx = -Math.ceil(w); dx <= Math.ceil(w); dx++) {
      if (Math.abs(dx) > w + 0.2) continue;
      const u = dx / Math.max(w, 0.5);
      let i = u < -0.55 ? 1 : u < 0.1 ? 2 : u < 0.65 ? 3 : 4;
      if (hash(Math.round(x + dx) + seed, Math.floor(y / 5)) > 0.84) i = Math.max(1, i - 1);
      c.set(x + dx, y, ramp[i]);
    }
  }
}

function scatter(cx: number, cy: number, rx: number, ry: number, n: number, gap: number, seed: number) {
  const rand = rng(seed * 31 + 5);
  const out: [number, number][] = [];
  for (let tries = 0; tries < n * 60 && out.length < n; tries++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand());
    const x = cx + Math.cos(a) * d * rx;
    const y = cy + Math.sin(a) * d * ry;
    if (out.every(([ox, oy]) => Math.hypot(ox - x, (oy - y) * 1.25) >= gap)) out.push([x, y]);
  }
  return out.sort((a, b) => a[1] - b[1]);
}

type Clump = { x: number; y: number; r: number; ramp: Rgb[]; bloom?: [Rgb, Rgb]; rate?: number };

// Batang dan massa gelap diam di tempat, hanya gumpalan terang yang bergerak, makin ke atas makin jauh.
function makeTree(o: { w: number; h: number; bx: number; seed: number; base: Canvas; clumps: Clump[]; per: number; reach: number; shadow: { h: number; rx: number; ry: number }; petal?: Rgb }): Plant {
  const fy = o.h - 3;
  const parts: Part[] = [{ s: sprite(o.base), x: -o.bx, y: -fy, ax: 0, ay: 0, ph: 0 }];
  const top = Math.min(...o.clumps.map((c) => c.y));
  const low = Math.max(...o.clumps.map((c) => c.y));
  o.clumps.forEach((cl, i) => {
    const s = sprite(leafClump(cl.r, cl.ramp, o.seed * 7 + i, cl.bloom, cl.rate ?? 0));
    const size = Math.ceil(cl.r * 2 + 5);
    const height = 1 - (cl.y - top) / Math.max(1, low - top);
    const side = (cl.x - o.bx) / Math.max(1, o.w / 2);
    parts.push({ s, x: cl.x - (size >> 1) - o.bx, y: cl.y - (size >> 1) - fy, ax: o.reach * (0.35 + 0.65 * height), ay: 0.28 * height + 0.12, ph: side * 0.9 + hash(i, o.seed) * 0.8 });
  });
  let petal: Sprite | undefined;
  if (o.petal) {
    const c = new Canvas(2, 2);
    c.set(0, 0, o.petal);
    c.set(1, 1, o.petal);
    c.set(1, 0, mix(o.petal, C.white, 0.5));
    petal = sprite(c);
  }
  return { parts, per: o.per, shadow: o.shadow, petal, petalColor: o.petal };
}

function tabebuya(seed: number): Plant {
  const [w, h, bx] = [72, 88, 36];
  const by = h - 3;
  const base = darkMass(w, h, [[32, 26, 18], [46, 31, 17], [24, 38, 15], [38, 42, 16]], PINK, seed);
  limb(base, BARK, bx, by, bx + 1, by - 30, 3.2, 2.2, seed);
  limb(base, BARK, bx + 1, by - 28, bx - 11, by - 44, 1.8, 0.8, seed);
  limb(base, BARK, bx + 1, by - 28, bx + 13, by - 42, 1.8, 0.8, seed);
  const clumps = scatter(36, 32, 27, 21, 15, 8.5, seed).map(([x, y], i) => ({ x, y, r: 6 + hash(i, seed) * 2.6, ramp: PINK }));
  return makeTree({ w, h, bx, seed, base, clumps, per: 7.5, reach: 1.1, shadow: { h: 26, rx: 25, ry: 12 }, petal: hex("#f6a6c0") });
}

function trembesi(seed: number): Plant {
  const [w, h, bx] = [100, 80, 50];
  const by = h - 3;
  const base = darkMass(w, h, [[50, 24, 20], [28, 30, 19], [72, 30, 19], [14, 37, 10], [86, 37, 10], [50, 38, 22]], DEEP, seed);
  limb(base, BARK, bx, by, bx - 1, by - 20, 5, 3.6, seed);
  limb(base, BARK, bx - 1, by - 18, bx - 24, by - 36, 2.6, 1, seed);
  limb(base, BARK, bx - 1, by - 18, bx + 25, by - 35, 2.6, 1, seed);
  limb(base, BARK, bx - 1, by - 20, bx + 3, by - 42, 2, 0.8, seed);
  const clumps = scatter(50, 26, 43, 18, 20, 8, seed).map(([x, y], i) => ({ x, y, r: 6 + hash(i, seed) * 2.4, ramp: DEEP, bloom: PINK_BLOOM, rate: i % 3 ? 0 : 0.05 }));
  return makeTree({ w, h, bx, seed, base, clumps, per: 9, reach: 1, shadow: { h: 25, rx: 38, ry: 16 } });
}

function flamboyan(seed: number): Plant {
  const [w, h, bx] = [90, 74, 45];
  const by = h - 3;
  const base = darkMass(w, h, [[45, 22, 15], [24, 30, 16], [66, 30, 16], [12, 34, 8], [78, 34, 8], [45, 34, 19]], RED, seed);
  limb(base, BARK, bx, by, bx + 1, by - 22, 4, 2.8, seed);
  limb(base, BARK, bx + 1, by - 20, bx - 20, by - 36, 2.2, 0.9, seed);
  limb(base, BARK, bx + 1, by - 20, bx + 21, by - 35, 2.2, 0.9, seed);
  const clumps = scatter(45, 25, 38, 15, 18, 7.6, seed).map(([x, y], i) => ({ x, y, r: 5.4 + hash(i, seed) * 2.4, ramp: i % 6 === 5 ? WARM : RED, bloom: i % 6 === 5 ? RED_BLOOM : undefined, rate: 0.06 }));
  return makeTree({ w, h, bx, seed, base, clumps, per: 8, reach: 1, shadow: { h: 24, rx: 33, ry: 14 }, petal: hex("#ec6f36") });
}

function kamboja(seed: number): Plant {
  const [w, h, bx] = [58, 62, 29];
  const by = h - 3;
  const base = new Canvas(w, h);
  limb(base, BARK_PALE, bx, by, bx, by - 16, 3.6, 2.8, seed);
  const ends: number[][] = [[bx - 16, by - 30], [bx - 6, by - 38], [bx + 7, by - 39], [bx + 17, by - 29]];
  for (const [x, y] of ends) {
    limb(base, BARK_PALE, bx, by - 15, (x + bx) / 2, (y + by - 15) / 2 + 3, 2, 1.4, seed);
    limb(base, BARK_PALE, (x + bx) / 2, (y + by - 15) / 2 + 3, x, y, 1.4, 1, seed);
  }
  const clumps: Clump[] = [
    ...ends.map(([x, y]) => ({ x, y: y - 3, r: 7, ramp: FRESH, bloom: WHITE_BLOOM, rate: 0.13 })),
    { x: bx - 11, y: by - 42, r: 5.5, ramp: FRESH, bloom: WHITE_BLOOM, rate: 0.14 },
    { x: bx + 12, y: by - 42, r: 5.5, ramp: FRESH, bloom: WHITE_BLOOM, rate: 0.14 },
    { x: bx, y: by - 48, r: 5.5, ramp: FRESH, bloom: WHITE_BLOOM, rate: 0.14 },
  ];
  return makeTree({ w, h, bx, seed, base, clumps, per: 6.5, reach: 0.9, shadow: { h: 20, rx: 20, ry: 10 } });
}

function palem(seed: number): Plant {
  const [w, h, bx] = [64, 100, 32];
  const by = h - 3;
  const fy = by;
  const base = new Canvas(w, h);
  const crownY = by - 66;
  for (let y = by; y >= crownY; y--) {
    const t = (by - y) / (by - crownY);
    const x = bx + Math.sin(t * 2.2) * 3;
    const wd = 2.6 - t * 0.9 + (t < 0.08 ? 1.2 : 0);
    limb(base, y % 4 === 0 ? BARK_PALE.map((c) => mix(c, C.line, 0.28)) : BARK_PALE, x, y, x, y - 1, wd, wd, seed);
  }
  const cx = bx + Math.sin(2.2) * 3;
  for (const [ox, oy] of [[-2, 2], [2, 2], [0, 3]]) base.disc(cx + ox, crownY + oy, 1.8, () => hex("#8a5a34"));
  const parts: Part[] = [{ s: sprite(base), x: -bx, y: -fy, ax: 0, ay: 0, ph: 0 }];
  const count = 11;
  for (let i = 0; i < count; i++) {
    const dir = i % 2 ? 1 : -1;
    const lift = (i / count) * 13 - 3;
    const len = 21 + hash(i, seed) * 8;
    const c = new Canvas(44, 34);
    const ox = dir > 0 ? 3 : 40;
    const oy = 15;
    const ramp = i < 4 ? [DEEP[1], DEEP[2], DEEP[3]] : [FRESH[2], FRESH[3], FRESH[4]];
    for (let t = 0; t <= 1; t += 0.03) {
      const x = ox + dir * t * len;
      const y = oy - lift * Math.sin(t * 2) + t * t * 15;
      const leaf = (1 - t) * 3 + 2;
      for (let j = 1; j <= leaf; j++) c.set(x, y + j, ramp[Math.floor((t * 34) % 2) ? 1 : j < 2 ? 2 : 0]);
      c.set(x, y, ramp[2]);
    }
    const s = sprite(c);
    parts.push({ s, x: cx - bx - ox, y: crownY - fy - oy, ax: 0.8 + 0.5 * (i / count), ay: 0.5, ph: hash(i, seed + 2) * 2.2 });
  }
  return { parts, per: 7, shadow: { h: 36, rx: 19, ry: 8 } };
}

// Pohon pangkas bulat di kanan kiri jalan, batang ramping.
function topiary(seed: number, ramp: Rgb[], bloom?: [Rgb, Rgb]): Plant {
  const [w, h, bx] = [36, 54, 18];
  const by = h - 3;
  const base = darkMass(w, h, [[18, 19, 14]], ramp, seed);
  limb(base, BARK, bx, by, bx, by - 22, 1.8, 1.4, seed);
  const clumps = scatter(18, 17, 11, 10, 8, 5.4, seed).map(([x, y], i) => ({ x, y, r: 4.6 + hash(i, seed), ramp, bloom, rate: 0.16 }));
  return makeTree({ w, h, bx, seed, base, clumps, per: 6.5, reach: 0.6, shadow: { h: 14, rx: 13, ry: 7 } });
}

function makeBush(seed: number, w: number, ramp: Rgb[], bloom?: [Rgb, Rgb], rate = 0.14, per = 6): Plant {
  const h = Math.round(w * 0.82);
  const by = h - 2;
  const lobes = [[w * 0.3, h * 0.58, w * 0.25], [w * 0.7, h * 0.58, w * 0.25], [w * 0.5, h * 0.44, w * 0.28]];
  const base = darkMass(w, h, lobes, ramp, seed);
  const rs = [w * 0.17, w * 0.2, w * 0.18, w * 0.15, w * 0.17, w * 0.15, w * 0.14];
  const spots = [[0.22, 0.42], [0.5, 0.24], [0.78, 0.38], [0.14, 0.66], [0.42, 0.56], [0.68, 0.6], [0.88, 0.66]];
  const parts: Part[] = [{ s: sprite(base), x: -w / 2, y: -by, ax: 0, ay: 0, ph: 0 }];
  spots.forEach(([u, v], i) => {
    const r = rs[i];
    const size = Math.ceil(r * 2 + 5);
    const s = sprite(leafClump(r, ramp, seed * 5 + i, bloom, rate));
    parts.push({ s, x: u * w - (size >> 1) - w / 2, y: v * h - (size >> 1) - by, ax: v < 0.5 ? 0.7 : 0.4, ay: 0.14, ph: hash(i, seed) * 2.4 });
  });
  return { parts, per, shadow: { h: 11, rx: w * 0.5, ry: w * 0.25 } };
}

// Rumpun berdaun panjang. Tiap helai sprite sendiri, ujungnya bisa berbunga.
function makeBlades(seed: number, w: number, h: number, ramp: Rgb[], tip?: Rgb): Plant {
  const rand = rng(seed * 3 + 1);
  const parts: Part[] = [];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const c = new Canvas(w + 6, h + 4);
    const u = (i + 0.5) / n;
    const lean = (u - 0.5) * w * 0.95 + (rand() - 0.5) * 2;
    const tall = h * (0.62 + rand() * 0.38);
    const x0 = (w + 6) / 2 + (u - 0.5) * 7;
    for (let t = 0; t <= 1; t += 0.03) {
      const x = x0 + lean * t * t;
      const y = h + 2 - t * tall;
      const col = ramp[t < 0.3 ? 2 : (t * 12) % 2 > 1 ? 3 : 4];
      c.set(x, y, col);
      if (t < 0.55) c.set(x + 1, y, ramp[2]);
      if (tip && t > 0.62) {
        c.set(x, y, tip);
        c.set(x + (Math.round(t * 30) % 2 ? 1 : -1), y, mix(tip, C.white, 0.35));
      }
    }
    parts.push({ s: sprite(c), x: -(w + 6) / 2, y: -(h + 2), ax: 0.45 + (rand() * 0.5), ay: 0.1, ph: rand() * 2.6 });
  }
  return { parts, per: 5.5, shadow: { h: 10, rx: w * 0.42, ry: w * 0.22 } };
}

// Satu potongan pagar tanaman. Baris panjang disusun dari banyak potongan supaya urutan kedalamannya tepat di sepanjang baris.
function hedgeSeg(seed: number, ramp: Rgb[], bloom: [Rgb, Rgb]): Plant {
  const [w, h] = [22, 18];
  const by = h - 3;
  const base = darkMass(w, h, [[11, 9, 8]], ramp, seed);
  const parts: Part[] = [{ s: sprite(base), x: -w / 2, y: -by, ax: 0, ay: 0, ph: 0 }];
  [[-3, -11, 4.8], [3, -9, 4.6]].forEach(([dx, dy, r], i) => {
    const size = Math.ceil(r * 2 + 5);
    parts.push({ s: sprite(leafClump(r, ramp, seed * 3 + i, bloom, 0.2)), x: dx - (size >> 1), y: dy - (size >> 1), ax: 0.4, ay: 0.12, ph: hash(i, seed) * 2.2 });
  });
  return { parts, per: 6, shadow: { h: 9, rx: 9, ry: 4.5 } };
}

// ---------------------------------------------------------------------------------------------------------------
// Bangunan kota dengan bayangan, jendela berbingkai, dan isi atap.
function richFacade(kind: Block, u: number, z: number, h: number, base: Rgb, seed: number, x: number, y: number): Rgb {
  const U = u + 800;
  if (z > h - 8) return z > h - 3 ? C.stoneLight : C.concreteDark;
  // Pipa air di sudut, kusam di dinding bawah.
  if (U % 248 < 4 && kind !== "kantor") return U % 248 < 2 ? C.concreteDark : C.steel;
  const grime = z < 16 ? shade(base, -0.2) : base;
  if (kind === "kantor") {
    if (z < 30) {
      if (U % 34 < 3 || z > 26) return C.steel;
      const lit = hash(Math.floor(U / 34), seed) > 0.45;
      return z < 5 ? C.dark : lit ? (z > 18 ? C.glowLight : C.glow) : (U + z) % 24 < 6 ? C.glassLight : C.glass;
    }
    const col = Math.floor(U / 22);
    const row = Math.floor((z - 30) / 22);
    if (U % 22 < 2.4 || (z - 30) % 22 < 2.4) return C.steel;
    const n = hash(col + seed, row);
    if (n > 0.84) return (z - 30) % 22 > 13 ? C.glowLight : C.glow;
    const glint = (U + z * 0.8) % 130 < 24;
    return glint ? C.glassLight : n > 0.45 ? C.glass : C.glassDark;
  }
  if (kind === "apartemen") {
    const ku = U % 44;
    const kz = z % 36;
    if (z < 34) {
      if (z > 27) return Math.floor(U / 12) % 2 ? C.teal : C.cloth;
      if (U % 88 < 4) return C.timber;
      return z < 5 ? C.dark : hash(Math.floor(U / 88), seed) > 0.5 ? C.glow : C.glass;
    }
    if (kz < 3) return shade(base, -0.28);
    if (ku > 7 && ku < 33 && kz > 9 && kz < 30) {
      if (ku < 10 || ku > 30 || kz < 12 || kz > 28) return kz < 12 ? C.stoneLight : C.line;
      const n = hash(Math.floor(U / 44) + seed, Math.floor(z / 36));
      if (n > 0.66) return kz > 20 ? C.glowLight : C.glow;
      if (n < 0.14 && kz > 21) return C.cloth;
      return (U + z) % 30 < 6 ? C.glassLight : C.glass;
    }
    // Unit AC di bawah sebagian jendela.
    if (ku > 13 && ku < 26 && kz >= 3 && kz <= 8 && hash(Math.floor(U / 44), Math.floor(z / 36) + seed) > 0.62) return kz < 5 ? C.concreteDark : (x % 2 ? C.stoneLight : C.stoneMid);
    return grime;
  }
  if (z < 36) {
    const ku = U % 64;
    if (ku < 4) return C.timber;
    if (z > 28) return Math.floor(U / 10) % 2 ? C.wine : C.cloth;
    if (z < 5) return C.dark;
    const n = hash(Math.floor(U / 64), seed);
    if (n > 0.66 && ku > 22 && ku < 42 && z < 24) return C.timber;
    return n > 0.4 ? (z > 18 ? C.glowLight : C.glow) : (U + y) % 20 < 4 ? C.glassLight : C.glass;
  }
  if (z < 41) return shade(C.wine, -0.2);
  const ku = U % 32;
  const kz = (z - 41) % 36;
  if (kz < 3) return shade(base, -0.24);
  if (ku > 7 && ku < 25 && kz > 8 && kz < 28) return ku < 10 || ku > 22 || kz < 10 ? C.line : hash(Math.floor(U / 32), Math.floor(z / 36) + seed) > 0.72 ? C.glow : C.glass;
  return grime;
}

function roofDetail(iso: Iso, l0: number, l1: number, s0: number, s1: number, h: number, seed: number) {
  const cast = (a0: number, a1: number, b0: number, b1: number, up: number) => {
    const dl = 0.49 * up;
    const ds = 0.89 * up;
    iso.floor(h, a0, a1 + dl, b0 - ds, b1, (l, s, x, y) => {
      for (let t = 0; t <= 1; t += 0.1) {
        const pl = l - t * dl;
        const ps = s + t * ds;
        if (pl >= a0 && pl <= a1 && ps >= b0 && ps <= b1) {
          const i = (Math.floor(y) * iso.c.w + Math.floor(x)) * 4;
          return mix([iso.c.data[i], iso.c.data[i + 1], iso.c.data[i + 2]], SHADOW, 0.4);
        }
      }
      return null;
    });
  };
  const al = l0 + (l1 - l0) * (0.22 + hash(seed, 5) * 0.34);
  const as = s0 + (s1 - s0) * (0.28 + hash(seed, 6) * 0.34);
  cast(al - 16, al + 16, as - 13, as + 13, 18);
  iso.box(al - 16, al + 16, as - 13, as + 13, h, h + 18, C.stoneLight, C.stoneDark, C.stoneMid);
  // Kisi kipas di atas mesin.
  iso.floor(h + 18, al - 11, al + 11, as - 8, as + 8, (l) => (Math.floor(l / 4) % 2 ? C.steel : C.steelLight));
  if (hash(seed, 7) > 0.4) {
    const tl = l1 - 46;
    const ts = s0 + 44;
    cast(tl - 13, tl + 13, ts - 13, ts + 13, 40);
    for (const [dl, ds] of [[-11, -11], [11, -11], [-11, 11], [11, 11]]) iso.box(tl + dl - 1.5, tl + dl + 1.5, ts + ds - 1.5, ts + ds + 1.5, h, h + 18, C.steelLight, C.steel, C.steelLight, null);
    const [x, y] = iso.xy(tl, ts, h + 18);
    const r = 16 / iso.art;
    const tall = 22 / iso.art;
    for (let k = -r; k <= r; k++) {
      const t = (k + r) / (2 * r);
      const col = t < 0.25 ? C.steel : t < 0.7 ? C.steelLight : C.concrete;
      const bow = Math.sqrt(Math.max(0, 1 - (k / r) ** 2)) * r * 0.45;
      for (let j = -tall; j <= bow; j++) iso.c.set(x + k, y + j, col);
      iso.c.set(x + k, y + bow + 1, C.line);
    }
    iso.c.disc(x, y - tall, r, (_, dy) => (dy > r * 0.42 || dy < -r * 0.42 ? null : C.concrete));
  }
  if (hash(seed, 8) > 0.5) {
    const [x, y] = iso.xy(l0 + 30, s1 - 30, h);
    iso.c.line(x, y, x, y - 34 / iso.art, C.line);
    iso.c.line(x - 3, y - 26 / iso.art, x + 3, y - 26 / iso.art, C.steel);
    iso.c.line(x - 2, y - 20 / iso.art, x + 2, y - 20 / iso.art, C.steel);
  }
}

function townBlock(iso: Iso, l0: number, l1: number, s0: number, s1: number, h: number, seed: number) {
  const kinds: Block[] = ["kantor", "apartemen", "ruko"];
  const kind = kinds[Math.floor(hash(seed, 3) * 3)];
  const [base, dark] = BLOCK_TONES[Math.floor(hash(seed, 9) * BLOCK_TONES.length)];
  // Dinding kanan menghadap matahari, dinding kiri sisi teduh.
  iso.wallS(s1, l0, l1, 0, h, (l, z, x, y) => {
    const c = richFacade(kind, l - l0, z, h, base, seed, x, y);
    return c === C.glow || c === C.glowLight ? c : shade(c, 0.05);
  });
  iso.wallL(l0, s0, s1, 0, h, (s, z, x, y) => {
    const c = richFacade(kind, s - s0, z, h, shade(base, -0.16), seed + 1, x, y);
    return c === C.glow || c === C.glowLight ? mix(c, C.glowDark, 0.35) : shade(c, -0.16);
  });
  iso.floor(h, l0, l1, s0, s1, (l, s) => {
    if (l < l0 + 7 || l > l1 - 7 || s < s0 + 7 || s > s1 - 7) return l > l1 - 7 || s < s0 + 7 ? C.concrete : C.stoneLight;
    // Bayangan tembok tepi di sisi yang menghadap matahari.
    if (l < l0 + 12 || s > s1 - 12) return shade(dark, -0.3);
    const tile = (l + 900) % 26 < 2 || (s + 900) % 26 < 2;
    return tile ? shade(dark, -0.18) : Math.floor(l / 26 + s / 26) % 2 ? dark : shade(dark, -0.07);
  });
  iso.seg([l0, s0, h], [l1, s0, h]);
  iso.seg([l1, s0, h], [l1, s1, h]);
  iso.seg([l1, s1, h], [l0, s1, h]);
  iso.seg([l0, s1, h], [l0, s0, h]);
  iso.seg([l0, s1, 0], [l0, s1, h]);
  iso.seg([l0, s0, 0], [l0, s0, h]);
  iso.seg([l1, s1, 0], [l1, s1, h]);
  roofDetail(iso, l0, l1, s0, s1, h, seed);
}

// Gerbang beton dan balok baja. Papan nama digambar di atas baloknya oleh door.tsx.
function drawGate(iso: Iso) {
  const { gateL: L, gateS: S, gateZ: Z } = TOWN;
  for (const k of [-1, 1]) {
    iso.box(L - 18, L + 18, k * S - 18, k * S + 18, 0, 12, C.stoneLight, C.concreteDark, C.concrete);
    iso.wallL(L - 12, k * S - 12, k * S + 12, 12, Z, (_, z) => (z % 30 < 3 ? C.steel : z % 30 < 5 ? C.stoneDark : C.concreteDark));
    iso.wallS(k * S + 12, L - 12, L + 12, 12, Z, (l, z) => (z % 30 < 3 ? C.steel : Math.abs(l - L) < 3 && z > 30 ? C.glowLight : C.concrete));
    iso.seg([L - 12, k * S - 12, 12], [L - 12, k * S - 12, Z]);
    iso.seg([L - 12, k * S + 12, 12], [L - 12, k * S + 12, Z]);
    iso.seg([L + 12, k * S + 12, 12], [L + 12, k * S + 12, Z]);
  }
  const BOARD = 70;
  iso.box(L - 14, L + 14, -S - 28, S + 28, Z, Z + BOARD, C.steelLight, C.steel, C.steelLight);
  iso.wallL(L - 14, -S - 28, S + 28, Z, Z + BOARD, (s, z) => {
    const e = Math.min(z - Z, Z + BOARD - z, s + S + 28, S + 28 - s);
    if (e < 2.4) return C.line;
    if (e < 6.5) return e < 4.6 ? C.goldBar : C.line;
    return hex("#39424d");
  });
  iso.box(L - 18, L + 18, -S - 34, S + 34, Z + BOARD, Z + BOARD + 6, C.stoneLight, C.concreteDark, C.concrete);
  iso.wallL(L - 14, -S - 28, S + 28, Z - 3, Z, () => C.glowLight);
  iso.box(L - 12, L + 12, -S - 26, S + 26, Z + BOARD + 6, Z + BOARD + 14, C.stoneLight, C.stoneDark, C.stoneMid);
  // Kotak bunga di atas balok: bunga putih dan merah muda berselang.
  for (let s = -S - 14; s <= S + 14; s += 24) {
    const [x, y] = iso.xy(L, s, Z + BOARD + 20);
    const i = Math.round(s + 500);
    paste(iso.c, leafClump(5.2, WARM, i, i % 3 ? WHITE_BLOOM : PINK_BLOOM, 0.2), x - 7, y - 7);
  }
}

// Gedung pernikahan: gedung kota bertingkat dengan lobi kaca menyala, dinding kaca di atasnya, dan kanopi pintu.
function mainHall(iso: Iso) {
  const { doorL: L0, bl1: L1, bs: S, wall: W, lobby: B } = TOWN;
  const upper = (u: number, z: number) => {
    if (z > W - 10) return z > W - 4 ? C.stoneLight : C.concrete;
    if ((z - B) % 36 < 4) return (z - B) % 36 < 2 ? C.concreteDark : C.concrete;
    if ((u + 800) % 40 < 3) return C.steel;
    const n = hash(Math.floor((u + 800) / 40), Math.floor((z - B) / 36));
    if (n > 0.74) return (z - B) % 36 > 22 ? C.glowLight : C.glow;
    const glint = (u + 800 + z * 0.9) % 150 < 30;
    return glint ? C.glassLight : n > 0.4 ? C.glass : C.glassDark;
  };
  iso.wallS(S, L0, L1, 0, W, (l, z) => {
    const u = l - L0;
    if (z < 8) return C.rock;
    if (z < B - 12) {
      const k = u % 68;
      if (k < 5) return C.concrete;
      if (z > B - 24) return (u + 900) % 12 < 2 ? C.goldBar : C.glowLight;
      if (z > B - 28) return C.steel;
      // Tirai di sisi kaca dan tanaman di balik kaca.
      if (k < 15) return Math.floor(k) % 3 ? C.cloth : C.clothDark;
      if (k > 58) return Math.floor(k) % 3 ? C.clothDark : C.cloth;
      if (z < 24 && Math.abs(k - 36) < 9 && hash(Math.floor(u / 68), 3) > 0.4) return (Math.floor(k) + Math.floor(z)) % 3 ? C.leafDark : C.leaf;
      return z > 62 ? C.glowLight : C.glow;
    }
    if (z < B) return C.concrete;
    const c = upper(u, z);
    return c === C.glow || c === C.glowLight ? c : shade(c, 0.06);
  });
  iso.wallL(L0, -S, S, 0, W, (s, z) => {
    const a = Math.abs(s);
    if (z < 8) return C.rockDark;
    if (z < B - 12) {
      if (a < 62) {
        if (a < 2 || z > B - 20) return C.steel;
        if (a > 58) return C.steel;
        if (a > 6 && a < 10 && z > 44 && z < 74) return C.goldBar;
        return z > 84 ? C.glowLight : C.glow;
      }
      return (a + 800) % 58 < 5 ? C.concreteDark : z > B - 30 ? C.glow : C.glowDark;
    }
    if (z < B) return C.concreteDark;
    // Bidang tengah polos dengan bunga netral, kaca di kanan dan kirinya.
    if (a < 60 && z < W - 10) {
      if (a > 56) return C.concreteDark;
      return flower(s, z - (B + W) / 2, 26, C.white, C.glow) ?? (z % 8 < 1 ? C.wineDark : C.wine);
    }
    const c = upper(a, z);
    return c === C.glow || c === C.glowLight ? mix(c, C.glowDark, 0.3) : shade(c, -0.14);
  });
  iso.seg([L0, S, 0], [L0, S, W]);
  iso.seg([L0, -S, 0], [L0, -S, W]);
  iso.floor(W, L0, L1, -S, S, (l, s) => {
    if (l > L1 - 8 || s < -S + 8) return C.stoneLight;
    if (l < L0 + 8 || s > S - 8) return C.stone;
    if (l < L0 + 14 || s > S - 14) return shade(C.rock, -0.34);
    return (l + 900) % 30 < 2 || (s + 900) % 30 < 2 ? C.rockDark : Math.floor(l / 30 + s / 30) % 2 ? C.stoneDark : C.rock;
  });
  iso.seg([L0, -S, W], [L1, -S, W]);
  iso.seg([L1, -S, W], [L1, S, W]);
  iso.seg([L1, S, W], [L0, S, W]);
  iso.seg([L0, S, W], [L0, -S, W]);
  roofDetail(iso, L0 + 20, L1 - 20, -S + 20, S - 20, W, 12);
  iso.box(L1 - 240, L1 - 200, -110, -70, W, W + 34, C.steelLight, C.steel, C.steelLight);

  // Tangga, karpet, dan kanopi di atas pintu.
  iso.box(L0 - 34, L0, -96, 96, 0, 8, C.stoneLight, C.stoneDark, C.stoneMid);
  iso.box(L0 - 17, L0, -80, 80, 8, 16, C.stoneLight, C.stoneDark, C.stoneMid);
  iso.floor(9, L0 - 34, L0 - 17, -44, 44, (_, s) => (Math.abs(s) > 40 ? C.goldBar : C.wine));
  iso.floor(17, L0 - 17, L0, -44, 44, (_, s) => (Math.abs(s) > 40 ? C.goldBar : C.wineLight));
  iso.wallL(L0 - 34, -44, 44, 0, 8, () => C.wineDark);
  iso.wallL(L0 - 17, -44, 44, 8, 16, () => C.wineDark);
  for (const k of [-1, 1]) iso.box(L0 - 62, L0 - 50, k * 86 - 6, k * 86 + 6, 0, B + 4, C.stoneLight, C.concreteDark, C.concrete);
  iso.box(L0 - 70, L0, -100, 100, B + 4, B + 16, C.stoneLight, C.steel, C.steelLight);
  iso.wallL(L0 - 70, -100, 100, B + 4, B + 7, () => C.glowLight);
  // Rangkaian bunga di tepi kanopi.
  for (let s = -92; s <= 92; s += 15) {
    const [x, y] = iso.xy(L0 - 70, s, B + 6);
    const i = Math.round(s + 200);
    paste(iso.c, leafClump(3.4, FRESH, i, i % 2 ? WHITE_BLOOM : PINK_BLOOM, 0.3), x - 5, y - 5);
  }
}

// Mobil dari profil samping yang diekstrusi selebar badan: kap, kaca, dan atap punya kemiringan sendiri, bukan tumpukan kotak.
type CarKind = "sedan" | "hatch" | "mpv" | "pickup";
type CarPoint = [number, number, string];
const CAR_PROFILES: Record<CarKind, { pts: CarPoint[]; belt: number; seam: number; pillar: number; wheel: number }> = {
  sedan: { pts: [[-37, 13, "rear"], [-37, 26, "deck"], [-24, 28, "rearglass"], [-12, 46, "roof"], [9, 46, "wind"], [21, 29, "hood"], [36, 26, "front"], [37, 13, ""]], belt: 30, seam: 0, pillar: -2, wheel: 25 },
  hatch: { pts: [[-31, 13, "rear"], [-31, 28, "rearglass"], [-22, 45, "roof"], [7, 45, "wind"], [18, 28, "hood"], [30, 25, "front"], [31, 13, ""]], belt: 29, seam: -3, pillar: -6, wheel: 20 },
  mpv: { pts: [[-37, 13, "rear"], [-37, 31, "rearglass"], [-33, 52, "roof"], [15, 52, "wind"], [24, 30, "hood"], [36, 27, "front"], [37, 13, ""]], belt: 32, seam: 2, pillar: -9, wheel: 25 },
  pickup: { pts: [[-38, 13, "rear"], [-38, 29, "bed"], [-9, 29, "backcab"], [-9, 47, "roof"], [9, 47, "wind"], [19, 29, "hood"], [37, 26, "front"], [38, 13, ""]], belt: 30, seam: 5, pillar: 99, wheel: 26 },
};

// dir 1: moncong ke arah penonton, dir -1: bagian belakang yang terlihat.
function car(iso: Iso, l: number, s: number, body: Rgb, kind: CarKind, dir: 1 | -1, married = false) {
  const { pts, belt, seam, pillar, wheel } = CAR_PROFILES[kind];
  const W = 23;
  const R = 8;
  const L = pts[pts.length - 1][0];
  const lit = shade(body, 0.24);
  const soft = shade(body, 0.1);
  const dim = shade(body, -0.16);
  const deep = shade(body, -0.36);
  const S = (a: number) => s + dir * a;
  const top = (a: number) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [a0, z0] = pts[i];
      const [a1, z1] = pts[i + 1];
      if (a1 > a0 && a >= a0 && a <= a1) return z0 + ((a - a0) / (a1 - a0)) * (z1 - z0);
    }
    return -1;
  };
  const glass = (u: number, v: number) => {
    if (u < 0.06 || u > 0.94 || v < 0.05 || v > 0.95) return dim;
    const k = (u * 20 + v * 9 + 3) % 20;
    return k < 2.4 ? C.glassLight : v < 0.4 ? C.glass : C.glassDark;
  };
  const faceColor = (tag: string) => (u: number, v: number): Rgb | null => {
    const stripe = married && Math.abs(u - 0.5) < 0.09;
    switch (tag) {
      case "roof":
        if (stripe) return C.white;
        if (u < 0.05 || u > 0.95 || v < 0.03 || v > 0.97) return soft;
        return u > 0.2 && u < 0.46 ? shade(body, 0.36) : lit;
      case "hood":
      case "deck":
        if (stripe) return C.white;
        if (v < 0.07) return deep;
        if (Math.abs(u - 0.24) < 0.015 || Math.abs(u - 0.76) < 0.015) return soft;
        return u > 0.3 && u < 0.52 ? shade(body, 0.32) : lit;
      case "wind":
      case "rearglass":
        return glass(u, v);
      case "backcab":
        return u > 0.16 && u < 0.84 && v > 0.22 && v < 0.74 ? glass(u, v) : soft;
      case "bed":
        if (u < 0.08 || u > 0.92 || v < 0.05 || v > 0.95) return lit;
        return (v * 30) % 5 < 1 ? C.timber : C.dark;
      case "front":
        if (v > 0.84) return C.line;
        if (v > 0.56) return Math.abs(u - 0.5) < 0.14 ? C.stoneLight : C.concrete;
        if (u < 0.22 || u > 0.78) return C.glowLight;
        if (u < 0.28 || u > 0.72) return body;
        return C.line;
      case "rear":
        if (v > 0.84) return C.line;
        if (v > 0.56) return Math.abs(u - 0.5) < 0.14 ? C.stoneLight : C.steelLight;
        if (u < 0.26 || u > 0.74) return hex("#d0403f");
        return body;
      default:
        return null;
    }
  };
  // Bayangan kontak di bawah badan.
  iso.floor(1, l - W + 4, l + W - 2, Math.min(S(-L), S(L)) + 3, Math.max(S(-L), S(L)) - 3, () => C.line);
  const order = pts.slice(0, -1).map((_, i) => i);
  if (dir < 0) order.reverse();
  for (const i of order) {
    const [a0, z0, tag] = pts[i];
    const [a1, z1] = pts[i + 1];
    // Dari jauh ke dekat, sisi yang membelakangi penonton dilewati.
    const [af, zf, an, zn] = dir > 0 ? [a0, z0, a1, z1] : [a1, z1, a0, z0];
    const projected = (S(an) - S(af)) / 2 - (zn - zf);
    if (projected <= 0) continue;
    iso.face([l - W, S(af), zf], [l + W, S(af), zf], [l - W, S(an), zn], faceColor(tag));
  }
  // Sisi panjang: jendela, pintu, spakbor, dan roda.
  const zMax = Math.max(...pts.map((p) => p[1]));
  iso.wallL(l - W, Math.min(S(-L), S(L)), Math.max(S(-L), S(L)), 0, zMax, (Sv, z) => {
    const a = (Sv - s) * dir;
    for (const k of [-1, 1]) {
      const d = Math.hypot(a - k * wheel, z - R);
      if (d < R) {
        if (d < R * 0.26) return C.steel;
        if (d < R * 0.56) return a - k * wheel + (z - R) > 0 ? C.stoneLight : C.stoneDark;
        return d < R * 0.68 ? C.line : hex("#25222b");
      }
      if (d < R + 1.8 && z >= 8) return C.line;
    }
    const h = top(a);
    if (h < 0 || z > h || z < 8) return null;
    if (z > belt + 1) {
      if (z > h - 2.4) return soft;
      if (Math.abs(a - pillar) < 1.8) return deep;
      const k = (a + z * 0.9 + 400) % 36;
      return k < 3 ? C.glassLight : z > belt + 8 ? C.glass : C.glassDark;
    }
    if (z > belt - 1.2) return married ? C.goldBar : C.stoneLight;
    if (z < 12) return deep;
    if (Math.abs(a) > L - 3 && z < 19) return C.steelLight;
    if (a > L - 5 && z > 21) return hex("#e8a93a");
    if (a < -L + 5 && z > 21) return hex("#b52f3a");
    if (Math.abs(a - seam) < 0.8) return deep;
    if (Math.abs(a - (seam - 3.5)) < 2 && z > belt - 6 && z < belt - 3.6) return C.stoneLight;
    return z > belt - 7 ? body : z > 16 ? shade(body, -0.07) : dim;
  });
  // Kaca spion.
  const [mx, my] = iso.xy(l - W - 3, S(10), belt + 2);
  iso.c.rect(mx, my, 2, 2, C.line);
  iso.c.set(mx, my, dim);
  if (married) {
    const hoodA = dir > 0 ? L - 8 : -L + 8;
    const [hx0, hy0] = iso.xy(l, S(hoodA), top(hoodA) + 4);
    paste(iso.c, leafClump(4.2, WARM, Math.round(l + s), WHITE_BLOOM, 0.4), hx0 - 6, hy0 - 6);
  }
}

// Bangku taman kecil: dudukan dua bilah, sandaran dua bilah berjarak, kaki besi. Digambar langsung per piksel supaya
// garis isometriknya rapi. along "s" adalah cermin along "l", sisinya sedikit lebih teduh.
function bench(c: Canvas, cx: number, cy: number, along: "l" | "s") {
  const [LEN, DEP, SEAT, BACK] = [20, 5, 6, 13];
  const [pale, mid, dark] = along === "l" ? [C.woodPale, C.woodLight, C.wood] : [C.woodLight, C.wood, C.timber];
  const b = new Canvas(LEN + DEP + 5, Math.ceil(LEN / 2) + Math.ceil(DEP / 2) + BACK + 5);
  const [ox, oy] = [2, Math.ceil(LEN / 2) + BACK + 2];
  const put = (u: number, v: number, z: number, col: Rgb) => b.set(ox + u + v, oy + Math.floor((v - u) / 2) - z, col);
  for (const u of [2, LEN - 2]) for (let z = 0; z <= BACK; z++) put(u, 0, z, C.steel);
  for (let u = 0; u <= LEN; u++) {
    put(u, 0, BACK - 1, pale);
    put(u, 0, BACK - 2, mid);
    put(u, 0, BACK - 4, mid);
    put(u, 0, BACK - 5, dark);
  }
  for (const u of [2, LEN - 2]) for (let z = SEAT + 1; z <= BACK - 1; z++) if (z !== BACK - 1 && z !== BACK - 2 && z !== BACK - 4 && z !== BACK - 5) put(u, 0, z, C.steel);
  for (const u of [2, LEN - 2]) for (let z = 0; z < SEAT; z++) put(u, 1, z, C.steel);
  for (let v = 0; v <= DEP; v++) {
    for (let u = 0; u <= LEN; u++) put(u, v, SEAT, v === 2 ? dark : v < 2 ? mid : pale);
  }
  for (let u = 0; u <= LEN; u++) put(u, DEP, SEAT - 1, dark);
  for (const u of [2, LEN - 2]) for (let z = 0; z < SEAT - 1; z++) put(u, DEP, z, C.steel);
  // Sandaran lengan dari besi di kedua ujung.
  for (const u of [0, LEN]) {
    for (let v = 0; v <= DEP; v++) put(u, v, SEAT + 4, C.steelLight);
    for (let z = SEAT + 1; z < SEAT + 4; z++) put(u, DEP, z, C.steel);
  }
  const [mx, my] = [ox + Math.round(LEN / 2 + DEP / 2), oy + Math.floor((DEP / 2 - LEN / 2) / 2)];
  for (let y = 0; y < b.h; y++) {
    for (let x = 0; x < b.w; x++) {
      const i = (y * b.w + x) * 4;
      if (!b.data[i + 3]) continue;
      const col: Rgb = [b.data[i], b.data[i + 1], b.data[i + 2]];
      c.set(Math.round(cx) + (along === "l" ? x - mx : mx - x), Math.round(cy) + y - my, col);
    }
  }
}

const SIGN_FONT: Record<string, string[]> = {
  I: ["111", "010", "010", "010", "111"],
  N: ["1001", "1101", "1011", "1001", "1001"],
  O: ["111", "101", "101", "101", "111"],
  U: ["101", "101", "101", "101", "111"],
  T: ["111", "010", "010", "010", "010"],
};

function roadSign(iso: Iso, l: number, s: number, panel: Rgb, text: string) {
  iso.box(l - 1.5, l + 1.5, s - 1.5, s + 1.5, 0, 60, C.steelLight, C.steel, C.steelLight, null);
  const [cx, cy] = iso.xy(l, s, 66).map(Math.round);
  const glyphs = [...text].map((ch) => SIGN_FONT[ch]);
  const w = glyphs.reduce((n, g) => n + g[0].length + 1, 3);
  const h = 9;
  const x0 = cx - (w >> 1);
  const y0 = cy - (h >> 1);
  iso.c.rect(x0, y0, w, h, C.white);
  iso.c.rect(x0 + 1, y0 + 1, w - 2, h - 2, panel);
  let at = x0 + 2;
  for (const g of glyphs) {
    g.forEach((row, j) => {
      [...row].forEach((on, i) => {
        if (on === "1") iso.c.set(at + i, y0 + 2 + j, C.white);
      });
    });
    at += g[0].length + 1;
  }
}

function trashBin(iso: Iso, l: number, s: number) {
  iso.box(l - 7, l + 7, s - 7, s + 7, 0, 26, C.leaf, C.leafDark, C.leaf);
  iso.box(l - 8, l + 8, s - 8, s + 8, 26, 30, C.steelLight, C.steel, C.steelLight);
}

function bollard(iso: Iso, l: number, s: number) {
  iso.box(l - 3, l + 3, s - 3, s + 3, 0, 18, C.stoneLight, C.steel, C.steelLight, C.line);
  iso.box(l - 3, l + 3, s - 3, s + 3, 13, 16, C.goldBar, C.goldBar, C.goldBar, null);
}

// Papan bunga ucapan khas resepsi: rangka bambu, kain warna, dan rangkaian bunga di tepinya.
function flowerBoard(iso: Iso, l: number, s: number, panel: Rgb, seed: number) {
  const [wd, h] = [38, 92];
  for (const k of [-1, 1]) iso.box(l - 2, l + 2, s + k * wd - 2, s + k * wd + 2, 0, h - 10, BAMBOO[3], BAMBOO[1], BAMBOO[2], null);
  iso.wallL(l, s - wd, s + wd, 28, h, (a, z) => {
    const u = (a - s) / wd;
    const v = (z - 28) / (h - 28);
    if (Math.abs(u) > 0.9 || v > 0.92 || v < 0.08) return shade(panel, -0.26);
    if (Math.abs(u) < 0.08) return C.goldBar;
    if (Math.abs(v - 0.62) < 0.05 && Math.abs(u) > 0.2 && Math.abs(u) < 0.72) return C.white;
    if (Math.abs(v - 0.42) < 0.03 && Math.abs(u) > 0.3 && Math.abs(u) < 0.62) return C.cloth;
    return panel;
  });
  iso.seg([l, s - wd, 28], [l, s + wd, 28]);
  iso.seg([l, s - wd, h], [l, s + wd, h]);
  iso.seg([l, s - wd, 28], [l, s - wd, h]);
  iso.seg([l, s + wd, 28], [l, s + wd, h]);
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const edge = i < 3 ? [s - wd + t * 3 * wd * 0.7, h] : i < 6 ? [s + wd - (t - 0.37) * 3 * wd * 0.7, h] : [s - wd + (i - 6) * wd, 28];
    const [x, y] = iso.xy(l, edge[0], edge[1]);
    paste(iso.c, leafClump(3.2, WARM, seed + i, i % 2 ? PINK_BLOOM : WHITE_BLOOM, 0.5), x - 5, y - 5);
  }
}

function oval(c: Canvas, x: number, y: number, rx: number, ry: number, fn: (dx: number, dy: number) => Rgb) {
  for (let j = -Math.ceil(ry); j <= ry; j++) {
    for (let i = -Math.ceil(rx); i <= rx; i++) {
      if ((i / rx) ** 2 + (j / ry) ** 2 <= 1) c.set(x + i, y + j, fn(i, j));
    }
  }
}

// Meja resepsi bertaplak di teras, sebagian berpayung.
function roundTable(c: Canvas, x: number, y: number, parasol: boolean, seed: number) {
  const chair = (cx: number, cy: number) => {
    c.rect(cx - 1, cy - 8, 4, 1, C.goldBar);
    c.rect(cx - 1, cy - 8, 1, 8, C.glowDark);
    c.rect(cx + 2, cy - 8, 1, 8, C.glowDark);
    c.rect(cx - 2, cy - 4, 6, 2, C.cloth);
  };
  chair(x - 2, y - 9);
  chair(x - 13, y - 3);
  chair(x + 10, y - 3);
  oval(c, x, y - 1, 11, 5, () => C.clothDark);
  c.rect(x - 10, y - 8, 21, 7, C.cloth);
  for (let i = -9; i <= 9; i += 4) c.rect(x + i, y - 7, 1, 8, C.clothDark);
  oval(c, x, y - 8, 11, 5.4, (dx) => (dx > 2 ? C.white : C.plasterLight));
  paste(c, leafClump(2.8, WARM, seed, PINK_BLOOM, 0.7), x - 4, y - 13);
  chair(x - 2, y + 7);
  if (!parasol) return;
  c.rect(x, y - 34, 1, 26, C.wood);
  const tent = y - 33;
  for (let j = 0; j < 9; j++) {
    const hw = 15 - j * 1.55;
    for (let i = -hw; i <= hw; i++) {
      const wedge = Math.floor((i / Math.max(hw, 1) + 1) * 3);
      c.set(x + i, tent - j, wedge % 2 ? C.wine : C.cloth);
    }
  }
  oval(c, x, tent, 15, 3, (dx) => (Math.floor((dx + 16) / 5) % 2 ? C.wine : C.cloth));
  c.set(x, tent - 10, C.goldBar);
}

// Gazebo kayu beratap genteng untuk sudut foto.
function gazebo(iso: Iso, l: number, s: number) {
  const P = 48;
  const C0 = 38;
  iso.box(l - P, l + P, s - P, s + P, 0, 9, C.stoneLight, C.stoneDark, C.stoneMid);
  iso.floor(9, l - P + 4, l + P - 4, s - P + 4, s + P - 4, (a, b) => ((Math.floor(a / 9) + Math.floor(b / 9)) % 2 ? C.woodLight : C.woodPale));
  const col = (a: number, b: number) => iso.box(a - 4, a + 4, b - 4, b + 4, 9, 74, C.plasterLight, C.plasterDark, C.plasterLight);
  col(l + C0, s - C0);
  col(l + C0, s + C0);
  col(l - C0, s - C0);
  // Pagar rendah di sisi belakang.
  for (const [a0, a1, b0, b1] of [[l - C0, l + C0, s - C0 - 2, s - C0 + 2], [l + C0 - 2, l + C0 + 2, s - C0, s + C0]]) iso.box(a0, a1, b0, b1, 26, 30, C.woodPale, C.wood, C.woodLight, null);
  // Rangkaian bunga di tengah.
  const [fx, fy] = iso.xy(l + 12, s - 12, 12);
  iso.c.rect(fx - 3, fy - 10, 7, 10, C.wood);
  paste(iso.c, leafClump(5.6, WARM, 77, PINK_BLOOM, 0.3), fx - 7, fy - 18);
  col(l - C0, s + C0);
  const E = 54;
  const eave = 74;
  const peak = 118;
  // Atap piramid: dua sisi yang menghadap penonton, sisi kanan kena matahari.
  const shingles = (u: number, v: number, dark: boolean, x: number, y: number) => {
    if (u + v > 1) return null;
    const row = Math.floor(v * 9);
    const n = hash(Math.floor((u + (row % 2) * 0.06) * 14), row);
    const base = n > 0.7 ? C.tilePale : n > 0.28 ? C.tileLight : C.tile;
    if ((v * 9) % 1 < 0.2) return dark ? C.brickDark : C.tileDark;
    void x;
    void y;
    return dark ? shade(base, -0.2) : base;
  };
  iso.face([l - E, s + E, eave], [l + E, s + E, eave], [l, s, peak], (u, v, x, y) => shingles(u, v, false, x, y));
  iso.face([l - E, s + E, eave], [l - E, s - E, eave], [l, s, peak], (u, v, x, y) => shingles(u, v, true, x, y));
  iso.seg([l - E, s + E, eave], [l + E, s + E, eave]);
  iso.seg([l - E, s + E, eave], [l - E, s - E, eave]);
  iso.seg([l - E, s + E, eave], [l, s, peak], C.tileDark);
  iso.seg([l + E, s + E, eave], [l, s, peak], C.tileDark);
  iso.seg([l - E, s - E, eave], [l, s, peak], C.tileDark);
  const [px, py] = iso.xy(l, s, peak);
  iso.c.rect(px - 1, py - 5, 2, 5, C.goldBar);
  for (let t = 0; t <= 1; t += 1 / 6) {
    const [ax, ay] = iso.xy(l - E + t * 2 * E, s + E, eave - 2);
    paste(iso.c, leafClump(3, FRESH, Math.round(t * 60), t * 6 % 2 ? WHITE_BLOOM : PINK_BLOOM, 0.5), ax - 4, ay - 4);
    const [bx, by] = iso.xy(l - E, s + E - t * 2 * E, eave - 2);
    paste(iso.c, leafClump(3, FRESH, Math.round(t * 80 + 9), t * 6 % 2 ? PINK_BLOOM : WHITE_BLOOM, 0.5), bx - 4, by - 4);
  }
}

// Air mancur dua tingkat dengan sudut 2:1 yang sama seperti peta: lingkar batu per blok, air rata, dan mangkuk di atas tiang.
// Bagian batu diam, air dan alirannya lembar frame yang berulang tanpa sambungan.
const FOUNTAIN = { l: 362, s: 190, rx: 30, ry: 15, wall: 7, inX: 22, inY: 11, sink: 3 };
const FOUNTAIN_FRAMES = 24;
const STONE = tones("#54516a", "#76738c", "#9a97ae", "#c1bfcf", "#e8e7f0");
const POOL = tones("#14595f", "#21908c", "#38b3a6", "#7fe6cf", "#eafff4");
const inOval = (i: number, j: number, rx: number, ry: number) => (i / rx) ** 2 + (j / ry) ** 2 <= 1;
// Mangkuk atas, dalam koordinat dari pusat bibir kolam.
const BOWL = { y: -17, rx: 13, ry: 6.5, wall: 2, inX: 10, inY: 5 };

// Terang permukaan bulat: matahari di kanan bawah, jadi puncak terang sedikit ke kanan dan sisi kiri paling gelap.
const roundTone = (u: number, bias = 0) => STONE[Math.max(0, Math.min(4, Math.floor((0.46 + 0.62 * u - 0.5 * u * u + bias) * 5)))];

// Benda putar dari tumpukan elips, bawah ke atas. Profil: [tinggi, jari-jari]. Bagian melebar ke atas teduh, menyempit terang.
function lathe(c: Canvas, ox: number, baseY: number, profile: number[][]) {
  const top = profile[profile.length - 1][0];
  for (let z = 0; z <= top; z++) {
    const k = profile.findIndex((p) => p[0] >= z);
    const [z1, r1] = profile[k];
    const [z0, r0] = profile[Math.max(0, k - 1)];
    const r = z1 === z0 ? r1 : r0 + ((z - z0) / (z1 - z0)) * (r1 - r0);
    const slope = z1 === z0 ? 0 : (r1 - r0) / (z1 - z0);
    const bias = slope > 0.3 ? -0.26 : slope < -0.3 ? 0.2 : 0;
    const ry = r / 2;
    for (let j = -Math.ceil(ry); j <= ry; j++) {
      for (let i = -Math.ceil(r); i <= r; i++) {
        if (inOval(i, j, r, ry)) c.set(ox + i, baseY - z + j, roundTone(i / Math.max(r, 1), bias));
      }
    }
  }
}

function fountainRim() {
  const { rx, ry, wall, inX, inY, sink } = FOUNTAIN;
  const c = new Canvas(rx * 2 + 7, ry * 2 + wall + 7);
  const [ox, oy] = [rx + 3, ry + 3];
  const blocks = 14;
  // Sisi luar: tumpukan elips dengan terang silinder, garis blok mengikuti lengkung.
  for (let z = 0; z < wall; z++) {
    for (let j = -ry; j <= ry; j++) {
      for (let i = -rx; i <= rx; i++) {
        if (!inOval(i, j, rx, ry)) continue;
        const u = i / rx;
        const seam = ((Math.acos(u) / Math.PI) * blocks) % 1 < 0.1;
        c.set(ox + i, oy + wall - z + j, seam ? STONE[0] : roundTone(u, z < 2 ? -0.2 : z > wall - 3 ? 0.1 : 0));
      }
    }
  }
  for (let j = -ry; j <= ry; j++) {
    for (let i = -rx; i <= rx; i++) {
      if (!inOval(i, j, rx, ry)) continue;
      if (inOval(i, j, inX, inY)) {
        if (inOval(i, j - sink, inX, inY)) {
          c.set(ox + i, oy + j, POOL[1]);
          continue;
        }
        // Dinding dalam sisi jauh menghadap penonton dan matahari, sisi kiri lebih terang karena cekung.
        const k = ((Math.atan2(j / inY, i / inX) + Math.PI) / (Math.PI * 2)) * blocks;
        const edge = !inOval(i, j - sink + 1, inX, inY);
        c.set(ox + i, oy + j, k % 1 < 0.12 ? STONE[0] : edge ? (i < 0 ? STONE[2] : STONE[1]) : STONE[0]);
        continue;
      }
      // Bibir batu rata: blok berselang, tepi depan paling terang.
      const k = ((Math.atan2(j / ry, i / rx) + Math.PI) / (Math.PI * 2)) * blocks;
      const outer = !inOval(i, j, rx - 1.6, ry - 1);
      const inner = inOval(i, j, inX + 1.4, inY + 0.8);
      let col = STONE[Math.floor(k) % 2 ? 3 : 2];
      if (k % 1 < 0.09) col = STONE[1];
      else if (outer) col = j > 0 ? STONE[4] : STONE[3];
      else if (inner) col = j > 0 ? STONE[4] : STONE[1];
      c.set(ox + i, oy + j, col);
    }
  }
  outline(c);
  return { c, ox, oy };
}

// Permukaan kolam: warna rata, bayangan bibir dan mangkuk ke arah jam 11, dan riak yang melebar teratur.
function fountainSurface(frame: number) {
  const { inX, inY, sink } = FOUNTAIN;
  const c = new Canvas(inX * 2 + 1, inY * 2 + 1);
  const t = frame / FOUNTAIN_FRAMES;
  // Air hanya di dalam lubang bibir batu, tidak boleh melewati bibir sisi depan.
  const mask = (i: number, j: number) => inOval(i, j, inX, inY) && inOval(i, j + sink, inX, inY);
  for (let j = -inY; j <= inY; j++) {
    for (let i = -inX; i <= inX; i++) {
      if (!mask(i, j)) continue;
      // Bibir sisi depan dan mangkuk menjatuhkan bayangan ke kiri atas.
      const rimShade = !inOval(i + 4, j + 2, inX, inY);
      const bowlShade = inOval(i + 7, j + 6, 12.5, 6);
      c.set(inX + i, inY + j, rimShade || bowlShade ? POOL[0] : POOL[1]);
    }
  }
  // Garis pantulan terang di tepi air sisi jauh, tempat air bertemu dinding yang kena matahari.
  for (let a = 0; a < 260; a++) {
    const an = (a / 260) * Math.PI * 2;
    const i = Math.round(Math.cos(an) * (inX - 1));
    const j = Math.round(Math.sin(an) * (inY - 1)) - sink;
    if (Math.sin(an) < 0.1 && (a + 3) % 26 > 3 && mask(i, j + 1)) c.set(inX + i, inY + j + 1, POOL[3]);
  }
  // Riak besar melebar dari sekitar tiang.
  for (let k = 0; k < 3; k++) {
    const p = (t + k / 3) % 1;
    if (p > 0.9) continue;
    const r = 10 + p * (inX - 13);
    const col = p < 0.3 ? POOL[3] : POOL[2];
    for (let a = 0; a < 96; a++) {
      if ((a + k * 7) % 12 > 8) continue;
      const an = (a / 96) * Math.PI * 2;
      const i = Math.round(Math.cos(an) * r);
      const j = Math.round(Math.sin(an) * r * 0.5);
      if (mask(i, j) && inOval(i, j, inX - 2, inY - 1.5)) c.set(inX + i, inY + j, col);
    }
  }
  // Riak kecil di beberapa titik, seperti tetesan.
  const spots = [[-15, 2, 0], [-9, 5, 0.31], [9, 6, 0.62], [16, 1, 0.18], [1, 7, 0.84], [-16, -3, 0.5], [17, -3, 0.72]];
  for (const [sx, sy, ph] of spots) {
    const p = (t * 2 + ph) % 1;
    if (p > 0.7) continue;
    const r = 1 + p * 2.8;
    for (let i = -Math.ceil(r); i <= r; i++) {
      const j = Math.round(Math.sqrt(Math.max(0, 1 - (i / r) ** 2)) * r * 0.5);
      if (mask(sx + i, sy + j)) c.set(inX + sx + i, inY + sy + j, p < 0.3 ? POOL[4] : POOL[3]);
    }
  }
  return c;
}

// Tiang berbentuk dan mangkuk atas. Titik (ox, oy) adalah pusat bibir kolam.
function fountainPedestal() {
  const c = new Canvas(46, 54);
  const [ox, oy] = [23, 40];
  const baseY = oy + FOUNTAIN.sink;
  lathe(c, ox, baseY, [[0, 5], [1, 5], [2, 3.6], [4, 3], [5, 2.2], [8, 2.2], [10, 3.4], [11, 3.4], [12, 2.2], [13, 2.2], [14, 4], [16, 9], [18, 12], [18, 13], [20, 13]]);
  const cy = oy + BOWL.y;
  // Bibir mangkuk, dinding dalam sisi jauh, dan air di dalamnya.
  for (let j = -BOWL.ry; j <= BOWL.ry; j++) {
    for (let i = -BOWL.rx; i <= BOWL.rx; i++) {
      if (!inOval(i, j, BOWL.rx, BOWL.ry)) continue;
      if (inOval(i, j, BOWL.inX, BOWL.inY)) {
        if (inOval(i, j - 1.5, BOWL.inX, BOWL.inY)) c.set(ox + i, cy + j, inOval(i + 3, j + 1.5, BOWL.inX, BOWL.inY) ? POOL[1] : POOL[0]);
        else c.set(ox + i, cy + j, i < 0 ? STONE[2] : STONE[1]);
        continue;
      }
      const k = ((Math.atan2(j / BOWL.ry, i / BOWL.rx) + Math.PI) / (Math.PI * 2)) * 12;
      let col = STONE[Math.floor(k) % 2 ? 3 : 2];
      if (k % 1 < 0.1) col = STONE[1];
      else if (!inOval(i, j, BOWL.rx - 1.2, BOWL.ry - 0.8)) col = j > 0 ? STONE[4] : STONE[3];
      else if (inOval(i, j, BOWL.inX + 1, BOWL.inY + 0.6)) col = j > 0 ? STONE[4] : STONE[1];
      c.set(ox + i, cy + j, col);
    }
  }
  // Kepala pancuran di tengah mangkuk.
  lathe(c, ox, cy + 1, [[0, 2.4], [1, 1.2], [4, 1], [5, 1.8], [6, 1]]);
  outline(c);
  return { c, ox, oy };
}

// Air bergerak di depan batu: semburan kecil di atas, riak mangkuk, aliran yang turun, dan percikan di kolam.
function fountainWater(frame: number) {
  const c = new Canvas(62, 60);
  const [ox, oy] = [31, 44];
  const t = frame / FOUNTAIN_FRAMES;
  const cy = oy + BOWL.y;
  // Riak di mangkuk.
  const r0 = 2.5 + t * (BOWL.inX - 4);
  for (let a = 0; a < 40; a++) {
    if (a % 5 > 2) continue;
    const an = (a / 40) * Math.PI * 2;
    c.set(ox + Math.cos(an) * r0, cy + 1.5 + Math.sin(an) * r0 * 0.5, POOL[3]);
  }
  // Semburan lembut: air naik dari kepala pancuran lalu jatuh melengkung ke mangkuk.
  for (let k = 0; k < 10; k++) {
    const p = (t * 2 + k / 14) % 1;
    const side = k % 2 ? 1 : -1;
    const spread = 2 + (k % 4) * 1.3;
    c.set(ox + side * spread * p, cy - 5 - 5 * 4 * p * (1 - p) + 5 * p, k % 3 ? POOL[4] : POOL[3]);
  }
  // Aliran dari bibir depan mangkuk ke kolam: beberapa aliran tipis, masing-masing punya irama sendiri.
  const waterY = oy + FOUNTAIN.sink;
  for (let n = 0; n <= 6; n++) {
    const an = Math.PI * (0.08 + (n / 6) * 0.84);
    const startX = ox + Math.cos(an) * (BOWL.rx - 0.5);
    const top = Math.round(cy + Math.sin(an) * (BOWL.ry - 0.5) + BOWL.wall);
    const bottom = Math.round(waterY + Math.sin(an) * 6);
    for (let y = top; y <= bottom; y++) {
      const k = (y - top) / Math.max(1, bottom - top);
      const x = Math.round(startX + Math.cos(an) * k * k * 2);
      const v = (y - frame + n * 3 + 240) % 8;
      if (v > 4) continue;
      c.set(x, y, v === 0 ? POOL[4] : v < 3 ? POOL[3] : POOL[2]);
    }
    // Percikan kecil tempat aliran menyentuh air.
    const s = (frame + n * 5) % 8;
    const x = Math.round(startX + Math.cos(an) * 2);
    if (s < 2) {
      c.set(x - 1, bottom, POOL[3]);
      c.set(x + 1, bottom, POOL[3]);
    } else if (s < 4) c.set(x, bottom + 1, POOL[4]);
  }
  return { c, ox, oy };
}

async function drawTown() {
  const W = 697;
  const H = 392;
  const c = new Canvas(W, H, C.walk);
  const iso = new Iso(c, TOWN.x0, TOWN.y0, TOWN.art);
  const { plazaL0: PL0, plazaL1: PL1, plazaS: PS, pathS: AS, doorL: DL, gateL: GL, gateS: GS } = TOWN;
  // Jalan raya dan gedung lain hanya di sisi atas dan kiri. Selain itu semuanya halaman gedung.
  const ROADS = { s1: [-532, -382], l1: [-340, -190] };
  // Jalur kendaraan dari jalan kiri ke parkiran: jalur masuk di s negatif, jalur keluar di s positif.
  const DRIVE = { at: 120, half: 36, flare: -168 };
  // Zebra cross melintasi jalan kiri, di antara jalur masuk dan keluar.
  const ZEBRA = { s0: -14, s1: 52 };
  const within = (v: number, r: number[], m = 0) => v > r[0] - m && v < r[1] + m;
  const GRASS = tones("#274b2e", "#39683a", "#548a3c", "#74a842", "#9cc950");
  const POND = { l: 330, s: 566, rl: 104, rs: 76 };
  const DECK = { l0: 540, l1: 884, s0: 276, s1: 356 };
  const GAZEBO = { l: 640, s: 470 };
  const WALKS = [
    [346, 378, 294, 386],
    [378, 610, 356, 386],
    [596, 628, 386, 410],
    [629, 655, 356, 372],
  ];
  const lawn = new Uint8Array(W * H);

  // Tanah: aspal bersih, trotoar, parkiran, halaman rumput, dan jalan setapak.
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const a = (x + 0.5) * TOWN.art - TOWN.x0;
      const b = 2 * ((y + 0.5) * TOWN.art - TOWN.y0);
      const l = (a - b) / 2;
      const s = (a + b) / 2;
      const inS = within(s, ROADS.s1);
      const inL = within(l, ROADS.l1);
      if (inS || inL) {
        const n = noise(x * 0.6, y * 0.8);
        let col = n > 0.74 ? mix(C.asphalt, C.asphaltLight, 0.6) : n < 0.26 ? mix(C.asphalt, C.asphaltDark, 0.6) : C.asphalt;
        const midS = (ROADS.s1[0] + ROADS.s1[1]) / 2;
        const midL = (ROADS.l1[0] + ROADS.l1[1]) / 2;
        if (inS && !inL && Math.abs(s - midS) < 3 && (l + 2000) % 90 < 48) col = C.lane;
        if (inL && !inS && Math.abs(l - midL) < 3 && (s + 2000) % 90 < 48) col = C.lane;
        if (inS && l > 40 && l < 120 && (s + 2000) % 26 < 13) col = C.lane;
        if (inL && !inS && s > ZEBRA.s0 && s < ZEBRA.s1 && (l + 2000) % 26 < 13) col = C.lane;
        c.set(x, y, col);
        continue;
      }
      // Jalur kendaraan menyambung jalan raya ke parkiran: aspalnya sama dengan jalan, mulutnya melebar ke arah jalan.
      const fromAxis = Math.abs(Math.abs(s) - DRIVE.at);
      const mouth = Math.max(0, DRIVE.flare - l) * 0.9;
      if (l >= ROADS.l1[1] && l < PL0 + 7 && fromAxis < DRIVE.half + mouth) {
        const n = noise(x * 0.6, y * 0.8);
        const col = n > 0.74 ? mix(C.asphalt, C.asphaltLight, 0.6) : n < 0.26 ? mix(C.asphalt, C.asphaltDark, 0.6) : C.asphalt;
        c.set(x, y, fromAxis > DRIVE.half + mouth - 4 ? C.curb : col);
        continue;
      }
      // Trotoar turun rata di kedua ujung zebra cross.
      if (s > ZEBRA.s0 && s < ZEBRA.s1 && within(l, ROADS.l1, 6)) {
        c.set(x, y, hash(x, y) > 0.5 ? C.walk : shade(C.walk, 0.1));
        continue;
      }
      const curb = within(s, ROADS.s1, 6) || within(l, ROADS.l1, 6);
      if (curb) {
        const toRoad = (s > ROADS.s1[1] && s < ROADS.s1[1] + 3) || (l > ROADS.l1[1] && l < ROADS.l1[1] + 3);
        c.set(x, y, toRoad ? C.walkDark : C.curb);
        continue;
      }
      if (l > PL0 && l < PL1 && Math.abs(s) < PS) {
        // Parkiran: aspal halus dan garis petak.
        const e = Math.abs(s);
        const n = noise(x * 0.6, y * 0.8);
        let col = n > 0.74 ? mix(C.parking, C.asphaltLight, 0.35) : n < 0.26 ? shade(C.parking, -0.06) : C.parking;
        if (Math.abs(e - 252) < 2.5) col = C.lane;
        if (e < 3 && (l + 2000) % 70 < 36) col = C.lane;
        if (e > 252 && (l + 116 + 840) % 84 < 3.4 && l < 222) col = C.lane;
        if (l < PL0 + 6 || l > PL1 - 6 || e > PS - 6) col = l < PL0 + 3 || l > PL1 - 3 || e > PS - 3 ? C.walkDark : C.curb;
        c.set(x, y, col);
        continue;
      }
      const onPath = l >= PL1 - 5 && l < DL && Math.abs(s) < AS + 12;
      const apron = l > DL - 80 && l < DL && Math.abs(s) < 130;
      if (onPath || apron) {
        let col: Rgb = onPath && Math.abs(s) < AS + 12 && Math.abs(s) > AS + 7 ? C.curb : paving(l, s, 34, 1);
        // Karpet merah dari gerbang sampai tangga.
        const e = Math.abs(s);
        if (l > GL + 16 && l < DL - 30 && e < 32) {
          col = e > 28 ? C.goldBar : e > 25 ? C.wineDark : (l + 2000) % 54 < 3 ? C.wineLight : C.wine;
          if (e < 25 && flower(((l + 2000) % 54) - 27, s, 9, C.wineLight, C.goldBar)) col = C.wineLight;
        }
        c.set(x, y, col);
        continue;
      }
      const garden = (l > PL1 + 8 && s > -348) || (s > PS && l > -128);
      if (garden) {
        const edge = (l < PL1 + 13 && s < PS + 5) || (s < PS + 5 && s > PS && l < PL1 + 13) || l < -123 || (s < -343 && l > PL1);
        if (edge) {
          c.set(x, y, C.curb);
          continue;
        }
        // Teras kayu di sisi gedung.
        if (l > DECK.l0 && l < DECK.l1 && s > DECK.s0 && s < DECK.s1) {
          const rim = l < DECK.l0 + 4 || l > DECK.l1 - 4 || s > DECK.s1 - 4;
          const board = Math.floor((s + 800) / 11);
          const seam = (s + 800) % 11 < 1.6 || (l + hash(board, 2) * 90 + 800) % 90 < 1.6;
          c.set(x, y, rim ? C.wood : seam ? C.timber : hash(board, Math.floor((l + 800) / 90)) > 0.5 ? C.woodPale : C.woodLight);
          continue;
        }
        const fd = Math.hypot(l - FOUNTAIN.l, s - FOUNTAIN.s);
        if (fd < 104) {
          c.set(x, y, fd > 99 ? C.curb : paving(l, s, 26, 4));
          continue;
        }
        if (Math.hypot(l - GAZEBO.l, s - GAZEBO.s) < 84) {
          c.set(x, y, paving(l, s, 22, 9));
          continue;
        }
        if (s > 0 && s < FOUNTAIN.s && Math.abs(l - FOUNTAIN.l) < 16) {
          c.set(x, y, (s + 800) % 34 < 24 && Math.abs(l - FOUNTAIN.l) < 13 ? paving(l, s, 22, 7) : GRASS[1]);
          lawn[y * W + x] = (s + 800) % 34 < 24 ? 0 : 1;
          continue;
        }
        if (WALKS.some(([l0, l1, s0, s1]) => l > l0 && l < l1 && s > s0 && s < s1)) {
          c.set(x, y, paving(l, s, 24, 6));
          continue;
        }
        // Kolam: tepi batu, pinggir gelap, tengah terang.
        const pd = Math.hypot((l - POND.l) / POND.rl, (s - POND.s) / POND.rs) + (noise(x * 0.09, y * 0.12) - 0.5) * 0.34;
        if (pd < 1.1) {
          if (pd > 1) {
            const n = hash(Math.floor(x / 4), Math.floor(y / 2));
            c.set(x, y, n > 0.6 ? C.stoneLight : n > 0.25 ? C.stoneMid : C.rock);
          } else if (pd > 0.9) c.set(x, y, POOL[0]);
          else if (pd > 0.8) c.set(x, y, hex("#1b7a7d"));
          else {
            // Garis riak pendek di baris selang-seling, makin ke tengah makin terang.
            const dash = y % 3 === 0 && hash(Math.floor((x + (y % 2) * 3) / 7), y) > 0.82 && (x + y) % 7 < 5;
            c.set(x, y, dash ? (pd < 0.45 ? POOL[3] : POOL[2]) : pd < 0.55 ? hex("#2a9e98") : POOL[1]);
          }
          continue;
        }
        // Rumput: tiga nada tegas berkelompok, bukan bintik halus. Tepinya berbentuk bilah pendek.
        const blade = (hash(x >> 1, y) - 0.5) * 0.09;
        const v = noise(x * 0.045, y * 0.07) * 0.55 + noise(x * 0.17 + 7, y * 0.24) * 0.45 + blade;
        c.set(x, y, GRASS[v < 0.4 ? 1 : v < 0.6 ? 2 : 3]);
        lawn[y * W + x] = 1;
        continue;
      }
      // Trotoar berpetak dengan jalur kuning pemandu di sisi jalan.
      const toRoad = Math.min(s > ROADS.s1[1] ? s - ROADS.s1[1] : 999, l > ROADS.l1[1] ? l - ROADS.l1[1] : 999);
      if (toRoad > 11 && toRoad < 24) {
        c.set(x, y, (Math.floor((l + 2000) / 5.5) + Math.floor((s + 2000) / 5.5)) % 2 ? hex("#e4bf55") : hex("#d4ad48"));
        continue;
      }
      const seam = (l + 2000) % 44 < 2.2 || (s + 2000) % 44 < 2.2;
      const tile = hash(Math.floor((l + 2000) / 44), Math.floor((s + 2000) / 44));
      c.set(x, y, seam ? C.walkDark : tile > 0.72 ? shade(C.walk, 0.14) : tile < 0.24 ? shade(C.walk, -0.08) : C.walk);
    }
  }
  // Rumpun rumput: bilah terang di atas pangkal gelap, jelas terbaca di ketiga nada dasar.
  {
    const rand = rng(91);
    const free = (x: number, y: number) => x > 1 && y > 3 && x < W - 2 && y < H - 2 && lawn[y * W + x] === 1;
    for (let i = 0; i < 2600; i++) {
      const x = Math.floor(rand() * W);
      const y = Math.floor(rand() * H);
      if (!free(x, y)) continue;
      c.set(x, y + 1, GRASS[0]);
      c.set(x - 1, y + 1, GRASS[0]);
      c.set(x + 1, y + 1, GRASS[0]);
      const hi = GRASS[rand() > 0.5 ? 4 : 3];
      c.set(x, y, hi);
      c.set(x - 1, y - 1, hi);
      c.set(x + 1, y - 1, hi);
      c.set(x, y - 2, GRASS[4]);
    }
    // Bunga liar berkelompok.
    const wild = [hex("#fff6d8"), hex("#f7a3bc"), hex("#f9d84e"), hex("#c7a4f0")];
    for (let i = 0; i < 1800; i++) {
      const x = Math.floor(rand() * W);
      const y = Math.floor(rand() * H);
      if (!free(x, y) || noise(x * 0.06 + 31, y * 0.09) < 0.66) continue;
      const col = wild[Math.floor(noise(x * 0.03, y * 0.03 + 5) * 7) % wild.length];
      c.set(x - 1, y, col);
      c.set(x + 1, y, col);
      c.set(x, y - 1, col);
      c.set(x, y + 1, col);
      c.set(x, y, C.glowDark);
    }
    // Daun teratai di kolam.
    for (let i = 0; i < 10; i++) {
      const a = rand() * Math.PI * 2;
      const d = 0.2 + rand() * 0.5;
      const [x, y] = iso.xy(POND.l + Math.cos(a) * d * POND.rl, POND.s + Math.sin(a) * d * POND.rs).map(Math.round);
      oval(c, x, y + 1, 4.5, 2.2, () => POOL[0]);
      oval(c, x, y, 4.5, 2.2, (dx, dy) => (dx > 1 || dy < 0 ? FRESH[3] : FRESH[2]));
      c.set(x + 2, y, POOL[1]);
      c.set(x + 3, y, POOL[1]);
      if (i % 3 === 0) {
        c.set(x - 1, y - 1, hex("#f7a3bc"));
        c.set(x, y - 1, hex("#fff0f4"));
        c.set(x + 1, y - 1, hex("#f7a3bc"));
        c.set(x, y - 2, hex("#f7a3bc"));
      }
    }
  }

  // Bayangan dikumpulkan dulu ke satu topeng, lalu menggelapkan tanah sebelum benda apa pun digambar.
  const mask = new Uint8Array(W * H);
  const dropX = (z: number) => (SUN.x * SUN.k * z) / TOWN.art;
  const dropY = (z: number) => (SUN.y * SUN.k * z) / TOWN.art;
  const polyShadow = (pts: [number, number][]) => {
    // Selubung cembung dari semua titik, cukup untuk kotak dan bayangannya.
    const sorted = [...pts].sort((p, q) => p[0] - q[0] || p[1] - q[1]);
    const cross = (o: number[], p: number[], q: number[]) => (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);
    const half = (list: [number, number][]) => {
      const out: [number, number][] = [];
      for (const p of list) {
        while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], p) <= 0) out.pop();
        out.push(p);
      }
      return out.slice(0, -1);
    };
    const hull = [...half(sorted), ...half([...sorted].reverse())];
    const ys = hull.map((p) => p[1]);
    const xs = hull.map((p) => p[0]);
    for (let y = Math.max(0, Math.floor(Math.min(...ys))); y <= Math.min(H - 1, Math.ceil(Math.max(...ys))); y++) {
      for (let x = Math.max(0, Math.floor(Math.min(...xs))); x <= Math.min(W - 1, Math.ceil(Math.max(...xs))); x++) {
        let ok = true;
        for (let i = 0; i < hull.length && ok; i++) ok = cross(hull[i], hull[(i + 1) % hull.length], [x + 0.5, y + 0.5]) >= 0;
        if (ok) mask[y * W + x] = 1;
      }
    }
  };
  const boxShadow = (l0: number, l1: number, s0: number, s1: number, z0: number, z1: number) => {
    const pts: [number, number][] = [];
    for (const l of [l0, l1]) {
      for (const s of [s0, s1]) {
        const [x, y] = iso.xy(l, s, 0);
        pts.push([x + dropX(z0), y + dropY(z0)], [x + dropX(z1), y + dropY(z1)]);
      }
    }
    polyShadow(pts);
  };
  const blobShadow = (cx: number, cy: number, rx: number, ry: number, leafy = true) => {
    for (let y = Math.max(0, Math.floor(cy - ry - 3)); y <= Math.min(H - 1, Math.ceil(cy + ry + 3)); y++) {
      for (let x = Math.max(0, Math.floor(cx - rx - 3)); x <= Math.min(W - 1, Math.ceil(cx + rx + 3)); x++) {
        const edge = leafy ? (noise(x * 0.34, y * 0.5) - 0.5) * 0.5 : 0;
        if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 + edge <= 1) mask[y * W + x] = 1;
      }
    }
  };
  const footShadow = (x: number, y: number, up: number, rx: number, ry: number) => {
    // Up dalam piksel gambar: seberapa tinggi benda yang menjatuhkan bayangan.
    const z = up * TOWN.art;
    // Tanaman rendah cukup oval kecil menempel di kaki. Tepi bergerigi di sini terbaca seperti petak di tanah.
    if (up < 14) {
      blobShadow(x + dropX(z) * 0.4, y + dropY(z) * 0.4, rx * 0.72, ry * 0.62, false);
      return;
    }
    const tx = x + dropX(z);
    const ty = y + dropY(z);
    blobShadow(tx, ty, rx, ry);
    polyShadow([[x - 1.5, y], [x + 1.5, y], [tx - 2, ty], [tx + 2, ty]]);
  };

  // Gedung dan benda rata menyatu dengan gambar peta, digambar dari belakang ke depan.
  const items: { d: number; draw: () => void }[] = [];
  const at = (l: number, s: number, draw: () => void) => items.push({ d: s - l, draw });
  const block = (l0: number, l1: number, s0: number, s1: number, h: number, seed: number) => {
    boxShadow(l0, l1, s0, s1, 0, h);
    at((l0 + l1) / 2, (s0 + s1) / 2, () => townBlock(iso, l0, l1, s0, s1, h, seed));
  };

  // Semua benda berdiri berada di lapisan hidup: diurutkan kaki terhadap karakter, dan posisinya terhadap gerbang tetap.
  type LifeObject = { foot: number; behind: number; parts: (number | number[])[][] };
  const objects: LifeObject[] = [];
  const falls: number[][] = [];
  const TOP = 9000;
  const behindGate = (l: number, s: number) => ((l > GL + 18 && s <= GS + 34) || s < -GS - 34 ? 1 : 0);
  const pieceOf = (p: Part, x: number, y: number, per: number, phase: number) => [p.frames ?? p.s.id, Math.round(x + p.x + p.s.ox), Math.round(y + p.y + p.s.oy), +p.ax.toFixed(2), +p.ay.toFixed(2), +(p.ph + phase).toFixed(2), per, p.fps ?? 0];
  const groundFoot = (l: number, s: number) => iso.xy(l, s, 0)[1];
  const plant = (kind: Plant, l: number, s: number, seed = 0, z = 0) => {
    const [xf, yf] = iso.xy(l, s, z);
    const x = Math.round(xf);
    const y = Math.round(yf);
    const { h, rx, ry } = kind.shadow;
    const [gx, gy] = iso.xy(l, s, 0);
    footShadow(gx, gy, h + z / TOWN.art, rx, ry);
    const phase = hash(l + seed, s) * 6.28;
    const per = kind.per * (0.9 + hash(s, l) * 0.25);
    // Tanaman di atas pot atau kotak diurutkan sedikit di depan wadahnya.
    objects.push({ foot: groundFoot(l, s) + (z ? 0.5 : 0), behind: behindGate(l, s), parts: kind.parts.map((p) => pieceOf(p, x, y, per, phase)) });
    if (kind.petal) {
      for (let i = 0; i < 5; i++) {
        const dx = (hash(i, seed + l) - 0.5) * kind.shadow.rx * 2.1;
        falls.push([kind.petal.id, x + dx, y - kind.shadow.h - 34 - hash(i, s) * 12, 54 + hash(i + 3, l) * 22, -8 - hash(i, 9) * 8, 9 + hash(i, l) * 6, hash(i + 7, s + l)]);
        for (let k = 0; k < 7; k++) c.set(x + dx - 6 + hash(k, i) * 16, y - hash(i, k) * 12 + 2, mix(kind.petalColor ?? C.white, C.white, 0.15));
      }
    }
  };
  // Pohon di belakang gedung utama digambar diam di peta, supaya tertutup gedung dengan benar.
  const backdrop = (kind: Plant, l: number, s: number) => {
    const [x, y] = iso.xy(l, s, 0).map(Math.round);
    footShadow(x, y, kind.shadow.h, kind.shadow.rx, kind.shadow.ry);
    at(l, s, () => {
      for (const p of kind.parts) paste(c, sprites[p.s.id], x + p.x + p.s.ox, y + p.y + p.s.oy);
    });
  };
  const prop = (l: number, s: number, draw: (i: Iso, cv: Canvas) => void, opt: { box?: number[]; outlined?: boolean; foot?: number; behind?: number } = {}) => {
    const cv = new Canvas(W, H);
    draw(new Iso(cv, TOWN.x0, TOWN.y0, TOWN.art), cv);
    if (opt.outlined) outline(cv);
    if (opt.box) {
      const [dl, ds, h] = opt.box;
      boxShadow(l - dl, l + dl, s - ds, s + ds, 0, h);
    }
    const sp = sprite(cv);
    objects.push({ foot: opt.foot ?? groundFoot(l, s), behind: opt.behind ?? behindGate(l, s), parts: [[sp.id, sp.ox, sp.oy, 0, 0, 0, 0, 0]] });
  };

  // Deretan gedung di seberang jalan, hanya di atas dan kiri.
  [-230, 70, 370, 670, 970].forEach((l, i) => block(l, l + 270, -832, -572, 210 + hash(i, 1) * 130, 10 + i));
  [-230, 100, 430, 760].forEach((l, i) => block(l, l + 300, -1162, -882, 240 + hash(i, 2) * 140, 20 + i));
  [-280, 40, 340].forEach((s, i) => block(-790, -530, s, s + 280, 110 + hash(i, 3) * 60, 30 + i));

  const streetLamp = (l: number, s: number, h = 112) =>
    prop(
      l,
      s,
      (i, cv) => {
        i.box(l - 6, l + 6, s - 6, s + 6, 0, 8, C.steelLight, C.steel, C.steelLight);
        i.box(l - 2.5, l + 2.5, s - 2.5, s + 2.5, 8, h, C.steelLight, C.steel, C.steelLight, null);
        i.seg([l - 2.5, s + 2.5, 8], [l - 2.5, s + 2.5, h]);
        i.box(l - 2.5, l + 2.5, s - 2, s + 24, h, h + 4, C.steelLight, C.steel, C.steel, C.line);
        i.box(l - 6, l + 6, s + 14, s + 28, h - 5, h, C.glowLight, C.glow, C.glowLight, C.line);
        // Keranjang bunga yang menggantung di tiang.
        const [x, y] = i.xy(l, s, h - 34);
        cv.rect(x - 3, y + 3, 7, 3, C.wood);
        cv.line(x - 3, y + 3, x, y - 4, C.line);
        cv.line(x + 3, y + 3, x, y - 4, C.line);
        paste(cv, leafClump(3.6, WARM, Math.round(l + s), Math.round(l) % 2 ? PINK_BLOOM : RED_BLOOM, 0.3), x - 5, y - 5);
      },
      { box: [3, 3, h] },
    );
  const street = (kind: Plant, l: number, s: number) => {
    at(l, s, () => {
      iso.box(l - 17, l + 17, s - 17, s + 17, 0, 4, C.dark, C.concreteDark, C.concrete);
      iso.floor(4, l - 14, l + 14, s - 14, s + 14, (a, b, x, y) => {
        const n = hash(x, y);
        if (n > 0.86) return GRASS[3];
        if (n > 0.76) return GRASS[1];
        return noise(a * 0.3 + 40, b * 0.3 + 40) > 0.5 ? C.timber : C.dark;
      });
    });
    plant(kind, l, s);
  };

  // Satu bibit tiap jenis dipakai beberapa kali supaya lembar sprite tetap kecil.
  const TREE = { pink: tabebuya(1), pink2: tabebuya(2), rain: trembesi(3), rain2: trembesi(4), red: flamboyan(5), red2: flamboyan(6), frangi: kamboja(7), palm: palem(8), palm2: palem(9), topi: topiary(11, FRESH), topi2: topiary(12, WARM, PINK_BLOOM) };
  const BUSH = {
    magenta: makeBush(21, 26, MAGENTA, PINK_BLOOM, 0.09),
    soka: makeBush(22, 24, WARM, RED_BLOOM, 0.17),
    melati: makeBush(23, 24, DEEP, WHITE_BLOOM, 0.2),
    blue: makeBush(24, 26, FRESH, BLUE_BLOOM, 0.17),
    yellow: makeBush(25, 22, FRESH, YELLOW_BLOOM, 0.2),
    lilac: makeBush(26, 22, DEEP, LILAC_BLOOM, 0.18),
    smallMagenta: makeBush(27, 18, MAGENTA, PINK_BLOOM, 0.1),
    smallSoka: makeBush(28, 18, WARM, RED_BLOOM, 0.2),
    smallWhite: makeBush(29, 18, FRESH, CREAM_BLOOM, 0.22),
    smallBlue: makeBush(30, 18, DEEP, BLUE_BLOOM, 0.2),
    lavender: makeBlades(31, 18, 18, FRESH, hex("#a688e6")),
    grass: makeBlades(32, 20, 22, DEEP),
    tulip: makeBlades(33, 16, 15, FRESH, hex("#ee5f6e")),
    tulip2: makeBlades(37, 16, 15, FRESH, hex("#f6c64e")),
  };

  // Baris pagar tanaman: potongan bergantian, jenisnya berganti tiap beberapa potongan.
  const HEDGES = [
    [0, 1, 2].map((i) => hedgeSeg(60 + i, WARM, PINK_BLOOM)),
    [0, 1, 2].map((i) => hedgeSeg(70 + i, FRESH, WHITE_BLOOM)),
    [0, 1, 2].map((i) => hedgeSeg(80 + i, DEEP, YELLOW_BLOOM)),
  ];
  const hedgeRow = (along: "l" | "s", fixed: number, from: number, to: number, z = 0) => {
    for (let v = from, i = 0; v <= to; v += 17, i++) {
      const set = HEDGES[Math.floor(i / 4) % HEDGES.length];
      plant(set[i % set.length], along === "l" ? v : fixed, along === "l" ? fixed : v, i, z);
    }
  };

  // Trotoar atas dan kiri parkiran, jalur kendaraan dibiarkan kosong.
  street(TREE.rain, -130, -356);
  streetLamp(35, -352);
  street(TREE.frangi, 96, -356);
  street(TREE.pink, 200, -356);
  streetLamp(365, -358);
  street(TREE.red, -160, -214);
  street(TREE.pink2, -162, 214);
  street(TREE.frangi, -152, 290);
  streetLamp(-140, 72);
  backdrop(TREE.pink2, 560, -330);
  backdrop(TREE.rain, 1240, -120);
  backdrop(TREE.red, 952, 226);

  // Taman kiri: pohon besar di belakang, papan bunga, dan semak berbunga.
  plant(TREE.rain2, 322, -252);
  plant(TREE.frangi, 300, -322);
  plant(TREE.red2, 430, -326);
  plant(BUSH.blue, 366, -312);
  plant(TREE.pink, 476, -262);
  for (const [kind, l, s] of [
    [BUSH.magenta, 272, -206], [BUSH.soka, 372, -226], [BUSH.grass, 280, -272], 
    [BUSH.blue, 452, -150], [BUSH.yellow, 430, -128],
    [BUSH.tulip, 446, -232], [BUSH.tulip2, 462, -238], [BUSH.lilac, 430, -256], [BUSH.soka, 400, -276],
  ] as const) plant(kind, l, s);
  [hex("#a8434a"), hex("#2f8f8a"), hex("#c98f2f")].forEach((p, i) => {
    const l = 306 + i * 42;
    const s = -150;
    prop(l, s, (iso2) => flowerBoard(iso2, l, s, p, 500 + i * 13), { box: [2, 38, 90] });
  });

  // Taman kanan: air mancur, bangku menghadap kolam, dan tanaman rendah.
  const [fx, fy] = iso.xy(FOUNTAIN.l, FOUNTAIN.s, 0).map(Math.round);
  blobShadow(fx - 6, fy - 7, FOUNTAIN.rx * 0.96, FOUNTAIN.ry, false);
  plant(TREE.topi, 272, 124);
  prop(446, 190, (i, cv) => bench(cv, i.xy(446, 190)[0], i.xy(446, 190)[1], "s"), { box: [7, 22, 16], outlined: true });
  prop(394, 430, (i, cv) => bench(cv, i.xy(394, 430)[0], i.xy(394, 430)[1], "s"), { box: [7, 22, 16], outlined: true });
  for (const [kind, l, s] of [
    [BUSH.magenta, 300, 318], [BUSH.melati, 446, 300], [BUSH.soka, 500, 290],
    
  ] as const) plant(kind, l, s);

  // Kotak bunga sepanjang jalan masuk, jenis bunganya berganti.
  const boxPlants = [BUSH.smallMagenta, BUSH.smallWhite, BUSH.smallSoka, BUSH.smallBlue];
  let boxIndex = 0;
  for (let l = PL1 + 44; l < DL - 90; l += 40) {
    for (const k of [-1, 1]) {
      const s = k * (AS + 24);
      const kind = boxPlants[boxIndex++ % boxPlants.length];
      prop(l, s, (i) => i.box(l - 18, l + 18, s - 9, s + 9, 0, 10, C.leafDark, C.concreteDark, C.concrete), { box: [18, 9, 10] });
      plant(kind, l, s, k, 11);
    }
  }

  // Kaki gedung: kotak tanam menyatu dengan peta karena tidak ada apa pun di belakangnya, tanamannya tetap bergoyang.
  const footBox = (l0: number, l1: number, s0: number, s1: number) => {
    boxShadow(l0, l1, s0, s1, 0, 12);
    items.push({ d: 0, draw: () => iso.box(l0, l1, s0, s1, 0, 12, C.leafDark, C.concreteDark, C.concrete) });
  };
  footBox(DL + 10, 870, TOWN.bs + 2, TOWN.bs + 22);
  hedgeRow("l", TOWN.bs + 12, DL + 24, 860, 12);
  for (const k of [-1, 1]) {
    footBox(DL - 25, DL - 3, Math.min(k * 140, k * 246), Math.max(k * 140, k * 246));
    hedgeRow("s", DL - 14, k > 0 ? 150 : -238, k > 0 ? 238 : -150, 12);
  }

  // Palem di kanan kiri tangga, di depan kotak tanam kaki gedung.
  plant(TREE.palm, DL - 40, -196);
  plant(TREE.palm2, DL - 40, 196);
  for (const s of [-118, 118]) {
    const l = DL - 44;
    prop(l, s, (i) => terracottaBase(i, l, s));
    blobShadow(iso.xy(l, s)[0] - 5, iso.xy(l, s)[1] - 8, 7, 4, false);
    plant(s < 0 ? BUSH.smallSoka : BUSH.smallWhite, l, s, 2, 22);
  }

  // Parkiran: mobil beragam di petak luar, jalan di tengah tetap kosong.
  const CARS = ["#b94a48", "#efe8d6", "#3f6d9a", "#39424d", "#c98f2f", "#4f8069", "#a6a8ad", "#7c2f3c"].map(hex);
  const lots: [number, number, number, CarKind, 1 | -1, boolean][] = [
    [-74, -290, 3, "sedan", 1, false],
    [10, -290, 5, "mpv", 1, false],
    [94, -290, 1, "sedan", 1, true],
    [178, -290, 2, "hatch", 1, false],
    [-74, 290, 4, "pickup", -1, false],
    [10, 290, 0, "hatch", -1, false],
    [94, 290, 7, "sedan", -1, false],
    [178, 290, 6, "mpv", -1, false],
  ];
  for (const [l, s, i, kind, dir, married] of lots) {
    prop(l, s, (iso2) => car(iso2, l, s, CARS[i], kind, dir, married), { box: [23, CAR_PROFILES[kind].pts[CAR_PROFILES[kind].pts.length - 1][0], 26], outlined: true });
  }
  // Penahan roda parkir rata dengan tanah, di tengah tiap petak.
  for (const l of [-74, 10, 94, 178]) {
    for (const k of [-1, 1]) at(l, k * 258, () => iso.box(l - 13, l + 13, k * 258 - 2, k * 258 + 2, 0, 4, C.goldBar, C.concreteDark, C.concrete, null));
  }

  // Isi trotoar.
  for (const [l, s] of [[-80, -360]]) prop(l, s, (i) => trashBin(i, l, s), { box: [8, 8, 30] });
  // Rambu jalur masuk dan keluar di sisi dalam tiap jalur.
  prop(-176, -74, (i) => roadSign(i, -176, -74, hex("#2f8f5a"), "IN"), { box: [3, 3, 60], outlined: true });
  prop(-176, 74, (i) => roadSign(i, -176, 74, hex("#c23f4a"), "OUT"), { box: [3, 3, 60], outlined: true });
  for (let l = PL0 + 12; l < PL1; l += 44) prop(l, -PS - 8, (i) => bollard(i, l, -PS - 8), { box: [3, 3, 18] });

  // Pagar tanaman di tepi bawah parkiran dan tepi kiri halaman.
  hedgeRow("l", PS + 20, -80, 240);
  hedgeRow("s", -108, 366, 500);

  // Halaman bawah: pohon besar jauh dari parkiran, bedeng bunga di sepanjang setapak.
  plant(TREE.frangi, 116, 462);
  plant(TREE.red, 150, 520);
  plant(TREE.palm, 214, 486);
  plant(TREE.rain, 520, 620);
  plant(TREE.pink2, 760, 520);
  plant(TREE.palm2, 462, 452);
  plant(TREE.frangi, 480, 540);
  plant(TREE.red2, 860, 420);
  plant(TREE.topi2, 316, 392);
  // Bedeng di kanan dan kiri setapak selatan.
  const beds: [number, number, Plant][] = [
    [330, 440, BUSH.tulip2],
    [416, 512, BUSH.blue],
    [470, 404, BUSH.yellow], [520, 404, BUSH.blue], [570, 408, BUSH.soka],
    [410, 340, BUSH.lilac], [460, 340, BUSH.tulip], [500, 340, BUSH.tulip2],
    [190, 430, BUSH.magenta], [150, 470, BUSH.soka], [90, 410, BUSH.blue], [20, 392, BUSH.yellow], [-60, 384, BUSH.melati], [176, 382, BUSH.lilac], [60, 436, BUSH.tulip],
    [600, 560, BUSH.magenta], [680, 580, BUSH.yellow], [760, 420, BUSH.blue], [820, 390, BUSH.melati], [700, 370, BUSH.lilac],
  ];
  for (const [l, s, kind] of beds) plant(kind, l, s);

  // Teras dengan meja resepsi, gazebo, dan kilau kolam.
  [[604, 318, true], [676, 322, false], [748, 318, true], [820, 322, false]].forEach(([l, s, parasol], i) => {
    const [x, y] = iso.xy(l as number, s as number, 0).map(Math.round);
    blobShadow(x - 6, y - 8, 12, 6, false);
    prop(l as number, s as number, (_, cv) => roundTable(cv, x, y, parasol as boolean, 40 + i), { outlined: true });
  });
  prop(GAZEBO.l, GAZEBO.s, (i) => gazebo(i, GAZEBO.l, GAZEBO.s), { box: [50, 50, 90] });
  plant(BUSH.magenta, GAZEBO.l - 74, GAZEBO.s + 46);
  plant(BUSH.blue, GAZEBO.l + 46, GAZEBO.s + 76);
  {
    const [px, py] = iso.xy(POND.l, POND.s, 0).map(Math.round);
    const glints = Array.from({ length: 8 }, (_, f) => {
      const g = new Canvas(120, 70);
      const rand = rng(7);
      for (let i = 0; i < 26; i++) {
        const x = 16 + rand() * 88;
        const y = 12 + rand() * 46;
        if (i % 8 !== f) continue;
        g.set(x, y, POOL[4]);
        g.set(x + 1, y, POOL[3]);
        g.set(x - 1, y, POOL[3]);
      }
      return raw(g);
    });
    objects.push({ foot: py - 40, behind: 0, parts: [[glints, px - 60, py - 35, 0, 0, 0, 0, 2]] });
  }

  // Janur melengkung di luar tiang gerbang, penanda ada hajatan. Selalu di depan gerbang.
  const janurFrond = (seed: number, len: number) => {
    const fr = new Canvas(10, len + 2);
    for (let y = 0; y < len; y++) {
      const x = 4 + Math.sin(y * 0.28 + seed) * 1.3;
      fr.set(x, y, BAMBOO[y % 4 === 0 ? 2 : y % 2 ? 3 : 4]);
      if (y < len - 3) fr.set(x + 1, y, BAMBOO[4]);
    }
    return sprite(fr);
  };
  for (const k of [-1, 1]) {
    const [bx, by] = iso.xy(GL - 22, k * 150, 0).map(Math.round);
    footShadow(bx, by, 22, 7, 4);
    const pole = new Canvas(46, 76);
    const fx0 = 24;
    const fyy = 74;
    const bend = k > 0 ? -1 : 1;
    for (let t = 0; t <= 1; t += 0.008) {
      const tipX = fx0 + bend * 17 * t ** 2.4;
      const tipY = fyy - (68 * Math.sin(t * 1.35)) / Math.sin(1.35);
      pole.set(tipX, tipY, BAMBOO[2]);
      pole.set(tipX + 1, tipY, BAMBOO[4]);
    }
    const parts: (number | number[])[][] = [pieceOf({ s: sprite(pole), x: -fx0, y: -fyy, ax: 0, ay: 0, ph: 0 }, bx, by, 6, 0)];
    for (let i = 0; i < 9; i++) {
      const t = 0.45 + (i / 8) * 0.55;
      const px = fx0 + bend * 17 * t ** 2.4;
      const py = fyy - (68 * Math.sin(t * 1.35)) / Math.sin(1.35);
      parts.push(pieceOf({ s: janurFrond(i * 2 + k, 11 + (i % 3) * 6), x: px - fx0 - 4, y: py - fyy, ax: 0.8 + t * 0.6, ay: 0.12, ph: i * 0.55 }, bx, by, 5.5, k));
    }
    objects.push({ foot: by, behind: 0, parts });
  }

  // Balon di sisi tangga.
  for (const k of [-1, 1]) {
    const l = DL - 62;
    const s = k * 112;
    const [bx, by] = iso.xy(l, s, 0).map(Math.round);
    footShadow(bx, by, 20, 5, 3);
    const weight = new Canvas(6, 4);
    weight.rect(1, 0, 4, 4, C.steel);
    const parts: (number | number[])[][] = [pieceOf({ s: sprite(weight), x: -3, y: -4, ax: 0, ay: 0, ph: 0 }, bx, by, 6, 0)];
    [hex("#e05a6a"), hex("#fff2d0"), hex("#e8b23e"), hex("#e88fb0")].forEach((col, i) => {
      const b = new Canvas(16, 46);
      const ox = 8 + (i - 1.5) * 1.5;
      const top = 7 + (i % 2) * 7;
      for (let y = top + 6; y < 46; y++) b.set(8 + ((ox - 8) * (46 - y)) / 32, y, C.stoneDark);
      b.disc(ox, top, 5.4, (dx, dy) => (dx > 1 && dy < -1 ? mix(col, C.white, 0.6) : dx < -2 || dy > 2.6 ? shade(col, -0.24) : col));
      parts.push(pieceOf({ s: sprite(b), x: -8 + (i - 1.5) * 4, y: -48, ax: 0.8, ay: 0.7, ph: i * 1.3 }, bx, by, 5, k));
    });
    objects.push({ foot: by, behind: 1, parts });
  }

  // Bendera segitiga melintang di atas jalan masuk. Tali di atas kepala, jadi selalu di depan karakter.
  const flag = (col: Rgb) => {
    const f = new Canvas(8, 11);
    for (let y = 0; y < 10; y++) {
      const hw = 3.6 * (1 - y / 10);
      for (let x = -hw; x <= hw; x++) f.set(4 + x, y, x > 0 ? col : shade(col, -0.16));
    }
    return sprite(f);
  };
  const flags = [hex("#c23f4a"), hex("#fff2d0"), hex("#e8b23e"), hex("#2f8f8a")].map(flag);
  {
    const l = 392;
    const left = iso.xy(l, -72, 0).map(Math.round);
    const right = iso.xy(l, 72, 0).map(Math.round);
    for (const [p, s] of [[left, -72], [right, 72]] as const) {
      footShadow(p[0], p[1], 30, 3, 2);
      const pole = new Canvas(6, 62);
      for (let y = 0; y < 62; y++) {
        pole.set(2, y, BAMBOO[y % 12 === 0 ? 1 : 2]);
        pole.set(3, y, BAMBOO[y % 12 === 0 ? 2 : 4]);
      }
      objects.push({ foot: groundFoot(l, s), behind: 1, parts: [pieceOf({ s: sprite(pole), x: -2, y: -60, ax: 0, ay: 0, ph: 0 }, p[0], p[1], 6, 0)] });
    }
    const parts: (number | number[])[][] = [];
    const rope = new Canvas(right[0] - left[0] + 2, right[1] - left[1] + 12);
    const count = 15;
    for (let i = 0; i <= (right[0] - left[0]) * 2; i++) {
      const t = i / ((right[0] - left[0]) * 2);
      rope.set(i / 2, t * (right[1] - left[1]) + 8 * 4 * t * (1 - t), C.dark);
    }
    parts.push(pieceOf({ s: sprite(rope), x: 0, y: 0, ax: 0, ay: 0, ph: 0 }, left[0], left[1] - 58, 6, 0));
    for (let i = 1; i < count; i++) {
      const t = i / count;
      const x = left[0] + (right[0] - left[0]) * t;
      const y = left[1] - 58 + (right[1] - left[1]) * t + 8 * 4 * t * (1 - t);
      parts.push(pieceOf({ s: flags[i % 4], x: -4, y: 0, ax: 0.9, ay: 0.14, ph: i * 0.75 }, x, y, 4.5, l));
    }
    objects.push({ foot: TOP, behind: 1, parts });
  }

  // Air mancur: batu diam, air di depannya berganti frame.
  {
    const rim = fountainRim();
    const rimS = sprite(rim.c);
    const pedestal = fountainPedestal();
    const pedestalS = sprite(pedestal.c);
    const count = Array.from({ length: FOUNTAIN_FRAMES }, (_, f) => f);
    const surface = count.map((f) => raw(fountainSurface(f)));
    const flows = count.map((f) => fountainWater(f));
    const flow = flows.map((w) => raw(w.c));
    const SPEED = 12;
    objects.push({
      foot: fy,
      behind: behindGate(FOUNTAIN.l, FOUNTAIN.s),
      parts: [
        [rimS.id, fx - rim.ox + rimS.ox, fy - rim.oy + rimS.oy, 0, 0, 0, 0, 0],
        [surface, fx - FOUNTAIN.inX, fy + FOUNTAIN.sink - FOUNTAIN.inY, 0, 0, 0, 0, SPEED],
        [pedestalS.id, fx - pedestal.ox + pedestalS.ox, fy - pedestal.oy + pedestalS.oy, 0, 0, 0, 0, 0],
        [flow, fx - flows[0].ox, fy - flows[0].oy, 0, 0, 0, 0, SPEED],
      ],
    });
  }

  // Kupu-kupu di sekitar bunga dan burung yang melintas sesekali.
  const wings = (col: Rgb, open: boolean) => {
    const b = new Canvas(5, 4);
    b.rect(2, 0, 1, 4, C.line);
    if (open) {
      b.rect(0, 0, 2, 2, col);
      b.rect(3, 0, 2, 2, col);
      b.set(0, 2, shade(col, -0.2));
      b.set(4, 2, shade(col, -0.2));
    } else {
      b.rect(1, 0, 1, 3, col);
      b.rect(3, 0, 1, 3, col);
    }
    return raw(b);
  };
  for (const [l, s, col, seed] of [[300, 300, "#fff2d0", 1], [420, -205, "#f4b64a", 2], [402, 360, "#e77fb0", 3], [320, -180, "#a5c8f4", 4], [120, 400, "#fff2d0", 5], [660, 400, "#f4b64a", 6]] as const) {
    const [x, y] = iso.xy(l, s, 34);
    const rgb = hex(col);
    objects.push({ foot: TOP + seed, behind: 1, parts: [[[wings(rgb, true), wings(rgb, false)], Math.round(x), Math.round(y), 12, 7, seed, 11 + seed, 7]] });
  }
  const bird = (open: boolean) => {
    const b = new Canvas(9, 5);
    if (open) {
      b.line(0, 0, 4, 2, C.line);
      b.line(8, 0, 4, 2, C.line);
    } else {
      b.line(0, 3, 4, 2, C.line);
      b.line(8, 3, 4, 2, C.line);
    }
    return raw(b);
  };
  const birdFrames = [bird(true), bird(false)];
  const flies = [[birdFrames, 40, 34, 0], [birdFrames, 62, 31, 0.03], [birdFrames, 22, 36, 0.05], [birdFrames, 130, 46, 0.55]];

  // Seluruh bayangan diterapkan ke tanah, gedung digambar sesudahnya.
  boxShadow(DL, TOWN.bl1, -TOWN.bs, TOWN.bs, 0, TOWN.wall);
  for (const k of [-1, 1]) boxShadow(GL - 12, GL + 12, k * GS - 12, k * GS + 12, 0, TOWN.gateZ);
  boxShadow(GL - 14, GL + 14, -GS - 28, GS + 28, TOWN.gateZ, TOWN.gateZ + 76);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!mask[y * W + x]) continue;
      const i = (y * W + x) * 4;
      const p: Rgb = [c.data[i], c.data[i + 1], c.data[i + 2]];
      c.set(x, y, mix(p, SHADOW, 0.46));
    }
  }

  at(DL, 0, () => mainHall(iso));

  items.sort((a, b) => a.d - b.d);
  for (const it of items) it.draw();
  await c.save("town.png", 200);
  // Gerbang satu lapisan DOM sendiri, papan namanya menempel di sana.
  const front = new Canvas(W, H);
  drawGate(new Iso(front, TOWN.x0, TOWN.y0, TOWN.art));
  await front.save("town-gate.png", 64);

  // Lembar potongan hidup dan datanya untuk town-life.ts.
  const rects = await saveAtlas("town-life.png", 220);
  objects.sort((a, b) => a.foot - b.foot);
  const data = `// Dihasilkan scripts/isometrik-assets.ts, jangan diubah manual. Koordinat dalam piksel gambar peta.
export const LIFE_ART = ${TOWN.art};
export const LIFE_W = ${W};
export const LIFE_H = ${H};
// Kotak air mancur, satu-satunya bagian yang diperbarui lebih sering dari sisa peta.
export const WATER_BOX = ${JSON.stringify([fx - 38, fy - 38, fx + 38, fy + 28])};
// Kaki objek yang selalu digambar paling depan, misalnya tali bendera di atas kepala.
export const LIFE_TOP = ${TOP};
// Kotak potongan di town-life.png: x, y, lebar, tinggi.
export const RECTS: number[][] = ${JSON.stringify(rects)};
export type LifePart = [number | number[], number, number, number, number, number, number, number];
// Tiap objek: [kaki, di belakang gerbang, potongan]. Potongan: [sprite atau frame, x, y, ayun x, ayun y, fase, periode, fps].
export const OBJECTS: [number, number, LifePart[]][] = ${JSON.stringify(objects.map((o) => [+o.foot.toFixed(1), o.behind, o.parts]))};
// Kelopak jatuh: [sprite, x, y, jarak jatuh, geser angin, periode, fase].
export const FALLS: number[][] = ${JSON.stringify(falls.map((f) => f.map((v) => +v.toFixed(2))))};
// Burung: [frame, y, detik per lintasan, fase].
export const FLIES: [number[], number, number, number][] = ${JSON.stringify(flies)};
`;
  await writeFile(`${ROOT}src/components/invitation/gedung/town-life-data.ts`, data);
}

// Pot terakota tanpa isi: tanamannya bagian dari lapisan hidup.
function terracottaBase(iso: Iso, l: number, s: number) {
  const c = iso.c;
  const [x, y] = iso.xy(l, s, 0);
  const r = 15 / iso.art;
  const h = 22 / iso.art;
  for (let i = 0; i <= h; i++) {
    const w = r * (0.75 + 0.3 * Math.sin((i / h) * Math.PI));
    for (let k = -w; k <= w; k++) {
      const t = (k + w) / (2 * w);
      c.set(x + k, y - i, t < 0.25 ? C.tileDark : t < 0.55 ? C.tile : t < 0.85 ? C.tileLight : C.tilePale);
    }
    c.set(x - w - 1, y - i, C.line);
    c.set(x + w + 1, y - i, C.line);
  }
  c.rect(x - r - 1, y - h - 1, 2 * r + 3, 2, C.tilePale);
  c.rect(x - r - 2, y - h - 2, 2 * r + 5, 1, C.line);
  c.rect(x - r, y + 1, 2 * r + 1, 1, C.line);
}

// ---------------------------------------------------------------------------------------------------------------
// Aula. Sama dengan interior-world.ts.
const HALL_ART = 2.4;
const H = { x0: 460, y0: 1300, L: 1500, S: 400, wall: 150, stageL: 1270, stageS: 280, stageZ: 26, stepL: 1236, stepS: 130, w: 2420, h: 1540 };

function hallWall(z: number, top: number): Rgb {
  if (z < 8) return C.rockDark;
  if (z > top - 5) return C.stoneLight;
  if (z > top - 9) return C.concreteDark;
  return C.concrete;
}

// Kaca seperti fasad gedung: lobi menyala bertirai di bawah, pita beton, lalu kisi kaca biru dan kuning di atas.
function hallGlass(u: number, z: number, top: number, seed: number): Rgb {
  const B = 98;
  const U = u + 800;
  if (z < 8) return C.rockDark;
  if (z < B - 8) {
    const k = U % 68;
    if (k < 5) return C.concrete;
    if (z > B - 22) return (U + 100) % 12 < 2 ? C.goldBar : C.glowLight;
    if (z > B - 26) return C.steel;
    if (k < 15) return Math.floor(k) % 3 ? C.cloth : C.clothDark;
    if (k > 58) return Math.floor(k) % 3 ? C.clothDark : C.cloth;
    return z > 56 ? C.glowLight : C.glow;
  }
  if (z < B) return (z - B + 8) % 8 < 2 ? C.concreteDark : C.concrete;
  if (z > top - 9) return hallWall(z, top);
  if (U % 40 < 3 || (z - B) % 22 < 2.4) return C.steel;
  const n = hash(Math.floor(U / 40) + seed, Math.floor((z - B) / 22));
  if (n > 0.72) return (z - B) % 22 > 13 ? C.glowLight : C.glow;
  return (U + z * 0.9) % 150 < 30 ? C.glassLight : n > 0.38 ? C.glass : C.glassDark;
}

// Panel marun berbunga, sama dengan panel di atas pintu gedung.
function bannerAt(u: number, z: number, w: number, z0: number, z1: number): Rgb | null {
  if (Math.abs(u) > w || z < z0 || z > z1) return null;
  if (Math.abs(u) > w - 3) return C.concreteDark;
  return flower(u, z - (z0 + z1) / 2, w * 0.68, C.white, C.glow) ?? (z % 8 < 1 ? C.wineDark : C.wine);
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

function hallFloor(l: number, s: number): Rgb {
  const T = 60;
  const BAY = H.L / 8;
  if ((l + 3000) % T < 2.6 || (s + 3000) % T < 2.6) return mix(C.stoneMid, C.stoneDark, 0.45);
  const n = hash(Math.floor((l + 3000) / T), Math.floor((s + 3000) / T));
  let col: Rgb = n > 0.72 ? C.stoneLight : n < 0.22 ? mix(C.stone, C.stoneMid, 0.4) : C.stone;
  // Cahaya jendela jatuh ke lantai, kecuali di depan dinding foto.
  const bay = Math.min(7, Math.floor(l / BAY));
  const u = l - (bay + 0.5) * BAY;
  const window = bay !== 3 && bay !== 4 && bay !== 1 && bay !== 6;
  if (window && Math.abs(u) < BAY / 2 - 20 && s > -H.S + 34 && s < -H.S + 128) col = mix(col, C.white, 0.42);
  // Bayangan kontak di kaki dinding.
  const toWall = Math.min(s + H.S, H.L - l);
  if (toWall < 14) col = mix(col, C.stoneDark, 0.62);
  else if (toWall < 28) col = mix(col, C.stoneDark, 0.28);
  return col;
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

async function drawHall() {
  // Di luar dinding hanya warna solid, sama dengan latar tema, jadi perhatian tamu tetap di dalam aula.
  const c = new Canvas(Math.round(H.w / HALL_ART), Math.round(H.h / HALL_ART), hex("#2a1c1e"));
  const iso = new Iso(c, H.x0, H.y0, HALL_ART);
  const { L, S, wall: W } = H;

  iso.box(0, L, -S, S, -18, 0, C.stone, C.rockDark, C.rock);
  iso.floor(0, 0, L, -S, S, hallFloor);
  iso.floor(0, -24, H.stepL + 2, -46, 46, carpet);

  // Dinding belakang: tiang beton, kaca seperti fasad, panel marun, dan bagian tengahnya dinding foto penuh.
  const BAY = L / 8;
  iso.wallS(-S, 0, L, 0, W, (l, z) => {
    const i = Math.min(7, Math.floor(l / BAY));
    const u = l - (i + 0.5) * BAY;
    const base = hallWall(z, W);
    if (Math.abs(u) > BAY / 2 - 10) return z < 8 ? C.rockDark : z > W - 9 ? base : Math.abs(u) > BAY / 2 - 3 ? C.concreteDark : C.concrete;
    if (i >= 3 && i <= 4) {
      if (z < 46 || z > W - 13) return base;
      const pu = (u + BAY / 2) % 34;
      const zz = z - 47;
      const row = Math.floor(zz / 30);
      const pv = zz % 30;
      if (pu > 1 && pu < 33 && pv > 1 && pv < 29) return photo(pu - 1, pv - 1, 32, 28, i * 7 + Math.floor((u + BAY / 2) / 34) * 3 + row * 5);
      return C.steel;
    }
    if (i === 1 || i === 6) return bannerAt(u, z, 42, 12, W - 12) ?? hallGlass(u, z, W, i);
    return hallGlass(u, z, W, i);
  });

  // Dinding ujung: latar pelaminan di sumbu karpet, kaca di kanan dan kirinya, sedikit lebih teduh.
  iso.wallL(L, -S, S, 0, W, (s, z) => {
    const a = Math.abs(s);
    const base = hallWall(z, W);
    if (a < 210) {
      if (z < 8) return C.rockDark;
      if (z > W - 12) return base;
      if (a > 174) return Math.floor(a / 7) % 2 ? C.wine : C.wineLight;
      if (a > 170) return C.glowDark;
      return flower(s, z - 112, 18, C.glow, C.white) ?? (Math.floor((s + 300) / 18) % 2 ? C.plasterLight : C.plaster);
    }
    if (a > 386 || a < 222) return z < 8 ? C.rockDark : z > W - 9 ? base : a > 392 || a < 216 ? C.concreteDark : C.concrete;
    const glass = hallGlass(a - 304, z, W, 20);
    return glass === C.glow || glass === C.glowLight ? mix(glass, C.glowDark, 0.28) : shade(glass, -0.1);
  });

  // Tembok tepi atas, sama dengan tepi atap gedung.
  iso.box(-16, L + 16, -S - 16, -S, W, W + 8, C.stoneLight, C.concreteDark, C.concrete);
  iso.box(L, L + 16, -S, S + 16, W, W + 8, C.stoneLight, C.concrete, C.concreteDark);

  // Pelaminan bertingkat: panggung, tangga tiga anak, podium pengantin, dan gebyok putih berukir emas sebagai latar.
  const { stageL: SL, stageS: SS, stageZ: SZ, stepL: TL, stepS: TS } = H;
  const DAIS = { l0: L - 92, l1: L - 8, s: 136, z: SZ + 10 };
  const under = (x: number, y: number): Rgb => {
    const i = (Math.floor(y) * c.w + Math.floor(x)) * 4;
    return [c.data[i], c.data[i + 1], c.data[i + 2]];
  };
  const dim = (z: number, l0: number, l1: number, s0: number, s1: number, k: number) => iso.floor(z, l0, l1, s0, s1, (_, __, x, y) => mix(under(x, y), SHADOW, k));
  const trim = (s: number, z: number, top: number, base: Rgb, dark: Rgb) => {
    if (z > top - 2.4) return C.goldBar;
    if (z > top - 4) return dark;
    if (z < 3) return C.line;
    if (z < 5) return C.goldBar;
    return Math.abs(((s + 900) % 34) - 17) + Math.abs(z - top / 2) * 1.4 < 5.5 ? C.goldBar : base;
  };
  dim(0, SL - 12, SL, -SS - 10, SS + 10, 0.24);
  iso.box(SL, L, -SS, SS, 0, SZ, C.stoneLight, C.wineDark, C.wine, null);
  iso.wallL(SL, -SS, SS, 0, SZ, (a, z) => trim(a, z, SZ, C.wineDark, C.wine));
  iso.wallS(SS, SL, L, 0, SZ, (a, z) => trim(a, z, SZ, C.wine, C.wineLight));
  // Lantai panggung marmer krem berbingkai emas, karpet marun dari tangga ke podium.
  iso.floor(SZ, SL, L, -SS, SS, (l, a) => {
    if (l < SL + 3 || Math.abs(a) > SS - 3) return C.goldBar;
    const T = 44;
    if ((l + 3000) % T < 2 || (a + 3000) % T < 2) return C.stoneMid;
    return hash(Math.floor((l + 3000) / T), Math.floor((a + 3000) / T)) > 0.55 ? C.stoneLight : C.stone;
  });
  iso.floor(SZ, SL, DAIS.l0, -48, 48, (l, a) => {
    const e = Math.abs(a);
    if (e > 44) return C.goldBar;
    return flower(((l + 3000) % 60) - 30, a, 16, C.wineLight, C.goldBar) ?? C.wine;
  });
  // Tangga tiga anak, karpet di tengah dan tepi emas di tiap anak tangga.
  const STEP = (SL - TL) / 3;
  for (let i = 0; i < 3; i++) {
    const l0 = TL + i * STEP;
    const z0 = (i * SZ) / 3;
    const z1 = ((i + 1) * SZ) / 3;
    iso.box(l0, SL, -TS, TS, z0, z1, C.stoneLight, C.stoneDark, C.stoneMid, null);
    iso.wallL(l0, -TS, TS, z0, z1, (a, z) => (z > z1 - 1.6 ? C.goldBar : Math.abs(a) < 48 ? C.wineDark : C.stoneDark));
    iso.floor(z1, l0, l0 + STEP, -TS, TS, (_, a) => (Math.abs(a) > 48 ? C.stoneLight : Math.abs(a) > 45 ? C.goldBar : C.wineLight));
  }

  // Gebyok tiga tingkat dari belakang ke depan, tiap panel punya tebal sendiri supaya tidak rata dengan dinding.
  const carve = (a: number, z: number, z0: number, top: number, s0: number, s1: number): Rgb => {
    const e = Math.min(z - z0, top - z, a - s0, s1 - a);
    if (e < 3) return C.goldBar;
    if (e < 4.6) return C.woodLight;
    const cx = ((a + 900) % 34) - 17;
    const cz = ((z + 900) % 34) - 17;
    const d = Math.abs(cx) + Math.abs(cz);
    if (d < 4.5) return C.goldBar;
    if (d > 13 && d < 15.5) return C.goldBar;
    return d > 15.5 ? C.plaster : C.plasterLight;
  };
  const crest = (a: number, top: number, k: number) => top - Math.abs(a) * k;
  for (const k of [-1, 1]) {
    const [a0, a1] = k > 0 ? [170, 268] : [-268, -170];
    dim(SZ, L - 22, L, a0 - 4, a1 + 4, 0.2);
    iso.box(L - 12, L - 2, a0, a1, SZ, SZ + 106, C.plasterLight, C.plasterDark, C.plaster, null);
    const mid = (a0 + a1) / 2;
    iso.wallL(L - 12, a0, a1, SZ, SZ + 128, (a, z) => {
      const edge = SZ + 128 - Math.abs(a - mid) * 0.44;
      if (z > edge) return null;
      return z > edge - 3.6 ? C.goldBar : carve(a, z, SZ, SZ + 128, a0, a1);
    });
    iso.wallL(L - 13, mid - 4, mid + 4, SZ + 128, SZ + 146, (a, z) => (Math.abs(a - mid) < (SZ + 146 - z) * 0.22 + 0.6 ? C.goldBar : null));
  }
  iso.box(DAIS.l0, DAIS.l1, -DAIS.s, DAIS.s, SZ, DAIS.z, C.wine, C.wineDark, C.wine, null);
  dim(SZ, DAIS.l0 - 10, DAIS.l0, -DAIS.s - 6, DAIS.s + 6, 0.2);
  iso.wallL(DAIS.l0, -DAIS.s, DAIS.s, SZ, DAIS.z, (_, z) => (z > DAIS.z - 2 ? C.goldBar : z < SZ + 2 ? C.line : C.wineDark));
  iso.wallS(DAIS.s, DAIS.l0, DAIS.l1, SZ, DAIS.z, (_, z) => (z > DAIS.z - 2 ? C.goldBar : z < SZ + 2 ? C.line : C.wine));
  iso.floor(DAIS.z, DAIS.l0, DAIS.l1, -DAIS.s, DAIS.s, (l, a) => {
    const e = Math.min(l - DAIS.l0, DAIS.l1 - l, DAIS.s - Math.abs(a));
    if (e < 3) return C.goldBar;
    if (e < 6) return C.wineDark;
    return flower(l - (DAIS.l0 + DAIS.l1) / 2 + 8, a, 28, C.wineLight, C.goldBar) ?? ((a + 900) % 30 < 2 ? C.wineDark : C.wine);
  });
  for (const k of [-1, 1]) {
    const [a0, a1] = k > 0 ? [96, 170] : [-170, -96];
    const top = DAIS.z + 170;
    iso.box(L - 20, L - 10, a0, a1, DAIS.z, top, C.plasterLight, C.plasterDark, C.plaster, null);
    iso.wallL(L - 20, a0, a1, DAIS.z, top, (a, z) => {
      const edge = crest(a - k * 96, top, 0.35);
      if (z > edge) return null;
      return z > edge - 3.6 ? C.goldBar : carve(a, z, DAIS.z, top, a0, a1);
    });
  }
  const CT = DAIS.z + 212;
  iso.box(L - 30, L - 20, -96, 96, DAIS.z, CT - 34, C.plasterLight, C.plasterDark, C.plaster, null);
  iso.wallL(L - 30, -96, 96, DAIS.z, CT, (a, z) => {
    const edge = crest(a, CT, 0.36);
    if (z > edge) return null;
    if (z > edge - 3.6 && Math.abs(a) > 4) return C.goldBar;
    // Lengkung tengah bertirai marun, medali emas di puncaknya.
    const arch = Math.abs(a) < 66 && (z < DAIS.z + 118 || Math.hypot(a, z - (DAIS.z + 118)) < 66);
    const rim = Math.abs(a) < 72 && (z < DAIS.z + 118 || Math.hypot(a, z - (DAIS.z + 118)) < 72);
    if (arch) {
      const mz = z - (DAIS.z + 142);
      const d = Math.hypot(a, mz);
      const petal = 13 + 6 * Math.abs(Math.cos(Math.atan2(mz, a) * 4));
      if (d < 4) return C.glowLight;
      if (d < 7) return C.wineDark;
      if (d < 10) return C.goldBar;
      if (d < petal) return d > petal - 2.4 ? C.goldBar : C.wineLight;
      return (a + 900) % 12 < 3 ? C.wineDark : (a + 900) % 12 < 8 ? C.wine : C.wineLight;
    }
    if (rim) return C.goldBar;
    return carve(a, z, DAIS.z, CT, -96, 96);
  });
  // Tirai krem terikat di kedua sisi lengkung.
  for (const k of [-1, 1]) {
    const tie = DAIS.z + 62;
    iso.wallL(L - 32, k > 0 ? 40 : -72, k > 0 ? 72 : -40, DAIS.z, DAIS.z + 152, (a, z) => {
      const reach = z > tie ? 8 + ((z - tie) / 90) * 26 : 8 + ((tie - z) / 62) * 18;
      const fromEdge = 72 - Math.abs(a);
      if (fromEdge > reach) return null;
      if (Math.abs(z - tie) < 3) return C.goldBar;
      return (a + 900) % 6 < 2 ? C.clothDark : C.cloth;
    });
  }
  // Untaian melati menjuntai dari lengkung di kedua sisi, dan lampu dinding emas di panel samping.
  for (const a of [-60, -51, -42, 42, 51, 60]) {
    const from = DAIS.z + 118 + Math.sqrt(66 * 66 - a * a) - 2;
    const len = 34 + (60 - Math.abs(a)) * 1.6;
    for (let z = from; z > from - len; z -= 4.8) {
      const [x, y] = iso.xy(L - 33, a, z);
      c.set(x, y, C.white);
      c.set(x, y + 1, Math.round(z / 4.8) % 3 ? C.white : C.goldBar);
    }
  }
  for (const k of [-1, 1]) {
    iso.wallL(L - 21, k * 133 - 5, k * 133 + 5, DAIS.z + 80, DAIS.z + 100, (a, z) => (z > DAIS.z + 96 || z < DAIS.z + 84 || Math.abs(a - k * 133) > 3.4 ? C.goldBar : C.glowLight));
  }
  const spear = (l: number, a: number, z: number) => iso.wallL(l, a - 5, a + 5, z - 2, z + 24, (v, zz) => (Math.abs(v - a) < (z + 24 - zz) * 0.2 + 0.7 ? C.goldBar : null));
  spear(L - 31, 0, CT - 2);
  for (const k of [-1, 1]) spear(L - 21, k * 96, DAIS.z + 170 - 2);
  // Sofa pengantin berbingkai emas.
  dim(DAIS.z, L - 56, L - 32, -66, 66, 0.28);
  const raised = iso.raised(DAIS.z);
  raised.box(L - 60, L - 34, -60, 60, 0, 16, C.cloth, C.clothDark, C.cloth, null);
  raised.box(L - 60, L - 34, -60, 60, 16, 20, C.white, C.clothDark, C.plasterLight, null);
  raised.box(L - 40, L - 32, -60, 60, 16, 52, C.goldBar, C.glowDark, C.goldBar, null);
  raised.wallL(L - 40, -56, 56, 20, 48, (a, z) => ((a + 900) % 28 < 2 ? C.clothDark : z > 44 ? C.goldBar : C.plasterLight));
  for (const k of [-1, 1]) raised.box(L - 62, L - 40, k * 60 - 4, k * 60 + 4, 16, 32, C.goldBar, C.glowDark, C.goldBar, null);
  // Rangkaian bunga di puncak lengkung, sudut gebyok, dan vas emas di sisi podium.
  for (let i = -12; i <= 12; i++) {
    const t = i / 12;
    const [x, y] = iso.xy(L - 34, t * 78, DAIS.z + 118 + Math.sqrt(Math.max(0, 1 - t * t)) * 76);
    bush(c, x, y, i % 2 ? 5.5 : 6.5, 40 + Math.abs(i), Math.abs(i) % 3 ? C.white : C.blush);
  }
  for (const k of [-1, 1]) {
    raised.box(L - 72, L - 56, k * 116 - 8, k * 116 + 8, 0, 8, C.goldBar, C.glowDark, C.goldBar, null);
    raised.box(L - 66, L - 62, k * 116 - 2, k * 116 + 2, 8, 44, C.goldBar, C.glowDark, C.goldBar, null);
    const [x, y] = raised.xy(L - 64, k * 116, 58);
    // Kembar mayang: janur melengkung keluar, rangkaian bunga, dan ujung emas.
    for (let i = -4; i <= 4; i++) {
      for (let t = 0; t <= 1; t += 0.06) c.set(x + i * 2.6 * t, y - 6 - t * 16 + t * t * (Math.abs(i) * 3.2), t > 0.6 ? FRESH[4] : FRESH[3]);
    }
    bush(c, x, y, 10, 70 + k, k > 0 ? C.white : C.blush);
    c.rect(x, y - 21, 1, 5, C.goldBar);
    c.set(x, y - 22, C.glowLight);
    for (const a of [100, 136, 168]) {
      const [fx, fy] = iso.xy(L - 22, k * a, DAIS.z + 2);
      bush(c, fx, fy, 7, Math.round(a + k * 3), a === 136 ? C.blush : C.white);
    }
    for (const a of [190, 228, 262]) {
      const [fx, fy] = iso.xy(L - 14, k * a, SZ + 2);
      bush(c, fx, fy, 8, Math.round(a + k), a === 228 ? C.blush : C.white);
    }
  }

  // Rangkaian bunga di sepanjang tepi atas dinding.
  for (let l = 20; l < L; l += 46) {
    const [x, y] = iso.xy(l, -S + 1, W - 2);
    paste(c, leafClump(3.4, l % 92 ? FRESH : WARM, Math.round(l), l % 92 ? WHITE_BLOOM : PINK_BLOOM, 0.42), Math.round(x) - 5, Math.round(y) - 5);
  }
  for (let a = -S + 20; a < S; a += 46) {
    if (Math.abs(a) < 214) continue;
    const [x, y] = iso.xy(L - 1, a, W - 2);
    paste(c, leafClump(3.4, FRESH, Math.round(a + 900), PINK_BLOOM, 0.42), Math.round(x) - 5, Math.round(y) - 5);
  }

  // Tembok rendah di sisi dekat kamera: tutup batu terang, tiang tipis mengikuti tiang dinding, dan panel berbingkai emas.
  const LOW = 18;
  const face = (a: number, z: number, shadeK: number): Rgb => {
    let col: Rgb;
    const k = (a + 2000 - 40) % (L / 8);
    if (z > LOW - 4) col = C.stoneLight;
    else if (z > LOW - 6) col = C.steel;
    else if (z < -13) col = C.rockDark;
    else if (k < 14) col = k < 2 || k > 12 ? C.stoneMid : C.stone;
    else if (z > LOW - 9 || z < -9 || k < 19 || k > L / 8 - 5) col = C.concrete;
    else if (z > LOW - 11 || z < -7 || k < 21 || k > L / 8 - 7) col = C.goldBar;
    else col = C.concreteDark;
    return shadeK ? shade(col, shadeK) : col;
  };
  iso.box(0, L + 16, S, S + 16, -18, LOW, C.stoneLight, C.concreteDark, C.concrete, null);
  iso.wallS(S + 16, 0, L + 16, -18, LOW, (a, z) => face(a, z, 0));
  iso.wallL(L + 16, S, S + 16, -18, LOW, (_, z) => (z > LOW - 4 ? C.stoneLight : C.concreteDark));
  iso.floor(LOW, 0, L + 16, S, S + 16, (_, a) => (a < S + 2.4 ? C.stoneMid : C.stoneLight));
  for (const [a, b] of [[58, S + 16], [-S - 16, -58]]) {
    iso.box(-16, 0, a, b, -18, LOW, C.stoneLight, C.concreteDark, C.concrete, null);
    iso.wallL(-16, a, b, -18, LOW, (v, z) => face(v, z, -0.1));
    iso.floor(LOW, -16, 0, a, b, (l) => (l > -2.4 ? C.stoneMid : C.stoneLight));
  }
  iso.seg([0, S + 16, -18], [L + 16, S + 16, -18], C.line);
  iso.seg([-16, S + 16, -18], [-16, S + 16, LOW], C.rockDark);
  // Tiang pintu masuk: beton berpanel, tutup baja, dan lampu dinding kecil.
  for (const k of [-1, 1]) {
    iso.box(-18, 2, k * 64 - 8, k * 64 + 8, -18, 64, C.stoneLight, C.concreteDark, C.concrete, null);
    iso.wallL(-18, k * 64 - 8, k * 64 + 8, -18, 64, (v, z) => {
      const e = Math.min(Math.abs(v - (k * 64 - 8)), Math.abs(v - (k * 64 + 8)));
      if (z < -13) return C.rockDark;
      return e < 2 || z > 58 ? C.concrete : Math.abs(z - 40) < 5 && Math.abs(v - k * 64) < 3 ? C.glowLight : C.concreteDark;
    });
    iso.box(-20, 4, k * 64 - 10, k * 64 + 10, 64, 69, C.steelLight, C.steel, C.steelLight, null);
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
// Isi aula yang berdiri di lantai: diurutkan bersama karakter dan kios lewat z-index, tanamannya bergoyang lewat CSS.
// Rintangannya ikut ditulis ke data supaya interior-world.ts tidak perlu menyalin posisinya.
async function drawHallProps() {
  sprites.length = 0;
  const W = Math.round(H.w / HALL_ART);
  const HH = Math.round(H.h / HALL_ART);
  const { L, S, stageL: SL, stageZ: SZ, stepL: TL } = H;
  const base = new Iso(new Canvas(1, 1), H.x0, H.y0, HALL_ART);
  const objects: { foot: number; parts: { id: number; x: number; y: number; ax: number; per: number; ph: number }[] }[] = [];
  const blocks: number[][] = [];
  const footOf = (l: number, s: number, z = 0) => (H.y0 + (s - l) / 2 - z);
  const add = (foot: number, cv: Canvas, ax = 0, per = 0, ph = 0, into?: (typeof objects)[number]) => {
    const sp = sprite(cv);
    const part = { id: sp.id, x: sp.ox, y: sp.oy, ax, per, ph };
    if (into) into.parts.push(part);
    else objects.push({ foot, parts: [part] });
  };
  const layer = () => {
    const cv = new Canvas(W, HH);
    return { cv, iso: new Iso(cv, H.x0, H.y0, HALL_ART) };
  };
  // Benda diam satu gambar. block: setengah panjang dan lebar rintangan di lantai.
  const prop = (l: number, s: number, draw: (iso: Iso, cv: Canvas) => void, block?: number[], outlined = true, z = 0) => {
    const { cv, iso } = layer();
    draw(iso, cv);
    if (outlined) softOutline(cv);
    add(footOf(l, s, z), cv);
    if (block) blocks.push([l - block[0], l + block[0], s - block[1], s + block[1], z]);
  };
  // Tajuk bunga: massa gelap dan gumpalan bunga, jadi satu sprite yang bergoyang pelan.
  const foliage = (cv: Canvas, x: number, y: number, r: number, ramp: Rgb[], bloom: [Rgb, Rgb], seed: number, rate = 0.3) => {
    cv.disc(x, y + 1, r, (dx, dy) => ramp[dy > r * 0.2 || dx < -r * 0.3 ? 0 : 1]);
    const spots = [[-0.5, -0.05, 0.6], [0.5, -0.05, 0.6], [0, -0.45, 0.68], [-0.25, 0.3, 0.5], [0.3, 0.3, 0.5]];
    spots.forEach(([dx, dy, k], i) => {
      const rr = r * k;
      const size = Math.ceil(rr * 2 + 5);
      paste(cv, leafClump(rr, ramp, seed * 3 + i, bloom, rate), Math.round(x + dx * r - (size >> 1)), Math.round(y + dy * r - (size >> 1)));
    });
  };

  const potPlant = (l: number, s: number, ramp: Rgb[], bloom: [Rgb, Rgb], seed: number, size = 1.1, z = 0) => {
    const obj = { foot: footOf(l, s, z), parts: [] as (typeof objects)[number]["parts"] };
    objects.push(obj);
    const pot = layer();
    terracottaBase(z ? pot.iso.raised(z) : pot.iso, l, s);
    softOutline(pot.cv);
    add(0, pot.cv, 0, 0, 0, obj);
    const top = new Canvas(W, HH);
    const [x, y] = base.xy(l, s, z + 22 + 16 * size);
    foliage(top, Math.round(x), Math.round(y), 8 * size, ramp, bloom, seed);
    softOutline(top);
    add(0, top, 0.9, 5.5 + hash(seed, 2) * 2.5, hash(seed, 5) * 6, obj);
    blocks.push([l - 13, l + 13, s - 13, s + 13, z]);
  };

  // Rangkaian bunga berdiri di tepi karpet: tiang emas berkaki tiga dan buket bergoyang.
  const stand = (l: number, s: number, ramp: Rgb[], bloom: [Rgb, Rgb], seed: number) => {
    const obj = { foot: footOf(l, s), parts: [] as (typeof objects)[number]["parts"] };
    objects.push(obj);
    const t = layer();
    const [x, y] = t.iso.xy(l, s, 0);
    const [tx, ty] = t.iso.xy(l, s, 58);
    t.cv.line(x - 4, y + 1, tx, ty + 10, C.goldBar);
    t.cv.line(x + 4, y + 1, tx, ty + 10, C.goldBar);
    t.cv.line(x, y + 3, tx, ty + 10, C.glowDark);
    t.cv.rect(tx, ty, 1, 11, C.goldBar);
    t.cv.rect(tx - 3, ty - 1, 7, 2, C.glowDark);
    softOutline(t.cv);
    add(0, t.cv, 0, 0, 0, obj);
    const top = new Canvas(W, HH);
    foliage(top, Math.round(tx), Math.round(ty - 4), 8.5, ramp, bloom, seed, 0.34);
    softOutline(top);
    add(0, top, 0.8, 6 + hash(seed, 3) * 2, hash(seed, 7) * 6, obj);
    blocks.push([l - 8, l + 8, s - 8, s + 8, 0]);
  };

  // Lentera dan pot di kaki dinding, mengikuti tiang.
  const BAY = L / 8;
  for (let i = 1; i < 8; i++) {
    if (i === 4) continue;
    const l = i * BAY;
    if (i % 2) potPlant(l, -S + 22, i % 4 === 1 ? WARM : FRESH, i % 4 === 1 ? WHITE_BLOOM : PINK_BLOOM, 100 + i);
    else prop(l, -S + 20, (iso) => lanternPost(iso, l, -S + 20, 44), [11, 11]);
  }
  // Rangkaian bunga berselang di kedua tepi karpet, sampai kaki tangga.
  [190, 400, 610, 820, 1030].forEach((l, i) => {
    for (const k of [-1, 1]) stand(l, k * 66, i % 2 ? WARM : FRESH, i % 2 ? PINK_BLOOM : WHITE_BLOOM, 200 + i * 2 + k);
  });
  // Pot besar di kaki tangga panggung, rintangannya sudah ada di FURNITURE.
  for (const k of [-1, 1]) potPlant(TL - 14, k * 150, WARM, WHITE_BLOOM, 21 + k, 1.4);

  // Meja bundar bertaplak dengan empat kursi di sumbu isometrik, supaya kursi digambar searah lantai.
  // Kursi pesta: kaki emas, bantal putih, dan sandaran kain marun di sisi yang jauh dari meja.
  const chair = (iso: Iso, l: number, s: number, side: "+l" | "-l" | "+s" | "-s") => {
    const R = 11;
    const SEAT = 22;
    const TOP = 50;
    const T = 3;
    const back = () => {
      if (side === "+l" || side === "-l") {
        const l0 = side === "+l" ? l + R - T : l - R;
        iso.box(l0, l0 + T, s - R, s + R, SEAT, TOP, C.goldBar, C.glowDark, C.goldBar, null);
        iso.wallL(l0, s - R + 2, s + R - 2, SEAT + 3, TOP - 3, () => C.wine);
      } else {
        const s0 = side === "-s" ? s - R : s + R - T;
        iso.box(l - R, l + R, s0, s0 + T, SEAT, TOP, C.goldBar, C.glowDark, C.goldBar, null);
        iso.wallS(s0 + T, l - R + 2, l + R - 2, SEAT + 3, TOP - 3, () => C.wineLight);
      }
    };
    const far = side === "+l" || side === "-s";
    if (far) back();
    for (const dl of [-R + 2, R - 2]) for (const ds of [-R + 2, R - 2]) iso.box(l + dl - 1.5, l + dl + 1.5, s + ds - 1.5, s + ds + 1.5, 0, SEAT - 3, C.goldBar, C.glowDark, C.goldBar, null);
    iso.box(l - R, l + R, s - R, s + R, SEAT - 3, SEAT, C.goldBar, C.glowDark, C.goldBar, null);
    iso.box(l - R + 1, l + R - 1, s - R + 1, s + R - 1, SEAT, SEAT + 3, C.white, C.clothDark, C.cloth, null);
    if (!far) back();
  };
  const banquet = (l: number, s: number, bloom: [Rgb, Rgb], seed: number) => {
    prop(l, s, (iso, cv) => {
      const [x0, y0] = iso.xy(l, s, 0).map(Math.round);
      const REACH = 44;
      chair(iso, l + REACH, s, "+l");
      chair(iso, l, s - REACH, "-s");
      oval(cv, x0, y0 + 1, 19, 9, () => C.clothDark);
      cv.rect(x0 - 18, y0 - 12, 37, 13, C.cloth);
      for (let i = -17; i <= 17; i += 4) cv.rect(x0 + i, y0 - 11, 1, 13, i % 8 ? hex("#e9d9b8") : C.clothDark);
      oval(cv, x0, y0 + 1, 18.5, 8.6, (dx, dy) => (dy < 0 ? C.cloth : dx % 4 ? C.cloth : C.clothDark));
      oval(cv, x0, y0 - 12, 19, 9.4, (dx) => (dx > 5 ? C.white : C.plasterLight));
      oval(cv, x0, y0 - 12, 15, 7, (dx, dy) => (Math.abs(dx) + Math.abs(dy) * 2 > 17 ? C.goldBar : dx > 5 ? C.white : C.plasterLight));
      // Piring, gelas, dan rangkaian bunga di tengah meja.
      for (const [dx, dy] of [[-11, 0], [11, 0], [-5, 4], [5, 4], [-5, -4], [5, -4]]) {
        oval(cv, x0 + dx, y0 - 12 + dy, 2.6, 1.4, () => C.stoneMid);
        cv.set(x0 + dx, y0 - 12 + dy, C.white);
      }
      paste(cv, leafClump(5, WARM, seed, bloom, 0.5), x0 - 7, y0 - 24);
      chair(iso, l - REACH, s, "-l");
      chair(iso, l, s + REACH, "+s");
    }, [56, 56]);
  };
  [430, 660, 890, 1120].forEach((l, i) => banquet(l, 316, i % 2 ? PINK_BLOOM : WHITE_BLOOM, 300 + i));
  banquet(960, -316, PINK_BLOOM, 310);

  // Meja prasmanan panjang di dinding belakang: taplak, wadah saji perak, dan bunga.
  prop(1130, -330, (iso, cv) => {
    const [l, s] = [1130, -330];
    iso.box(l - 74, l + 74, s - 20, s + 20, 0, 34, C.white, C.clothDark, C.cloth);
    iso.wallS(s + 20, l - 74, l + 74, 0, 34, (a, z, x) => (z > 28 ? C.wine : z > 25 ? C.goldBar : x % 3 ? C.cloth : C.clothDark));
    iso.wallL(l - 74, s - 20, s + 20, 0, 34, (_, z, x) => (z > 28 ? C.wineDark : z > 25 ? C.glowDark : x % 3 ? C.clothDark : hex("#c4ad84")));
    for (const a of [-52, -20, 12, 44]) {
      iso.box(l + a - 11, l + a + 11, s - 9, s + 9, 34, 37, C.stoneDark, C.rockDark, C.rock);
      const [x, y] = iso.xy(l + a, s, 37);
      oval(cv, Math.round(x), Math.round(y) - 3, 6, 3.6, (dx, dy) => (dx > 1 && dy < 0 ? C.white : dx < -2 ? C.stoneDark : C.stoneLight));
      cv.rect(Math.round(x), Math.round(y) - 8, 1, 2, C.rockDark);
    }
    const [fx, fy] = iso.xy(l + 66, s, 40);
    paste(cv, leafClump(5, WARM, 33, PINK_BLOOM, 0.5), fx - 7, fy - 8);
  }, [76, 22]);

  // Sudut foto: dinding bunga, tirai, dan lampu cincin.
  prop(170, 322, (iso, cv) => {
    const [l, s] = [170, 330];
    iso.box(l - 62, l + 62, s + 12, s + 18, 0, 118, C.woodPale, C.wood, C.woodLight);
    iso.wallS(s + 12, l - 62, l + 62, 0, 118, (a, z) => (z < 8 ? C.wood : Math.floor((a + 200) / 12) % 2 ? C.plaster : C.plasterLight));
    const rand = rng(77);
    for (let i = 0; i < 46; i++) {
      const a = l - 58 + rand() * 116;
      const z = 14 + rand() * 100;
      const [x, y] = iso.xy(a, s + 11, z);
      const edge = Math.abs(a - l) > 34 || z > 86;
      if (!edge) continue;
      paste(cv, leafClump(3 + rand() * 1.5, i % 3 ? FRESH : WARM, i, i % 2 ? PINK_BLOOM : WHITE_BLOOM, 0.6), x - 5, y - 5);
    }
    const [tx, ty] = iso.xy(l, s + 11, 62);
    cv.rect(tx - 9, ty - 7, 19, 11, C.wine);
    cv.rect(tx - 8, ty - 6, 17, 9, C.wineLight);
    cv.disc(tx, ty - 2, 3, () => C.white);
    cv.set(tx, ty - 2, C.glow);
  }, [64, 18]);

  // Kursi orang tua di kedua sisi pengantin, di lantai panggung.
  const armchair = (l: number, s: number) => {
    prop(l, s, (iso0) => {
      const iso = iso0.raised(SZ);
      iso.box(l - 13, l + 13, s - 13, s + 13, 0, 16, C.cloth, C.clothDark, C.cloth, null);
      iso.box(l - 14, l + 14, s - 14, s + 14, 16, 19, C.white, C.clothDark, C.plasterLight, null);
      iso.box(l + 8, l + 15, s - 14, s + 14, 16, 46, C.goldBar, C.glowDark, C.goldBar, null);
      iso.wallL(l + 8, s - 11, s + 11, 19, 43, () => C.wine);
      iso.box(l - 14, l + 8, s - 16, s - 12, 16, 28, C.goldBar, C.glowDark, C.goldBar, null);
      iso.box(l - 14, l + 8, s + 12, s + 16, 16, 28, C.goldBar, C.glowDark, C.goldBar, null);
    }, [16, 16], true, SZ);
  };
  for (const k of [-1, 1]) {
    armchair(L - 62, k * 176);
    armchair(L - 62, k * 216);
  }

  // Rangkaian buah di depan panggung, di kanan dan kiri tangga.
  const fruits = (l: number, s: number, seed: number) => {
    prop(l, s, (iso, cv) => {
      iso.box(l - 20, l + 20, s - 20, s + 20, 0, 12, C.goldBar, C.glowDark, C.goldBar);
      const [x, y] = iso.xy(l, s, 12).map(Math.round);
      const rand = rng(seed);
      const tones2 = ["#f28c3f", "#e8505f", "#f7cf5a", "#7bb03f", "#a0507a"].map(hex);
      paste(cv, leafClump(10, FRESH, seed, undefined, 0), x - 12, y - 20);
      for (let row = 0; row < 4; row++) {
        const n = 5 - row;
        for (let i = 0; i < n; i++) {
          const col = tones2[Math.floor(rand() * tones2.length)];
          const fx = x + (i - (n - 1) / 2) * 5;
          const fy = y - 1 - row * 5;
          cv.disc(fx, fy, 3, (dx, dy) => (dx > 0 && dy < 0 ? mix(col, C.white, 0.4) : dy > 1 ? mix(col, C.line, 0.3) : col));
        }
      }
    }, [24, 24]);
  };
  for (const k of [-1, 1]) fruits(TL - 26, k * 196, 50 + k);

  // Tiang panggung dan rangkaian bunga di tepi depan panggung.
  for (const k of [-1, 1]) {
    prop(SL + 20, k * 262, (iso) => lanternPost(iso.raised(SZ), SL + 20, k * 262, 40), [11, 11], true, SZ);
    for (const s of [170, 206, 242]) {
      const obj = { foot: footOf(SL + 8, k * s, SZ), parts: [] as (typeof objects)[number]["parts"] };
      objects.push(obj);
      const top = new Canvas(W, HH);
      const [x, y] = base.xy(SL + 8, k * s, SZ + 8);
      foliage(top, Math.round(x), Math.round(y), 6.5, s % 3 ? WARM : FRESH, s % 2 ? PINK_BLOOM : WHITE_BLOOM, 400 + s + k, 0.32);
      softOutline(top);
      add(0, top, 0.7, 6 + hash(s, k) * 2, hash(k, s) * 6, obj);
    }
  }

  const rects = await saveAtlas("hall-props.png", 200);
  const sheetH = Math.max(...rects.map((r) => r[1] + r[3])) + 1;
  objects.sort((a, b) => a.foot - b.foot);
  // Tiap potongan: [x atlas, y atlas, lebar, tinggi, x, y, kaki, ayun, periode, fase].
  const flat: number[][] = [];
  for (const o of objects) for (const p of o.parts) flat.push([...rects[p.id], p.x, p.y, Math.round(o.foot), p.ax, +p.per.toFixed(2), +p.ph.toFixed(2)]);
  const data = `// Dihasilkan scripts/isometrik-assets.ts, jangan diubah manual. Koordinat dalam piksel gambar aula.
export const PROPS_W = ${W};
export const PROPS_H = ${HH};
export const PROPS_ATLAS = { src: "/img/rafi-kayla/hall-props.png", w: 1024, h: ${sheetH} };
// Tiap potongan: [x atlas, y atlas, lebar, tinggi, x, y, kaki, ayun, periode, fase]. Ayun -1 berarti berkelip.
export const HALL_PROPS: number[][] = ${JSON.stringify(flat)};
// Rintangan di lantai aula: [l0, l1, s0, s1, tinggi lantai].
export const HALL_BLOCKS: number[][] = ${JSON.stringify(blocks)};
`;
  await writeFile(`${ROOT}src/components/invitation/gedung/hall-props-data.ts`, data);
}

// Karakter bergaya chibi: kepala besar berambut tebal bergerigi, badan kecil, mata gelap berkilap, pipi merona, tanpa mulut.
// Sel 28 x 37 digambar sepadat peta (2,4 piksel peta per piksel gambar), jadi kisi pikselnya sama dengan lingkungan.
// Lembar 3 x 3 sel: baris menghadap bawah, kanan, dan atas (kanan dicerminkan untuk kiri), kolom diam dan dua langkah.
// Ukuran sel sama dengan CELL di door.tsx.
const CELL = { w: 28, h: 37 };
const INK = hex("#1b1320");

// Warna jas karakter pemain di gambar. Di halaman warna ini ditukar mengikuti aksen tema, lihat hero-tint.ts.
const JAS_KEY = "#b4553b";

type Art = { x: number; y: number; rows: string[] };
const art = (x: number, y: number, ...rows: string[]): Art => ({ x, y, rows });

// Bayangan bergeser ke merah keunguan, sorot ke kuning, supaya warnanya tidak kusam.
function hsv(c: Rgb): [number, number, number] {
  const [r, g, b] = c.map((v) => v / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  const h = !d ? 0 : max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, max ? d / max : 0, max];
}
function rgb(h: number, s: number, v: number): Rgb {
  const f = (n: number) => {
    const k = (n + ((h + 360) % 360) / 60) % 6;
    return (v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255;
  };
  return [f(5), f(3), f(1)];
}
const tint = (c: Rgb, dh: number, ks: number, kv: number): Rgb => {
  const [h, s, v] = hsv(c);
  return rgb(h + dh, Math.min(1, s * ks), Math.min(1, v * kv));
};
const SHADE = hex("#3b2f5c");
const DEEP_SHADE = hex("#231f33");
const ramp4 = (b: string) => {
  const c = hex(b);
  return { hi: mix(c, hex("#ffdca8"), 0.3), base: c, lo: mix(c, SHADE, 0.36), deep: mix(c, DEEP_SHADE, 0.62) };
};

type Spec = {
  skin: string;
  hair: string;
  top: string;
  shirt?: string;
  accent?: string;
  bottom: string;
  shoe: string;
  build: "pria" | "wanita";
  hairStyle: string;
  topStyle?: "kemeja" | "beskap" | "rompi" | "kebaya" | "gaun";
  motif?: "top" | "bottom";
  hat?: "peci" | "blangkon";
  glasses?: boolean;
  melati?: boolean;
  clip?: boolean;
  short?: boolean;
  prop?: "tongkat" | "balon" | "kipas" | "tas" | "kamera" | "nampan" | "buket";
};

function paletteOf(sp: Spec): Record<string, Rgb> {
  const s = hex(sp.skin);
  const hair = ramp4(sp.hair);
  const top = ramp4(sp.top);
  const shirt = hex(sp.shirt ?? "#f6f1e6");
  const gold = hex(sp.accent ?? "#f2c14e");
  const bottom = ramp4(sp.bottom);
  const shoe = ramp4(sp.shoe);
  return {
    s,
    S: mix(s, hex("#a8606a"), 0.5),
    z: mix(s, hex("#6f4f78"), 0.62),
    l: tint(s, 6, 0.72, 1.06),
    E: hex("#2e2228"),
    x: hex("#fff8f0"),
    r: hex("#6a4a44"),
    c: mix(s, hex("#e8707c"), 0.4),
    h: hair.base,
    H: hair.lo,
    d: hair.deep,
    i: hair.hi,
    a: top.base,
    A: top.lo,
    D: top.deep,
    e: top.hi,
    w: shirt,
    W: mix(shirt, hex("#6f6a9c"), 0.46),
    L: mix(hair.base, DEEP_SHADE, 0.72),
    g: gold,
    G: tint(gold, -14, 1.2, 0.68),
    p: bottom.base,
    P: bottom.lo,
    Q: bottom.deep,
    q: bottom.hi,
    n: shoe.base,
    N: shoe.lo,
    v: shoe.hi,
    k: hex("#2b2a38"),
    K: hex("#4c4a64"),
    y: hex("#f4c95a"),
    Y: hex("#a8702e"),
    R: hex("#ef8098"),
    T: hex("#c95676"),
  };
}
// Bahan satu keluarga memakai warna garis yang sama. Garis luar gelap, sedikit berwarna mengikuti bahan di sebelahnya.
const OUTLINE_OF: Record<string, string> = { s: "z", S: "z", z: "z", l: "z", c: "z", E: "z", x: "z", r: "z", h: "d", H: "d", d: "d", i: "d", L: "d", a: "D", A: "D", D: "D", e: "D", w: "W", W: "W", g: "G", G: "G", y: "Y", Y: "Y", k: "k", K: "k", R: "T", T: "T", p: "Q", P: "Q", Q: "Q", q: "Q", n: "N", N: "N", v: "N" };

function compose(layers: (Art | null)[], sp: Spec) {
  const pal = paletteOf(sp);
  const grid: string[][] = Array.from({ length: CELL.h }, () => Array(CELL.w).fill("."));
  for (const a of layers) {
    if (!a) continue;
    a.rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const ch = row[i];
        if (ch === ".") continue;
        const x = a.x + i;
        const y = a.y + j;
        if (x >= 0 && y >= 0 && x < CELL.w && y < CELL.h) grid[y][x] = ch;
      }
    });
  }
  // Anak: beberapa baris badan dan kaki dibuang, kepala tetap besar.
  if (sp.short) {
    for (const row of [31, 30, 25, 24]) grid.splice(row, 1);
    while (grid.length < CELL.h) grid.unshift(Array(CELL.w).fill("."));
  }
  const motifAt = (x: number, y: number, ch: string) => (sp.motif === "top" ? "aAe" : sp.motif === "bottom" ? "pPq" : "").includes(ch) && y % 2 === 0 && (x + y / 2) % 3 === 0;
  const cv = new Canvas(CELL.w, CELL.h);
  for (let y = 0; y < CELL.h; y++) {
    for (let x = 0; x < CELL.w; x++) {
      const ch = grid[y][x];
      if (ch === ".") continue;
      if (motifAt(x, y, ch)) {
        cv.set(x, y, pal.G);
        continue;
      }
      if (ch !== "O") {
        cv.set(x, y, pal[ch] ?? [255, 0, 255]);
        continue;
      }
      const near = [grid[y + 1]?.[x], grid[y]?.[x + 1], grid[y]?.[x - 1], grid[y - 1]?.[x]].find((n) => n && OUTLINE_OF[n]);
      cv.set(x, y, near ? mix(pal[OUTLINE_OF[near]], INK, "hHdiLszSlcEx".includes(near) ? 0.5 : 0.66) : INK);
    }
  }
  return cv;
}
const shifted = (a: Art, dx: number, dy: number): Art => ({ x: a.x + dx, y: a.y + dy, rows: a.rows });

// Gaya chibi: kepala besar berambut tebal, badan kecil, 4 arah (bawah, samping, atas), dalam kisi 28 x 37.
// Rambut bergerigi dengan helai gelap di dalamnya, mata gelap kecil berkilap, pipi merona, tanpa mulut.
const FACE_DOWN = art(6, 9,
  ".OSSSSSSSSSSSSO.",
  "OSSSSSSSSSSSSSSO",
  "OssSssSsssSssSSO",
  "OssEEEsssssEEEsO",
  "OssxEEsssssxEEsO",
  "OssEErsssssEErSO",
  "OcccsssssssssccO",
  ".OccssssssssccO.",
  "..OOsssssSSsOO..",
  "....OOOOOOOO....",
);
const FACE_DOWN_W = art(6, 9,
  ".OSSSSSSSSSSSSO.",
  "OSSSSSSSSSSSSSSO",
  "OssSssSsssSssSSO",
  "OsEEEEsssssEEEEO",
  "OssxEEsssssxEEsO",
  "OssEErsssssEErSO",
  "OcccsssssssssccO",
  ".OccssssssssccO.",
  "...OOssssSsOO...",
  ".....OOOOOO.....",
);
const FACE_SIDE = art(7, 9,
  "..OSSSSSSSSSO.",
  ".OSSSSSSSSSSSO",
  ".OSSsssSsssSSO",
  ".OSsssssEEEssO",
  ".OSsssssxEEssO",
  ".OSsssssEErssO",
  ".OSsssscccccsO",
  "..OSsssssccsO.",
  "...OOssssssO..",
  ".....OOOOOO...",
);
const HAIR_PRIA = {
  down: art(3, 0,
    "..........OO.O........",
    ".......O.OhhOiO.O.....",
    "......OhOhhiihhOhO....",
    ".....OhhhihhiihhhhO...",
    "....OHhhhihhhihhhhHO..",
    "...OHhhhhhhhihhhhhhHO.",
    "...OHhhLhhhhhhhhLhhHO.",
    "..OHHhLhhhLhhLhhhLhHHO",
    "..OHHLhhLhhhhLhhhhLHHO",
    "..OHhLhLhhLhhhLhhLhLHO",
    "..OHLO.LhL.LhL.LhL.OHO",
    "..OHO...L...L...L..OHO",
    ".OHHO..............OHHO",
    ".OHHO..............OHHO",
    "..OHO..............OHO",
    "..OHHO............OHHO",
    "...OO..............OO",
  ),
  side: art(3, 0,
    "...........OO.O.......",
    "........O.OhhOiO.O....",
    ".......OhOhhiihhOhO...",
    "......OhhhihhiihhhhO..",
    ".....OHhhhihhhihhhhHO.",
    "....OHhhhhhhhihhhhhhO.",
    "...OHHhhLhhhhhhhLhhhHO",
    "...OHHhLhhhLhhLhhhLhhO",
    "..OHHHLhhLhhhhLhhhhLhO",
    "..OHHHLhLhhLhhhLhLhOLO",
    "..OHHHHhLhLhhOLhL.L.O.",
    "..OHHHHHhLO....L......",
    "..OHHHHHHO............",
    "..OHHHHHHO............",
    "..OHHHHHO.............",
    "...OdHHHO.............",
    "....OdHO..............",
    ".....OO...............",
  ),
  up: art(3, 0,
    "..........OO.O........",
    ".......O.OhhOiO.O.....",
    "......OhOhhiihhOhO....",
    ".....OhhhihhiihhhhO...",
    "....OHhhhihhhihhhhHO..",
    "...OHhhhhhhhihhhhhhHO.",
    "...OHhhhhhhhhhhhhhhHO.",
    "..OHHhhHhhhhhhhHhhhHHO",
    "..OHHhhHhhhHhhhHhhhHHO",
    "..OHHhhhHhhHhhHhhhhHHO",
    "..OHHhhhHhhHhhHhhhHHHO",
    "..OHHHhhhhHhhhHhhhHHHO",
    ".OHHHHhhhhHhhHhhhHHHHHO",
    ".OHHHHHhhhhHhhhhHHHHHO",
    "..OHHHHHhhhhhhhHHHHHO",
    "..OdHHHHHHHHHHHHHHHdO",
    "...OdHOdHHdHHOdHHOdO",
    "....OO.OOOOOOOO.OO",
  ),
};
const HAIR_WANITA = {
  down: art(3, 0,
    "........OOOOOO........",
    "......OOhhiihhOO......",
    ".....OhhhihhiihhO.....",
    "....OhhhihhhihhhhO....",
    "...OHhhhhhhihhhhHO....",
    "...OHhhhhhhhhhhhhHO...",
    "..OHhhhhLhhhhhhhhhHO..",
    "..OHhhhLhhhhLhhhhhHO..",
    "..OHhhLhhLhhhLhhhhHHO.",
    "..OHhLhLhhLhhhLLhhHHO.",
    ".OHHLO.LhL..LhhL.OLHHO",
    ".OHHO...L....LL...OHHO",
    ".OHHO.............OHHO",
    ".OiHO.............OHiO",
    ".OiHO.............OHiO",
    ".OhHO.............OHhO",
    ".OhHO.............OHhO",
    ".OHHO.............OHHO",
    ".OHHO.............OHHO",
    ".OHHO.............OHHO",
    ".OHiO.............OiHO",
    ".OHiO.............OiHO",
    ".OHhO.............OhHO",
    "..OHO.............OHO.",
    "..OHO.............OHO.",
    "...O...............O..",
  ),
  side: art(3, 0,
    "..........OOOOOO......",
    "........OOhhiihhOO....",
    ".......OhhhihhiihhO...",
    "......OhhhihhhihhhhO..",
    ".....OHhhhhhhihhhhHO..",
    "....OHhhhhhhhhhhhhhHO.",
    "...OHHhhhLhhhhhhLhhhO.",
    "...OHHhhLhhhLhhhhLhhO.",
    "..OHHHhLhhLhhhLhhhLhO.",
    "..OHHHLhLhhLhhhLhLOLO.",
    "..OHHHHhLhLhhOLhL.LO..",
    "..OHHHHHhLO....L......",
    "..OHHHHHHO............",
    "..OHiHHHHO............",
    "..OHiHHHHO............",
    "..OHhHHHHO............",
    "..OHhHHHHO............",
    "..OHHHHHHO............",
    "..OHHHHHHO............",
    "..OHHHiHHO............",
    "..OHHHiHO.............",
    "..OHHHhHO.............",
    "..OdHHHHO.............",
    "...OdHHO..............",
    "...OdHHO..............",
    "....OOO...............",
  ),
  up: art(3, 0,
    "........OOOOOO........",
    "......OOhhiihhOO......",
    ".....OhhhihhiihhO.....",
    "....OhhhihhhihhhhO....",
    "...OHhhhhhhihhhhHO....",
    "...OHhhhhhhhhhhhhHO...",
    "..OHHhhhhhhhhhhhhhHO..",
    "..OHHhHhhhhhhhHhhhHO..",
    "..OHHhHhhhHhhhHhhhHHO.",
    "..OHHhHhhhHhhhHhhhHHO.",
    ".OHHHhhHhhHhhHhhhhHHHO",
    ".OHHHhhHhhHhhHhhhhHHHO",
    ".OHHHhhHhhHhhHhhhhHHHO",
    ".OHHHhhHhihhhHhiihHHHO",
    ".OHHHhhHhihhhHhiihHHHO",
    ".OHHHhhHhhHhhHhhhhHHHO",
    ".OHHHhhHhhHhhHhhhhHHHO",
    ".OHHHHhhHhHhHhhhhHHHHO",
    ".OHHHHhhHhHhHhhhhHHHHO",
    ".OHHHHhhHhHhHhhhHHHHHO",
    ".OHHHHHhHhHhHhhhHHHHHO",
    ".OHHHHHhHhHhHhhhHHHHHO",
    "..OHHHHHHHHHHHHHHHHHO.",
    "..OdHHHHHHHHHHHHHHHdO.",
    "...OdHOdHHdHHOdHHOdO..",
    "....OO.OOOOOOOO.OO....",
  ),
};
const CLIP = art(19, 4, ".x.", "xgx", ".x.");

// Jas pria: kerah V, kemeja, dasi gelap, bunga kecil di dada.
const JAS = {
  down: art(7, 19,
    "..OOOwWwwWOOO.",
    ".OaaeWwDwWeaaO",
    ".OAaaeWDWeaaaO",
    ".OAaaaeDexgaaO",
    ".OAaaaaDaaaaaO",
    ".OAaaagDaaaaaO",
    ".OAAaaaDaaaaaO",
    ".OAAaagDaaaaaO",
    ".OOOOOOOOOOOOO",
  ),
  side: art(8, 19,
    "...OOOwwOOO.",
    "..OAaaeWwaO.",
    "..OAaaeWDaO.",
    "..OAaaaeDaO.",
    "..OAaaaaeaO.",
    "..OAaaaaaaO.",
    "..OAaaaagaO.",
    "..OAAaaaaaO.",
    "..OOOOOOOOO.",
  ),
  up: art(7, 19,
    "..OOOOOOOOOOO.",
    ".OaaaaaaaaaaaO",
    ".OAaaaaaaaaaaO",
    ".OAaaaaaaaaaaO",
    ".OAaaaaaaaaaaO",
    ".OAaaaaDaaaaaO",
    ".OAAaaaDaaaaaO",
    ".OAAaaDaDaaaaO",
    ".OOOOOOOOOOOOO",
  ),
};
const ARM_PRIA = {
  left: art(5, 20, ".OO.", "OAaO", "OAaO", "OAaO", "OAaO", "OAaO", "OSsO", ".OO."),
  right: art(19, 20, ".OO.", "OaeO", "OaeO", "OaaO", "OaaO", "OaaO", "OssO", ".OO."),
  side: [
    art(12, 20, ".OO.", "OAeO", "OAeO", "OAaO", "OAaO", "OAaO", "OSsO", ".OO."),
    art(13, 20, ".OO..", "OAeO.", "OAeO.", ".OAaO", ".OAaO", ".OAaO", ".OSsO", "..OO."),
    art(10, 20, "..OO.", ".OAeO", ".OAeO", "OAaO.", "OAaO.", "OAaO.", "OSsO.", ".OO.."),
  ],
};
const LEG_PRIA = {
  down: [
    art(9, 28, "OPpqOPpqO.", "OPpqOPpqO.", "OPpqOPpqO.", "OPpqOPpqO.", "ONnnOONnnO", "ONnvOONnvO", ".OOO..OOO."),
    art(9, 28, "OPpqOPpqO.", "OPpqOPpqO.", "OPpO.OPqO.", "ONnO.OPqO.", ".OOO.ONnnO", ".....ONnvO", "......OOO."),
    art(9, 28, "OPpqOPpqO.", "OPpqOPpqO.", "OPqO.OPpO.", "OPqO.ONnO.", "ONnnO.OOO.", "ONnvO.....", ".OOO......"),
  ],
  side: [
    art(11, 28, "OPppqO..", "OPppqO..", "OPppqO..", "OPpqO...", "ONnnvOO.", "ONnnnnvO", ".OOOOOO."),
    art(9, 28, "..OPppqO..", "..OPppqO..", ".OPpOPpqO.", ".OPO.OPqO.", "ONnO.ONnvO", ".OO..ONnnvO", ".....OOOO."),
    art(9, 28, "..OPppqO..", "..OPppqO..", ".OPpOPpqO.", ".OPO.OPqO.", ".ONnO.ONnO", ".OOO..OOOO", ".........."),
  ],
};

// Wanita: blazer pas badan, rok panjang melebar, sepatu mengintip.
const BLAZER = {
  down: art(8, 19,
    "..OOOSsSOOO.",
    ".OaeSssSeaO.",
    ".OAaeSSseaO.",
    ".OAaaeWweaO.",
    "..OAaeWeaO..",
    "..OAaaeaaO..",
    "..OAagDaaO..",
    ".OAAaaDaaaO.",
    ".OOOOOOOOOO.",
  ),
  side: art(9, 19,
    "..OOOSwO..",
    ".OAaaeSwO.",
    ".OAaaeWwO.",
    ".OAaaaeWO.",
    "..OAaaaeO.",
    "..OAaaaaO.",
    "..OAaaagO.",
    ".OAAaaaaO.",
    ".OOOOOOOO.",
  ),
  up: art(8, 19,
    "..OOOOOOOOO.",
    ".OaaaaaaaaO.",
    ".OAaaaaaaaO.",
    ".OAaaaDaaaO.",
    "..OAaaDaaO..",
    "..OAaaDaaO..",
    "..OAaaDaaO..",
    ".OAAaaDaaaO.",
    ".OOOOOOOOOO.",
  ),
};
const ARM_WANITA = {
  left: art(6, 20, ".O.", "OaO", "OaO", "OAO", "OAO", "OAO", "OSO", ".O."),
  right: art(19, 20, ".O.", "OeO", "OeO", "OaO", "OaO", "OaO", "OsO", ".O."),
  side: [
    art(12, 20, ".O.", "OeO", "OeO", "OaO", "OaO", "OaO", "OsO", ".O."),
    art(13, 20, ".O..", "OeO.", "OeO.", ".OaO", ".OaO", ".OaO", ".OsO", "..O."),
    art(11, 20, "..O.", ".OeO", ".OeO", "OaO.", "OaO.", "OaO.", "OsO.", ".O.."),
  ],
};
const SKIRT = {
  down: art(7, 28,
    "...OPPpqqO....",
    "..OPPPpqqqO...",
    "..OPPPpqqqO...",
    ".OPPPPpqqqqO..",
    ".OPPPPpqqqqO..",
    "OPPPPPpqqqqqO.",
    "OQPPPPPpqqqqO.",
    ".OOOOOOOOOOO..",
  ),
  side: art(8, 28,
    "..OPPpqqO...",
    "..OPPpqqqO..",
    "..OPPpqqqO..",
    ".OPPPpqqqO..",
    ".OPPPpqqqqO.",
    ".OPPPpqqqqO.",
    "OQPPPPpqqqO.",
    ".OOOOOOOOO..",
  ),
};
const TOES = {
  down: [art(9, 35, "OnnO.OnnO", ".OO...OO."), art(9, 35, "OnnO.....", ".OO..OnnO"), art(9, 35, ".....OnnO", "OnnO..OO.")],
  side: [art(13, 35, "OnnvO", ".OOO."), art(16, 35, "OnnvO", ".OOO."), art(10, 35, "OnnvO", ".OOO.")],
};

const recolor = (a: Art, map: Record<string, string>): Art => ({ x: a.x, y: a.y, rows: a.rows.map((r) => [...r].map((ch) => map[ch] ?? ch).join("")) });
const TOP_OF: Record<string, Record<string, string>> = { kemeja: { W: "e", w: "e", D: "A", g: "a" }, beskap: { W: "a", w: "a", e: "a", D: "y", g: "y" }, rompi: { g: "y" }, kebaya: { w: "g", W: "G" }, gaun: { e: "a", w: "a", W: "A", D: "a", g: "a" } };
const WHITE_SLEEVE = { a: "w", A: "W", e: "w" };

// Rambut lain untuk tamu. Pria bersisir rapi, anak ikal, kakek botak beruban. Wanita bob, sanggul, dan hijab.
const SISIR = {
  down: art(3, 1,
    ".........OOOOO........",
    "......OOOhhiihOO......",
    ".....OhhhhhiiihhhO....",
    "....OHhhhhhhiihhhhO...",
    "...OHhhhhhhhhhhhhhHO..",
    "...OHhLLhhhhhhhhhhHO..",
    "..OHHLhhLLLhhhhhhhHHO.",
    "..OHHhhhhhhLLhhhhhHHO.",
    "..OHHhLhhhhhhLLhhhHHO.",
    "..OHHO.LLLLLLLLOhOHHO.",
    "..OHO...........O.OHO.",
    "..OHO.............OHO.",
    "..OHO.............OHO.",
    "...OO..............OO.",
  ),
  side: art(3, 1,
    "..........OOOOO.......",
    ".......OOOhhiihOO.....",
    "......OhhhhhiiihhhO...",
    ".....OHhhhhhhiihhhhO..",
    "....OHhhhhhhhhhhhhhHO.",
    "...OHHhhhLLhhhhhhhhhO.",
    "...OHHhhLhhLLLhhhhhhO.",
    "..OHHHhhhhhhhLLhhhhhO.",
    "..OHHHHhhhhhhhhLLhhO..",
    "..OHHHHHhLLLLLLLLOO...",
    "..OHHHHHHO............",
    "..OHHHHHHO............",
    "..OHHHHHO.............",
    "...OdHHHO.............",
    "....OOOO..............",
  ),
  up: art(3, 1,
    ".........OOOOO........",
    "......OOOhhiihOO......",
    ".....OhhhhhiiihhhO....",
    "....OHhhhhhhiihhhhO...",
    "...OHhhhhhhhhhhhhhHO..",
    "...OHhhhhhhhhhhhhhHO..",
    "..OHHhhhHhhhhHhhhhHHO.",
    "..OHHhhhHhhhhHhhhhHHO.",
    "..OHHhhhhHhhHhhhhhHHO.",
    "..OHHhhhhHhhHhhhhHHHO.",
    "..OHHHhhhhhhhhhhHHHHO.",
    ".OHHHHHhhhhhhhhHHHHHHO",
    "..OHHHHHHhhhHHHHHHHO..",
    "..OdHHHHHHHHHHHHHHdO..",
    "...OOdHHOdHHOdHHOOO...",
    ".....OOOOOOOOOOOO.....",
  ),
};
const IKAL_TOP = ["....O..OO..OO.O.......", "...OhOOhiOOhiOhO......", "...OhiihhiihhiihhO....", "...OHhiihhiihhiihhO..."];
const withTop = (a: Art, top: string[]): Art => ({ x: a.x, y: a.y - 1, rows: [...top, ...a.rows.slice(3)] });
const IKAL = { down: withTop(SISIR.down, IKAL_TOP), side: withTop(SISIR.side, IKAL_TOP), up: withTop(SISIR.up, IKAL_TOP) };
const BOTAK = {
  down: art(3, 2,
    ".........OOOOO........",
    ".......OOsllssOO......",
    "......OSsslllssSO.....",
    ".....OSsssllsssssO....",
    "....OSsssssssssssSO...",
    "....OSsssssssssssSO...",
    "....OSsssssssssssSO...",
    "...OHSSSSSSSSSSSSSHO..",
    "..OHHO.............OHHO",
    "..OiHO.............OHiO",
    "..OiHO.............OHiO",
    "..OHHO.............OHHO",
    "...OO...............OO.",
  ),
  side: art(3, 2,
    "..........OOOOO.......",
    "........OOsllssOO.....",
    ".......OSsslllssSO....",
    "......OSsssllsssssO...",
    ".....OSsssssssssssSO..",
    "....OSssssssssssssSO..",
    "...OHSsssssssssssssO..",
    "...OHHSSSSSSSSSSSSSO..",
    "..OHHHHHO.............",
    "..OiHHHHO.............",
    "..OiHHHO..............",
    "..OHHHO...............",
    "...OOO................",
  ),
  up: art(3, 2,
    ".........OOOOO........",
    ".......OOsllssOO......",
    "......OSsslllssSO.....",
    ".....OSsssllsssssO....",
    "....OSsssssssssssSO...",
    "...OSSsssssssssssSSO..",
    "...OHSSsssssssssSSHO..",
    "..OHHHSSSSSSSSSSSHHHO.",
    "..OHHHHhhhhhhhhhHHHHO.",
    "..OiHHHhhhiihhhhHHHiO.",
    "..OHHHHhhhhhhhhHHHHHO.",
    "...OHHHHHHHHHHHHHHHO..",
    "....OOdHHOdHHOdHHOO...",
    "......OOOOOOOOOOO.....",
  ),
};
const cut = (a: Art, n: number, ...close: string[]): Art => ({ x: a.x, y: a.y, rows: [...a.rows.slice(0, n), ...close] });
const BOB = {
  down: cut(HAIR_WANITA.down, 17, ".OdHO.............OdHO", "..OO...............OO."),
  side: cut(HAIR_WANITA.side, 17, "..OdHHHHHO............", "...OOOOOO............."),
  up: cut(HAIR_WANITA.up, 17, ".OdHHHHHHHHHHHHHHHHHdO", "..OOOOOOOOOOOOOOOOOOO."),
};
const LONG_UP = cut(HAIR_WANITA.up, 19, "..OHHHHhHhhHhHhhHHHHO.", "..OdHHHHHHiHHHiHHHHdO.", "...OdHOdHHdHHOdHHOdO..", "....OO.OOOOOOOO.OO....");
const BUN = art(16, 0, "..OOOO.", ".OhiihO", ".OhhhHO", "..OOOO.");
const SANGGUL = {
  down: cut(HAIR_WANITA.down, 13, "..OHO..............OHO", "...O................O."),
  side: cut(HAIR_WANITA.side, 14, "...OdHHHO.............", "....OOOO.............."),
  up: cut(HAIR_WANITA.up, 15, "..OdHHHHHHHHHHHHHHHdO.", "...OOdHHOdHHOdHHOOO...", ".....OOOOOOOOOOOO....."),
};
const HIJAB = {
  down: art(3, 0,
    "........OOOOOO........",
    "......OOhhiihhOO......",
    ".....OhhhiiiihhhO.....",
    "....OhhhiiiiiihhhO....",
    "...OHhhhhiiiihhhhHO...",
    "...OHhhhhhhhhhhhhHO...",
    "..OHhhhhhhhhhhhhhhHO..",
    "..OHhhhhhhhhhhhhhhHO..",
    "..OHhhLLLLLLLLLLhhHHO.",
    "..OHhL..........LhHHO.",
    ".OHHL............LHHHO",
    ".OHHL............LHHHO",
    ".OHHL............LHHHO",
    ".OHHL............LHHHO",
    ".OHHL............LHHHO",
    ".OHHHL..........LhHHHO",
    ".OHHHHL........LhhHHHO",
    ".OHHHHHLLLLLLLLhhhHHHO",
    ".OHHHHhhhhhhhhhhhHHHHO",
    ".OHHHHhhhhiihhhhhHHHHO",
    ".OHHHHhhhhiihhhhHHHHHO",
    "..OHHHHhhhhhhhhHHHHHO.",
    "...OOHHHhhhhhHHHHOO...",
    ".....OOOOOOOOOOOO.....",
  ),
  side: art(3, 0,
    "..........OOOOOO......",
    "........OOhhiihhOO....",
    ".......OhhhiiiihhhO...",
    "......OhhhiiiiiihhhO..",
    ".....OHhhhhiiiihhhhHO.",
    "....OHhhhhhhhhhhhhhHO.",
    "...OHHhhhhhhhhhhhhhhO.",
    "...OHHhhhhhhhhhhhhhhO.",
    "..OHHHhLLLLLLLLLLLLhO.",
    "..OHHHL............LO.",
    "..OHHL............L...",
    "..OHHL............L...",
    "..OHHL............L...",
    "..OHHL............L...",
    "..OHHL............L...",
    "..OHHHL..........L....",
    "..OHHHHL........LO....",
    "..OHHHHHLLLLLLLLhO....",
    "..OHHHHhhhhhhhhhhhO...",
    "..OHHHHhhhiihhhhhhO...",
    "...OHHHhhhiihhhhhO....",
    "...OHHHHhhhhhhhHO.....",
    "....OOHHHhhhhHOO......",
    "......OOOOOOOO........",
  ),
  up: art(3, 0,
    "........OOOOOO........",
    "......OOhhiihhOO......",
    ".....OhhhiiiihhhO.....",
    "....OhhhiiiiiihhhO....",
    "...OHhhhhiiiihhhhHO...",
    "...OHhhhhhhhhhhhhHO...",
    "..OHHhhhhhhhhhhhhhHO..",
    "..OHHhhhhhhhhhhhhhHO..",
    "..OHHhhhhhHhhhhhhhHHO.",
    "..OHHhhhhhHhhhhhhhHHO.",
    ".OHHHhhhhhHhhhhhhhHHHO",
    ".OHHHhhhhhHhhhhhhhHHHO",
    ".OHHHhhhhhHhhhhhhhHHHO",
    ".OHHHhhhhhHhhhhhhhHHHO",
    ".OHHHhhhhhHhhhhhhhHHHO",
    ".OHHHHhhhhHhhhhhhHHHHO",
    ".OHHHHhhhhHhhhhhhHHHHO",
    ".OHHHHhhhhHhhhhhhHHHHO",
    ".OHHHHhhhhHhhhhhHHHHHO",
    ".OHHHHhhhhHhhiihHHHHHO",
    ".OHHHHHhhhHhhiihHHHHHO",
    "..OHHHHhhhhhhhhHHHHHO.",
    "...OOHHHhhhhhHHHHOO...",
    ".....OOOOOOOOOOOO.....",
  ),
};
const HATS: Record<string, Art> = {
  peci: art(7, 1, "..OOOOOOOOOO..", ".OkKKKKKKKKkO.", ".OkkkkkkkkkkO.", "OkkkkkkkkkkkkO", "OOOOOOOOOOOOOO"),
  blangkon: art(5, 0, "...OOOOOOOOOOOO...", "..OgGgGgGgGgGgGO..", ".OGgYgGYGgYgGYgGO.", ".OgGgGgGgGgGgGgGgO", "OGYgGYGgYgGYgGYgGO", "OkkkkkkkkkkkkkkkkO", "OOOOOOOOOOOOOOOOOO"),
};
const GLASSES = { down: art(8, 11, "kkkkk...kkkkk", "....kkkkk...."), side: art(14, 11, "kkkkkk") };
const MELATI = art(5, 8, "x.x", ".x.", "x.x", ".x.", "x.x");
const PROPS: Record<string, { down: Art[]; side: Art[] }> = {
  tongkat: { down: [art(21, 26, "OOO", "OkO", "OkO"), art(22, 29, "k", "k", "k", "k", "k", "k", "k")], side: [art(17, 26, "OOO", "OkO", "OkO"), art(18, 29, "k", "k", "k", "k", "k", "k", "k")] },
  balon: { down: [art(20, 3, "..OOOO..", ".OxRRRO.", "ORRRRRRO", "ORRRRRRO", "ORRRRTRO", ".ORRTTO.", "..OOOO.."), art(23, 10, "k", "k", "k", "k", "k", "k", "k", "k", "k", "k", "k", "k", "k", "k", "k", "k")], side: [art(20, 3, "..OOOO..", ".OxRRRO.", "ORRRRRRO", "ORRRRRRO", "ORRRRTRO", ".ORRTTO.", "..OOOO.."), art(18, 10, "k", "k", "k", "k", "k", "k", "k", "k", "k", "k", "k", "k", "k", "k", "k", "k")] },
  kipas: { down: [art(0, 23, ".OOOOO.", "OgGgGgO", "OGgGgGO", ".OGgGO.", "..OGO..", "...O...")], side: [art(16, 21, ".OOOOO.", "OgGgGgO", "OGgGgGO", ".OGgGO.", "..OGO..", "...O...")] },
  tas: { down: [art(21, 27, "..OO..", ".O..O.", "OggggO", "OgGGgO", "OOOOOO")], side: [art(10, 27, "..OO..", ".O..O.", "OggggO", "OgGGgO", "OOOOOO")] },
  kamera: { down: [art(10, 20, "..OO....", "OOOOOOOO", "OkKkkkkO", "OkxKkkkO", "OkkkkkkO", "OOOOOOOO")], side: [art(15, 20, "OOOOOOO", "OkkkKxO", "OkkkKkO", "OkkkkkO", "OOOOOOO")] },
  nampan: { down: [art(20, 19, "..OO...", "..OxO..", "..OWO..", "OOOOOOO", "OyyyyyO", ".OOOOO.")], side: [art(16, 19, "..OO...", "..OxO..", "..OWO..", "OOOOOOO", "OyyyyyO", ".OOOOO.")] },
  buket: { down: [art(9, 21, ".OO.OO.OO.", "OxROxRORxO", "ORxRxRxRxO", ".OxRxRxRO.", "..OhHhHO..", "...OOOO...")], side: [art(15, 21, ".OO.OO.", "OxRORxO", "ORxRxRO", ".OhHhO.", "..OOO..")] },
};

function frameLayers(row: 0 | 1 | 2, frame: 0 | 1 | 2, sp: Spec): (Art | null)[] {
  const bob = frame ? 1 : 0;
  const up = (a: Art) => shifted(a, 0, bob);
  const swing = frame === 1 ? 1 : frame === 2 ? -1 : 0;
  const view = row === 0 ? "down" : row === 1 ? "side" : "up";
  const pria = sp.build === "pria";
  const arms = pria ? ARM_PRIA : ARM_WANITA;
  const hairSets: Record<string, { down: Art; side: Art; up: Art }> = { spiky: HAIR_PRIA, panjang: { ...HAIR_WANITA, up: LONG_UP }, sisir: SISIR, ikal: IKAL, botak: BOTAK, bob: BOB, sanggul: SANGGUL, hijab: HIJAB };
  const hairSet = hairSets[sp.hairStyle] ?? HAIR_PRIA;
  const top = recolor((pria ? JAS : BLAZER)[view], TOP_OF[sp.topStyle ?? ""] ?? {});
  const sleeve: Record<string, string> = sp.topStyle === "rompi" ? WHITE_SLEEVE : {};
  const lowKey = row === 1 ? "side" : "down";
  const lower = pria ? [LEG_PRIA[lowKey][frame]] : [TOES[lowKey][frame], up(SKIRT[lowKey])];
  const props = sp.prop ? PROPS[sp.prop][row === 1 ? "side" : "down"].map(up) : [];
  const extras = [
    sp.hairStyle === "sanggul" ? up(BUN) : null,
    sp.clip ? up(CLIP) : null,
    sp.melati ? up(MELATI) : null,
    sp.hat ? up(HATS[sp.hat]) : null,
    sp.glasses && row !== 2 ? up(GLASSES[row === 0 ? "down" : "side"]) : null,
    ...props,
  ];
  const left = recolor(arms.left, sleeve);
  const right = recolor(arms.right, sleeve);
  if (row === 0) return [...lower, up(top), shifted(left, 0, bob + swing), shifted(right, 0, bob - swing), up(pria ? FACE_DOWN : FACE_DOWN_W), up(hairSet.down), ...extras];
  if (row === 1) return [...lower, up(top), up(FACE_SIDE), up(hairSet.side), up(recolor(arms.side[frame], sleeve)), ...extras];
  return [...lower, up(top), shifted(left, 0, bob + swing), shifted(right, 0, bob - swing), up(hairSet.up), ...extras];
}

function outline(c: Canvas) {
  const on = (x: number, y: number) => x >= 0 && y >= 0 && x < c.w && y < c.h && c.data[(y * c.w + x) * 4 + 3] > 0;
  const pts: [number, number][] = [];
  for (let y = 0; y < c.h; y++) for (let x = 0; x < c.w; x++) if (!on(x, y) && (on(x - 1, y) || on(x + 1, y) || on(x, y - 1) || on(x, y + 1))) pts.push([x, y]);
  for (const [x, y] of pts) c.set(x, y, C.line);
}

// Garis luar berwarna gelap mengikuti warna di sebelahnya. Dipakai benda di aula.
function softOutline(c: Canvas) {
  const at = (x: number, y: number): Rgb | null => {
    if (x < 0 || y < 0 || x >= c.w || y >= c.h) return null;
    const i = (y * c.w + x) * 4;
    return c.data[i + 3] ? [c.data[i], c.data[i + 1], c.data[i + 2]] : null;
  };
  const pts: [number, number, Rgb][] = [];
  for (let y = 0; y < c.h; y++) {
    for (let x = 0; x < c.w; x++) {
      if (at(x, y)) continue;
      const near = at(x, y + 1) ?? at(x, y - 1) ?? at(x - 1, y) ?? at(x + 1, y);
      if (near) pts.push([x, y, mix(near, INK, 0.72)]);
    }
  }
  for (const [x, y, col] of pts) c.set(x, y, col);
}

async function drawSheet(file: string, sp: Spec) {
  const c = new Canvas(CELL.w * 3, CELL.h * 3);
  for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) paste(c, compose(frameLayers(row as 0 | 1 | 2, col as 0 | 1 | 2, sp), sp), col * CELL.w, row * CELL.h);
  await c.save(file, 256);
}

const SKIN = { terang: "#f8d4b6", kuning: "#f9d6bc", sawo: "#e6b088", gelap: "#bf8660" };
const SHEETS: Record<string, Spec> = {
  // Karakter pemain: warna jas mengikuti aksen tema, ditukar saat halaman dibuka.
  "guest-male.png": { skin: SKIN.terang, hair: "#4a3638", top: JAS_KEY, bottom: "#3a3550", shoe: "#4a2f2a", build: "pria", hairStyle: "spiky" },
  "guest-female.png": { skin: SKIN.kuning, hair: "#3c3442", top: JAS_KEY, bottom: "#efe0c2", shoe: "#8a5a3a", build: "wanita", hairStyle: "panjang", clip: true },
  // Tamu di aula.
  "npc-pria.png": { skin: SKIN.sawo, hair: "#6a4428", top: "#c9a26a", bottom: "#5a4a3c", shoe: "#3b2a2a", build: "pria", hairStyle: "spiky" },
  "npc-pria-hijau.png": { skin: SKIN.gelap, hair: "#2c2428", top: "#3f8f58", accent: "#e8d27a", bottom: "#34303c", shoe: "#2c2428", build: "pria", hairStyle: "sisir", topStyle: "kemeja", motif: "top", hat: "peci" },
  "npc-bapak.png": { skin: SKIN.sawo, hair: "#6a6670", top: "#34507f", bottom: "#2c3048", shoe: "#2c2428", build: "pria", hairStyle: "sisir", glasses: true },
  "npc-kakek.png": { skin: SKIN.terang, hair: "#e4e0d8", top: "#8c3448", accent: "#f0cc72", bottom: "#4f4048", shoe: "#3b2a2a", build: "pria", hairStyle: "botak", topStyle: "kemeja", motif: "top", glasses: true, prop: "tongkat" },
  "npc-anak.png": { skin: SKIN.sawo, hair: "#4a2c24", top: "#f0a040", bottom: "#3f6fa8", shoe: "#c23a48", build: "pria", hairStyle: "ikal", topStyle: "kemeja", short: true, prop: "balon" },
  "npc-wanita.png": { skin: SKIN.kuning, hair: "#6a3a2c", top: "#6f9fd8", bottom: "#6f9fd8", shoe: "#c98f2f", build: "wanita", hairStyle: "bob", topStyle: "gaun", prop: "tas" },
  "npc-gadis.png": { skin: SKIN.sawo, hair: "#ee9cb2", top: "#f0e2c0", bottom: "#f0e2c0", shoe: "#8a5a3a", build: "wanita", hairStyle: "hijab", topStyle: "gaun" },
  "npc-ibu.png": { skin: SKIN.terang, hair: "#9c98a8", top: "#9c70c8", accent: "#f2c14e", bottom: "#6a3058", shoe: "#3b2a2a", build: "wanita", hairStyle: "sanggul", topStyle: "kebaya", motif: "bottom", glasses: true, prop: "kipas" },
  "npc-kebaya.png": { skin: SKIN.gelap, hair: "#2c2228", top: "#e8707c", accent: "#f7cf5a", bottom: "#7c4a30", shoe: "#3b2a2a", build: "wanita", hairStyle: "sanggul", topStyle: "kebaya", motif: "bottom", melati: true },
  "npc-foto.png": { skin: SKIN.sawo, hair: "#5c3c26", top: "#8a7048", shirt: "#f0e8d6", accent: "#c23a48", bottom: "#3a3a44", shoe: "#3b2a2a", build: "pria", hairStyle: "spiky", topStyle: "rompi", prop: "kamera" },
  "npc-pelayan.png": { skin: SKIN.terang, hair: "#2c2228", top: "#2f2d3c", accent: "#c23a48", bottom: "#2f2d3c", shoe: "#1f1e28", build: "pria", hairStyle: "sisir", topStyle: "rompi", prop: "nampan" },
};

// Pengantin berdiri berdampingan menghadap tamu: beskap dan blangkon, kebaya putih, sanggul, dan buket.
async function drawCouple() {
  const c = new Canvas(50, CELL.h);
  const groom: Spec = { skin: SKIN.terang, hair: "#2c2228", top: "#2f2a3a", accent: "#c9973a", bottom: "#6a4630", shoe: "#2c2228", build: "pria", hairStyle: "sisir", topStyle: "beskap", motif: "bottom", hat: "blangkon" };
  const bride: Spec = { skin: SKIN.kuning, hair: "#2c2228", top: "#f7efdc", accent: "#d9a53a", bottom: "#7a4a30", shoe: "#d9a53a", build: "wanita", hairStyle: "sanggul", topStyle: "kebaya", motif: "bottom", melati: true, prop: "buket" };
  paste(c, compose(frameLayers(0, 0, groom), groom), 0, 0);
  paste(c, compose(frameLayers(0, 0, bride), bride), 22, 0);
  await c.save("couple-sprite.png", 256);
}

// Cahaya: satu gambar transparan di atas semua isi peta. Tiap sumber ditumpuk, lalu kekuatannya dibagi beberapa tingkat
// supaya tetap terbaca sebagai pixel art.
type Light = (x: number, y: number) => [Rgb, number] | null;
async function saveLight(file: string, w: number, h: number, lights: Light[], inside: (x: number, y: number) => boolean = () => true) {
  const LEVELS = 14;
  const buf = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!inside(x, y)) continue;
      let a = 0;
      let col: Rgb = [0, 0, 0];
      for (const light of lights) {
        const hit = light(x, y);
        if (!hit || hit[1] <= 0) continue;
        const na = 1 - (1 - a) * (1 - hit[1]);
        col = mix(col, hit[0], hit[1] / na);
        a = na;
      }
      const q = Math.round(a * LEVELS * 3) / (LEVELS * 3);
      buf.set([Math.round(col[0]), Math.round(col[1]), Math.round(col[2]), Math.round(q * 255)], (y * w + x) * 4);
    }
  }
  await sharp(buf, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 9, palette: true, colours: 64, dither: 0 }).toFile(OUT + file);
}
const glow = (cx: number, cy: number, rx: number, ry: number, col: Rgb, peak: number): Light => (x, y) => {
  const d = Math.hypot((x - cx) / rx, (y - cy) / ry);
  return d < 1 ? [col, peak * (1 - d) ** 1.6] : null;
};

async function drawLights() {
  // Sinar matahari: arahnya mengikuti bayangan ke jam 11, turun dari kanan atas ke kiri bawah.
  const TW = Math.round(1672 / TOWN.art);
  const TH = Math.round(941 / TOWN.art);
  const SUNNY = hex("#fff0b8");
  const ux = -0.79;
  const uy = 0.61;
  const rays: [number, number, number][] = [[90, 34, 0.26], [170, 16, 0.17], [262, 46, 0.3], [352, 22, 0.19], [430, 58, 0.28], [530, 18, 0.17], [610, 40, 0.23]];
  const sun: Light = (x, y) => {
    const along = x * ux + y * uy + TW * 0.79;
    const across = x * 0.61 + y * 0.79;
    const fade = Math.max(0, 1 - along / (TW * 1.05));
    let a = 0;
    for (const [at, half, peak] of rays) {
      const d = Math.abs(across - at) / half;
      if (d < 1) a = Math.max(a, peak * (d < 0.6 ? 1 : (1 - d) / 0.4));
    }
    return a ? [SUNNY, a * fade] : null;
  };
  const dusk: Light = (x, y) => {
    const d = Math.hypot(x / TW, (TH - y) / TH);
    return d < 0.8 ? [hex("#2b2440"), 0.16 * (1 - d / 0.8)] : null;
  };
  await saveLight("town-light.png", TW, TH, [dusk, glow(TW, 0, TW * 0.7, TH * 0.8, hex("#ffe3a0"), 0.3), sun]);

  // Aula: cahaya dari jendela turun ke lantai, sorot hangat ke pelaminan, dan genangan cahaya lampu.
  const HW = Math.round(H.w / HALL_ART);
  const HH = Math.round(H.h / HALL_ART);
  const base = new Iso(new Canvas(1, 1), H.x0, H.y0, HALL_ART);
  const { L, S, stageL: SL, stageZ: SZ } = H;
  const BAY = L / 8;
  const WINDOWS = [0, 2, 5, 7];
  const shaft: Light = (x, y) => {
    const X = x * HALL_ART - H.x0;
    const Y = y * HALL_ART - H.y0;
    const t = (Y + X / 2 + S + 140) / 268;
    if (t < 0 || t > 1) return null;
    const l = X - (-S + 128 * t);
    const bay = Math.floor(l / BAY);
    if (!WINDOWS.includes(bay) || Math.abs(l - (bay + 0.5) * BAY) > BAY / 2 - 20) return null;
    return [hex("#fff2cf"), ((l + 800) % 40 < 4 ? 0.08 : 0.26) * (0.45 + 0.55 * t)];
  };
  const shade: Light = (x, y) => {
    const X = x * HALL_ART - H.x0;
    const Y = y * HALL_ART - H.y0;
    const l = X / 2 - Y;
    const s = X / 2 + Y;
    const far = Math.max(0, (s + S * 0.2) / (S * 1.2)) * Math.max(0, 1 - l / L);
    return far > 0 ? [hex("#2b2440"), 0.2 * far] : null;
  };
  const warm = hex("#ffcf78");
  const at = (l: number, s: number, z: number) => base.xy(l, s, z);
  const lamps: [number, number, number][] = [];
  for (let i = 1; i < 8; i++) if (i !== 4 && i % 2 === 0) lamps.push([i * BAY, -S + 20, 40]);
  for (const k of [-1, 1]) {
    lamps.push([SL + 20, k * 262, SZ + 36]);
    lamps.push([L - 21, k * 133, SZ + 100]);
    lamps.push([-8, k * 64, 40]);
  }
  const lights: Light[] = [shade, shaft];
  for (const [l, s, z] of lamps) {
    const [gx, gy] = at(l, s, z);
    lights.push(glow(gx, gy, 28, 28, warm, 0.5));
    const [fx, fy] = at(l, s, 0);
    lights.push(glow(fx, fy, 42, 21, warm, 0.24));
  }
  const [px, py] = at(L - 30, 0, SZ + 120);
  lights.push(glow(px, py, 130, 104, hex("#ffd98a"), 0.36));
  const [cx, cy] = at(L - 72, 0, SZ + 40);
  lights.push(glow(cx, cy, 58, 48, hex("#fff0c8"), 0.26));
  // Area gelap di luar dinding tidak ikut kena cahaya, di warna rata tingkat cahayanya terlihat seperti cincin.
  const hall = await sharp(`${OUT}hall.png`).removeAlpha().raw().toBuffer();
  const OUTSIDE = hex("#2a1c1e");
  const inside = (x: number, y: number) => {
    const i = (y * HW + x) * 3;
    return Math.abs(hall[i] - OUTSIDE[0]) + Math.abs(hall[i + 1] - OUTSIDE[1]) + Math.abs(hall[i + 2] - OUTSIDE[2]) > 6;
  };
  await saveLight("hall-light.png", HW, HH, lights, inside);
}

// pnpm isometrik-assets town, hall, booth, chars, atau light hanya menggambar ulang satu bagian itu. Lembar potongan bersama,
// jadi tiap bagian mulai dari kosong.
const only = process.argv[2];
const want = (part: string) => !only || only === part;
if (want("town")) {
  await drawTown();
  sprites.length = 0;
}
if (want("hall")) {
  await drawHall();
  await drawHallProps();
}
if (want("booth")) await Promise.all((Object.keys(TONES) as Kind[]).map((k) => drawBooth(k, TONES[k][0], TONES[k][1])));
if (want("light")) await drawLights();
if (want("chars")) {
  await Promise.all(Object.entries(SHEETS).map(([file, sp]) => drawSheet(file, sp)));
  await drawCouple();
}
