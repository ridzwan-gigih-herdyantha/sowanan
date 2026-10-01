// pnpm sakinah-assets
// Proses aset ornamen tema Sakinah (unduhan Canva) dari folder sumber menjadi WebP di public/img/fadhil-nayla.
// Ornamen satu warna (gelap di atas putih) diubah menjadi mask: gelapnya jadi alpha, warnanya diatur di CSS.
// Ilustrasi watercolor dibuang latar putihnya: latar dicari dari tepi gambar, lalu di area latar itu
// warna dipisah dari putih supaya sapuan cat yang tipis tetap halus dan kelopak putih di dalam tidak ikut hilang.
import { existsSync } from "node:fs";
import sharp from "sharp";

const SRC = process.env.SAKINAH_SRC ?? "D:/Projects/Work/Assets/sowanan/fadhil-nayla/";
const OUT = new URL("../public/img/fadhil-nayla/", import.meta.url).pathname.replace(/^\/([A-Z]:)/i, "$1");

const items: { name: string; max: number; kind: "mask" | "paint" }[] = [
  { name: "sk-mahkota", max: 1400, kind: "mask" },
  { name: "sk-sudut", max: 900, kind: "mask" },
  { name: "sk-pita", max: 1400, kind: "mask" },
  { name: "sk-bunga", max: 800, kind: "paint" },
];

async function toMask(file: string) {
  const { data, info } = await sharp(file).greyscale().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) out[i * 4 + 3] = Math.round(Math.min(1, Math.max(0, (225 - data[i]) / 150)) * 255);
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

async function unpaint(file: string) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const n = w * h;
  const dist = new Float32Array(n);
  for (let i = 0; i < n; i++) dist[i] = Math.max(255 - data[i * 3], 255 - data[i * 3 + 1], 255 - data[i * 3 + 2]);

  // Latar: tersambung ke tepi dan hampir putih.
  const NEAR = 22;
  const bg = new Uint8Array(n);
  const queue = new Int32Array(n);
  let head = 0;
  let tail = 0;
  const push = (i: number) => {
    if (!bg[i] && dist[i] < NEAR) {
      bg[i] = 1;
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

  const out = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    // Di area latar, alpha sebanding dengan jarak dari putih, lalu warna dikembalikan seolah tanpa kertas putih.
    const a = bg[i] ? Math.min(1, Math.max(0, (dist[i] - 3) / (NEAR - 3))) : 1;
    for (let c = 0; c < 3; c++) {
      const v = data[i * 3 + c];
      out[i * 4 + c] = a > 0 && a < 1 ? Math.min(255, Math.max(0, Math.round(255 - (255 - v) / a))) : v;
    }
    out[i * 4 + 3] = Math.round(a * 255);
  }
  return sharp(out, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

for (const { name, max, kind } of items) {
  const src = ["png", "jpg", "jpeg", "webp"].map((e) => `${SRC}${name}.${e}`).find(existsSync);
  if (!src) {
    console.log(`- ${name}: tidak ada, dilewati`);
    continue;
  }
  const input = kind === "mask" ? await toMask(src) : await unpaint(src);
  const { data, info } = await sharp(input)
    .trim()
    .resize({ width: max, height: max, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 86, alphaQuality: 92 })
    .toBuffer({ resolveWithObject: true });
  await sharp(data).toFile(`${OUT}${name}.webp`);
  console.log(`ok ${name}: ${info.width}x${info.height}, ${Math.round(data.length / 1024)}KB`);
}
