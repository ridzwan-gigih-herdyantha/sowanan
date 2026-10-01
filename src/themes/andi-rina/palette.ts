import { deepen, mix, type ThemePalette, type Vars } from "../palette";

type Ar = { paper: string; wash: string; night: string; accent: string; gold: string; goldLight: string; ink: string; line: string; card: string; deep: string; flap: string };

const vars = (c: Ar): Vars => ({
  "--inv-paper": c.paper,
  "--inv-wash": c.wash,
  "--inv-night": c.night,
  "--inv-accent": c.accent,
  "--inv-gold": c.gold,
  "--inv-gold-light": c.goldLight,
  "--inv-ink": c.ink,
  "--inv-line": c.line,
  "--inv-card": c.card,
  "--ar-deep": c.deep,
  "--ar-flap": c.flap,
});

// Palet Senja Kota. Jingga cap tanggal film dan segel lilin tetap, jadi palet dijaga hangat di bagian emasnya.
export const palette: ThemePalette = {
  presets: [
    {
      id: "senja",
      name: "Senja",
      vars: vars({ paper: "#F6EEE3", wash: "#EAD9C2", night: "#0B2327", accent: "#1F4449", gold: "#B07A3A", goldLight: "#D39B59", ink: "#1C1916", line: "#A08F74", card: "#FBF7F0", deep: "#070F11", flap: "#E3CDB0" }),
    },
    {
      id: "biru-malam",
      name: "Biru Malam",
      vars: vars({ paper: "#F3F0EA", wash: "#DFDAD0", night: "#141B2E", accent: "#2B3A5E", gold: "#A9894F", goldLight: "#D5B572", ink: "#1A1A1F", line: "#9C958A", card: "#FAF8F4", deep: "#0A0F1C", flap: "#D9D2C4" }),
    },
    {
      id: "hijau-botol",
      name: "Hijau Botol",
      vars: vars({ paper: "#F4F0E6", wash: "#E3DCC8", night: "#10241A", accent: "#1F4A33", gold: "#A8813A", goldLight: "#CFA65A", ink: "#1B1C17", line: "#9E9278", card: "#FBF8F0", deep: "#08140E", flap: "#DFD3B8" }),
    },
    {
      id: "terakota",
      name: "Terakota",
      vars: vars({ paper: "#F7EDE6", wash: "#ECD8CB", night: "#2A1712", accent: "#7A3B26", gold: "#B5743F", goldLight: "#DB9A5E", ink: "#1F1714", line: "#A8907E", card: "#FCF6F1", deep: "#160B08", flap: "#E6CDBD" }),
    },
  ],
  derive: ({ paper, accent, ink }) => {
    const night = deepen(mix(accent, ink, 0.3), 0.03);
    return vars({
      paper,
      accent,
      ink,
      night,
      wash: mix(paper, ink, 0.1),
      gold: mix("#B07A3A", accent, 0.15),
      goldLight: mix("#D39B59", accent, 0.1),
      line: mix(paper, ink, 0.38),
      card: mix(paper, "#FFFFFF", 0.6),
      deep: mix(night, "#000000", 0.45),
      flap: mix(paper, ink, 0.13),
    });
  },
  base: (v) => ({ paper: v["--inv-paper"], accent: v["--inv-accent"], ink: v["--inv-ink"] }),
  swatch: ["--inv-paper", "--inv-wash", "--inv-accent", "--inv-night", "--inv-gold-light"],
  checks: [
    { fg: "--inv-ink", bg: "--inv-paper", label: "Teks di latar terang" },
    { fg: "--inv-accent", bg: "--inv-paper", label: "Aksen dan tautan" },
    { fg: "--inv-paper", bg: "--inv-night", label: "Teks di bagian gelap" },
    { fg: "--inv-night", bg: "--inv-gold-light", label: "Teks di pita emas" },
  ],
};
