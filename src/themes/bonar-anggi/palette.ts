import { brighten, deepen, mix, type ThemePalette, type Vars } from "../palette";

type Hr = {
  paper: string;
  wash: string;
  night: string;
  accent: string;
  gold: string;
  goldLight: string;
  ink: string;
  line: string;
  merah: string;
  putih: string;
  langit: string;
  senja: string;
};

const vars = (c: Hr): Vars => ({
  "--inv-paper": c.paper,
  "--inv-wash": c.wash,
  "--inv-night": c.night,
  "--inv-accent": c.accent,
  "--inv-gold": c.gold,
  "--inv-gold-light": c.goldLight,
  "--inv-ink": c.ink,
  "--inv-line": c.line,
  "--hr-merah": c.merah,
  "--hr-putih": c.putih,
  "--hr-langit": c.langit,
  "--hr-senja": c.senja,
});

// Palet Horas berangkat dari tiga bolit gorga Batak: merah, hitam, dan putih, ditambah emas benang ulos pesta.
// Langit dan senja dipakai di adegan rumah bolon pada pembuka dan penutup.
export const palette: ThemePalette = {
  presets: [
    {
      id: "tiga-bolit",
      name: "Tiga Bolit",
      vars: vars({ paper: "#F4EBDD", wash: "#FBF6EE", night: "#1C1211", accent: "#A11D22", gold: "#B8913F", goldLight: "#EBD293", ink: "#2A1A15", line: "#DDCBB2", merah: "#7A1418", putih: "#F3E9DA", langit: "#2B1A24", senja: "#C8683E" }),
    },
    {
      id: "ulos-malam",
      name: "Ulos Malam",
      vars: vars({ paper: "#EFE4D2", wash: "#F8F1E6", night: "#120C0B", accent: "#8E1A1D", gold: "#C59A45", goldLight: "#E6CB8A", ink: "#1E1310", line: "#D3C0A3", merah: "#560E11", putih: "#EFE2CB", langit: "#150E13", senja: "#7E3A28" }),
    },
    {
      id: "gading-toba",
      name: "Gading Toba",
      vars: vars({ paper: "#F7F0E3", wash: "#FCF8F1", night: "#3B2116", accent: "#9F2A2B", gold: "#A8813A", goldLight: "#EAD6A6", ink: "#301E15", line: "#E0D0B8", merah: "#86292A", putih: "#F7EFE1", langit: "#4F6E86", senja: "#E3B98D" }),
    },
  ],
  derive: ({ paper, accent, ink }) =>
    vars({
      paper,
      ink,
      accent,
      wash: mix(paper, "#FFFFFF", 0.55),
      night: deepen(mix(ink, "#000000", 0.25), 0.04),
      gold: mix("#B8913F", accent, 0.15),
      goldLight: brighten(mix("#EBD293", accent, 0.1), 0.6),
      line: mix(paper, ink, 0.16),
      merah: deepen(accent, 0.12),
      putih: mix(paper, "#FFFFFF", 0.2),
      langit: deepen(mix(ink, accent, 0.25), 0.05),
      senja: mix(accent, "#E39A55", 0.6),
    }),
  roles: [
    { key: "--inv-paper", label: "Latar" },
    { key: "--inv-wash", label: "Kartu" },
    { key: "--inv-accent", label: "Merah ulos" },
    { key: "--hr-merah", label: "Bagian merah" },
    { key: "--inv-night", label: "Bagian gelap" },
    { key: "--inv-ink", label: "Teks" },
    { key: "--inv-gold", label: "Emas" },
    { key: "--inv-gold-light", label: "Teks terang" },
    { key: "--hr-putih", label: "Benang putih" },
    { key: "--hr-langit", label: "Langit" },
    { key: "--hr-senja", label: "Senja" },
    { key: "--inv-line", label: "Garis" },
  ],
  base: (v) => ({ paper: v["--inv-paper"], accent: v["--inv-accent"], ink: v["--inv-ink"] }),
  swatch: ["--inv-paper", "--inv-accent", "--hr-merah", "--inv-night", "--inv-gold"],
  checks: [
    { fg: "--inv-ink", bg: "--inv-paper", label: "Teks di latar terang" },
    { fg: "--inv-accent", bg: "--inv-paper", label: "Aksen dan tautan" },
    { fg: "--inv-wash", bg: "--hr-merah", label: "Teks di bagian merah" },
    { fg: "--inv-wash", bg: "--inv-night", label: "Teks di bagian gelap" },
  ],
};
