import { archPath, burstPath, circlePath, CX, H, heartPath, rectPath, roundPath, W, type Box, type Kit, type ThemeStory } from "../story-kit";

const A = "/img/galih-ardila";

const pop = (k: Kit) => k.c.accent;
const pop2 = (k: Kit) => k.c.gold;
const sun = (k: Kit) => k.v("--tp-sun", "#F2B632");

// Nama retro: isi warna, garis luar, dan bayangan keras yang bergeser.
const retro = (k: Kit, s: string, x: number, y: number, size: number, fill: string, maxW = 920, align: CanvasTextAlign = "center") => {
  const o = { font: "name" as const, align };
  const fit = k.fit(s, { ...o, size, maxW });
  k.text(s, x + fit * 0.05, y + fit * 0.05, { ...o, size: fit, color: k.c.ink, stroke: { color: k.c.ink, width: fit * 0.09 } });
  k.text(s, x, y, { ...o, size: fit, color: fill, stroke: { color: k.c.ink, width: fit * 0.06 } });
  return fit;
};

const pill = (k: Kit, s: string, x: number, y: number, fill: string, ink = k.c.ink, max = 30) => {
  const size = k.fit(s, { font: "label", size: max, spacing: 3, maxW: 880 });
  const w = k.measure(s, { font: "label", size, spacing: 3 }, size) + 56;
  const box = { x: x - w / 2, y: y - size * 0.9, w, h: size * 1.7 };
  k.fillPath(roundPath(box, box.h / 2), fill, { color: k.c.ink, x: 3, y: 4 });
  k.strokePath(roundPath(box, box.h / 2), k.c.ink, 3.5);
  k.text(s, x, y + size * 0.26, { font: "label", size, spacing: 3, color: ink });
};

const sticker = (k: Kit, s: string, x: number, y: number, r: number, fill: string, rot: number) => {
  k.fillPath(burstPath(x + 5, y + 6, r, r * 0.8, 13, rot), k.c.ink);
  k.fillPath(burstPath(x, y, r, r * 0.8, 13, rot), fill);
  k.strokePath(burstPath(x, y, r, r * 0.8, 13, rot), k.c.ink, 3.5);
  k.group(() => k.text(s, x, y + r * 0.13, { font: "name", size: Math.round(r * 0.42), color: k.c.ink, maxW: r * 1.6 }), { at: [x, y], rot });
};

const flower = (k: Kit, x: number, y: number, r: number, fill: string) => {
  for (let i = 0; i < 6; i += 1) {
    const a = (Math.PI * i) / 3;
    const px = x + Math.cos(a) * r * 0.62;
    const py = y + Math.sin(a) * r * 0.62;
    k.fillPath(circlePath(px, py, r * 0.46), fill);
    k.strokePath(circlePath(px, py, r * 0.46), k.c.ink, 3);
  }
  k.fillPath(circlePath(x, y, r * 0.36), sun(k));
  k.strokePath(circlePath(x, y, r * 0.36), k.c.ink, 3);
};

const heart = (k: Kit, x: number, y: number, s: number, fill: string) => {
  k.fillPath(heartPath(x + 4, y + 4, s), k.c.ink);
  k.fillPath(heartPath(x, y, s), fill);
  k.strokePath(heartPath(x, y, s), k.c.ink, 3.5);
};

const rays = (k: Kit, x: number, y: number, a: string, b: string, count = 22) => {
  k.bg(a);
  for (let i = 0; i < count; i += 2) {
    const start = (Math.PI * 2 * i) / count;
    const end = (Math.PI * 2 * (i + 1)) / count;
    const p = new Path2D();
    p.moveTo(x, y);
    p.lineTo(x + Math.cos(start) * 2400, y + Math.sin(start) * 2400);
    p.lineTo(x + Math.cos(end) * 2400, y + Math.sin(end) * 2400);
    p.closePath();
    k.fillPath(p, b);
  }
};

const dots = (k: Kit, box: Box, color: string, gap = 22, r = 3) => {
  k.group(() => {
    k.ctx.clip(rectPath(box));
    for (let y = box.y, j = 0; y < box.y + box.h; y += gap, j += 1) for (let x = box.x + (j % 2 ? gap / 2 : 0); x < box.x + box.w; x += gap) k.fillPath(circlePath(x, y, r), color);
  }, {});
};

// Kabar Retro: stiker tebal, sinar matahari, nama Shrikhand berbayangan keras, dan tekstur kertas kraft.
export const story: ThemeStory = {
  assets: () => [`${A}/kraft.webp`, `${A}/krem.webp`],
  templates: [
    {
      id: "sinar",
      name: "Sinar Retro",
      draw: (k) => {
        rays(k, CX, 900, k.mix(k.c.paper, sun(k), 0.35), k.mix(pop(k), k.c.paper, 0.45));
        k.art(`${A}/kraft.webp`, CX, H / 2, W, { h: H, alpha: 0.3, mode: "multiply" });
        pill(k, "KABAR RETRO  ·  NO. 27", 280, 296, k.c.card);
        pill(k, "EDISI SPESIAL", 836, 296, sun(k));
        retro(k, "Kami", 270, 440, 124, k.c.card, 500, "left");
        retro(k, "Menikah!", 140, 562, 124, sun(k), 800, "left");
        const photo = { x: 120, y: 620, w: 840, h: 690 };
        k.group(
          () => {
            k.fillPath(roundPath({ x: photo.x + 12, y: photo.y + 14, w: photo.w, h: photo.h }, 28), k.c.ink);
            k.fillPath(roundPath(photo, 28), k.c.card);
            k.strokePath(roundPath(photo, 28), k.c.ink, 5);
            const inner = { x: photo.x + 24, y: photo.y + 24, w: photo.w - 48, h: photo.h - 48 };
            k.photo(k.d.photos.hero, inner, { path: roundPath(inner, 14), empty: k.c.paper });
            k.strokePath(roundPath(inner, 14), k.c.ink, 4);
          },
          { at: [CX, 960], rot: -0.035 },
        );
        sticker(k, "Sah!", 912, 642, 112, sun(k), 0.24);
        heart(k, 130, 1268, 66, pop(k));
        flower(k, 948, 1260, 62, k.c.card);
        pill(k, `${k.d.groom} & ${k.d.bride}`.toLocaleUpperCase("id-ID"), CX, 1370, k.c.card, k.c.ink, 40);
        k.text(k.d.date, CX, 1456, { font: "label", size: 46, spacing: 2, color: k.c.ink, stroke: { color: k.c.card, width: 8 }, maxW: 940 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, 1508, { size: 30, weight: 600, color: k.c.ink, stroke: { color: k.c.card, width: 7 }, maxW: 940 });
        k.link({ fill: pop(k), ink: "#FFFFFF", stroke: k.c.ink, label: "", y: 1550, shadow: { color: k.c.ink, x: 4, y: 6 } });
      },
    },
    {
      id: "koran",
      name: "Halaman Koran",
      draw: (k) => {
        k.bg(k.c.card);
        k.art(`${A}/krem.webp`, CX, H / 2, W, { h: H, mode: "multiply" });
        const ink = k.c.ink;
        k.rect(60, 248, W - 120, 8, ink);
        k.text("KABAR RETRO", CX, 366, { font: "name", size: 112, color: ink, maxW: W - 120 });
        k.rect(60, 392, W - 120, 3, ink);
        k.text(`NO. 27`, 64, 432, { font: "label", size: 34, spacing: 2, color: ink, align: "left" });
        k.text(k.d.date.toLocaleUpperCase("id-ID"), W - 64, 432, { font: "label", size: 34, spacing: 2, color: ink, align: "right", maxW: 700 });
        k.rect(60, 448, W - 120, 8, ink);
        const c = k.couple({ top: 462, font: "name", size: 100, color: pop(k), maxW: W - 130, lineHeight: 1.02, ampGap: 0.42, amp: { color: k.c.ink, scale: 0.38 } });
        const y = c.bottom + 8;
        const box = { x: 60, y, w: W - 120, h: 1280 - y };
        k.photo(k.d.photos.couple ?? k.d.photos.hero, box, { tone: "mono", empty: k.c.paper });
        dots(k, box, k.alpha(ink, 0.14), 11, 2.2);
        k.strokePath(rectPath(box), ink, 4);
        sticker(k, "Sah!", 924, y + 60, 100, sun(k), 0.2);
        k.line(CX, 1306, CX, 1500, ink, 2);
        const body = { font: "type" as const, size: 28, color: ink, align: "left" as const, width: 440, lineHeight: 1.36, maxLines: 5 };
        k.para("Dengan penuh sukacita, kedua mempelai mengundang Anda untuk hadir dan memberikan doa restu.", 64, 1342, body);
        k.text("TEMPAT ACARA", 570, 1342, { font: "label", size: 30, spacing: 2, color: pop(k), align: "left" });
        k.para([k.d.venue, k.d.city].filter(Boolean).join(", "), 570, 1386, { ...body, width: 446, maxLines: 3 });
        k.link({ fill: ink, ink: k.c.card, label: "", y: 1536, radius: 0, font: "type", size: 34 });
      },
    },
    {
      id: "lengkung",
      name: "Lengkung Pop",
      draw: (k) => {
        k.bg(k.c.paper);
        k.art(`${A}/kraft.webp`, CX, H / 2, W, { h: H, alpha: 0.5, mode: "multiply" });
        dots(k, { x: 0, y: 0, w: W, h: 760 }, k.alpha(pop(k), 0.28), 28, 4);
        pill(k, "UNDANGAN PERNIKAHAN", CX, 296, k.c.card, pop(k));
        const outer = { x: 130, y: 350, w: 820, h: 840 };
        k.fillPath(archPath({ ...outer, x: outer.x + 10, y: outer.y + 12 }), k.c.ink);
        k.group(() => {
          k.ctx.clip(archPath(outer));
          k.rect(outer.x, outer.y, outer.w, outer.h, k.c.card);
          for (let i = -30; i < 60; i += 2) {
            const p = new Path2D();
            p.moveTo(outer.x + i * 34, outer.y + outer.h);
            p.lineTo(outer.x + i * 34 + 34, outer.y + outer.h);
            p.lineTo(outer.x + i * 34 + 34 + outer.h, outer.y);
            p.lineTo(outer.x + i * 34 + outer.h, outer.y);
            p.closePath();
            k.fillPath(p, pop2(k));
          }
        }, {});
        k.strokePath(archPath(outer), k.c.ink, 5);
        const inner = { x: 172, y: 392, w: 736, h: 756 };
        k.photo(k.d.photos.hero, inner, { path: archPath(inner), empty: k.c.wash });
        k.strokePath(archPath(inner), k.c.ink, 5);
        flower(k, 180, 440, 78, k.c.card);
        sticker(k, "Sah!", 906, 480, 112, sun(k), 0.2);
        heart(k, 164, 1120, 62, pop(k));
        flower(k, 918, 1130, 54, k.c.card);
        const size = retro(k, k.d.groom, CX, 1302, 118, pop(k), 920);
        k.fillPath(circlePath(CX, 1342, 38), sun(k));
        k.strokePath(circlePath(CX, 1342, 38), k.c.ink, 3.5);
        k.text("&", CX, 1358, { font: "display", size: 44, color: k.c.ink });
        retro(k, k.d.bride, CX, 1460, size, pop2(k), 920);
        pill(k, k.d.date.toLocaleUpperCase("id-ID"), CX, 1520, k.c.card, k.c.ink, 28);
        k.link({ fill: pop(k), ink: "#FFFFFF", stroke: k.c.ink, label: "", y: 1570, h: 80, shadow: { color: k.c.ink, x: 4, y: 6 } });
      },
    },
  ],
};
