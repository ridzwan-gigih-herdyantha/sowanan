import { useEffect, type RefObject } from "react";

type Rgb = [number, number, number];

// Lembar sprite karakter pemain.
export const SPRITES = { groom: "/img/rafi-kayla/guest-male.png", bride: "/img/rafi-kayla/guest-female.png" };

// Warna jas di gambar, sama dengan JAS_KEY di scripts/isometrik-assets.ts.
const KEY = "#b4553b";
// Selisih warna yang masih dianggap jas, karena kompresi PNG bisa menggeser warna sedikit.
const NEAR = 8;

const hexOf = (c: string): Rgb | null => (/^#[0-9a-f]{6}$/.test(c) ? [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)] : null);
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

// Nada jas: sorot, dasar, bayangan, gelap, dan garis. Rumusnya sama dengan ramp4 di generator.
function rampOf(c: Rgb): Rgb[] {
  const deep = mix(c, [0x23, 0x1f, 0x33], 0.62);
  return [mix(c, [0xff, 0xdc, 0xa8], 0.3), c, mix(c, [0x3b, 0x2f, 0x5c], 0.36), deep, mix(deep, [0x1b, 0x13, 0x20], 0.66)];
}

async function tinted(src: string, accent: Rgb) {
  const img = new Image();
  img.src = src;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0);
  const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = frame;
  const from = rampOf(hexOf(KEY) as Rgb);
  const to = rampOf(accent);
  for (let i = 0; i < data.length; i += 4) {
    if (!data[i + 3]) continue;
    const hit = from.findIndex((c) => Math.abs(data[i] - c[0]) + Math.abs(data[i + 1] - c[1]) + Math.abs(data[i + 2] - c[2]) <= NEAR);
    if (hit >= 0) data.set(to[hit].map(Math.round), i);
  }
  ctx.putImageData(frame, 0, 0);
  return canvas.toDataURL("image/png");
}

// Warna jas karakter pemain mengikuti aksen tema. Hasilnya disimpan di variabel CSS yang dibaca sprite(). Aksen dicek
// berkala supaya ikut berubah saat palet diganti di editor, dan gambar hanya diproses bila warnanya berubah.
export function useHeroTint(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    let alive = true;
    let shown = KEY;
    const apply = async () => {
      const el = root.current;
      if (!el) return;
      const value = getComputedStyle(el).getPropertyValue("--inv-accent").trim().toLowerCase();
      const accent = hexOf(value);
      if (!accent || value === shown) return;
      shown = value;
      for (const who of ["groom", "bride"] as const) {
        const url = await tinted(SPRITES[who], accent);
        if (alive && url) el.style.setProperty(`--gd-sheet-${who}`, `url(${url})`);
      }
    };
    void apply();
    const timer = window.setInterval(() => void apply(), 1500);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [root]);
}
