import { mix, type ThemePalette, type Vars } from "../palette";

type Gd = {
  paper: string;
  wash: string;
  night: string;
  accent: string;
  gold: string;
  goldLight: string;
  ink: string;
  line: string;
  card: string;
  sky: string;
  grass: string;
  road: string;
  roof: string;
};

const vars = (c: Gd): Vars => ({
  "--inv-paper": c.paper,
  "--inv-wash": c.wash,
  "--inv-night": c.night,
  "--inv-accent": c.accent,
  "--inv-gold": c.gold,
  "--inv-gold-light": c.goldLight,
  "--inv-ink": c.ink,
  "--inv-line": c.line,
  "--inv-card": c.card,
  "--inv-sky": c.sky,
  "--inv-grass": c.grass,
  "--inv-road": c.road,
  "--inv-roof": c.roof,
});

// Palet Isometrik: suasana kota mini pada tiga waktu. Warna dipakai untuk papan, tombol, dan latar di sekitar
// peta, sedangkan gambar peta sendiri tetap sama.
export const palette: ThemePalette = {
  presets: [
    {
      id: "siang",
      name: "Siang",
      vars: vars({
        paper: "#FFF8EC",
        wash: "#F6EBD3",
        night: "#2B3A55",
        accent: "#E4573D",
        gold: "#7B6A55",
        goldLight: "#F2D9A0",
        ink: "#2B2A36",
        line: "#2B2A36",
        card: "#FFFFFF",
        sky: "#BDE6FB",
        grass: "#8FD07A",
        road: "#E9D9B6",
        roof: "#E4573D",
      }),
    },
    {
      id: "senja",
      name: "Senja",
      vars: vars({
        paper: "#FFF1E2",
        wash: "#F8DDC2",
        night: "#3A2442",
        accent: "#D9475A",
        gold: "#8A5E52",
        goldLight: "#FFD3A0",
        ink: "#3A2442",
        line: "#3A2442",
        card: "#FFFAF4",
        sky: "#F9B98B",
        grass: "#B7C76A",
        road: "#F0CFA6",
        roof: "#8E4A83",
      }),
    },
    {
      id: "malam",
      name: "Malam",
      vars: vars({
        paper: "#1F2440",
        wash: "#2A3054",
        night: "#12152B",
        accent: "#F5B83D",
        gold: "#B5BBDC",
        goldLight: "#F8DE9C",
        ink: "#F3EEDF",
        line: "#F3EEDF",
        card: "#2D345C",
        sky: "#171B38",
        grass: "#2F6B5A",
        road: "#4A4F7A",
        roof: "#6C7AE0",
      }),
    },
  ],
  derive: ({ paper, accent, ink }) =>
    vars({
      paper,
      accent,
      ink,
      wash: mix(paper, accent, 0.12),
      night: mix(ink, "#000000", 0.2),
      gold: mix(ink, paper, 0.35),
      goldLight: mix(accent, "#FFF0C8", 0.7),
      line: ink,
      card: mix(paper, "#FFFFFF", 0.55),
      sky: mix(paper, "#8CCBF0", 0.55),
      grass: mix(accent, "#8FD07A", 0.75),
      road: mix(paper, ink, 0.12),
      roof: accent,
    }),
  roles: [
    { key: "--inv-paper", label: "Latar" },
    { key: "--inv-wash", label: "Latar kedua" },
    { key: "--inv-card", label: "Kotak" },
    { key: "--inv-ink", label: "Teks" },
    { key: "--inv-accent", label: "Aksen" },
    { key: "--inv-gold", label: "Teks redup" },
    { key: "--inv-gold-light", label: "Sorot" },
    { key: "--inv-line", label: "Garis" },
    { key: "--inv-night", label: "Tombol musik" },
    { key: "--inv-sky", label: "Langit" },
    { key: "--inv-grass", label: "Rumput" },
    { key: "--inv-road", label: "Jalan" },
    { key: "--inv-roof", label: "Atap" },
  ],
  base: (v) => ({ paper: v["--inv-paper"], accent: v["--inv-accent"], ink: v["--inv-ink"] }),
  swatch: ["--inv-sky", "--inv-grass", "--inv-paper", "--inv-accent", "--inv-roof"],
  checks: [
    { fg: "--inv-ink", bg: "--inv-paper", label: "Teks di latar" },
    { fg: "--inv-ink", bg: "--inv-card", label: "Teks di kotak" },
    { fg: "--inv-paper", bg: "--inv-accent", label: "Teks di tombol" },
  ],
};
