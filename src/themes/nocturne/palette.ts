import { mix, type ThemePalette, type Vars } from "../palette";

type Nocturne = { paper: string; wash: string; night: string; accent: string; gold: string; goldLight: string; ink: string; line: string; card: string };
const vars = (c: Nocturne): Vars => ({
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

export const palette: ThemePalette = {
  presets: [
    { id: "oxblood", name: "Oxblood", vars: vars({ paper: "#171012", wash: "#21171A", night: "#090708", accent: "#8F3D4A", gold: "#C59A68", goldLight: "#745052", ink: "#F0E8DF", line: "#493137", card: "#2A1D21" }) },
    { id: "charcoal", name: "Arang", vars: vars({ paper: "#111214", wash: "#191A1D", night: "#070809", accent: "#A27E68", gold: "#C4AE8D", goldLight: "#65564E", ink: "#ECE8E3", line: "#373438", card: "#222124" }) },
    { id: "forest", name: "Hutan Malam", vars: vars({ paper: "#101613", wash: "#19201C", night: "#070A08", accent: "#657C62", gold: "#C6A77B", goldLight: "#55614F", ink: "#E9E9DF", line: "#344037", card: "#202A23" }) },
    { id: "plum", name: "Plum Gelap", vars: vars({ paper: "#17121A", wash: "#211A25", night: "#09070B", accent: "#8E627E", gold: "#C4A27E", goldLight: "#685063", ink: "#EFE7EC", line: "#453543", card: "#2A202D" }) },
  ],
  derive: ({ paper, accent, ink }) => vars({
    paper,
    accent,
    ink,
    wash: mix(paper, ink, 0.07),
    night: mix(paper, "#000000", 0.55),
    gold: mix(ink, "#C59A68", 0.5),
    goldLight: mix(paper, accent, 0.5),
    line: mix(paper, ink, 0.2),
    card: mix(paper, ink, 0.1),
  }),
  roles: [
    { key: "--inv-paper", label: "Malam" }, { key: "--inv-wash", label: "Malam kedua" },
    { key: "--inv-card", label: "Kartu" }, { key: "--inv-ink", label: "Gading" },
    { key: "--inv-accent", label: "Anggur" }, { key: "--inv-gold", label: "Perunggu" },
    { key: "--inv-gold-light", label: "Aksen redup" }, { key: "--inv-line", label: "Garis" },
    { key: "--inv-night", label: "Hitam pekat" },
  ],
  base: (v) => ({ paper: v["--inv-paper"], accent: v["--inv-accent"], ink: v["--inv-ink"] }),
  swatch: ["--inv-paper", "--inv-wash", "--inv-gold-light", "--inv-gold", "--inv-accent"],
  checks: [
    { fg: "--inv-ink", bg: "--inv-paper", label: "Teks gading di latar gelap" },
    { fg: "--inv-ink", bg: "--inv-accent", label: "Teks di aksen" },
  ],
};
