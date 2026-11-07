import { archPath, circlePath, CX, H, roundPath, W, type Kit, type ThemeStory } from "../story-kit";

const A = "/img/bonar-anggi";

// Corak ulos: lajur merah, gelap, dan krem berulang dengan garis tipis dan gerigi kecil.
const ulos = (k: Kit, y = 0, h = H, x = 0, w = W) => {
  const red = k.v("--hr-merah", k.c.accent);
  const white = k.v("--hr-putih", k.c.paper);
  const night = k.c.night;
  const bands: [number, string][] = [[56, red], [10, white], [18, night], [6, k.c.gold], [22, red], [6, white], [34, night], [12, k.c.accent], [8, white], [28, red]];
  k.group(() => {
    k.ctx.beginPath();
    k.ctx.rect(x, y, w, h);
    k.ctx.clip();
    let at = x;
    let i = 0;
    while (at < x + w) {
      const [size, color] = bands[i % bands.length];
      k.rect(at, y, size, h, color);
      if (size === 6) for (let j = y; j < y + h; j += 14) k.rect(at - 3, j, 12, 6, color);
      at += size;
      i += 1;
    }
  }, {});
};

// Pita ulos mendatar dengan gerigi di tepi bawah, seperti ujung kain.
const band = (k: Kit, y: number, h: number) => {
  const red = k.v("--hr-merah", k.c.accent);
  const white = k.v("--hr-putih", k.c.paper);
  const rows: [number, string][] = [[0.4, red], [0.06, white], [0.14, k.c.night], [0.05, k.c.gold], [0.35, red]];
  let at = y;
  for (const [part, color] of rows) {
    k.rect(0, at, W, h * part + 1, color);
    at += h * part;
  }
  for (let x = 0; x < W; x += 36) {
    const p = new Path2D();
    p.moveTo(x, at);
    p.lineTo(x + 36, at);
    p.lineTo(x + 18, at + 28);
    p.closePath();
    k.fillPath(p, red);
  }
};

const dusk = (k: Kit) => k.linear(0, 0, 0, H, [[0, k.v("--hr-langit", k.c.night)], [0.42, k.mix(k.v("--hr-merah", k.c.accent), k.c.night, 0.3)], [0.76, k.v("--hr-senja", k.c.accent)], [1, k.mix(k.v("--hr-senja", k.c.accent), k.c.night, 0.45)]]);

const plants = ["alpinia", "bambu", "hibiskus", "kelapa", "pisang", "renealmia", "rumah-depan"];

// Punggung bukit Toba berlapis di belakang rumah bolon.
const hills = (k: Kit, base: number, peak: number, color: string, phase: number) => {
  const p = new Path2D();
  p.moveTo(0, H);
  for (let x = 0; x <= W; x += 20) p.lineTo(x, base - Math.sin(x / 210 + phase) * peak - Math.sin(x / 90 + phase * 2) * peak * 0.25);
  p.lineTo(W, H);
  p.closePath();
  k.fillPath(p, color);
};

const floor = (k: Kit, from: number) => k.bg(k.linear(0, from, 0, H, [[0, k.alpha(k.c.night, 0)], [0.3, k.alpha(k.c.night, 0.94)], [1, k.c.night]]));

// Horas: tenun ulos, rumah bolon, tumbuhan tropis Toba, dan nama skrip emas.
export const story: ThemeStory = {
  assets: () => plants.map((n) => `${A}/${n}.webp`),
  templates: [
    {
      id: "ulos",
      name: "Tenun Ulos",
      draw: (k) => {
        ulos(k);
        k.bg(k.alpha(k.c.night, 0.08));
        k.link({ fill: k.c.goldLight, ink: k.c.night, label: "", y: 1520, radius: 6, h: 96, stroke: k.c.night, shadow: { color: "#00000080", blur: 26, y: 10 } });
        // Foto bundar berbingkai di atas tenun, nama di panel gelap di bawahnya.
        const y = 600;
        const r = 280;
        k.fillPath(circlePath(CX, y, r + 26), k.c.accent, { color: "#00000099", blur: 50, y: 14 });
        k.photo(k.d.photos.couple ?? k.d.photos.hero, { x: CX - r, y: y - r, w: r * 2, h: r * 2 }, { path: circlePath(CX, y, r), empty: k.c.night });
        k.strokePath(circlePath(CX, y, r - 14), k.c.gold, 3);
        const box = { x: 110, y: 940, w: 860, h: 540 };
        k.fillPath(roundPath(box, 8), k.c.night, { color: "#00000099", blur: 40, y: 12 });
        k.strokePath(roundPath({ x: box.x + 16, y: box.y + 16, w: box.w - 32, h: box.h - 32 }, 4), k.c.gold, 3);
        k.text("U N D A N G A N", CX, 1010, { size: 26, spacing: 6, color: k.c.goldLight });
        const c = k.couple({ top: 1034, maxH: 250, font: "name", size: 110, color: k.c.goldLight, maxW: 740, lineHeight: 1.1, ampGap: 0.4, amp: { color: k.c.gold, scale: 0.34 } });
        for (let x = CX - 140; x <= CX + 140; x += 40) {
          const p = new Path2D();
          p.moveTo(x - 20, c.bottom + 24);
          p.lineTo(x + 20, c.bottom + 24);
          p.lineTo(x, c.bottom + 48);
          p.closePath();
          k.fillPath(p, k.c.gold);
        }
        k.text(k.d.date, CX, c.bottom + 100, { size: 34, color: k.c.goldLight, maxW: 740 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, c.bottom + 144, { size: 27, color: k.c.goldLight, alpha: 0.82, maxW: 740 });
      },
    },
    {
      id: "rumah-bolon",
      name: "Rumah Bolon",
      draw: (k) => {
        k.bg(dusk(k));
        hills(k, 860, 110, k.alpha(k.c.night, 0.32), 0.6);
        hills(k, 1000, 90, k.alpha(k.c.night, 0.5), 2.4);
        k.art(`${A}/bambu.webp`, 120, 970, 480);
        k.art(`${A}/kelapa.webp`, 960, 860, 540);
        k.art(`${A}/rumah-depan.webp`, CX, 1020, 560, { shadow: { color: "#00000099", blur: 38, y: 12 } });
        floor(k, 1190);
        k.art(`${A}/pisang.webp`, 80, 1240, 400);
        k.art(`${A}/hibiskus.webp`, 990, 1280, 300);
        k.text("HORAS!", CX, 306, { font: "display", size: 44, spacing: 12, weight: 600, color: k.c.goldLight });
        k.couple({ top: 322, maxH: 290, font: "name", size: 112, color: k.c.goldLight, maxW: 800, lineHeight: 1.08, ampGap: 0.38, amp: { color: k.c.gold, scale: 0.34 } });
        k.text(k.d.date.toLocaleUpperCase("id-ID"), CX, 1436, { font: "display", size: 34, spacing: 3, color: k.c.goldLight, maxW: 920 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, 1484, { size: 28, color: k.c.goldLight, alpha: 0.85, maxW: 900 });
        k.link({ fill: k.c.goldLight, ink: k.c.night, label: "", y: 1540, radius: 6 });
      },
    },
    {
      id: "gorga",
      name: "Gerbang Gorga",
      draw: (k) => {
        k.bg(dusk(k));
        floor(k, 1240);
        band(k, 0, 200);
        k.text("PERNIKAHAN", CX, 296, { size: 25, spacing: 9, color: k.c.goldLight });
        const name = k.text(k.d.groom, CX, 392, { font: "name", size: 92, color: k.c.goldLight, maxW: 880 });
        k.text(`& ${k.d.bride}`, CX, 490, { font: "name", size: name, color: k.c.goldLight, maxW: 880 });
        const arch = { x: 190, y: 540, w: 700, h: 810 };
        k.fillPath(archPath({ x: 156, y: 506, w: 768, h: 844 }), k.c.night, { color: "#00000080", blur: 30, y: 10 });
        k.strokePath(archPath({ x: 156, y: 506, w: 768, h: 844 }), k.c.gold, 4);
        k.strokePath(archPath({ x: 174, y: 524, w: 732, h: 826 }), k.c.accent, 6);
        k.photo(k.d.photos.closing ?? k.d.photos.hero, arch, { path: archPath(arch), empty: k.c.night });
        k.art(`${A}/pisang.webp`, 80, 1140, 480);
        k.art(`${A}/renealmia.webp`, 1010, 1170, 400);
        k.art(`${A}/hibiskus.webp`, 170, 1320, 300);
        k.art(`${A}/alpinia.webp`, 930, 1320, 320);
        k.text(k.d.date.toLocaleUpperCase("id-ID"), CX, 1424, { font: "display", size: 33, spacing: 3, color: k.c.goldLight, maxW: 900 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, 1474, { size: 28, color: k.c.goldLight, alpha: 0.88, maxW: 900 });
        k.link({ fill: k.c.goldLight, ink: k.c.night, label: "", y: 1530, radius: 6 });
      },
    },
  ],
};
