// node --no-warnings scripts/prepare-fadhil-nayla.ts
// Potong dan kompres foto contoh tema Sakinah (Pexels, Orhan Pergel) ke public/img/fadhil-nayla/.
// Sesudahnya jalankan pnpm migrate-demo-media fadhil-nayla lalu pnpm seed-invitations fadhil-nayla.
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const SRC = process.env.SAKINAH_SRC ?? "D:/Projects/Work/Assets/sowanan/fadhil-nayla/photos/";
const OUT = new URL("../public/img/fadhil-nayla/", import.meta.url).pathname.replace(/^\/([A-Z]:)/i, "$1");
mkdirSync(OUT, { recursive: true });

// Potongan dalam pecahan lebar dan tinggi foto sumber: [kiri, atas, lebar, tinggi].
type Job = { out: string; id: string; crop?: [number, number, number, number]; width: number; warm?: boolean; format?: "webp" | "jpg"; height?: number };

const jobs: Job[] = [
  { out: "hero", id: "17057189", crop: [0, 0.02, 1, 0.96], width: 1400, warm: true },
  { out: "herowide", id: "17057194", width: 2000 },
  { out: "og", id: "17057194", crop: [0.02, 0.38, 0.96, 0.6], width: 1200, height: 630, format: "jpg" },
  { out: "venue", id: "17057200", crop: [0, 0.08, 1, 0.84], width: 1200 },
  { out: "groom", id: "17057196", crop: [0.56, 0.06, 0.36, 0.8], width: 900 },
  { out: "bride", id: "17057192", crop: [0.12, 0.3, 0.76, 0.66], width: 900 },
  { out: "story-1", id: "17057198", crop: [0, 0.08, 1, 0.8], width: 1000 },
  { out: "story-2", id: "17057203", crop: [0.04, 0, 0.8, 1], width: 1000 },
  { out: "story-3", id: "17057202", crop: [0, 0.14, 1, 0.8], width: 1000 },
  { out: "story-4", id: "17057193", crop: [0.24, 0, 0.45, 1], width: 1000 },
  { out: "gallery-1", id: "17057194", width: 1600 },
  { out: "gallery-2", id: "17057192", width: 1200 },
  { out: "gallery-3", id: "17057190", width: 1200 },
  { out: "gallery-4", id: "17057196", width: 1600 },
  { out: "gallery-5", id: "17057188", width: 1200 },
  { out: "gallery-6", id: "17057199", width: 1200 },
  { out: "gallery-7", id: "17057201", width: 1200 },
];

for (const j of jobs) {
  let img = sharp(`${SRC}${j.id}.jpg`);
  const { width: w = 0, height: h = 0 } = await img.metadata();
  if (j.crop) {
    const [l, t, cw, ch] = j.crop;
    img = img.extract({ left: Math.round(l * w), top: Math.round(t * h), width: Math.round(cw * w), height: Math.round(ch * h) });
  }
  img = img.resize({ width: j.width, height: j.height, fit: "cover", withoutEnlargement: !j.height });
  // Foto hitam putih diberi nada hangat tipis supaya menyatu dengan palet.
  if (j.warm) img = img.tint("#9C7A4E").modulate({ brightness: 1.06 });
  const file = `${OUT}${j.out}.${j.format ?? "webp"}`;
  const info = await (j.format === "jpg" ? img.jpeg({ quality: 82, mozjpeg: true }) : img.webp({ quality: 80 })).toFile(file);
  console.log(`ok ${j.out}: ${info.width}x${info.height}, ${Math.round(info.size / 1024)}KB`);
}
