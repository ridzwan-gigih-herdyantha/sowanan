import { archPath, CX, H, roundPath, W, type Kit, type ThemeStory } from "../story-kit";

const A = "/img/danang-kinanthi";
const dated = (k: Kit) => k.d.date.replace(",", ` ${k.d.pasaran},`);

const corners = (k: Kit, size: number, top = true, bottom = false) => {
  const half = size / 2;
  if (top) {
    k.art(`${A}/sudut.webp`, half, half, size, {});
    k.art(`${A}/sudut.webp`, W - half, half, size, { flipX: true });
  }
  if (bottom) {
    k.art(`${A}/sudut.webp`, half, H - half, size, { flipY: true });
    k.art(`${A}/sudut.webp`, W - half, H - half, size, { flipX: true, flipY: true });
  }
};

const aksara = (k: Kit, y: number, color: string, size = 40) => {
  const { groom, bride } = k.d.aksara;
  if (groom && bride) k.text(`${groom} | ${bride}`, CX, y, { font: "jawa", size, color, maxW: 800 });
};

// Pakeliran: gunungan, wayang Kamajaya dan Kamaratih, ukiran emas, dan batik parang.
export const story: ThemeStory = {
  assets: () => ["gunungan", "kamajaya", "kamaratih", "parang", "sudut", "lung-mahkota"].map((n) => `${A}/${n}.webp`),
  templates: [
    {
      id: "gunungan",
      name: "Gunungan",
      draw: (k) => {
        k.bg(k.radial(CX, 1000, 100, 1150, [[0, k.c.wash], [1, k.c.paper]]));
        corners(k, 300);
        k.text("PAHARGYAN PAWIWAHAN", CX, 296, { size: 25, spacing: 8, color: k.c.ink, alpha: 0.82 });
        const c = k.couple({ top: 312, font: "name", size: 108, color: k.c.ink, maxW: 800, lineHeight: 1.02, ampGap: 0.5, amp: { color: k.c.gold, scale: 0.46 } });
        aksara(k, c.bottom + 44, k.c.accent);
        k.text(dated(k), CX, c.bottom + 100, { font: "display", size: 37, color: k.c.accent, maxW: 840 });
        const top = c.bottom + 122;
        const space = Math.max(320, 1500 - top);
        const w = Math.min(space / 1.688, 460);
        k.art(`${A}/gunungan.webp`, CX, top + space / 2, w, { shadow: { color: k.alpha(k.c.night, 0.34), blur: 34, y: 16 } });
        k.tile(`${A}/parang.webp`, 170, 1, { x: 0, y: 1702, w: W, h: 218 });
        k.rect(0, 1694, W, 8, k.c.gold);
        k.link({ fill: k.c.accent, label: "", y: 1540, radius: 6, stroke: k.c.gold });
      },
    },
    {
      id: "kelir",
      name: "Kelir Wayang",
      draw: (k) => {
        const lamp = k.v("--inv-gold-light", k.c.goldLight);
        const base = k.mix(k.c.night, "#000000", 0.42);
        k.bg(base);
        k.bg(k.radial(CX, 960, 80, 1020, [[0, k.alpha(lamp, 0.55)], [0.5, k.alpha(lamp, 0.14)], [1, k.alpha(lamp, 0)]]));
        k.tile(`${A}/parang.webp`, 120, 1, { x: 0, y: 0, w: W, h: 120 });
        k.tile(`${A}/parang.webp`, 120, 1, { x: 0, y: H - 120, w: W, h: 120 });
        k.rect(0, 120, W, 5, k.c.gold);
        k.rect(0, H - 125, W, 5, k.c.gold);
        // Foto menjadi kelir yang diterangi blencong, wayang berdiri di depannya.
        const screen = { x: 170, y: 660, w: 740, h: 690 };
        k.strokePath(roundPath({ x: screen.x - 14, y: screen.y - 14, w: screen.w + 28, h: screen.h + 28 }, 12), k.c.gold, 5);
        k.photo(k.d.photos.couple ?? k.d.photos.hero, screen, { path: roundPath(screen, 6), empty: k.mix(base, lamp, 0.25), emptyInk: lamp });
        k.fillPath(roundPath(screen, 6), k.radial(CX, 1000, 220, 560, [[0, k.alpha(base, 0)], [1, k.alpha(base, 0.55)]]));
        const glow = { color: k.alpha("#000000", 0.6), blur: 32, x: 0, y: 14 };
        k.art(`${A}/kamajaya.webp`, 150, 1100, 190, { shadow: glow });
        k.art(`${A}/kamaratih.webp`, 930, 1100, 280, { shadow: glow });
        const light = k.mix(lamp, "#FFFFFF", 0.3);
        k.text("PAHARGYAN PAWIWAHAN", CX, 296, { size: 25, spacing: 8, color: lamp });
        const c = k.couple({ top: 312, maxH: 270, font: "name", size: 96, color: light, maxW: 800, lineHeight: 1, ampGap: 0.5, amp: { color: lamp, scale: 0.46 } });
        aksara(k, c.bottom + 40, lamp, 34);
        k.text(dated(k), CX, 1430, { font: "display", size: 37, color: light, maxW: 860, shadow: { color: "#000000AA", blur: 12 } });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, 1484, { size: 28, color: light, alpha: 0.88, maxW: 880, shadow: { color: "#000000AA", blur: 12 } });
        k.link({ fill: lamp, ink: base, label: "", y: 1540, radius: 6 });
      },
    },
    {
      id: "gapura",
      name: "Gapura",
      draw: (k) => {
        k.bg(k.c.paper);
        corners(k, 260, true, true);
        k.art(`${A}/lung-mahkota.webp`, CX, 326, 440, { tint: k.c.gold });
        const arch = { x: 140, y: 380, w: 800, h: 960 };
        k.strokePath(archPath({ x: 112, y: 352, w: 856, h: 1016 }), k.c.gold, 5);
        k.strokePath(archPath({ x: 126, y: 366, w: 828, h: 988 }), k.c.gold, 1.5);
        k.photo(k.d.photos.couple ?? k.d.photos.hero, arch, { path: archPath(arch), empty: k.c.wash });
        k.fillPath(archPath(arch), k.linear(0, 900, 0, 1340, [[0, k.alpha(k.c.night, 0)], [1, k.alpha(k.mix(k.c.night, "#000000", 0.3), 0.96)]]));
        k.couple({ bottom: 1320, maxH: 340, font: "name", size: 86, color: k.c.goldLight, maxW: 700, lineHeight: 1, ampGap: 0.46, amp: { color: k.c.goldLight, scale: 0.44 } });
        k.text(dated(k), CX, 1432, { font: "display", size: 37, color: k.c.ink, maxW: 800 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, 1484, { size: 28, color: k.c.ink, alpha: 0.8, maxW: 800 });
        k.link({ fill: k.c.accent, label: "", y: 1540, radius: 6, stroke: k.c.gold });
      },
    },
  ],
};
