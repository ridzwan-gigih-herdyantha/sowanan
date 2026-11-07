import { CX, H, W, type Kit, type ThemeStory } from "../story-kit";

const SEAL = "/img/andi-rina/seal.webp";
const GRAIN = "/img/andi-rina/grain.webp";

const seal = (k: Kit, x: number, y: number, size: number) => {
  k.art(SEAL, x, y, size, { shadow: { color: k.alpha(k.v("--ar-deep", k.c.night), 0.45), blur: 34, y: 16 } });
  k.text(k.d.monogram, x, y + size * 0.07, { font: "display", size: Math.round(size * 0.19), color: k.mix(k.c.goldLight, "#FFFFFF", 0.35), maxW: size * 0.56 });
};

// Senja Kota: kertas hangat, huruf Bodoni besar, segel lilin, dan warna teal senja.
export const story: ThemeStory = {
  assets: () => [SEAL, GRAIN],
  templates: [
    {
      id: "segel",
      name: "Amplop Segel",
      draw: (k) => {
        const flap = k.v("--ar-flap", k.c.wash);
        k.bg(k.c.paper);
        const tip = 1040;
        const fold = new Path2D();
        fold.moveTo(0, 0);
        fold.lineTo(W, 0);
        fold.lineTo(W, 480);
        fold.lineTo(CX, tip);
        fold.lineTo(0, 480);
        fold.closePath();
        k.fillPath(fold, k.linear(0, 0, 0, tip, [[0, flap], [1, k.mix(flap, k.c.wash, 0.5)]]), { color: k.alpha(k.c.night, 0.28), blur: 42, y: 16 });
        k.grain(GRAIN, 0.4);
        k.text("PERNIKAHAN", CX, 320, { size: 28, spacing: 11, color: k.c.gold });
        k.couple({ top: 356, maxH: 480, font: "name", size: 148, color: k.c.accent, maxW: 760, amp: { color: k.c.gold, italic: true, scale: 0.52 }, ampGap: 0.62, lineHeight: 1 });
        seal(k, CX, tip - 4, 280);
        k.text(k.d.date, CX, 1270, { font: "display", size: 48, color: k.c.ink, maxW: 860 });
        const end = k.para(k.d.venue, CX, 1340, { size: 34, color: k.c.ink, width: 820, alpha: 0.85 });
        k.text(k.d.city, CX, end + 4, { size: 28, color: k.c.ink, alpha: 0.65 });
        k.link({ fill: k.c.accent, labelColor: k.c.ink, radius: 6, y: 1562 });
      },
    },
    {
      id: "editorial",
      name: "Editorial",
      draw: (k) => {
        k.bg(k.c.paper);
        k.grain(GRAIN, 0.4);
        k.text("KEDUA MEMPELAI", 70, 302, { size: 26, spacing: 8, color: k.c.gold, align: "left" });
        const size = k.text(k.d.groom, 62, 482, { font: "name", size: 196, color: k.c.accent, align: "left", maxW: 950 });
        k.photo(k.d.photos.wide, { x: 0, y: 540, w: W, h: 640 }, { empty: k.c.accent });
        k.rect(0, 540, W, 16, k.c.night);
        k.rect(0, 1164, W, 16, k.c.night);
        k.text("&", 900, 1240, { font: "display", size: 320, color: k.c.goldLight, italic: true, shadow: { color: k.alpha(k.c.night, 0.3), blur: 18, y: 6 } });
        k.text(k.d.bride, W - 62, 1350, { font: "name", size: Math.min(size, 196), color: k.c.accent, align: "right", maxW: 950 });
        k.text(k.d.date, 70, 1436, { font: "display", size: 42, color: k.c.ink, align: "left", maxW: 900 });
        k.line(70, 1460, 170, 1460, k.c.gold, 3);
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), 70, 1508, { size: 30, color: k.c.ink, align: "left", alpha: 0.82, maxW: 930 });
        k.link({ fill: k.c.accent, label: "", y: 1570, radius: 6, x: CX });
      },
    },
    {
      id: "senja",
      name: "Senja Penuh",
      draw: (k) => {
        const deep = k.v("--ar-deep", k.c.night);
        const light = k.mix(k.c.paper, "#FFFFFF", 0.4);
        k.bg(deep);
        k.photo(k.d.photos.hero, { x: 0, y: 0, w: W, h: 1280 }, { empty: k.c.accent });
        k.bg(k.linear(0, 0, 0, H, [[0, k.alpha(deep, 0.74)], [0.2, k.alpha(deep, 0.05)], [0.4, k.alpha(deep, 0.05)], [0.62, k.alpha(deep, 0.92)], [0.67, deep], [1, deep]]));
        k.text("PERNIKAHAN", CX, 300, { size: 26, spacing: 11, color: light });
        seal(k, CX, 900, 170);
        const c = k.couple({ top: 984, maxH: 450, font: "name", size: 132, color: light, maxW: 880, lineHeight: 1, ampGap: 0.62, amp: { color: k.c.goldLight, italic: true, scale: 0.52 } });
        k.rule(c.bottom + 30, k.c.goldLight);
        k.text(k.d.date, CX, c.bottom + 92, { font: "display", size: 44, color: light, maxW: 860 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, c.bottom + 140, { size: 29, color: light, alpha: 0.85, maxW: 880 });
        k.link({ fill: k.c.goldLight, ink: deep, label: "", y: 1580, radius: 6 });
      },
    },
  ],
};
