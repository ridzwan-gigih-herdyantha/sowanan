import { archPath, CX, H, W, type Kit, type ThemeStory } from "../story-kit";

const A = "/img/fadhil-nayla";
const BISMILLAH = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";

// Emas tema ini disimpan di --sk-emas, karena --inv-gold dipakai untuk warna aksen.
const emas = (k: Kit) => k.v("--sk-emas", k.c.gold);

const corners = (k: Kit, size: number, color: string) => {
  const half = size / 2;
  k.art(`${A}/sk-sudut.webp`, half, half, size, { tint: color });
  k.art(`${A}/sk-sudut.webp`, W - half, half, size, { tint: color, flipX: true });
  k.art(`${A}/sk-sudut.webp`, half, H - half, size, { tint: color, flipY: true });
  k.art(`${A}/sk-sudut.webp`, W - half, H - half, size, { tint: color, flipX: true, flipY: true });
};

// Sakinah: mihrab hijau tua, mahkota dan sudut ornamen emas, buket putih, dan foto bernuansa sepia.
export const story: ThemeStory = {
  assets: () => ["sk-mahkota", "sk-sudut", "sk-bunga", "sk-pita"].map((n) => `${A}/${n}.webp`),
  templates: [
    {
      id: "mihrab",
      name: "Mihrab",
      draw: (k) => {
        const gold = emas(k);
        const bg = k.v("--sk-night2", k.mix(k.c.night, "#3C2E20", 0.7));
        k.bg(k.mix(bg, "#000000", 0.28));
        corners(k, 300, gold);
        const arch = { x: 110, y: 520, w: 860, h: 1190 };
        const out = { x: 92, y: 502, w: 896, h: 1208 };
        k.fillPath(archPath(arch), k.linear(0, 520, 0, 1710, [[0, k.c.night], [1, k.mix(k.c.night, "#000000", 0.25)]]), { color: "#00000080", blur: 44, y: 14 });
        k.strokePath(archPath(out), gold, 3);
        k.strokePath(archPath(arch), gold, 1.5);
        k.art(`${A}/sk-mahkota.webp`, CX, 430, 620, { tint: gold });
        const light = k.c.goldLight;
        k.text(BISMILLAH, CX, 730, { font: "arab", size: 58, color: light, rtl: true, maxW: 700 });
        k.text("WALIMATUL 'URSY", CX, 800, { size: 25, spacing: 8, color: light, alpha: 0.9 });
        const c = k.couple({ top: 830, font: "name", size: 124, color: k.c.wash, maxW: 700, lineHeight: 1.05, ampGap: 0.5, amp: { color: gold, scale: 0.46 } });
        k.art(`${A}/sk-pita.webp`, CX, c.bottom + 26, 320, { tint: gold });
        k.text(k.d.date, CX, c.bottom + 96, { font: "display", size: 38, color: k.c.wash, maxW: 720 });
        k.text(k.d.hijri, CX, c.bottom + 142, { size: 27, color: light, maxW: 720 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, c.bottom + 188, { size: 27, color: k.c.wash, alpha: 0.85, maxW: 740 });
        k.link({ fill: k.c.wash, ink: k.c.night, label: "", y: 1570, radius: 6 });
      },
    },
    {
      id: "foto",
      name: "Foto Lengkung",
      draw: (k) => {
        k.bg(k.c.paper);
        corners(k, 240, emas(k));
        k.text(BISMILLAH, CX, 318, { font: "arab", size: 50, color: k.c.accent, rtl: true, maxW: 700 });
        k.art(`${A}/sk-mahkota.webp`, CX, 416, 500, { tint: emas(k) });
        const arch = { x: 180, y: 470, w: 720, h: 660 };
        k.photo(k.d.photos.couple ?? k.d.photos.hero, arch, { path: archPath(arch), tone: "sepia", toneColor: k.mix(emas(k), "#A07A4C", 0.5), empty: k.c.wash });
        k.strokePath(archPath({ x: 160, y: 450, w: 760, h: 680 }), emas(k), 3);
        k.art(`${A}/sk-bunga.webp`, 196, 1076, 400);
        k.art(`${A}/sk-bunga.webp`, 884, 1076, 400, { flipX: true });
        const c = k.couple({ top: 1132, maxH: 330, font: "name", size: 88, color: k.c.ink, maxW: 800, lineHeight: 1.02, ampGap: 0.44, amp: { color: emas(k), scale: 0.42 } });
        k.text(k.d.date, CX, c.bottom + 44, { font: "display", size: 35, color: k.c.ink, maxW: 800 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, c.bottom + 88, { size: 26, color: k.c.ink, alpha: 0.78, maxW: 820 });
        k.link({ fill: k.c.night, ink: k.c.wash, label: "", y: 1570, radius: 6 });
      },
    },
    {
      id: "walimah",
      name: "Malam Walimah",
      draw: (k) => {
        const gold = k.c.goldLight;
        const line = emas(k);
        const n = k.c.night;
        k.bg(n);
        k.photo(k.d.photos.hero, { x: 0, y: 200, w: W, h: 1100 }, { empty: n });
        k.bg(k.linear(0, 0, 0, H, [[0, n], [0.12, n], [0.26, k.alpha(n, 0.1)], [0.44, k.alpha(n, 0.1)], [0.68, n], [1, n]]));
        corners(k, 270, line);
        k.strokePath(archPath({ x: 80, y: 250, w: W - 160, h: H - 330 }), line, 3);
        k.strokePath(archPath({ x: 98, y: 268, w: W - 196, h: H - 366 }), line, 1.5);
        k.text(BISMILLAH, CX, 366, { font: "arab", size: 50, color: gold, rtl: true, maxW: 560 });
        const c = k.couple({ bottom: 1340, font: "name", size: 112, color: k.c.wash, maxW: 780, lineHeight: 1.05, ampGap: 0.5, amp: { color: gold, scale: 0.46 } });
        k.art(`${A}/sk-pita.webp`, CX, c.bottom + 20, 300, { tint: line });
        k.text(k.d.date, CX, c.bottom + 78, { font: "display", size: 37, color: k.c.wash, maxW: 800 });
        k.text(k.d.hijri, CX, c.bottom + 120, { size: 26, color: gold, maxW: 800 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, c.bottom + 162, { size: 26, color: k.c.wash, alpha: 0.88, maxW: 800 });
        k.link({ fill: k.c.wash, ink: n, label: "", y: 1560, radius: 6 });
      },
    },
  ],
};
