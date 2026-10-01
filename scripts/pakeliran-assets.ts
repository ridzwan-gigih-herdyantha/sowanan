// pnpm pakeliran-assets
// Proses aset tema Pakeliran dari folder sumber (unduhan Canva) menjadi WebP di public/img/danang-kinanthi.
// PNG transparan dipakai apa adanya. JPG berlatar polos dibuang latarnya: latar diambil dari tepi gambar
// lalu disebar ke piksel bertetangga yang warnanya mirip, supaya bagian gelap di dalam objek tidak ikut hilang.
// Ornamen lung-lungan (gelap di atas putih) diubah menjadi mask: gelapnya jadi alpha, warnanya diatur di CSS.
import { existsSync } from "node:fs";
import sharp from "sharp";

const SRC = process.env.PAKELIRAN_SRC ?? "D:/Projects/Work/Assets/sowanan/danang-kinanthi/";
const OUT = new URL("../public/img/danang-kinanthi/", import.meta.url).pathname.replace(/^\/([A-Z]:)/i, "$1");

const items: { name: string; max: number; key: boolean; mask?: boolean }[] = [
  { name: "kamajaya", max: 1400, key: true },
  { name: "kamaratih", max: 1400, key: true },
  { name: "gunungan", max: 1200, key: true },
  { name: "gebyok", max: 1600, key: true },
  { name: "sudut", max: 600, key: true },
  { name: "parang", max: 900, key: false },
  { name: "lung-sudut", max: 900, key: false, mask: true },
  { name: "lung-mahkota", max: 1400, key: false, mask: true },
  { name: "lung-tepi", max: 1400, key: false, mask: true },
];

async function toMask(file: string) {
  const { data, info } = await sharp(file).greyscale().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) out[i * 4 + 3] = Math.round(Math.min(1, Math.max(0, (225 - data[i]) / 150)) * 255);
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

async function removeBackground(file: string) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const n = w * h;

  // Warna latar: median piksel tepi.
  const border: number[][] = [];
  for (let x = 0; x < w; x += 4) border.push([x, 0], [x, h - 1]);
  for (let y = 0; y < h; y += 4) border.push([0, y], [w - 1, y]);
  const ch = (c: number) => border.map(([x, y]) => data[(y * w + x) * 3 + c]).sort((a, b) => a - b)[border.length >> 1];
  const bg = [ch(0), ch(1), ch(2)];

  const dist = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const r = data[i * 3] - bg[0];
    const g = data[i * 3 + 1] - bg[1];
    const b = data[i * 3 + 2] - bg[2];
    dist[i] = Math.sqrt(r * r + g * g + b * b);
  }

  // Latar = tersambung ke tepi dan mirip warna latar, ditambah lubang yang warnanya hampir persis latar.
  const NEAR = 48;
  const HOLE = 20;
  const isBg = new Uint8Array(n);
  const queue = new Int32Array(n);
  let head = 0;
  let tail = 0;
  const push = (i: number) => {
    if (!isBg[i] && dist[i] < NEAR) {
      isBg[i] = 1;
      queue[tail++] = i;
    }
  };
  for (let x = 0; x < w; x++) {
    push(x);
    push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    push(y * w);
    push(y * w + w - 1);
  }
  while (head < tail) {
    const i = queue[head++];
    const x = i % w;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (i >= w) push(i - w);
    if (i < n - w) push(i + w);
  }
  for (let i = 0; i < n; i++) if (dist[i] < HOLE) isBg[i] = 1;

  // Alpha halus di tepi, lalu warna tepi dibersihkan dari sisa latar.
  const out = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    const x = i % w;
    let a = isBg[i] ? 0 : 1;
    if (!isBg[i]) {
      const edge = (x > 0 && isBg[i - 1]) || (x < w - 1 && isBg[i + 1]) || (i >= w && isBg[i - w]) || (i < n - w && isBg[i + w]);
      if (edge) a = Math.min(1, Math.max(0, (dist[i] - HOLE) / 45));
    }
    for (let c = 0; c < 3; c++) {
      const v = data[i * 3 + c];
      out[i * 4 + c] = a > 0 && a < 1 ? Math.min(255, Math.max(0, Math.round((v - (1 - a) * bg[c]) / a))) : v;
    }
    out[i * 4 + 3] = Math.round(a * 255);
  }
  return sharp(out, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

// Ubin batik dicerminkan 2x2 supaya sambungannya mulus saat diulang.
async function mirrorTile(file: string, size: number) {
  const s = Math.round(size);
  const base = await sharp(file).resize(s, s, { fit: "cover" }).toBuffer();
  const [hz, vt, both] = await Promise.all([sharp(base).flop().toBuffer(), sharp(base).flip().toBuffer(), sharp(base).flip().flop().toBuffer()]);
  return sharp({ create: { width: s * 2, height: s * 2, channels: 3, background: "#000" } })
    .composite([
      { input: base, left: 0, top: 0 },
      { input: hz, left: s, top: 0 },
      { input: vt, left: 0, top: s },
      { input: both, left: s, top: s },
    ])
    .png()
    .toBuffer();
}

for (const { name, max, key, mask } of items) {
  const png = `${SRC}${name}.png`;
  const jpg = ["jpg", "jpeg", "webp"].map((e) => `${SRC}${name}.${e}`).find(existsSync);
  let input: Buffer | string;
  if (mask) {
    const src = jpg ?? (existsSync(png) ? png : undefined);
    if (!src) continue;
    input = await toMask(src);
  } else if (name === "parang") {
    const src = existsSync(png) ? png : jpg;
    if (!src) continue;
    input = await mirrorTile(src, max / 2);
  } else if (existsSync(png)) {
    input = png;
  } else if (jpg) {
    input = key ? await removeBackground(jpg) : jpg;
  } else {
    console.log(`- ${name}: tidak ada, dilewati`);
    continue;
  }
  const img = name === "parang" ? sharp(input) : sharp(input).trim();
  const { data, info } = await img
    .resize({ width: max, height: max, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 86, alphaQuality: 92 })
    .toBuffer({ resolveWithObject: true });
  await sharp(data).toFile(`${OUT}${name}.webp`);
  console.log(`ok ${name}: ${info.width}x${info.height}, ${Math.round(data.length / 1024)}KB`);
}
