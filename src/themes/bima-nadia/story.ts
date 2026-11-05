import { circlePath, CX, H, seeded, W, type Kit, type ThemeStory } from "../story-kit";

const MOON = "/img/bima-nadia/moon.webp";

const sky = (k: Kit) => k.bg(k.linear(0, 0, 0, H, [[0, k.mix(k.c.paper, "#000000", 0.2)], [0.6, k.c.paper], [1, k.mix(k.c.paper, k.c.accent, 0.08)]]));

const stars = (k: Kit, seed: number, count: number, bottom = H) => {
  const rand = seeded(seed);
  for (let i = 0; i < count; i += 1) {
    const r = rand() < 0.1 ? 3.4 : 1 + rand() * 1.5;
    k.fillPath(circlePath(rand() * W, rand() * bottom, r), k.alpha("#FFFFFF", 0.3 + rand() * 0.6));
  }
};

const moon = (k: Kit, x: number, y: number, size: number) => {
  k.fillPath(circlePath(x, y, size * 0.92), k.radial(x, y, size * 0.4, size * 0.92, [[0, k.alpha(k.c.goldLight, 0.34)], [1, k.alpha(k.c.goldLight, 0)]]));
  k.art(MOON, x, y, size);
};

// Rembulan: langit malam, bulan purnama, bintang acak, dan huruf Italiana yang tipis.
export const story: ThemeStory = {
  assets: () => [MOON],
  templates: [
    {
      id: "purnama",
      name: "Purnama",
      draw: (k) => {
        sky(k);
        stars(k, 11, 190);
        k.text("UNDANGAN PERNIKAHAN", CX, 296, { size: 25, spacing: 9, color: k.c.ink, alpha: 0.82 });
        const c = k.couple({ top: 312, maxH: 400, font: "name", size: 134, color: k.c.ink, maxW: 860, lineHeight: 1.05, ampGap: 0.46, amp: { color: k.c.gold, italic: true, scale: 0.4 } });
        k.text(k.d.date, CX, c.bottom + 40, { font: "body", size: 30, spacing: 3, color: k.c.ink, maxW: 820 });
        moon(k, CX, 1090, 620);
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, 1468, { size: 30, italic: true, color: k.c.ink, alpha: 0.9, maxW: 880 });
        k.link({ fill: "transparent", ink: k.c.ink, stroke: k.alpha(k.c.ink, 0.65).slice(0, 7), label: "", y: 1550 });
      },
    },
    {
      id: "dua-cahaya",
      name: "Dua Cahaya",
      draw: (k) => {
        sky(k);
        stars(k, 23, 160);
        moon(k, 918, 322, 150);
        k.text("Dua cahaya,", 70, 390, { font: "display", size: 74, color: k.c.ink, align: "left" });
        k.text("satu malam", 70, 474, { font: "display", size: 74, color: k.c.ink, align: "left" });
        const r = 246;
        const y = 800;
        k.fillPath(circlePath(CX, y, 420), k.radial(CX, y, 80, 420, [[0, k.alpha(k.c.goldLight, 0.3)], [1, k.alpha(k.c.goldLight, 0)]]));
        const left = { x: 310 - r, y: y - r, w: r * 2, h: r * 2 };
        const right = { x: 770 - r, y: y - r, w: r * 2, h: r * 2 };
        k.photo(k.d.photos.groom, left, { path: circlePath(310, y, r), empty: k.c.wash });
        k.photo(k.d.photos.bride, right, { path: circlePath(770, y, r), empty: k.c.wash });
        k.strokePath(circlePath(310, y, r), k.c.goldLight, 2);
        k.strokePath(circlePath(770, y, r), k.c.goldLight, 2);
        const size = k.text(k.d.groom, 310, 1150, { font: "name", size: 86, color: k.c.ink, maxW: 440 });
        k.text(k.d.bride, 770, 1150, { font: "name", size, color: k.c.ink, maxW: 440 });
        k.text("&", CX, 1148, { font: "display", size: 52, italic: true, color: k.c.gold });
        k.line(150, 1212, W - 150, 1212, k.c.goldLight, 1, 0.55);
        k.text(k.d.date, CX, 1282, { font: "display", size: 44, color: k.c.ink, maxW: 860 });
        k.para([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, 1344, { size: 30, italic: true, color: k.c.ink, alpha: 0.88, width: 840 });
        k.link({ fill: "transparent", ink: k.c.ink, stroke: k.alpha(k.c.ink, 0.65).slice(0, 7), label: "", y: 1550 });
      },
    },
    {
      id: "malam",
      name: "Malam Biru",
      draw: (k) => {
        const n = k.mix(k.c.paper, "#000000", 0.14);
        k.bg(n);
        k.photo(k.d.photos.closing ?? k.d.photos.hero, { x: 0, y: 260, w: W, h: 800 }, { tone: "mono", empty: k.c.wash });
        k.group(() => k.rect(0, 260, W, 800, k.mix(k.c.paper, k.c.ink, 0.6)), { mode: "multiply" });
        k.bg(k.linear(0, 0, 0, H, [[0, n], [0.15, n], [0.26, k.alpha(n, 0)], [0.44, k.alpha(n, 0)], [0.55, n], [1, n]]));
        stars(k, 37, 150, 620);
        stars(k, 51, 60, H);
        moon(k, 880, 330, 170);
        k.text("UNDANGAN PERNIKAHAN", 80, 340, { size: 25, spacing: 8, color: k.c.ink, alpha: 0.9, align: "left", maxW: 660 });
        const c = k.couple({ top: 1040, maxH: 390, font: "name", size: 112, color: k.c.ink, maxW: 880, lineHeight: 1.04, ampGap: 0.46, amp: { color: k.c.gold, italic: true, scale: 0.4 } });
        k.text(k.d.date, CX, c.bottom + 62, { font: "display", size: 42, color: k.c.ink, maxW: 860 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, c.bottom + 116, { size: 29, italic: true, color: k.c.ink, alpha: 0.88, maxW: 880 });
        k.link({ fill: "transparent", ink: k.c.ink, stroke: k.alpha(k.c.ink, 0.65).slice(0, 7), label: "", y: 1550 });
      },
    },
  ],
};
