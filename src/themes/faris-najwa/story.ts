import { archPath, burstPath, circlePath, CX, diamondPath, H, rectPath, W, type Kit, type ThemeStory } from "../story-kit";

const BISMILLAH = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";

// Medali geometri islami: lingkaran dan bintang delapan berlapis.
const medallion = (k: Kit, x: number, y: number, r: number, color: string) => {
  k.strokePath(circlePath(x, y, r), color, 2, 0.55);
  k.strokePath(circlePath(x, y, r * 0.85), color, 1.5, 0.42, [3, 7]);
  // Bintang delapan dari dua persegi yang saling berputar.
  for (const [size, turn] of [[0.92, 0], [0.92, Math.PI / 4], [0.6, 0], [0.6, Math.PI / 4]]) k.strokePath(burstPath(x, y, r * size, r * size * Math.SQRT1_2, 4, turn), color, 2, 0.62);
  for (let i = 0; i < 8; i += 1) {
    const a = (Math.PI * i) / 4;
    k.line(x + Math.cos(a) * r * 0.98, y + Math.sin(a) * r * 0.98, x + Math.cos(a) * r * 1.14, y + Math.sin(a) * r * 1.14, color, 2, 0.7);
  }
};

const corner = (k: Kit, x: number, y: number, size: number, color: string, flipX: boolean, flipY: boolean) => {
  k.group(
    () => {
      const p = new Path2D();
      p.moveTo(x, y + size);
      p.lineTo(x, y);
      p.lineTo(x + size, y);
      p.moveTo(x + 14, y + size * 0.72);
      p.lineTo(x + 14, y + 14);
      p.lineTo(x + size * 0.72, y + 14);
      k.strokePath(p, color, 2);
      k.fillPath(diamondPath(x + 34, y + 34, 9), color);
      k.strokePath(burstPath(x + 34, y + 34, 24, 16, 8), color, 1.5, 0.7);
    },
    { at: [x + (flipX ? 0 : 0), y], flipX, flipY },
  );
};

const corners = (k: Kit, color: string, m = 46, size = 110) => {
  corner(k, m, m, size, color, false, false);
  corner(k, W - m, m, size, color, true, false);
  corner(k, m, H - m, size, color, false, true);
  corner(k, W - m, H - m, size, color, true, true);
};

const divider = (k: Kit, y: number, color: string) => {
  k.line(CX - 170, y, CX - 26, y, color);
  k.line(CX + 26, y, CX + 170, y, color);
  k.strokePath(diamondPath(CX, y, 12), color, 2);
};

// Mawaddah: laguna tua dan pasir, geometri bintang delapan, garis tembaga, dan bismillah.
export const story: ThemeStory = {
  templates: [
    {
      id: "medali",
      name: "Medali",
      draw: (k) => {
        const n = k.c.night;
        const light = k.c.goldLight;
        const split = 1120;
        k.bg(k.c.paper);
        k.rect(0, 0, W, split, k.linear(0, 0, 0, split, [[0, n], [1, k.mix(n, k.c.accent, 0.35)]]));
        medallion(k, CX, 640, 420, light);
        k.strokePath(rectPath({ x: 46, y: 46, w: W - 92, h: split - 92 }), light, 1.5, 0.55);
        k.text("MAWADDAH  ·  WALIMATUL 'URSY", CX, 290, { size: 23, spacing: 5, color: light, maxW: 900 });
        k.text(k.d.monogram, CX, 668, { font: "display", size: 104, color: light, maxW: 560 });
        k.text(k.d.tagline || "Sebuah ikrar, dalam kasih dan rahmat-Nya.", CX, 1000, { font: "display", size: 34, italic: true, color: "#FFFFFF", maxW: 840 });
        k.text(k.d.hijri.toLocaleUpperCase("id-ID"), CX, 1062, { size: 25, spacing: 4, color: light, maxW: 880 });
        k.rect(0, split, W, 8, k.c.gold);
        const size = k.text(k.d.groom, CX, 1244, { font: "name", size: 96, color: k.c.accent, maxW: 900 });
        k.text(`& ${k.d.bride}`, CX, 1344, { font: "name", size, color: k.c.accent, maxW: 900 });
        k.text(k.d.date, CX, 1414, { size: 31, color: k.c.ink, maxW: 860 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, 1462, { size: 27, color: k.c.ink, alpha: 0.75, maxW: 880 });
        k.link({ fill: n, ink: "#FFFFFF", label: "", y: 1530, radius: 2 });
      },
    },
    {
      id: "mihrab",
      name: "Mihrab Garis",
      draw: (k) => {
        const line = k.readable(k.c.gold, k.c.paper, 2, k.c.accent);
        k.bg(k.c.paper);
        medallion(k, 900, 1720, 330, k.alpha(line, 0.5).slice(0, 7));
        medallion(k, 170, 300, 300, k.alpha(line, 0.5).slice(0, 7));
        corners(k, line);
        k.text(BISMILLAH, CX, 322, { font: "arab", size: 54, color: k.c.accent, rtl: true, maxW: 760 });
        const arch = { x: 180, y: 410, w: 720, h: 760 };
        k.strokePath(archPath({ x: 150, y: 380, w: 780, h: 790 }), line, 2);
        k.strokePath(archPath({ x: 164, y: 394, w: 752, h: 776 }), line, 1, 0.55);
        k.photo(k.d.photos.couple ?? k.d.photos.hero, arch, { path: archPath(arch), empty: k.c.wash });
        k.fillPath(burstPath(CX, 380, 28, 18, 8), k.c.paper);
        k.strokePath(burstPath(CX, 380, 28, 18, 8), line, 2);
        k.text("WALIMATUL 'URSY", CX, 1228, { size: 24, spacing: 7, color: k.c.gold });
        k.text(`${k.d.groom} & ${k.d.bride}`, CX, 1320, { font: "name", size: 94, color: k.c.accent, maxW: 900 });
        divider(k, 1360, line);
        k.text(k.d.date, CX, 1424, { size: 31, color: k.c.ink, maxW: 860 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, 1472, { size: 27, color: k.c.ink, alpha: 0.75, maxW: 880 });
        k.link({ fill: k.c.night, ink: "#FFFFFF", label: "", y: 1530, radius: 2 });
      },
    },
    {
      id: "laguna",
      name: "Laguna",
      draw: (k) => {
        const n = k.c.night;
        const light = k.c.goldLight;
        k.bg(n);
        k.photo(k.d.photos.hero, { x: 0, y: 0, w: W, h: 1240 }, { empty: n });
        k.bg(k.linear(0, 0, 0, H, [[0, k.alpha(n, 0.94)], [0.22, k.alpha(n, 0.2)], [0.42, k.alpha(n, 0.1)], [0.64, n], [1, n]]));
        k.strokePath(rectPath({ x: 46, y: 46, w: W - 92, h: H - 92 }), light, 1.5, 0.7);
        corners(k, light, 46);
        k.text(BISMILLAH, CX, 330, { font: "arab", size: 56, color: light, rtl: true, maxW: 760 });
        k.text("WALIMATUL 'URSY", CX, 396, { size: 24, spacing: 7, color: light });
        const c = k.couple({ top: 1000, maxH: 380, font: "name", size: 118, color: "#FFFFFF", maxW: 860, lineHeight: 1.02, ampGap: 0.5, amp: { italic: true, color: light, scale: 0.48 } });
        divider(k, c.bottom + 36, light);
        k.text(k.d.date, CX, c.bottom + 100, { size: 33, color: "#FFFFFF", maxW: 860 });
        k.text(k.d.hijri, CX, c.bottom + 146, { size: 26, color: light, maxW: 860 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, c.bottom + 192, { size: 26, color: "#FFFFFF", alpha: 0.9, maxW: 880 });
        k.link({ fill: k.c.paper, ink: n, label: "", y: 1580, radius: 2 });
      },
    },
  ],
};
