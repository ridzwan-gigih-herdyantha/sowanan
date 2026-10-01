import { deepen, mix, type ThemePalette, type Vars } from "../palette";

type Bs = { paper: string; wash: string; night: string; accent: string; gold: string; goldLight: string; ink: string; line: string; dline: string };

const vars = (c: Bs): Vars => ({
  "--inv-paper": c.paper,
  "--inv-wash": c.wash,
  "--inv-night": c.night,
  "--inv-accent": c.accent,
  "--inv-gold": c.gold,
  "--inv-gold-light": c.goldLight,
  "--inv-ink": c.ink,
  "--inv-line": c.line,
  "--bs-dline": c.dline,
});

// Palet Ruang. Tema monokrom, jadi tiap palet hanya menggeser nada abunya ke hangat, hijau, atau biru.
export const palette: ThemePalette = {
  presets: [
    {
      id: "abu",
      name: "Abu",
      vars: vars({ paper: "#E8E5E0", wash: "#D6D2CB", night: "#1A1A19", accent: "#121212", gold: "#5C5853", goldLight: "#BDB8B0", ink: "#121212", line: "#9D978F", dline: "#5E5A55" }),
    },
    {
      id: "pasir",
      name: "Pasir",
      vars: vars({ paper: "#ECE6DC", wash: "#DCD3C6", night: "#24201B", accent: "#1E1A16", gold: "#6B6155", goldLight: "#C4B9A8", ink: "#1E1A16", line: "#A69C8E", dline: "#615A50" }),
    },
    {
      id: "zaitun",
      name: "Zaitun",
      vars: vars({ paper: "#E6E6DC", wash: "#D3D4C6", night: "#1E211A", accent: "#171A14", gold: "#5D6352", goldLight: "#BBBFAD", ink: "#171A14", line: "#989C8C", dline: "#5A5F52" }),
    },
    {
      id: "biru-batu",
      name: "Biru Batu",
      vars: vars({ paper: "#E3E6E8", wash: "#D0D5D9", night: "#171B20", accent: "#11151A", gold: "#56606A", goldLight: "#B4BCC4", ink: "#11151A", line: "#939CA5", dline: "#545C66" }),
    },
  ],
  derive: ({ paper, accent, ink }) => {
    const night = deepen(mix(ink, paper, 0.06), 0.015);
    return vars({
      paper,
      accent,
      ink,
      night,
      wash: mix(paper, ink, 0.08),
      gold: mix(paper, ink, 0.65),
      goldLight: mix(paper, ink, 0.22),
      line: mix(paper, ink, 0.4),
      dline: mix(night, paper, 0.3),
    });
  },
  base: (v) => ({ paper: v["--inv-paper"], accent: v["--inv-accent"], ink: v["--inv-ink"] }),
  swatch: ["--inv-paper", "--inv-wash", "--inv-gold-light", "--inv-gold", "--inv-night"],
  checks: [
    { fg: "--inv-ink", bg: "--inv-paper", label: "Teks di latar terang" },
    { fg: "--inv-gold", bg: "--inv-paper", label: "Teks keterangan" },
    { fg: "--inv-paper", bg: "--inv-night", label: "Teks di bagian gelap" },
  ],
};
