import { brighten, deepen, mix, type ThemePalette, type Vars } from "../palette";

type Sk = {
  paper: string;
  wash: string;
  pasir: string;
  night: string;
  night2: string;
  accent: string;
  ink: string;
  line: string;
  emas: string;
  goldLight: string;
  tex: string;
  glow: string;
};

const vars = (c: Sk): Vars => ({
  "--inv-paper": c.paper,
  "--inv-wash": c.wash,
  "--inv-night": c.night,
  "--inv-accent": c.accent,
  "--inv-gold": c.accent,
  "--inv-gold-light": c.goldLight,
  "--inv-ink": c.ink,
  "--inv-line": c.line,
  "--sk-pasir": c.pasir,
  "--sk-night2": c.night2,
  "--sk-emas": c.emas,
  "--sk-tex": c.tex,
  "--sk-glow": c.glow,
});

// Palet Sakinah. Tenang dan kontrasnya rendah, emas tipis untuk garis ornamen, teks dan tombol tetap tegas.
export const palette: ThemePalette = {
  presets: [
    {
      id: "zaitun",
      name: "Zaitun",
      vars: vars({ paper: "#F5F1E6", wash: "#FBF9F3", pasir: "#E9E3D2", night: "#2F3628", night2: "#4A3D2E", accent: "#56603F", ink: "#262A20", line: "#D6CFB9", emas: "#B3955C", goldLight: "#E9DDB8", tex: "#7D7354", glow: "#F6D58E" }),
    },
    {
      id: "zamrud",
      name: "Zamrud",
      vars: vars({ paper: "#F2F1EA", wash: "#FAFAF6", pasir: "#E2E6DC", night: "#1F3B32", night2: "#3B3329", accent: "#2F6150", ink: "#1C2823", line: "#CDD5CB", emas: "#B39A5E", goldLight: "#E8DDB5", tex: "#4E7264", glow: "#F4D896" }),
    },
    {
      id: "biru-fes",
      name: "Biru Fes",
      vars: vars({ paper: "#F1F0EC", wash: "#F9F8F5", pasir: "#E0E2E6", night: "#1F2D45", night2: "#40342C", accent: "#2E4B78", ink: "#1A2030", line: "#CBCED6", emas: "#B39B66", goldLight: "#E6DCBA", tex: "#4A6087", glow: "#F2D79A" }),
    },
    {
      id: "mawar-damaskus",
      name: "Mawar Damaskus",
      vars: vars({ paper: "#F6EFEB", wash: "#FCF8F6", pasir: "#ECDFDA", night: "#4A2A2F", night2: "#3E3530", accent: "#8A4E57", ink: "#2E1E21", line: "#DECBC6", emas: "#B6955F", goldLight: "#EED9BC", tex: "#9A6B71", glow: "#F6D49A" }),
    },
  ],
  derive: ({ paper, accent, ink }) =>
    vars({
      paper,
      ink,
      accent,
      wash: mix(paper, "#FFFFFF", 0.55),
      pasir: mix(paper, accent, 0.1),
      night: deepen(mix(accent, ink, 0.4), 0.05),
      night2: deepen(mix("#4A3D2E", accent, 0.2), 0.06),
      line: mix(paper, ink, 0.15),
      emas: mix("#B3955C", accent, 0.15),
      goldLight: brighten(mix("#E9DDB8", accent, 0.1), 0.62),
      tex: mix(accent, paper, 0.25),
      glow: "#F6D58E",
    }),
  roles: [
    { key: "--inv-paper", label: "Latar" },
    { key: "--inv-wash", label: "Kartu" },
    { key: "--sk-pasir", label: "Pasir" },
    { key: "--inv-accent", label: "Aksen" },
    { key: "--inv-ink", label: "Teks" },
    { key: "--inv-night", label: "Bagian gelap" },
    { key: "--sk-night2", label: "Bagian gelap kedua" },
    { key: "--inv-gold-light", label: "Teks terang" },
    { key: "--sk-emas", label: "Emas ornamen" },
    { key: "--sk-glow", label: "Cahaya lentera" },
    { key: "--inv-line", label: "Garis" },
  ],
  base: (v) => ({ paper: v["--inv-paper"], accent: v["--inv-accent"], ink: v["--inv-ink"] }),
  swatch: ["--inv-paper", "--sk-pasir", "--inv-accent", "--inv-night", "--sk-emas"],
  checks: [
    { fg: "--inv-ink", bg: "--inv-paper", label: "Teks di latar terang" },
    { fg: "--inv-accent", bg: "--inv-paper", label: "Aksen dan tautan" },
    { fg: "--inv-ink", bg: "--sk-pasir", label: "Teks di latar pasir" },
    { fg: "--inv-wash", bg: "--inv-night", label: "Teks di bagian gelap" },
    { fg: "--inv-wash", bg: "--sk-night2", label: "Teks di bagian gelap kedua" },
  ],
};
