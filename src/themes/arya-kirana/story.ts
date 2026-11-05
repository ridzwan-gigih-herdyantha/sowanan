import { CX, H, rectPath, W, type Kit, type ThemeStory } from "../story-kit";

const A = "/img/arya-kirana";

const frame = (k: Kit, color: string, m = 50) => {
  k.strokePath(rectPath({ x: m, y: m, w: W - m * 2, h: H - m * 2 }), color, 2.5);
  k.strokePath(rectPath({ x: m + 14, y: m + 14, w: W - (m + 14) * 2, h: H - (m + 14) * 2 }), color, 1);
};

const corners = (k: Kit, color: string, size = 240, m = 34, bottom = true) => {
  const c = m + size / 2;
  // Ornamen aslinya mengarah ke sudut kanan atas.
  k.art(`${A}/corner.svg`, W - c, c, size, { tint: color, h: size });
  k.art(`${A}/corner.svg`, c, c, size, { tint: color, h: size, flipX: true });
  if (!bottom) return;
  k.art(`${A}/corner.svg`, W - c, H - c, size, { tint: color, h: size, flipY: true });
  k.art(`${A}/corner.svg`, c, H - c, size, { tint: color, h: size, flipX: true, flipY: true });
};

const divider = (k: Kit, y: number, color: string, w = 560) => k.art(`${A}/divider.svg`, CX, y, w, { tint: color, h: w, alpha: 1 });

// Sutra: kertas gading, bingkai ganda emas, ornamen sudut, karangan daun, pita emas, dan nama skrip.
export const story: ThemeStory = {
  assets: () => ["bow", "corner", "divider", "wreath"].map((n) => `${A}/${n}.svg`),
  templates: [
    {
      id: "karangan",
      name: "Karangan Daun",
      draw: (k) => {
        k.bg(k.radial(CX, 800, 80, 1200, [[0, k.mix(k.c.paper, "#FFFFFF", 0.6)], [1, k.c.paper]]));
        frame(k, k.c.gold);
        corners(k, k.c.gold);
        k.art(`${A}/wreath.svg`, CX, 590, 470, { tint: k.c.gold, h: 470 });
        k.text(k.d.monogram, CX, 610, { font: "display", size: 66, color: k.c.ink, maxW: 260 });
        k.text("UNDANGAN PERNIKAHAN", CX, 910, { size: 26, spacing: 9, color: k.c.gold });
        const c = k.couple({ top: 930, maxH: 470, font: "name", size: 124, color: k.c.accent, maxW: 800, lineHeight: 1.08, ampGap: 0.5, amp: { color: k.c.gold, italic: true, scale: 0.42 } });
        divider(k, c.bottom + 30, k.c.gold);
        k.text(k.d.date, CX, c.bottom + 92, { font: "display", size: 33, spacing: 3, color: k.c.ink, upper: true, maxW: 840 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, c.bottom + 142, { size: 30, italic: true, color: k.c.ink, alpha: 0.78, maxW: 820 });
        k.link({ fill: "transparent", ink: k.c.ink, stroke: k.c.gold, label: "", y: 1560, radius: 0 });
      },
    },
    {
      id: "pita",
      name: "Pita Emas",
      draw: (k) => {
        k.bg(k.c.paper);
        frame(k, k.c.gold);
        corners(k, k.c.gold, 170, 34);
        k.text("UNDANGAN PERNIKAHAN", CX, 296, { size: 25, spacing: 9, color: k.c.gold });
        k.text(`${k.d.groom} & ${k.d.bride}`, CX, 396, { font: "name", size: 104, color: k.c.accent, maxW: 860 });
        const y = 540;
        const h = 800;
        k.rect(170, y, 740, h, k.mix(k.c.paper, "#FFFFFF", 0.7));
        k.strokePath(rectPath({ x: 170, y, w: 740, h }), k.c.gold, 2);
        k.strokePath(rectPath({ x: 158, y: y - 12, w: 764, h: h + 24 }), k.c.gold, 1);
        k.photo(k.d.photos.closing ?? k.d.photos.hero, { x: 196, y: y + 26, w: 688, h: h - 52 }, { empty: k.c.wash });
        k.art(`${A}/bow.svg`, CX, y - 14, 230, { h: 230 * 0.72, shadow: { color: "#00000040", blur: 14, y: 6 } });
        divider(k, y + h + 34, k.c.gold, 480);
        k.text(k.d.date, CX, y + h + 92, { font: "display", size: 32, spacing: 3, color: k.c.ink, upper: true, maxW: 840 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, y + h + 138, { size: 29, italic: true, color: k.c.ink, alpha: 0.78, maxW: 820 });
        k.link({ fill: "transparent", ink: k.c.ink, stroke: k.c.gold, label: "", y: 1560, radius: 0 });
      },
    },
    {
      id: "selendang",
      name: "Selendang Sutra",
      draw: (k) => {
        const veil = k.mix(k.c.paper, "#FFFFFF", 0.4);
        k.bg(veil);
        k.photo(k.d.photos.closing ?? k.d.photos.hero, { x: 0, y: 0, w: W, h: 1080 }, { empty: k.c.wash });
        k.bg(k.linear(0, 0, 0, 500, [[0, k.alpha(veil, 0.72)], [1, k.alpha(veil, 0)]]));
        k.bg(k.linear(0, 800, 0, 1070, [[0, k.alpha(veil, 0)], [1, veil]]));
        k.rect(0, 1070, W, H - 1070, veil);
        frame(k, k.c.gold);
        corners(k, k.c.gold, 190, 34);
        k.text("UNDANGAN PERNIKAHAN", CX, 296, { size: 25, spacing: 9, color: k.readable(k.c.ink, veil), shadow: { color: k.alpha(veil, 0.9), blur: 18 } });
        const c = k.couple({ top: 1060, maxH: 340, font: "name", size: 108, color: k.c.accent, maxW: 820, lineHeight: 1.08, ampGap: 0.5, amp: { color: k.c.gold, italic: true, scale: 0.42 } });
        divider(k, c.bottom + 30, k.c.gold, 480);
        k.text(k.d.date, CX, c.bottom + 90, { font: "display", size: 33, spacing: 3, color: k.c.ink, upper: true, maxW: 840 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, c.bottom + 140, { size: 29, italic: true, color: k.c.ink, alpha: 0.78, maxW: 820 });
        k.link({ fill: "transparent", ink: k.c.ink, stroke: k.c.gold, label: "", y: 1560, radius: 0 });
      },
    },
  ],
};
