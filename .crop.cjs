const sharp = require("sharp");
const [SP, n, v, top, h, out] = process.argv.slice(2);
(async () => {
  const meta = await sharp(`${SP}/base/base-${n}-${v}.png`).metadata();
  const H = Math.min(+h, meta.height - +top);
  const a = await sharp(`${SP}/base/base-${n}-${v}.png`).extract({ left: 0, top: +top, width: meta.width, height: H }).toBuffer();
  const b = await sharp(`${SP}/tok/tok-${n}-${v}.png`).extract({ left: 0, top: +top, width: meta.width, height: H }).toBuffer();
  await sharp({ create: { width: meta.width * 2 + 10, height: H, channels: 3, background: "#f00" } }).composite([{ input: a, left: 0, top: 0 }, { input: b, left: meta.width + 10, top: 0 }]).png().toFile(out);
})();
