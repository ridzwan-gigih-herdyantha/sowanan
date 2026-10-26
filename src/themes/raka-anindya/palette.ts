import { deepen, mix, type ThemePalette, type Vars } from "../palette";

const vars = (paper: string, wash: string, accent: string, ink: string): Vars => ({
  "--inv-paper": paper,
  "--inv-wash": wash,
  "--inv-card": mix(paper, "#FFFFFF", 0.56),
  "--inv-accent": accent,
  "--inv-gold": mix(accent, "#C6A66B", 0.52),
  "--inv-gold-light": mix(paper, "#C6A66B", 0.24),
  "--inv-ink": ink,
  "--inv-line": mix(paper, accent, 0.22),
  "--inv-night": deepen(ink, 0.08),
});

export const palette: ThemePalette = {
  presets: [
    { id: "zaitun", name: "Zaitun", vars: vars("#F5F2E9", "#EAE9DC", "#52634A", "#262A22") },
    { id: "terracotta", name: "Terra", vars: vars("#F7F0E9", "#EEE1D5", "#925B48", "#302720") },
    { id: "biru", name: "Biru Malam", vars: vars("#F1F2F0", "#E0E6E3", "#405A5A", "#242C2B") },
    { id: "monokrom", name: "Monokrom", vars: vars("#F4F2EC", "#E8E5DC", "#54514A", "#282724") },
  ],
  derive: ({ paper, accent, ink }) => vars(paper, mix(paper, accent, 0.07), accent, ink),
  roles: [
    { key: "--inv-paper", label: "Latar" }, { key: "--inv-wash", label: "Latar kedua" },
    { key: "--inv-card", label: "Kartu" }, { key: "--inv-ink", label: "Teks" },
    { key: "--inv-accent", label: "Aksen" }, { key: "--inv-gold", label: "Perunggu" },
    { key: "--inv-gold-light", label: "Aksen muda" }, { key: "--inv-line", label: "Garis" },
    { key: "--inv-night", label: "Gelap" },
  ],
  base: (v) => ({ paper: v["--inv-paper"], accent: v["--inv-accent"], ink: v["--inv-ink"] }),
  swatch: ["--inv-paper", "--inv-wash", "--inv-gold-light", "--inv-gold", "--inv-accent"],
  checks: [{ fg: "--inv-ink", bg: "--inv-paper", label: "Teks di latar" }, { fg: "--inv-card", bg: "--inv-accent", label: "Teks di tombol" }],
};
