import { CX, H, roundPath, W, type Kit, type ThemeStory } from "../story-kit";

const initials = (k: Kit) => k.d.initials.join(" & ");
const STAMP = "#F2A33C";

const stamp = (k: Kit, x: number, y: number) => k.text(k.d.stamp, x, y, { font: "body", size: 28, spacing: 2, color: STAMP, align: "right", shadow: { color: "#000000", blur: 8 } });

// Lensa: gaya sinema, judul kota tebal melawan nama Bodoni miring, bingkai film, dan cap tanggal kamera.
export const story: ThemeStory = {
  templates: [
    {
      id: "poster",
      name: "Poster Film",
      draw: (k) => {
        const light = "#FFFFFF";
        k.photo(k.d.photos.hero, { x: 0, y: 0, w: W, h: H }, { empty: "#1B1A18", emptyInk: "#45423D" });
        k.bg(k.linear(0, 0, 0, H, [[0, "#000000D9"], [0.27, "#00000040"], [0.55, "#00000000"], [0.76, "#000000B0"], [1, "#000000F2"]]));
        const head = k.d.headline.toLocaleUpperCase("id-ID");
        k.text(head, 70, 300, { font: "display", size: 36, weight: 800, color: light, align: "left", spacing: 2, maxW: 620 });
        k.text(initials(k), W - 70, 300, { font: "display", size: 36, weight: 800, color: light, align: "right", spacing: 2 });
        k.line(70, 324, W - 70, 324, light, 2, 0.6);
        k.text(`${k.d.groom} & ${k.d.bride}`, CX, 440, { font: "name", size: 126, italic: true, color: light, maxW: 950 });
        k.text(k.d.date, CX, 1430, { size: 37, color: light, maxW: 900 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, 1482, { size: 28, color: light, alpha: 0.85, maxW: 900 });
        k.link({ fill: "transparent", ink: light, stroke: light, label: "", y: 1540, radius: 0, spacing: 1 });
      },
    },
    {
      id: "rol-film",
      name: "Rol Film",
      draw: (k) => {
        const light = "#F4F1EC";
        k.bg("#0B0A09");
        const left = 96;
        const width = W - left * 2;
        for (let y = -10; y < H; y += 74) {
          k.fillPath(roundPath({ x: 28, y, w: 40, h: 44 }, 7), "#ECE7DE");
          k.fillPath(roundPath({ x: W - 68, y, w: 40, h: 44 }, 7), "#ECE7DE");
        }
        const h = 410;
        const frames = [k.d.photos.wide ?? k.d.photos.hero, k.d.photos.closing ?? k.d.photos.couple ?? k.d.photos.extra[0]];
        k.text(k.d.groom.toLocaleUpperCase("id-ID"), CX, 348, { font: "display", size: 82, weight: 800, color: light, maxW: width - 30 });
        k.text(`& ${k.d.bride}`, CX, 448, { font: "name", size: 92, italic: true, color: light, maxW: width - 30 });
        frames.forEach((p, i) => {
          const y = 496 + i * (h + 24);
          k.photo(p, { x: left, y, w: width, h }, { empty: "#1C1B19", emptyInk: "#615E58" });
          stamp(k, left + width - 24, y + h - 24);
        });
        k.text(k.d.date, CX, 1404, { size: 37, color: light, maxW: width - 30 });
        k.text([k.d.venue, k.d.city].filter(Boolean).join(", "), CX, 1456, { size: 27, color: light, alpha: 0.8, maxW: width - 30 });
        k.link({ fill: "#0B0A09", ink: light, stroke: light, label: "", y: 1540, radius: 0, size: 32 });
      },
    },
    {
      id: "judul",
      name: "Judul Kota",
      draw: (k) => {
        const light = "#FFFFFF";
        // Layar bioskop gelap dengan sorot proyektor hangat, tanpa foto.
        k.bg("#121110");
        k.bg(k.radial(CX, 860, 60, 1000, [[0, k.alpha(STAMP, 0.26)], [0.55, k.alpha(STAMP, 0.06)], [1, "#00000000"]]));
        k.rect(0, 0, W, 200, "#000000");
        k.rect(0, H - 200, W, 200, "#000000");
        k.line(70, 620, W - 70, 620, light, 2, 0.35);
        k.line(70, 1250, W - 70, 1250, light, 2, 0.35);
        stamp(k, W - 70, 1220);
        k.text("Halo! Kamu diundang ke", CX, 730, { size: 36, color: light });
        k.text(k.d.headline.toLocaleUpperCase("id-ID"), CX, 880, { font: "display", size: 158, weight: 800, color: light, maxW: 980 });
        k.text(`Pernikahan ${k.d.groom} & ${k.d.bride}`, CX, 964, { size: 38, color: light, maxW: 900 });
        k.text(initials(k), CX, 1320, { font: "display", size: 40, weight: 800, spacing: 6, color: light });
        k.text(k.d.date, CX, 1384, { size: 34, color: light, maxW: 900 });
        k.text(k.d.venue, CX, 1434, { size: 27, color: light, alpha: 0.82, maxW: 900 });
        k.link({ fill: "transparent", ink: light, stroke: light, label: "", y: 1090, radius: 0, spacing: 1 });
      },
    },
  ],
};
