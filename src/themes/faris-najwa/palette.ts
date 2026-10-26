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
    { id: "zamrud", name: "Zamrud & Gading", vars: vars({ paper: "#F5F1E7", wash: "#FCFAF4", sand: "#E9E2D1", night: "#173C32", night2: "#294C3F", accent: "#2F6653", ink: "#202C27", line: "#D9D1BD", gold: "#A7834F", glow: "#E9D8AF" }) },
    { id: "pirus", name: "Pirus Safir", vars: vars({ paper: "#F1F3ED", wash: "#FBFCF8", sand: "#E0E9E3", night: "#183B43", night2: "#244D51", accent: "#2C6970", ink: "#1D2C2C", line: "#CCD8D2", gold: "#B39157", glow: "#E9D9B5" }) },
    { id: "mawar", name: "Mawar Gurun", vars: vars({ paper: "#F6F0E8", wash: "#FCF8F2", sand: "#EBDDD2", night: "#51343A", night2: "#61464A", accent: "#86525C", ink: "#302528", line: "#DCCBC2", gold: "#AD875B", glow: "#F0DDB8" }) },
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
    { key: "--inv-accent", label: "Aksen zamrud" },
    { key: "--inv-ink", label: "Teks" },
    { key: "--inv-night", label: "Bagian gelap" },
    { key: "--sk-night2", label: "Hijau kedua" },
    { key: "--sk-emas", label: "Emas" },
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
