import { deepen, mix, type ThemePalette, type Vars } from "../palette";

type Tp = { paper: string; wash: string; card: string; ink: string; pop: string; pop2: string; sun: string };

// Peran warna Tabloid Asmara: kertas, kertas gelap untuk bagian selang-seling, krem untuk kotak isi, tinta hitam,
// warna pop untuk nama dan tombol, warna pendamping, dan mustard untuk pelangi, gelombang, dan stiker.
const vars = (c: Tp): Vars => ({
  "--inv-paper": c.paper,
  "--inv-wash": c.wash,
  "--inv-card": c.card,
  "--inv-ink": c.ink,
  "--inv-night": c.ink,
  "--inv-accent": c.pop,
  "--inv-gold": c.pop2,
  "--inv-gold-light": c.sun,
  "--inv-line": mix(c.ink, c.paper, 0.75),
  "--tp-sun": c.sun,
});

export const palette: ThemePalette = {
  presets: [
    { id: "kraft", name: "Kraft", vars: vars({ paper: "#E3C99C", wash: "#CFAE7C", card: "#F8EEDB", ink: "#22180F", pop: "#E0472B", pop2: "#1F7F8C", sun: "#F2B632" }) },
    { id: "pastel", name: "Pop Pastel", vars: vars({ paper: "#F6DCD4", wash: "#EEC3B8", card: "#FFF8EF", ink: "#2A1F2B", pop: "#D94A6E", pop2: "#3F9480", sun: "#F4C55C" }) },
    { id: "mustard", name: "Mustard", vars: vars({ paper: "#F0CF6A", wash: "#E2B94A", card: "#FDF4DC", ink: "#2B2014", pop: "#C8401F", pop2: "#2F5A8A", sun: "#F39A3A" }) },
    { id: "teal", name: "Biru Telur Asin", vars: vars({ paper: "#B6DCD6", wash: "#97C9C2", card: "#F6F2E6", ink: "#1D2B2B", pop: "#D9592B", pop2: "#B8343F", sun: "#F2C14E" }) },
  ],
  derive: ({ paper, accent, ink }) =>
    vars({
      paper,
      ink,
      pop: accent,
      wash: mix(paper, ink, 0.1),
      card: mix(paper, "#FFFFFF", 0.7),
      pop2: deepen(mix(accent, "#1F7F8C", 0.7), 0.12),
      sun: mix(accent, "#F2B632", 0.75),
    }),
  roles: [
    { key: "--inv-paper", label: "Kertas" },
    { key: "--inv-wash", label: "Kertas gelap" },
    { key: "--inv-card", label: "Krem" },
    { key: "--inv-ink", label: "Tinta" },
    { key: "--inv-accent", label: "Pop" },
    { key: "--inv-gold", label: "Pendamping" },
    { key: "--tp-sun", label: "Mustard" },
  ],
  base: (v) => ({ paper: v["--inv-paper"], accent: v["--inv-accent"], ink: v["--inv-ink"] }),
  swatch: ["--inv-paper", "--inv-card", "--inv-accent", "--tp-sun", "--inv-gold"],
  checks: [
    { fg: "--inv-ink", bg: "--inv-paper", label: "Teks di kertas" },
    { fg: "--inv-ink", bg: "--inv-card", label: "Teks di kotak krem" },
    { fg: "--inv-card", bg: "--inv-accent", label: "Teks di tombol" },
  ],
};
