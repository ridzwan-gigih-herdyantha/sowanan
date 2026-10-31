import { brighten, deepen, mix, type ThemePalette, type Vars } from "../palette";

type Mawaddah = { paper: string; wash: string; sand: string; night: string; night2: string; accent: string; ink: string; line: string; gold: string; glow: string };

const vars = (c: Mawaddah): Vars => ({
  "--inv-paper": c.paper,
  "--inv-wash": c.wash,
  "--inv-night": c.night,
  "--inv-accent": c.accent,
  "--inv-gold": c.gold,
  "--inv-gold-light": c.glow,
  "--inv-ink": c.ink,
  "--inv-line": c.line,
  "--sk-pasir": c.sand,
  "--sk-night2": c.night2,
  "--sk-emas": c.gold,
  "--sk-tex": c.accent,
  "--sk-glow": c.glow,
});

export const palette: ThemePalette = {
  presets: [
    { id: "zamrud", name: "Laguna & Tembaga", vars: vars({ paper: "#F4EEE2", wash: "#FCF9F2", sand: "#E7D8C4", night: "#163E43", night2: "#24565A", accent: "#397477", ink: "#243232", line: "#D8C8B2", gold: "#B96F4E", glow: "#EBC8A5" }) },
    { id: "pirus", name: "Safir & Pasir", vars: vars({ paper: "#F0F0E9", wash: "#FAFAF5", sand: "#DDE3DF", night: "#20374A", night2: "#304E60", accent: "#4A7882", ink: "#202B32", line: "#CBD4D2", gold: "#B97858", glow: "#E8CEB2" }) },
    { id: "mawar", name: "Mawar Bata", vars: vars({ paper: "#F4ECE6", wash: "#FBF7F2", sand: "#E9D8CF", night: "#493139", night2: "#604047", accent: "#925E66", ink: "#30272A", line: "#DCC8BE", gold: "#B77859", glow: "#EBCBB0" }) },
  ],
  derive: ({ paper, accent, ink }) => vars({
    paper, ink, accent,
    wash: mix(paper, "#FFFFFF", 0.55),
    sand: mix(paper, accent, 0.12),
    night: deepen(mix(accent, ink, 0.38), 0.06),
    night2: deepen(mix(accent, "#243D34", 0.48), 0.04),
    line: mix(paper, ink, 0.15),
    gold: mix("#A7834F", accent, 0.12),
    glow: brighten(mix("#E9D8AF", accent, 0.08), 0.62),
  }),
  roles: [
    { key: "--inv-paper", label: "Latar" },
    { key: "--inv-wash", label: "Kertas terang" },
    { key: "--sk-pasir", label: "Pasir" },
    { key: "--inv-accent", label: "Aksen teal" },
    { key: "--inv-ink", label: "Teks" },
    { key: "--inv-night", label: "Bagian gelap" },
    { key: "--sk-night2", label: "Hijau kedua" },
    { key: "--sk-emas", label: "Tembaga" },
    { key: "--inv-gold-light", label: "Emas terang" },
    { key: "--inv-line", label: "Garis" },
  ],
  base: (v) => ({ paper: v["--inv-paper"], accent: v["--inv-accent"], ink: v["--inv-ink"] }),
  swatch: ["--inv-paper", "--sk-pasir", "--inv-accent", "--inv-night", "--sk-emas"],
  checks: [
    { fg: "--inv-ink", bg: "--inv-paper", label: "Teks di latar terang" },
    { fg: "--inv-accent", bg: "--inv-paper", label: "Aksen dan tautan" },
    { fg: "--inv-ink", bg: "--sk-pasir", label: "Teks di pasir" },
    { fg: "--inv-wash", bg: "--inv-night", label: "Teks di hijau gelap" },
    { fg: "--inv-wash", bg: "--sk-night2", label: "Teks di hijau kedua" },
  ],
};
