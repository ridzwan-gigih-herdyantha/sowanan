import { BRIDE_IDLE, BUSH, CHARACTER_COLORS, CLOUD, CLOUD_COLORS, COIN, COIN_COLORS, DIRT_TILE, FLAG, FLAG_COLORS, GRASS_TILE, GROOM_IDLE, GROUND_COLORS, SUN, TREE, TREE_COLORS } from "@/components/invitation/petualang/art";
import { HEART } from "@/components/invitation/petualang/pixel";
import { CX, H, rectPath, seeded, W, type Kit, type ThemeStory } from "../story-kit";

const HEART_COLORS = { o: "#261B33", L: "#E2434B", l: "#B32C3A", W: "#FFFFFF" };
const SUN_COLORS = { Y: "#FFE27A", W: "#FFF8D0", y: "#F2C14E", o: "#F2C14E" };

// Langit bertingkat seperti latar game: warna berganti per pita, bukan gradasi halus.
const skyBands = (k: Kit, top: string, bottom: string, end = H, bands = 9) => {
  const h = end / bands;
  for (let i = 0; i < bands; i += 1) k.rect(0, i * h, W, h + 1, k.mix(top, bottom, i / (bands - 1)));
};

// Gunung berundak: setiap kolom naik atau turun satu blok.
const mountains = (k: Kit, base: number, color: string, peak: string, seed: number, step = 24) => {
  const rand = seeded(seed);
  let h = 200 + rand() * 80;
  let dir = 1;
  for (let x = 0; x < W; x += step) {
    h += dir * step * (0.6 + rand() * 0.8);
    if (h > 470) dir = -1;
    if (h < 150) dir = 1;
    const top = Math.round((base - h) / step) * step;
    k.rect(x, top, step + 1, base - top, color);
    if (h > 380) k.rect(x, top, step + 1, step * 2, peak);
  }
};

const ground = (k: Kit, y: number, scale = 4) => {
  const size = 16 * scale;
  for (let x = 0; x < W; x += size) {
    k.sprite(GRASS_TILE, x, y, scale, GROUND_COLORS);
    for (let j = y + size; j < H; j += size) k.sprite(DIRT_TILE, x, j, scale, GROUND_COLORS);
  }
};

const couple = (k: Kit, x: number, feet: number, scale: number) => {
  k.sprite(GROOM_IDLE, x - 30 * scale, feet - GROOM_IDLE.length * scale, scale, CHARACTER_COLORS);
  k.sprite(BRIDE_IDLE, x + 2 * scale, feet - BRIDE_IDLE.length * scale, scale, CHARACTER_COLORS);
};

// Judul piksel dengan bayangan berlapis, sama dengan logo di layar awal undangan.
const logo = (k: Kit, s: string, y: number, size: number, maxW = 900) => {
  const night = k.c.night;
  const base = { font: "name" as const, weight: 700, spacing: 4, maxW };
  const fit = k.fit(s, { ...base, size });
  const o = { ...base, maxW: undefined };
  k.text(s, CX + fit * 0.075, y + fit * 0.075, { ...o, size: fit, color: night });
  k.text(s, CX + fit * 0.042, y + fit * 0.042, { ...o, size: fit, color: k.c.accent });
  k.text(s, CX, y, { ...o, size: fit, color: "#FFFFFF" });
  return fit;
};

const panel = (k: Kit, x: number, y: number, w: number, h: number, fill: string) => {
  const b = { x, y, w, h };
  k.rect(x + 10, y + 10, w, h, "#00000055");
  k.rect(x, y, w, h, fill);
  k.strokePath(rectPath(b), k.c.night, 8);
};

const start = (k: Kit, y = 1490) => {
  panel(k, 110, y, 860, 130, k.c.night);
  k.text("TEKAN UNTUK MULAI", CX, y + 46, { font: "display", size: 26, spacing: 4, color: k.v("--inv-sun", "#FFE27A"), maxW: 780 });
  k.text(k.d.link, CX, y + 98, { size: 34, color: "#FFFFFF", maxW: 790 });
};

// Co-op Adventure: dunia game piksel dengan langit bertingkat, gunung, ubin rumput, dan karakter pengantin.
export const story: ThemeStory = {
  templates: [
    {
      id: "layar-judul",
      name: "Layar Judul",
      draw: (k) => {
        const sky = k.v("--inv-sky", k.c.accent);
        const horizon = k.v("--inv-horizon", k.c.wash);
        const hill = k.v("--inv-hill", "#3E8A4C");
        skyBands(k, sky, horizon, 1440);
        k.sprite(SUN, 760, 180, 9, SUN_COLORS);
        k.sprite(CLOUD, 90, 240, 7, CLOUD_COLORS);
        k.sprite(CLOUD, 680, 980, 6, CLOUD_COLORS);
        mountains(k, 1460, k.mix(hill, horizon, 0.55), "#FFFFFF", 5);
        mountains(k, 1500, hill, k.mix(hill, "#FFFFFF", 0.2), 9);
        ground(k, 1360);
        k.sprite(TREE, 40, 1360 - TREE.length * 6, 6, TREE_COLORS);
        k.sprite(BUSH, 850, 1360 - BUSH.length * 6, 6, TREE_COLORS);
        k.text("UNDANGAN PERNIKAHAN", CX, 400, { font: "display", size: 34, spacing: 5, color: "#FFFFFF", shadow: { color: k.c.night, x: 3, y: 3 }, maxW: 900 });
        logo(k, k.d.groom, 540, 140);
        k.sprite(HEART, CX - 42, 580, 12, HEART_COLORS);
        logo(k, k.d.bride, 800, 140);
        k.text(k.d.date, CX, 900, { font: "display", size: 38, spacing: 2, color: "#FFFFFF", shadow: { color: k.c.night, x: 3, y: 3 }, maxW: 930 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, 958, { size: 30, color: "#FFFFFF", shadow: { color: k.c.night, x: 2, y: 2 }, maxW: 930 });
        couple(k, CX, 1360, 8);
        start(k);
      },
    },
    {
      id: "kartu-dialog",
      name: "Kartu Dialog",
      draw: (k) => {
        const sky = k.v("--inv-sky", k.c.accent);
        const horizon = k.v("--inv-horizon", k.c.wash);
        skyBands(k, sky, horizon, 1640);
        k.sprite(CLOUD, 70, 160, 5, CLOUD_COLORS);
        k.sprite(SUN, 830, 150, 6, SUN_COLORS);
        mountains(k, 1640, k.mix(k.v("--inv-hill", "#3E8A4C"), horizon, 0.35), "#FFFFFF", 14);
        ground(k, 1640);
        panel(k, 100, 266, 880, 1170, k.c.card);
        k.photo(k.d.photos.hero, { x: 130, y: 296, w: 820, h: 640 }, { pixel: 150, empty: k.c.wash });
        k.strokePath(rectPath({ x: 130, y: 296, w: 820, h: 640 }), k.c.night, 6);
        k.text("PROLOG", 140, 984, { font: "display", size: 28, spacing: 4, color: k.c.accent, align: "left" });
        k.text(`${k.d.groom} & ${k.d.bride}`, 140, 1064, { font: "name", size: 72, weight: 700, spacing: 2, color: k.c.ink, align: "left", maxW: 800 });
        k.para("Dua pemain, satu tim. Petualangan terbesar kami baru akan dimulai.", 140, 1124, { font: "display", size: 34, color: k.c.ink, align: "left", width: 800, lineHeight: 1.32, maxLines: 2 });
        k.line(140, 1240, 940, 1240, k.c.night, 4, 1, [12, 8]);
        k.text(k.d.date, 140, 1296, { font: "display", size: 34, color: k.c.ink, align: "left", maxW: 800 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), 140, 1352, { size: 28, color: k.c.ink, align: "left", alpha: 0.82, maxW: 800 });
        k.link({ fill: k.c.accent, ink: "#FFFFFF", label: "", y: 1462, radius: 0, stroke: k.c.night, h: 88, shadow: { color: "#00000055", x: 8, y: 8 } });
        couple(k, 540, 1640, 3);
      },
    },
    {
      id: "level-final",
      name: "Level Final",
      draw: (k) => {
        const night = k.c.night;
        const dusk = k.mix(night, k.c.accent, 0.5);
        skyBands(k, k.mix(night, "#000000", 0.35), dusk, 1420);
        const rand = seeded(44);
        for (let i = 0; i < 90; i += 1) {
          const s = rand() < 0.2 ? 8 : 4;
          k.rect(Math.round(rand() * 134) * 8, Math.round(rand() * 160) * 8, s, s, "#FFFFFF", 0.35 + rand() * 0.6);
        }
        mountains(k, 1450, k.mix(night, "#000000", 0.2), k.mix(night, "#FFFFFF", 0.12), 21);
        ground(k, 1360);
        const hud = { font: "display" as const, size: 32, color: "#FFFFFF" };
        k.text("LEVEL FINAL", 70, 296, { ...hud, spacing: 3, align: "left" });
        k.sprite(COIN, 744, 266, 4, COIN_COLORS);
        k.text(k.d.dateShort.replace(/\s/g, ""), W - 70, 296, { ...hud, align: "right", maxW: 190 });
        k.rect(70, 320, W - 140, 6, "#FFFFFF", 0.65);
        k.text("PEMAIN 1 + PEMAIN 2", CX, 452, { font: "display", size: 34, spacing: 4, color: k.v("--inv-sun", "#FFE27A"), maxW: 900 });
        logo(k, k.d.groom, 600, 132);
        k.sprite(HEART, CX - 42, 636, 12, HEART_COLORS);
        logo(k, k.d.bride, 840, 132);
        k.sprite(FLAG, 800, 1360 - FLAG.length * 7, 7, FLAG_COLORS);
        k.sprite(COIN, 120, 1110, 8, COIN_COLORS);
        k.sprite(COIN, 220, 1070, 8, COIN_COLORS);
        k.sprite(COIN, 320, 1110, 8, COIN_COLORS);
        k.text(k.d.date, CX, 950, { font: "display", size: 38, spacing: 2, color: "#FFFFFF", maxW: 930 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, 1006, { size: 30, color: "#FFFFFF", maxW: 930 });
        couple(k, CX, 1360, 7);
        start(k);
      },
    },
  ],
};
