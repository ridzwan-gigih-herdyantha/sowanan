import { mix, type ThemePalette, type Vars } from "../palette";

type Ls = { paper: string; wash: string; night: string; accent: string; gold: string; goldLight: string; ink: string; line: string; card: string };

const vars = (c: Ls): Vars => ({
  "--inv-paper": c.paper,
  "--inv-wash": c.wash,
  "--inv-night": c.night,
  "--inv-accent": c.accent,
  "--inv-gold": c.gold,
  "--inv-gold-light": c.goldLight,
  "--inv-ink": c.ink,
  "--inv-line": c.line,
  "--inv-card": c.card,
});

// Palet Lensa: satu warna dasar, satu warna teks, satu aksen. Foto yang membawa warna, palet hanya menjaga tenang.
export const palette: ThemePalette = {
  presets: [
    {
      id: "batu",
      name: "Batu",
      vars: vars({ paper: "#EEECE7", wash: "#E3E0D9", night: "#171615", accent: "#171615", gold: "#7D786F", goldLight: "#B5B0A6", ink: "#171615", line: "#CFCBC3", card: "#F7F6F2" }),
    },
    {
      id: "kapur",
      name: "Kapur",
      vars: vars({ paper: "#FAFAF8", wash: "#F0F0EC", night: "#111111", accent: "#111111", gold: "#6F6F6A", goldLight: "#B9B9B3", ink: "#111111", line: "#DADAD5", card: "#FFFFFF" }),
    },
    {
      id: "terakota",
      name: "Terakota",
      vars: vars({ paper: "#F2EBE3", wash: "#E9DFD3", night: "#2A1C16", accent: "#9C4A2F", gold: "#8A7465", goldLight: "#C4B2A3", ink: "#241A15", line: "#D9CCBF", card: "#F9F4EE" }),
    },
    {
      id: "zaitun",
      name: "Zaitun",
      vars: vars({ paper: "#EDEDE4", wash: "#E1E2D5", night: "#1C1F17", accent: "#4B5A36", gold: "#77796A", goldLight: "#B3B4A5", ink: "#1C1F17", line: "#CDCEC0", card: "#F6F6F0" }),
    },
  ],
  derive: ({ paper, accent, ink }) =>
    vars({
      paper,
      accent,
      ink,
      wash: mix(paper, ink, 0.05),
      night: mix(ink, "#000000", 0.2),
      gold: mix(ink, paper, 0.45),
      goldLight: mix(ink, paper, 0.68),
      line: mix(paper, ink, 0.15),
      card: mix(paper, "#FFFFFF", 0.5),
    }),
  roles: [
    { key: "--inv-paper", label: "Latar" },
    { key: "--inv-wash", label: "Latar kedua" },
    { key: "--inv-card", label: "Kartu" },
    { key: "--inv-ink", label: "Teks" },
    { key: "--inv-accent", label: "Aksen" },
    { key: "--inv-gold", label: "Teks redup" },
    { key: "--inv-gold-light", label: "Teks samar" },
    { key: "--inv-line", label: "Garis" },
    { key: "--inv-night", label: "Bagian gelap" },
  ],
  base: (v) => ({ paper: v["--inv-paper"], accent: v["--inv-accent"], ink: v["--inv-ink"] }),
  swatch: ["--inv-paper", "--inv-wash", "--inv-gold-light", "--inv-gold", "--inv-accent"],
  checks: [
    { fg: "--inv-ink", bg: "--inv-paper", label: "Teks di latar" },
    { fg: "--inv-accent", bg: "--inv-paper", label: "Aksen di latar" },
    { fg: "--inv-paper", bg: "--inv-accent", label: "Teks di tombol" },
  ],
};
