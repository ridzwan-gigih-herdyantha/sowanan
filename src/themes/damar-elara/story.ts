import { circlePath, CX, H, rectPath, W, type Kit, type ThemeStory } from "../story-kit";

// Palet kustom bisa membuat latar terang atau abu-abu, jadi warna teks dipilih yang terbaca di atas latarnya.
const on = (k: Kit, bg: string) => ({ ink: k.readable(k.c.ink, bg, 4.5, k.c.paper), gold: k.readable(k.c.gold, bg, 3, k.c.ink, k.c.paper) });

const frame = (k: Kit, m = 48) => {
  k.strokePath(rectPath({ x: m, y: m, w: W - m * 2, h: H - m * 2 }), k.c.gold, 1.5, 0.65);
  k.strokePath(rectPath({ x: m + 18, y: m + 18, w: W - (m + 18) * 2, h: H - (m + 18) * 2 }), k.c.gold, 1, 0.3);
};

const ring = (k: Kit, x: number, y: number, r: number) => {
  const { gold } = on(k, k.c.night);
  k.strokePath(circlePath(x, y, r), gold, 1.5, 0.85);
  k.text(k.d.monogram.replace(/\s+/g, " "), x, y + r * 0.14, { font: "display", size: Math.round(r * 0.4), spacing: 3, color: gold, maxW: r * 1.5 });
};

const header = (k: Kit, bg = k.c.night) => {
  const { gold } = on(k, bg);
  k.text("NOCTURNE", 96, 280, { size: 23, spacing: 6, color: gold, align: "left" });
  k.text(`${k.d.day} ${k.d.month} ${k.d.year}`.toLocaleUpperCase("id-ID"), W - 96, 280, { size: 23, spacing: 4, color: gold, align: "right", maxW: 560 });
};

const button = (k: Kit, y = 1548) => k.link({ fill: k.c.accent, label: "", y, radius: 0, stroke: k.mix(k.c.accent, k.c.ink, 0.25), spacing: 1 });

// Nocturne: surat cinta setelah gelap, hitam pekat, garis emas tipis, potret hitam putih, dan huruf Cinzel.
export const story: ThemeStory = {
  templates: [
    {
      id: "surat-malam",
      name: "Surat Malam",
      draw: (k) => {
        k.bg(k.c.night);
        k.group(() => k.photo(k.d.photos.hero, { x: 0, y: 0, w: W, h: H }, { tone: "mono", empty: k.c.night, emptyInk: k.c.night }), { alpha: 0.42 });
        k.bg(k.radial(CX, 860, 120, 1130, [[0, k.alpha(k.c.night, 0.3)], [1, k.alpha(k.c.night, 0.96)]]));
        frame(k);
        header(k);
        const { ink, gold } = on(k, k.c.night);
        k.text("UNDANGAN PERNIKAHAN", CX, 470, { size: 26, spacing: 8, color: ink });
        const y = 800;
        k.strokePath(circlePath(CX, y, 420), k.c.gold, 1, 0.3);
        ring(k, CX, 610, 92);
        const c = k.couple({ top: 730, maxH: 520, font: "name", size: 136, color: ink, upper: true, maxW: 840, lineHeight: 1.08, ampGap: 0.5, amp: { font: "body", color: gold, scale: 0.34 } });
        k.line(CX - 120, c.bottom + 40, CX + 120, c.bottom + 40, gold, 1.5, 0.8);
        k.text(k.d.date.toLocaleUpperCase("id-ID"), CX, c.bottom + 106, { size: 28, spacing: 4, color: gold, maxW: 840 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join("  ·  ").toLocaleUpperCase("id-ID"), CX, c.bottom + 158, { size: 25, spacing: 3, color: ink, alpha: 0.82, maxW: 840 });
        button(k);
      },
    },
    {
      id: "potret",
      name: "Potret Emas",
      draw: (k) => {
        k.bg(k.c.paper);
        frame(k);
        header(k, k.c.paper);
        const { ink, gold } = on(k, k.c.paper);
        const b = { x: 170, y: 330, w: 740, h: 800 };
        k.strokePath(rectPath({ x: b.x - 22, y: b.y - 22, w: b.w + 44, h: b.h + 44 }), k.c.gold, 1.5, 0.8);
        k.photo(k.d.photos.closing ?? k.d.photos.hero, b, { tone: "mono", empty: k.c.wash });
        k.rect(b.x, b.y + b.h - 8, b.w, 8, k.c.accent);
        const c = k.couple({ top: 1158, maxH: 290, font: "name", size: 92, color: ink, upper: true, maxW: 840, lineHeight: 1.08, ampGap: 0.46, amp: { font: "body", color: gold, scale: 0.32 } });
        k.text(k.d.date.toLocaleUpperCase("id-ID"), CX, c.bottom + 44, { size: 26, spacing: 4, color: gold, maxW: 840 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join("  ·  ").toLocaleUpperCase("id-ID"), CX, c.bottom + 88, { size: 23, spacing: 3, color: ink, alpha: 0.8, maxW: 840 });
        button(k);
      },
    },
    {
      id: "diptik",
      name: "Diptik",
      draw: (k) => {
        k.bg(k.c.night);
        const { ink, gold } = on(k, k.c.night);
        const left = { x: 110, y: 330, w: 424, h: 700 };
        const right = { x: 546, y: 330, w: 424, h: 700 };
        k.photo(k.d.photos.groom, left, { tone: "mono", empty: k.c.wash });
        k.photo(k.d.photos.bride, right, { tone: "mono", empty: k.c.wash });
        k.strokePath(rectPath({ x: 92, y: 312, w: 896, h: 736 }), k.c.gold, 1.5, 0.85);
        k.rect(534, 330, 12, 700, k.c.accent);
        frame(k);
        header(k);
        k.fillPath(circlePath(CX, 1040, 84), k.c.night);
        ring(k, CX, 1040, 84);
        const c = k.couple({ top: 1132, maxH: 310, font: "name", size: 104, color: ink, upper: true, maxW: 860, lineHeight: 1.08, ampGap: 0.46, amp: { font: "body", color: gold, scale: 0.32 } });
        k.text(k.d.date.toLocaleUpperCase("id-ID"), CX, c.bottom + 50, { size: 27, spacing: 4, color: gold, maxW: 840 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join("  ·  ").toLocaleUpperCase("id-ID"), CX, c.bottom + 96, { size: 24, spacing: 3, color: ink, alpha: 0.85, maxW: 840 });
        button(k);
      },
    },
  ],
};
