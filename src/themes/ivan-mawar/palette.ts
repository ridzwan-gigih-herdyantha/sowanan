import { deepen, mix, type ThemePalette, type Vars } from "../palette";

// Set bunga cat air yang tersedia di public/img/ivan-mawar/bunga-N. Kelopaknya sudah diwarnai per set.
export const FLORA_SETS = ["merah", "putih", "kuning", "peach"] as const;
export type FloraSet = (typeof FLORA_SETS)[number];

type Mm = { paper: string; wash: string; night: string; accent: string; gold: string; goldLight: string; ink: string; line: string; card: string; rose: string; set: FloraSet };

const vars = (c: Mm): Vars => ({
  "--inv-paper": c.paper,
  "--inv-wash": c.wash,
  "--inv-night": c.night,
  "--inv-accent": c.accent,
  "--inv-gold": c.gold,
  "--inv-gold-light": c.goldLight,
  "--inv-ink": c.ink,
  "--inv-line": c.line,
  "--inv-card": c.card,
  "--mm-rose": c.rose,
  "--mm-set": c.set,
});

// Set bunga untuk palet kustom, dipilih dari rona warna aksen. Aksen yang hampir tanpa warna memakai mawar putih.
function nearestSet(accent: string): FloraSet {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(accent.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max - min < 0.12) return "putih";
  const d = max - min;
  const h = max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  const deg = h * 60;
  if (deg >= 40 && deg < 75) return "kuning";
  if (deg >= 14 && deg < 40) return "peach";
  return "merah";
}

// Palet Mekar Mawar. Kelopak di gambar mengikuti set bunga palet, aksen dipakai untuk nama dan tombol,
// emas hanya untuk garis bingkai foto dan pemisah tipis.
export const palette: ThemePalette = {
  presets: [
    {
      id: "merah",
      name: "Mawar Merah",
      vars: vars({ paper: "#FFF9F6", wash: "#F9ECE9", night: "#3A1219", accent: "#8E1B30", gold: "#C29B6E", goldLight: "#E3CBB0", ink: "#2B1D1F", line: "#EAD3D0", card: "#FFFDFC", rose: "#D9536A", set: "merah" }),
    },
    {
      id: "putih",
      name: "Mawar Putih",
      vars: vars({ paper: "#F8F5F0", wash: "#EFE9E0", night: "#2C2A26", accent: "#6A5D4B", gold: "#B9A27F", goldLight: "#DDD0BA", ink: "#26292A", line: "#E0D8CB", card: "#FFFDF9", rose: "#C9BDAA", set: "putih" }),
    },
    {
      id: "kuning",
      name: "Mawar Kuning",
      vars: vars({ paper: "#FFFBF0", wash: "#FBF1DA", night: "#3A2A0C", accent: "#8A5A0B", gold: "#C49A55", goldLight: "#E6CF9F", ink: "#2D2618", line: "#EEDDB3", card: "#FFFEF8", rose: "#E3AE2E", set: "kuning" }),
    },
    {
      id: "peach",
      name: "Mawar Peach",
      vars: vars({ paper: "#FFF8F3", wash: "#FCEBE2", night: "#3D1D16", accent: "#A2432C", gold: "#C9A07B", goldLight: "#E8CDB5", ink: "#2E2220", line: "#F1D6C9", card: "#FFFDFB", rose: "#F0997A", set: "peach" }),
    },
  ],
  derive: ({ paper, accent, ink }) =>
    vars({
      paper,
      accent,
      ink,
      wash: mix(paper, accent, 0.06),
      night: deepen(mix(ink, accent, 0.25), 0.03),
      gold: mix(accent, "#C29B6E", 0.6),
      goldLight: mix(mix(accent, "#C29B6E", 0.6), paper, 0.55),
      line: mix(paper, accent, 0.18),
      card: mix(paper, "#FFFFFF", 0.6),
      rose: mix(accent, "#FFFFFF", 0.3),
      set: nearestSet(accent),
    }),
  roles: [
    { key: "--inv-paper", label: "Latar" },
    { key: "--inv-wash", label: "Latar kedua" },
    { key: "--inv-card", label: "Kartu" },
    { key: "--inv-ink", label: "Teks" },
    { key: "--inv-accent", label: "Nama dan tombol" },
    { key: "--mm-rose", label: "Aksen kelopak" },
    { key: "--inv-gold", label: "Garis emas" },
    { key: "--inv-gold-light", label: "Emas muda" },
    { key: "--inv-line", label: "Garis" },
  ],
  base: (v) => ({ paper: v["--inv-paper"], accent: v["--inv-accent"], ink: v["--inv-ink"] }),
  swatch: ["--inv-paper", "--inv-wash", "--mm-rose", "--inv-gold", "--inv-accent"],
  checks: [
    { fg: "--inv-ink", bg: "--inv-paper", label: "Teks di latar" },
    { fg: "--inv-accent", bg: "--inv-paper", label: "Nama dan tombol" },
    { fg: "--inv-card", bg: "--inv-accent", label: "Teks di tombol" },
  ],
};
