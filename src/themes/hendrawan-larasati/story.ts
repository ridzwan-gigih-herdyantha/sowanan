import { CX, H, roundPath, W, type Kit, type ThemeStory } from "../story-kit";

const GRAIN = "/img/hendrawan-larasati/grain.webp";

const tape = (k: Kit, x: number, y: number, w: number, rot: number) => {
  k.group(() => k.rect(x - w / 2, y - 24, w, 48, k.v("--hl-tape", k.c.goldLight), 0.68), { at: [x, y], rot });
};

// Foto ditempel seperti lembar herbarium: kertas putih, bayangan tipis, dan selotip di tepinya.
const pinned = (k: Kit, p: Kit["d"]["photos"]["hero"], x: number, y: number, w: number, h: number, rot: number, mat = 18) => {
  const cx = x + w / 2;
  const cy = y + h / 2;
  k.group(
    () => {
      k.fillPath(roundPath({ x, y, w, h }, 2), k.c.wash, { color: "#00000055", blur: 34, y: 14 });
      k.photo(p, { x: x + mat, y: y + mat, w: w - mat * 2, h: h - mat * 2 }, { empty: k.c.paper });
    },
    { at: [cx, cy], rot },
  );
};

const labelNo = (k: Kit) => k.d.dateShort.replace(/\D/g, "").slice(0, 4);

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
        pinned(k, k.d.photos.hero, 92, 690, 800, 720, -0.012);
        tape(k, 480, 690, 210, 0.03);
        pinned(k, k.d.photos.extra[0] ?? k.d.photos.couple, 748, 628, 256, 290, 0.08, 14);
        tape(k, 874, 628, 110, -0.05);
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
