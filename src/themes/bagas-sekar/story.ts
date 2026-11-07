import { archPath, CX, H, W, type ThemeStory } from "../story-kit";

const GRAIN = "/img/bagas-sekar/grain.webp";

// Ruang: garis denah arsitektur, nama yang berseberangan, dan foto hitam putih. Template Denah sengaja tanpa foto.
export const story: ThemeStory = {
  assets: () => [GRAIN],
  templates: [
    {
      id: "denah",
      name: "Denah",
      draw: (k) => {
        k.bg(k.c.paper);
        k.grain(GRAIN, 0.4);
        const rule = k.alpha(k.c.ink, 0.28);
        k.line(CX, 0, CX, 760, rule, 2);
        k.line(0, 760, W, 760, rule, 2);
        k.line(0, 1420, W, 1420, rule, 2);
        k.line(CX, 1420, CX, H, rule, 2);
        k.para(k.d.groom, 56, 420, { font: "name", size: 118, color: k.c.ink, align: "left", width: 460, lineHeight: 1.05 });
        k.para(k.d.bride, W - 56, 610, { font: "name", size: 118, color: k.c.ink, align: "right", italic: true, width: 460, lineHeight: 1.05 });
        // Petak tengah berisi kisi denah dan tanggal besar sebagai ganti foto.
        for (let x = 60; x < W; x += 60) k.line(x, 760, x, 1420, rule, 1, 0.45);
        for (let y = 820; y < 1420; y += 60) k.line(0, y, W, y, rule, 1, 0.45);
        k.rect(56, 860, 450, 460, k.c.paper);
        k.text(k.d.day, 281, 1210, { font: "display", size: 360, color: k.c.ink, maxW: 430 });
        k.rect(W - 506, 860, 450, 460, k.c.paper);
        k.text(k.d.month.toLocaleUpperCase("id-ID"), W - 76, 960, { font: "display", size: 52, spacing: 4, color: k.c.ink, align: "right", maxW: 410 });
        k.text(k.d.year, W - 76, 1030, { font: "display", size: 52, spacing: 4, color: k.c.ink, align: "right", alpha: 0.7 });
        k.line(W - 486, 1080, W - 76, 1080, k.c.ink, 2, 0.5);
        k.para([k.d.venue, k.d.city].filter(Boolean).join(", "), W - 76, 1140, { size: 30, color: k.c.ink, align: "right", width: 410, maxLines: 4, lineHeight: 1.3 });
        k.text("KAMI MENGUNDANGMU", 56, 1478, { size: 24, spacing: 7, color: k.c.ink, align: "left", alpha: 0.75, maxW: 460 });
        k.text(k.d.weekday, W - 56, 1478, { font: "display", size: 36, color: k.c.ink, align: "right", spacing: 3, maxW: 460 });
        k.link({ fill: k.c.ink, label: "", y: 1540, radius: 4, size: 34 });
      },
    },
    {
      id: "lengkung",
      name: "Lengkung",
      draw: (k) => {
        k.bg(k.c.paper);
        k.grain(GRAIN, 0.4);
        k.text("KAMI MENGUNDANGMU KE PERNIKAHAN", CX, 296, { size: 23, spacing: 6, color: k.c.ink, alpha: 0.72, maxW: 900 });
        k.text(`${k.d.groom} & ${k.d.bride}`, CX, 406, { font: "name", size: 112, color: k.c.ink, maxW: 950 });
        const arch = { x: 150, y: 450, w: 780, h: 800 };
        k.photo(k.d.photos.hero, arch, { path: archPath(arch), tone: "mono", empty: k.c.wash });
        k.strokePath(archPath({ x: 128, y: 428, w: 824, h: 822 }), k.alpha(k.c.ink, 0.3), 2);
        k.text(k.d.tagline || "Dua hati, satu arah.", CX, 1330, { font: "display", size: 46, italic: true, color: k.c.ink, maxW: 860 });
        k.text([k.d.date, k.d.city].filter(Boolean).join("  ·  "), CX, 1400, { size: 27, spacing: 4, color: k.c.ink, upper: true, maxW: 950 });
        k.text(k.d.venue, CX, 1448, { size: 28, color: k.c.ink, alpha: 0.72, maxW: 900 });
        k.link({ fill: k.c.ink, label: "", y: 1540, radius: 4, size: 34 });
      },
    },
    {
      id: "monokrom",
      name: "Monokrom",
      draw: (k) => {
        const light = "#F4F2EE";
        k.bg("#0B0B0B");
        k.photo(k.d.photos.closing ?? k.d.photos.hero, { x: 0, y: 0, w: W, h: 1300 }, { tone: "mono", empty: "#2A2A2A", emptyInk: "#8A8A8A" });
        k.bg(k.linear(0, 0, 0, H, [[0, "#000000B8"], [0.22, "#00000018"], [0.42, "#00000020"], [0.67, "#0B0B0B"], [1, "#0B0B0B"]]));
        k.text(k.d.monogram.replace(/\s*&\s*/, " / "), 70, 300, { font: "display", size: 44, color: light, align: "left" });
        k.text(k.d.dateShort, W - 70, 300, { font: "display", size: 38, color: light, align: "right", spacing: 3 });
        k.line(70, 330, W - 70, 330, light, 2, 0.5);
        const c = k.couple({ x: 70, bottom: 1400, align: "left", font: "name", size: 136, color: light, maxW: 930, italic: true, lineHeight: 1, ampGap: 0.46, amp: { color: light, scale: 0.42 } });
        k.line(70, c.bottom + 20, W - 70, c.bottom + 20, light, 2, 0.5);
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), 70, c.bottom + 70, { size: 31, color: light, align: "left", maxW: 930 });
        k.link({ fill: light, ink: "#111111", label: "", y: 1540, radius: 4, size: 34 });
      },
    },
  ],
};
