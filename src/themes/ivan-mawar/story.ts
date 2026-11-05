import { circlePath, CX, H, rectPath, W, type Kit, type ThemeStory } from "../story-kit";
import { FLORA_SETS, type FloraSet } from "./palette";

const setOf = (k: { palette: Record<string, string> }) => {
  const s = k.palette["--mm-set"];
  return FLORA_SETS.includes(s as FloraSet) ? (s as FloraSet) : "merah";
};
const PIECES = ["buket", "buket-kecil", "rangkaian", "sapuan", "tiang", "untaian", "kolibri", "deret", "mawar-1", "mawar-2", "mawar-3", "daun-1", "daun-2", "daun-3"];
const flora = (k: Kit, piece: string) => `/img/ivan-mawar/bunga-6/${setOf(k.d)}/${piece}.webp`;

const nameStyle = { font: "name" as const, italic: true, weight: 300 };

const wash = (k: Kit) => {
  k.bg(k.c.paper);
  k.art(flora(k, "sapuan"), CX, H / 2, W, { h: H, alpha: 0.55 });
};

// Mekar Mawar: mawar cat air di atas kertas hangat. Bunganya mengikuti set warna palet.
export const story: ThemeStory = {
  assets: (d) => PIECES.map((p) => `/img/ivan-mawar/bunga-6/${setOf(d)}/${p}.webp`),
  templates: [
    {
      id: "buket",
      name: "Buket Lingkar",
      draw: (k) => {
        wash(k);
        k.art(flora(k, "rangkaian"), 170, 190, 720, { rot: 0.4 });
        k.art(flora(k, "rangkaian"), 910, 190, 720, { rot: -0.4, flipX: true });
        k.art(flora(k, "mawar-2"), 980, 1830, 380);
        k.art(flora(k, "mawar-1"), 90, 1830, 400);
        const y = 640;
        const r = 280;
        k.fillPath(circlePath(CX, y, r + 18), k.c.card, { color: "#00000033", blur: 30, y: 12 });
        k.photo(k.d.photos.hero, { x: CX - r, y: y - r, w: r * 2, h: r * 2 }, { path: circlePath(CX, y, r), empty: k.c.wash });
        k.strokePath(circlePath(CX, y, r + 18), k.c.gold, 2.5);
        k.art(flora(k, "buket-kecil"), 810, 870, 330);
        k.art(flora(k, "daun-1"), 270, 890, 170, { rot: -1.1 });
        k.text("UNDANGAN PERNIKAHAN", CX, 1044, { size: 25, spacing: 8, color: k.c.ink, alpha: 0.8 });
        const c = k.couple({ top: 1058, maxH: 420, ...nameStyle, size: 104, color: k.c.accent, maxW: 800, lineHeight: 1.02, ampGap: 0.5, amp: { italic: true, color: k.c.gold, scale: 0.48 } });
        k.text(k.d.date, CX, c.bottom + 44, { font: "display", size: 34, color: k.c.ink, maxW: 820 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, c.bottom + 90, { font: "display", size: 27, italic: true, color: k.c.ink, alpha: 0.78, maxW: 840 });
        k.link({ fill: k.c.accent, label: "", y: 1580 });
      },
    },
    {
      id: "bingkai",
      name: "Bingkai Mawar",
      draw: (k) => {
        wash(k);
        const b = { x: 200, y: 320, w: 680, h: 790 };
        k.fillPath(rectPath({ x: b.x - 18, y: b.y - 18, w: b.w + 36, h: b.h + 36 }), k.c.card, { color: "#00000030", blur: 34, y: 14 });
        k.strokePath(rectPath({ x: b.x - 18, y: b.y - 18, w: b.w + 36, h: b.h + 36 }), k.c.gold, 2);
        k.photo(k.d.photos.closing ?? k.d.photos.hero, b, { empty: k.c.wash });
        k.art(flora(k, "buket"), 196, 350, 460, { rot: -0.25 });
        k.art(flora(k, "buket-kecil"), 860, 1090, 400);
        k.art(flora(k, "kolibri"), 930, 270, 210);
        k.art(flora(k, "daun-2"), 110, 900, 170, { rot: 0.3 });
        k.text("PERNIKAHAN", CX, 1192, { size: 25, spacing: 10, color: k.c.ink, alpha: 0.8 });
        const c = k.couple({ top: 1204, maxH: 296, ...nameStyle, size: 92, color: k.c.accent, maxW: 800, lineHeight: 1, ampGap: 0.48, amp: { italic: true, color: k.c.gold, scale: 0.48 } });
        k.text(k.d.date, CX, c.bottom + 42, { font: "display", size: 33, color: k.c.ink, maxW: 840 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, c.bottom + 86, { font: "display", size: 26, italic: true, color: k.c.ink, alpha: 0.78, maxW: 840 });
        k.link({ fill: k.c.accent, label: "", y: 1590 });
      },
    },
    {
      id: "taman",
      name: "Taman Mawar",
      draw: (k) => {
        wash(k);
        k.art(flora(k, "tiang"), 90, 960, 300);
        k.art(flora(k, "tiang"), 990, 960, 300, { flipX: true });
        k.art(flora(k, "untaian"), CX, 150, 1240);
        k.art(flora(k, "deret"), CX, 1800, 1240);
        k.art(flora(k, "kolibri"), 850, 400, 180);
        k.text("UNDANGAN PERNIKAHAN", CX, 500, { size: 26, spacing: 9, color: k.c.ink, alpha: 0.82, maxW: 660 });
        const c = k.couple({ center: 790, maxH: 420, ...nameStyle, size: 150, color: k.c.accent, maxW: 660, lineHeight: 1.04, ampGap: 0.56, amp: { italic: true, color: k.c.gold, scale: 0.46 } });
        k.rule(c.bottom + 44, k.c.gold, 130);
        k.text(k.d.weekday.toLocaleUpperCase("id-ID"), CX, c.bottom + 118, { size: 27, spacing: 8, color: k.c.ink, alpha: 0.8 });
        k.text(`${k.d.day} ${k.d.month} ${k.d.year}`, CX, c.bottom + 178, { font: "display", size: 48, color: k.c.ink, maxW: 660 });
        k.para([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, c.bottom + 240, { font: "display", size: 28, italic: true, color: k.c.ink, alpha: 0.8, width: 660 });
        k.link({ fill: k.c.accent, label: "", y: 1490 });
      },
    },
  ],
};
