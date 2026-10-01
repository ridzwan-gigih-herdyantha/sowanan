// node --no-warnings scripts/brand-icons.ts
// Buat favicon.ico, icon.png, dan apple-icon.png di src/app dari logo vektor di src/lib/brand.ts.
import { writeFileSync } from "node:fs";
import sharp from "sharp";
import { iconSvg } from "../src/lib/brand.ts";

const APP = new URL("../src/app/", import.meta.url).pathname.replace(/^\/([A-Z]:)/i, "$1");
const png = (size: number, rounded = true) => sharp(Buffer.from(iconSvg({ size, rounded }))).png().toBuffer();

// ICO berisi beberapa PNG: header 6 byte, 16 byte per entri, lalu data PNG berurutan.
async function ico(sizes: number[]) {
  const images = await Promise.all(sizes.map((s) => png(s)));
  const head = Buffer.alloc(6 + 16 * sizes.length);
  head.writeUInt16LE(0, 0);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(sizes.length, 4);
  let offset = head.length;
  sizes.forEach((s, i) => {
    const e = 6 + 16 * i;
    head.writeUInt8(s >= 256 ? 0 : s, e);
    head.writeUInt8(s >= 256 ? 0 : s, e + 1);
    head.writeUInt16LE(1, e + 4);
    head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(images[i].length, e + 8);
    head.writeUInt32LE(offset, e + 12);
    offset += images[i].length;
  });
  return Buffer.concat([head, ...images]);
}

writeFileSync(`${APP}favicon.ico`, await ico([16, 32, 48]));
writeFileSync(`${APP}icon.png`, await png(512));
// iOS memberi sudut membulat sendiri, jadi ikon Apple dibuat kotak penuh.
writeFileSync(`${APP}apple-icon.png`, await png(180, false));
console.log("ok favicon.ico, icon.png, apple-icon.png");
