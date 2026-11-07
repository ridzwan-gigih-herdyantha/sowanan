import { CX, H, roundPath, W, type Kit, type ThemeStory } from "../story-kit";

const GRAIN = "/img/hendrawan-larasati/grain.webp";

const tape = (k: Kit, x: number, y: number, w: number, rot: number) => {
  k.group(() => k.rect(x - w / 2, y - 24, w, 48, k.v("--hl-tape", k.c.goldLight), 0.68), { at: [x, y], rot });
};

// Ranting daun herbarium: batang melengkung dengan daun berselang kiri dan kanan.
const sprig = (k: Kit, x: number, base: number, h: number) => {
  const color = k.c.accent;
  const top = base - h;
  const at = (t: number) => ({ x: x + Math.sin(t * Math.PI) * 26, y: base - t * h });
  const stem = new Path2D();
  stem.moveTo(x, base);
  stem.quadraticCurveTo(x + 52, base - h / 2, x, top);
  k.strokePath(stem, color, 5);
  for (let i = 1; i <= 7; i += 1) {
    const t = i / 8;
    const p = at(t);
    const side = i % 2 ? -1 : 1;
    const len = 70 * (1 - t * 0.45);
    const leaf = new Path2D();
    leaf.ellipse(p.x + side * len * 0.8, p.y - len * 0.25, len, len * 0.36, side * -0.5, 0, Math.PI * 2);
    k.fillPath(leaf, k.alpha(color, 0.85));
    k.line(p.x, p.y, p.x + side * len * 1.5, p.y - len * 0.6, k.c.wash, 2, 0.6);
  }
  const tip = new Path2D();
  tip.ellipse(x, top - 34, 22, 48, 0, 0, Math.PI * 2);
  k.fillPath(tip, k.alpha(color, 0.85));
};

const labelNo =(k: Kit) => k.d.dateShort.replace(/\D/g, "").slice(0, 4);

// Herbarium: lembar koleksi botani, selotip, label bergaris, dan nama latin mempelai.
export const story: ThemeStory = {
  assets: () => [GRAIN],
  templates: [
    {
      id: "lembar",
      name: "Lembar Koleksi",
      draw: (k) => {
        k.bg(k.c.paper);
        k.grain(GRAIN, 0.45);
        k.text(`LEMBAR KOLEKSI NO. ${labelNo(k)}`, 80, 300, { size: 25, spacing: 6, color: k.c.ink, align: "left" });
        const c = k.couple({ x: 76, top: 322, align: "left", font: "name", size: 118, color: k.c.accent, maxW: 930, lineHeight: 1.06, ampGap: 0.72, amp: { color: k.c.accent, italic: true, scale: 0.72 } });
        const y = c.bottom + 44;
        const card = { x: 80, y, w: 920, h: 1460 - y };
        k.group(
          () => {
            k.fillPath(roundPath(card, 3), k.c.wash, { color: "#00000033", blur: 30, y: 12 });
            const inner = { x: 124, y: y + 88, w: 832, h: card.h - 300 };
            k.photo(k.d.photos.hero, inner, { empty: k.c.paper });
            k.line(124, y + 66, 956, y + 66, k.c.line, 2);
            k.text("HERBARIUM SOWANAN", 124, y + 50, { size: 21, spacing: 5, color: k.c.ink, align: "left" });
            k.text(`NO. ${labelNo(k)}`, 956, y + 50, { size: 21, spacing: 5, color: k.c.ink, align: "right" });
            const row = inner.y + inner.h;
            k.line(CX, row + 24, CX, card.y + card.h - 24, k.c.line, 2);
            k.text("TANGGAL", 124, row + 62, { size: 21, spacing: 5, color: k.c.ink, align: "left", alpha: 0.7 });
            k.text(k.d.dateShort.replace(/\s/g, ""), 124, row + 122, { font: "display", size: 44, color: k.c.ink, align: "left", maxW: 390 });
            k.text("LOKASI", 574, row + 62, { size: 21, spacing: 5, color: k.c.ink, align: "left", alpha: 0.7 });
            k.text(k.d.city || k.d.venue, 574, row + 122, { font: "display", size: 44, color: k.c.ink, align: "left", maxW: 382 });
          },
          { at: [CX, y + card.h / 2], rot: -0.008 },
        );
        tape(k, 240, y + 4, 190, -0.08);
        k.link({ fill: k.c.accent, label: "", y: 1540, radius: 4, shadow: { color: k.alpha(k.c.night, 0.4), blur: 18, y: 8 } });
      },
    },
    {
      id: "spesimen",
      name: "Spesimen",
      draw: (k) => {
        k.bg(k.c.paper);
        k.grain(GRAIN, 0.45);
        k.text(k.d.monogram, 80, 296, { font: "display", size: 34, color: k.c.ink, align: "left", spacing: 6 });
        k.text(`NO. ${labelNo(k)}`, W - 80, 296, { size: 24, spacing: 5, color: k.c.ink, align: "right" });
        k.text("UNDANGAN PERNIKAHAN", CX, 366, { size: 24, spacing: 8, color: k.c.ink, alpha: 0.8 });
        const name = k.text(k.d.groom, CX, 470, { font: "name", size: 104, color: k.c.accent, maxW: 900 });
        k.text(`& ${k.d.bride}`, CX, 576, { font: "name", size: name, color: k.c.accent, maxW: 900 });
        if (k.d.latinPair) k.text(k.d.latinPair, CX, 640, { font: "display", size: 34, italic: true, color: k.c.ink, alpha: 0.72, maxW: 840 });
        // Lembar spesimen tanpa foto: ranting daun digambar, ditempel selotip, dengan tabel label koleksi.
        const card = { x: 92, y: 690, w: 896, h: 730 };
        k.group(
          () => {
            k.fillPath(roundPath(card, 2), k.c.wash, { color: "#00000044", blur: 30, y: 12 });
            sprig(k, CX, 1100, 300);
            const rows: [string, string][] = [
              ["NAMA", `${k.d.groom} & ${k.d.bride}`],
              ["TANGGAL", k.d.date],
              ["LOKASI", [k.d.venue, k.d.city].filter(Boolean).join(", ")],
            ];
            k.line(140, 1130, 940, 1130, k.c.line, 2);
            rows.forEach(([label, value], i) => {
              const y = 1130 + (i + 1) * 86;
              k.text(label, 140, y - 30, { size: 20, spacing: 5, color: k.c.ink, align: "left", alpha: 0.7 });
              k.text(value, 330, y - 28, { font: "display", size: 34, color: k.c.ink, align: "left", maxW: 610 });
              k.line(140, y, 940, y, k.c.line, 1.5, 0.7);
            });
          },
          { at: [CX, card.y + card.h / 2], rot: -0.01 },
        );
        tape(k, CX - 10, 1085, 160, 0.05);
        tape(k, 230, 700, 170, -0.06);
        k.text([k.d.dateShort, k.d.city].filter(Boolean).join("   ·   "), CX, 1488, { size: 29, spacing: 4, color: k.c.ink, upper: true, maxW: 940 });
        k.link({ fill: k.c.accent, label: "", y: 1540, radius: 4 });
      },
    },
    {
      id: "plat",
      name: "Plat Botani",
      draw: (k) => {
        k.photo(k.d.photos.closing ?? k.d.photos.hero, { x: 0, y: 0, w: W, h: H }, { empty: k.c.accent, emptyInk: k.c.accent });
        k.bg(k.linear(0, 0, 0, 560, [[0, k.alpha(k.c.night, 0.55)], [1, k.alpha(k.c.night, 0)]]));
        k.strokePath(roundPath({ x: 44, y: 44, w: W - 88, h: H - 88 }, 2), k.mix(k.c.paper, "#FFFFFF", 0.3), 3, 0.85);
        const card = { x: 108, y: 1010, w: 864, h: 700 };
        k.fillPath(roundPath(card, 3), k.c.paper, { color: "#00000066", blur: 40, y: 16 });
        tape(k, CX, card.y + 2, 220, -0.03);
        k.text(`PLAT ${labelNo(k)}  ·  UNDANGAN PERNIKAHAN`, CX, card.y + 68, { size: 22, spacing: 5, color: k.c.ink, alpha: 0.8, maxW: 780 });
        const c = k.couple({ top: card.y + 86, maxH: 334, font: "name", size: 96, color: k.c.accent, maxW: 760, lineHeight: 1.04, ampGap: 0.5, amp: { italic: true, color: k.c.accent, scale: 0.55 } });
        if (k.d.latinPair) k.text(k.d.latinPair, CX, c.bottom + 34, { font: "display", size: 30, italic: true, color: k.c.ink, alpha: 0.72, maxW: 760 });
        k.line(160, c.bottom + 58, 920, c.bottom + 58, k.c.line, 2);
        k.text(k.d.date, CX, c.bottom + 112, { font: "display", size: 38, color: k.c.ink, maxW: 780 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, c.bottom + 158, { size: 26, color: k.c.ink, alpha: 0.78, maxW: 780 });
        k.link({ fill: k.c.accent, label: "", y: 1600, h: 78, size: 32, radius: 4 });
      },
    },
  ],
};
