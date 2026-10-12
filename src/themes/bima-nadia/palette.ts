import { mix, type ThemePalette, type Vars } from "../palette";

type Rb = { paper: string; wash: string; night: string; accent: string; gold: string; goldLight: string; ink: string; line: string; card: string };

const vars = (c: Rb): Vars => ({
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

// Palet Rembulan terbalik dari tema lain: latar gelap, teks terang. Aksen adalah cahaya bulan, dipakai untuk bulan,
// nama tamu, dan tombol. Perak untuk garis dan label, bukan emas.
export const palette: ThemePalette = {
  presets: [
    {
      id: "tengah-malam",
      name: "Tengah Malam",
      vars: vars({ paper: "#0B0F1C", wash: "#10172A", night: "#05070E", accent: "#EDE5CF", gold: "#A9B2C5", goldLight: "#5E6A86", ink: "#E3E7EF", line: "#232C45", card: "#131B30" }),
    },
    {
      id: "ungu-senja",
      name: "Ungu Senja",
      vars: vars({ paper: "#130F1D", wash: "#1A1528", night: "#08060E", accent: "#F0DCCB", gold: "#B9AFC9", goldLight: "#6A5F82", ink: "#ECE6F0", line: "#2C2540", card: "#1C1730" }),
    },
    {
      id: "laut-malam",
      name: "Laut Malam",
      vars: vars({ paper: "#081417", wash: "#0D1D21", night: "#030A0C", accent: "#E4EEDF", gold: "#9FB9B6", goldLight: "#4F6E6E", ink: "#E1ECEB", line: "#1C3236", card: "#10242A" }),
    },
    {
      id: "arang",
      name: "Arang",
      vars: vars({ paper: "#111214", wash: "#17191C", night: "#08090A", accent: "#F1E4C8", gold: "#B8B2A6", goldLight: "#6B675F", ink: "#ECE9E3", line: "#2A2B2F", card: "#1A1C1F" }),
    },
  ],
  derive: ({ paper, accent, ink }) =>
    vars({
      paper,
      accent,
      ink,
      wash: mix(paper, ink, 0.04),
      night: mix(paper, "#000000", 0.45),
      gold: mix(ink, paper, 0.3),
      goldLight: mix(ink, paper, 0.62),
      line: mix(paper, ink, 0.14),
      card: mix(paper, ink, 0.06),
    }),
  roles: [
    { key: "--inv-paper", label: "Langit" },
    { key: "--inv-wash", label: "Langit kedua" },
    { key: "--inv-card", label: "Kartu" },
    { key: "--inv-ink", label: "Teks" },
    { key: "--inv-accent", label: "Cahaya bulan" },
    { key: "--inv-gold", label: "Perak" },
    { key: "--inv-gold-light", label: "Perak redup" },
    { key: "--inv-line", label: "Garis" },
    { key: "--inv-night", label: "Malam pekat" },
  ],
  base: (v) => ({ paper: v["--inv-paper"], accent: v["--inv-accent"], ink: v["--inv-ink"] }),
  swatch: ["--inv-paper", "--inv-wash", "--inv-gold-light", "--inv-gold", "--inv-accent"],
  checks: [
    { fg: "--inv-ink", bg: "--inv-paper", label: "Teks di langit" },
    { fg: "--inv-accent", bg: "--inv-paper", label: "Cahaya bulan dan tombol" },
    { fg: "--inv-paper", bg: "--inv-accent", label: "Teks di tombol" },
  ],
};
