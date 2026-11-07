import { CX, H, roundPath, type Box, type Kit, type ThemeStory } from "../story-kit";

const A = "/img/dimas-salsa";

// Kartu dialog khas Piksel: krem, sudut bulat, garis luar gelap tebal, dan bayangan keras.
const card = (k: Kit, b: Box, r = 34) => {
  k.fillPath(roundPath({ ...b, x: b.x + 7, y: b.y + 10 }, r), k.c.night);
  k.fillPath(roundPath(b, r), k.c.card);
  k.strokePath(roundPath(b, r), k.c.night, 6);
};

const chip = (k: Kit, s: string, y: number, size = 28, x = CX) => {
  const w = k.measure(s, { font: "display", size, spacing: 4, weight: 600 }, size) + 70;
  card(k, { x: x - w / 2, y, w, h: size * 2.3 }, size * 1.15);
  k.text(s, x, y + size * 1.5, { font: "display", size, spacing: 4, weight: 600, color: k.c.ink });
};

// Latar isometrik piksel dibesarkan dengan tepi tajam, dan diberi gelap tipis supaya kartu menonjol.
const scene = (k: Kit, src: string, cx: number, scale: number, y = H / 2) => {
  k.bg(k.v("--inv-grass", k.c.accent));
  k.art(src, cx, y, 558 * scale, { crisp: true });
};

const coupleSprite = (k: Kit, x: number, y: number, w: number) => k.art(`${A}/couple-sprite.png`, x, y, w, { crisp: true, shadow: { color: "#00000055", y: 8 } });

const button = (k: Kit, y: number) => {
  k.link({ fill: k.c.accent, ink: "#FFFFFF", stroke: k.c.night, label: "", y, shadow: { color: k.c.night, x: 5, y: 7 }, font: "display" });
};

// Piksel: kota piksel, aula resepsi, sprite pengantin, dan kartu dialog dengan huruf Fredoka.
export const story: ThemeStory = {
  assets: () => ["town.png", "hall.png", "couple-sprite.png"].map((n) => `${A}/${n}`),
  templates: [
    {
      id: "kota",
      name: "Kota Pesta",
      draw: (k) => {
        const scale = 1920 / 314;
        scene(k, `${A}/town.png`, 500, scale);
        chip(k, "UNDANGAN PERNIKAHAN", 270);
        const b = { x: 80, y: 370, w: 920, h: 640 };
        card(k, b);
        k.text("Kamu diundang ke gedung!", CX, 452, { font: "display", size: 36, weight: 600, color: k.c.ink, maxW: 840 });
        const c = k.couple({ top: 480, maxH: 400, font: "name", weight: 600, size: 108, color: k.c.accent, maxW: 840, lineHeight: 1.04, ampGap: 0.52, amp: { font: "display", weight: 700, color: k.c.ink, scale: 0.44 } });
        k.text(k.d.date, CX, c.bottom + 54, { font: "display", size: 34, weight: 500, color: k.c.ink, maxW: 840 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, c.bottom + 102, { size: 28, weight: 600, color: k.c.ink, alpha: 0.75, maxW: 840 });
        coupleSprite(k, CX, 1320, 500);
        button(k, 1560);
      },
    },
    {
      id: "aula",
      name: "Aula Resepsi",
      draw: (k) => {
        const scale = 1920 / 642;
        k.bg(k.c.night);
        k.art(`${A}/hall.png`, 540, 1050, 1008 * scale * 0.82, { crisp: true });
        k.bg(k.linear(0, 0, 0, 700, [[0, k.alpha(k.c.night, 0.9)], [1, k.alpha(k.c.night, 0)]]));
        k.bg(k.linear(0, 1420, 0, H, [[0, k.alpha(k.c.night, 0)], [1, k.alpha(k.c.night, 0.9)]]));
        chip(k, "SELAMAT DATANG DI AULA", 268, 26);
        const name = k.text(k.d.groom, CX, 470, { font: "name", weight: 600, size: 106, color: "#FFFFFF", maxW: 900, stroke: { color: k.c.night, width: 14 } });
        k.text(`& ${k.d.bride}`, CX, 584, { font: "name", weight: 600, size: name, color: k.v("--inv-gold-light", "#F2D28A"), maxW: 900, stroke: { color: k.c.night, width: 14 } });
        // Foto dipajang di panggung aula seperti layar besar, sprite pengantin berdiri di sudutnya.
        card(k, { x: 140, y: 630, w: 800, h: 600 });
        const p = { x: 170, y: 660, w: 740, h: 540 };
        k.photo(k.d.photos.closing ?? k.d.photos.hero, p, { path: roundPath(p, 22), empty: k.c.wash });
        k.strokePath(roundPath(p, 22), k.c.night, 5);
        coupleSprite(k, 860, 1190, 200);
        const b = { x: 110, y: 1270, w: 860, h: 240 };
        card(k, b);
        k.text(k.d.date, CX, b.y + 76, { font: "display", size: 38, weight: 600, color: k.c.ink, maxW: 790 });
        k.para([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, b.y + 132, { size: 29, weight: 600, color: k.c.ink, alpha: 0.78, width: 790, maxLines: 2, lineHeight: 1.25 });
        button(k, 1560);
      },
    },
    {
      id: "foto",
      name: "Kartu Foto",
      draw: (k) => {
        const scale = 1920 / 314;
        scene(k, `${A}/town.png`, 720, scale);
        k.bg(k.alpha(k.c.night, 0.18));
        const b = { x: 110, y: 250, w: 860, h: 1260 };
        card(k, b, 44);
        k.text("Selamat datang", CX, 334, { font: "display", size: 42, weight: 600, color: k.c.accent });
        const p = { x: 164, y: 372, w: 752, h: 680 };
        k.photo(k.d.photos.hero, p, { path: roundPath(p, 24), empty: k.c.wash });
        k.strokePath(roundPath(p, 24), k.c.night, 5);
        k.art(`${A}/couple-sprite.png`, 836, 1040, 210, { crisp: true });
        k.text("★ ★ ★", CX, 1110, { font: "display", size: 30, color: k.c.accent, spacing: 4 });
        k.text(`${k.d.groom} & ${k.d.bride}`, CX, 1190, { font: "name", weight: 600, size: 78, color: k.c.ink, maxW: 780 });
        k.text(k.d.date, CX, 1252, { font: "display", size: 32, weight: 500, color: k.c.ink, maxW: 780 });
        k.para([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, 1302, { size: 27, weight: 600, color: k.c.ink, alpha: 0.75, width: 760, maxLines: 2, lineHeight: 1.26 });
        k.text("Sampai jumpa di gedung ya!", CX, 1452, { font: "display", size: 30, weight: 500, color: k.c.accent, maxW: 760 });
        button(k, 1560);
      },
    },
  ],
};
