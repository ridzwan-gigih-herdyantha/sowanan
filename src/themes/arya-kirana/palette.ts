import { deepen, mix, type ThemePalette, type Vars } from "../palette";

type Su = { paper: string; wash: string; night: string; accent: string; gold: string; goldLight: string; ink: string; line: string; card: string };

const vars = (c: Su): Vars => ({
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

// Palet Sutra. Ivory selalu dominan, aksen untuk nama dan tombol, sampanye hanya untuk garis dan ornamen.
export const palette: ThemePalette = {
  presets: [
    {
      id: "ivory",
      name: "Ivory",
      vars: vars({ paper: "#FBF8F2", wash: "#F3ECDF", night: "#2F2A24", accent: "#7A6346", gold: "#B49A6A", goldLight: "#DCC9A3", ink: "#2A2622", line: "#D8CCB7", card: "#FFFDF9" }),
    },
    {
      id: "mawar-kering",
      name: "Mawar Kering",
      vars: vars({ paper: "#FAF3F0", wash: "#F1E3DE", night: "#3A2629", accent: "#7D4E57", gold: "#B8977A", goldLight: "#DEC6B3", ink: "#2C2224", line: "#DCC6BF", card: "#FFFBFA" }),
    },
    {
      id: "daun-sage",
      name: "Daun Sage",
      vars: vars({ paper: "#F6F6F0", wash: "#E8EBE0", night: "#263026", accent: "#4E5E4F", gold: "#A99A6D", goldLight: "#D3C9A4", ink: "#222823", line: "#CDD1C2", card: "#FCFCF8" }),
    },
    {
      id: "tinta-biru",
      name: "Tinta Biru",
      vars: vars({ paper: "#F8F6F1", wash: "#ECE8DF", night: "#1E2633", accent: "#2E3A4F", gold: "#B59B6B", goldLight: "#D9C59F", ink: "#22252B", line: "#CFC6B5", card: "#FFFDF8" }),
    },
  ],
  derive: ({ paper, accent, ink }) =>
    vars({
      paper,
      accent,
      ink,
      wash: mix(paper, accent, 0.07),
      night: deepen(mix(ink, accent, 0.2), 0.02),
      gold: mix(accent, paper, 0.35),
      goldLight: mix(accent, paper, 0.62),
      line: mix(paper, accent, 0.25),
      card: mix(paper, "#FFFFFF", 0.6),
    }),
  roles: [
    { key: "--inv-paper", label: "Latar" },
    { key: "--inv-wash", label: "Latar kedua" },
    { key: "--inv-card", label: "Kartu" },
    { key: "--inv-ink", label: "Teks" },
    { key: "--inv-accent", label: "Aksen" },
    { key: "--inv-gold", label: "Sampanye" },
    { key: "--inv-gold-light", label: "Sampanye muda" },
    { key: "--inv-line", label: "Garis" },
    { key: "--inv-night", label: "Bagian gelap" },
  ],
  base: (v) => ({ paper: v["--inv-paper"], accent: v["--inv-accent"], ink: v["--inv-ink"] }),
  swatch: ["--inv-paper", "--inv-wash", "--inv-gold-light", "--inv-gold", "--inv-accent"],
  checks: [
    { fg: "--inv-ink", bg: "--inv-paper", label: "Teks di latar" },
    { fg: "--inv-accent", bg: "--inv-paper", label: "Nama dan tombol" },
    { fg: "--inv-card", bg: "--inv-accent", label: "Teks di tombol" },
  ],
};
