import { circlePath, CX, H, rectPath, W, type Kit, type ThemeStory } from "../story-kit";

// Segel bundar mengikuti warna aksen palet, sama dengan segel sentuh di pintu undangan Elaris.
const seal = (k: Kit, x: number, y: number, r: number) => {
  k.fillPath(circlePath(x, y, r), k.c.accent, { color: k.alpha(k.c.night, 0.35), blur: 26, y: 10 });
  k.strokePath(circlePath(x, y, r), k.c.goldLight, 2.5);
  k.strokePath(circlePath(x, y, r * 0.84), k.c.goldLight, 1.2, 0.8);
  for (let i = 0; i < 8; i += 1) {
    const a = (Math.PI * i) / 4;
    k.line(x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78, x + Math.cos(a) * r * 0.68, y + Math.sin(a) * r * 0.68, k.c.goldLight, 1.5, 0.7);
  }
  k.text(k.d.monogram.replace(/\s+/g, " "), x, y + r * 0.15, { font: "display", size: Math.round(r * 0.42), spacing: 2, color: k.mix(k.c.goldLight, "#FFFFFF", 0.45), maxW: r * 1.25 });
};

const lined = (k: Kit, x: number, y: number, w: number, h: number) => {
  k.strokePath(rectPath({ x, y, w, h }), k.c.gold, 1.5, 0.75);
  k.strokePath(rectPath({ x: x + 12, y: y + 12, w: w - 24, h: h - 24 }), k.c.gold, 1, 0.45);
};

// Lembar kartu berlapis di atas dinding berpanel, seperti pintu undangan Elaris yang tenang.
const wall = (k: Kit) => {
  k.bg(k.c.paper);
  const panel = k.alpha(k.c.line, 0.65);
  k.line(CX, 0, CX, H, panel, 2);
  for (const x of [48, CX + 48]) {
    k.strokePath(rectPath({ x, y: 48, w: CX - 96, h: 860 }), panel, 2);
    k.strokePath(rectPath({ x, y: 948, w: CX - 96, h: 924 }), panel, 2);
  }
};

// Elaris: elegan dan tenang, dinding berpanel, garis tipis perunggu, Cormorant, dan segel hijau.
export const story: ThemeStory = {
  templates: [
    {
      id: "kartu",
      name: "Kartu Undangan",
      draw: (k) => {
        wall(k);
        const card = { x: 70, y: 240, w: 940, h: 1440 };
        k.rect(card.x, card.y, card.w, card.h, k.mix(k.c.wash, k.c.card, 0.3));
        k.group(() => k.rect(card.x, card.y, card.w, card.h, k.c.wash), { shadow: { color: k.alpha(k.c.night, 0.28), blur: 60, y: 24 } });
        lined(k, card.x + 22, card.y + 22, card.w - 44, card.h - 44);
        k.text("UNDANGAN PERNIKAHAN", CX, 344, { size: 24, spacing: 8, color: k.c.ink, alpha: 0.85 });
        k.text("DENGAN PENUH SYUKUR", CX, 396, { font: "display", size: 28, spacing: 7, color: k.mix(k.c.gold, k.c.ink, 0.35) });
        k.rect(130, 430, 820, 560, k.c.card);
        k.strokePath(rectPath({ x: 130, y: 430, w: 820, h: 560 }), k.c.gold, 1.5, 0.75);
        k.photo(k.d.photos.wide, { x: 146, y: 446, w: 788, h: 528 }, { empty: k.c.paper });
        k.text(`${k.d.groom} & ${k.d.bride}`, CX, 1110, { font: "name", size: 92, color: k.c.accent, maxW: 840 });
        k.text(k.d.date, CX, 1176, { size: 32, color: k.c.ink, maxW: 800 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, 1224, { size: 28, color: k.c.ink, alpha: 0.72, maxW: 800 });
        seal(k, CX, 1376, 96);
        k.link({ fill: k.c.accent, label: "", y: 1538, h: 78, size: 32 });
      },
    },
    {
      id: "pintu",
      name: "Pintu Segel",
      draw: (k) => {
        const left = k.mix(k.c.wash, k.c.card, 0.25);
        k.bg(k.c.paper);
        k.rect(0, 0, CX, H, left);
        k.rect(CX, 0, CX, H, left);
        for (const x of [62, CX + 62]) {
          k.strokePath(rectPath({ x, y: 62, w: CX - 124, h: H - 124 }), k.c.gold, 1.5, 0.75);
          k.strokePath(rectPath({ x: x + 14, y: 76, w: CX - 152, h: H - 152 }), k.c.gold, 1, 0.45);
        }
        k.rect(CX - 2, 0, 4, H, k.alpha(k.c.night, 0.35));
        k.bg(k.linear(0, 0, W, 0, [[0, k.alpha(k.c.night, 0.08)], [0.48, k.alpha(k.c.night, 0)], [0.5, k.alpha(k.c.night, 0.14)], [0.52, k.alpha(k.c.night, 0)], [1, k.alpha(k.c.night, 0.08)]]));
        k.text("UNDANGAN PERNIKAHAN", CX, 338, { size: 25, spacing: 8, color: k.c.ink, stroke: { color: left, width: 16 } });
        const c = k.couple({ top: 370, maxH: 400, font: "name", size: 118, color: k.c.accent, maxW: 820, lineHeight: 1.08, ampGap: 0.58, stroke: { color: left, width: 18 }, amp: { font: "display", color: k.c.gold, scale: 0.5, italic: true, stroke: { color: left, width: 12 } } });
        const y = Math.max(c.bottom + 200, 950);
        k.fillPath(circlePath(CX, y, 200), k.alpha(k.c.night, 0.06));
        seal(k, CX, y, 158);
        k.text("SENTUH SEGEL UNTUK MEMBUKA", CX, y + 232, { size: 23, spacing: 5, color: k.c.ink, alpha: 0.75, stroke: { color: left, width: 12 }, maxW: 800 });
        k.text(k.d.date, CX, 1404, { font: "display", size: 44, color: k.c.ink, stroke: { color: left, width: 14 }, maxW: 840 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, 1458, { size: 28, color: k.c.ink, alpha: 0.8, stroke: { color: left, width: 12 }, maxW: 840 });
        k.link({ fill: k.c.accent, label: "", y: 1538, h: 78, size: 32 });
      },
    },
    {
      id: "lukisan",
      name: "Lukisan",
      draw: (k) => {
        k.bg(k.c.paper);
        k.photo(k.d.photos.hero, { x: 0, y: 0, w: W, h: 1120 }, { empty: k.c.accent });
        k.bg(k.linear(0, 0, 0, 500, [[0, k.alpha(k.c.night, 0.5)], [1, k.alpha(k.c.night, 0)]]));
        const card = { x: 90, y: 1040, w: 900, h: 680 };
        k.group(() => k.rect(card.x, card.y, card.w, card.h, k.c.wash), { shadow: { color: "#00000066", blur: 50, y: 18 } });
        lined(k, card.x + 18, card.y + 18, card.w - 36, card.h - 36);
        seal(k, CX, card.y, 92);
        k.text("UNDANGAN PERNIKAHAN", CX, card.y + 140, { size: 24, spacing: 8, color: k.c.ink, alpha: 0.85 });
        const c = k.couple({ top: card.y + 148, maxH: 300, font: "name", size: 84, color: k.c.accent, maxW: 790, lineHeight: 1.02, ampGap: 0.42, amp: { italic: true, color: k.c.gold, scale: 0.48 } });
        k.text(k.d.date, CX, c.bottom + 42, { size: 31, color: k.c.ink, maxW: 790 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, c.bottom + 86, { size: 26, color: k.c.ink, alpha: 0.72, maxW: 790 });
        k.link({ fill: k.c.accent, label: "", y: 1590, h: 76, size: 31 });
      },
    },
  ],
};
