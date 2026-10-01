import { brighten, deepen, mix, type ThemePalette, type Vars } from "../palette";

type Pk = {
  paper: string;
  wash: string;
  pasir: string;
  night: string;
  lumut: string;
  accent: string;
  ink: string;
  line: string;
  emas: string;
  ukir: string;
  tex: string;
  goldLight: string;
};

const vars = (c: Pk): Vars => ({
  "--inv-paper": c.paper,
  "--inv-wash": c.wash,
  "--inv-night": c.night,
  "--inv-accent": c.accent,
  "--inv-gold": c.accent,
  "--inv-gold-light": c.goldLight,
  "--inv-ink": c.ink,
  "--inv-line": c.line,
  "--pk-pasir": c.pasir,
  "--pk-lumut": c.lumut,
  "--pk-emas": c.emas,
  "--pk-ukir": c.ukir,
  "--pk-tex": c.tex,
});

// Palet Pakeliran. Emas, kulit wayang, dan batik parang tetap, jadi tiap palet dirancang supaya serasi dengan ketiganya.
export const palette: ThemePalette = {
  presets: [
    {
      id: "soga-gading",
      name: "Soga Gading",
      vars: vars({ paper: "#F4EDE0", wash: "#FAF6EE", pasir: "#EADFC8", night: "#5E4838", lumut: "#59654F", accent: "#7C573A", ink: "#3E2E22", line: "#D8C8AA", emas: "#B8995E", ukir: "#A88A62", tex: "#8A6142", goldLight: "#E8D7A8" }),
    },
    {
      id: "hijau-pandan",
      name: "Hijau Pandan",
      vars: vars({ paper: "#EFF0E6", wash: "#F8F9F3", pasir: "#DFE4D3", night: "#2F4B3B", lumut: "#5E4A36", accent: "#3E6A4E", ink: "#213027", line: "#CCD3BF", emas: "#B09A5E", ukir: "#9A8A58", tex: "#4E6F57", goldLight: "#E6DDB0" }),
    },
    {
      id: "biru-wedel",
      name: "Biru Wedel",
      vars: vars({ paper: "#EFEEEA", wash: "#F8F7F4", pasir: "#DEDDE3", night: "#2C3452", lumut: "#5B4636", accent: "#3A4A7A", ink: "#1E2235", line: "#CBCAD3", emas: "#B39A63", ukir: "#A08E66", tex: "#3F4C7E", goldLight: "#E5D8B2" }),
    },
    {
      id: "merah-kesumba",
      name: "Merah Kesumba",
      vars: vars({ paper: "#F5EDE6", wash: "#FBF7F3", pasir: "#EBDDD3", night: "#5B2329", lumut: "#4A3A30", accent: "#8A2F37", ink: "#37191C", line: "#DDC6BC", emas: "#B8995E", ukir: "#A8805E", tex: "#8A3B40", goldLight: "#EDD5AC" }),
    },
  ],
  derive: ({ paper, accent, ink }) =>
    vars({
      paper,
      ink,
      accent,
      wash: mix(paper, "#FFFFFF", 0.55),
      pasir: mix(paper, accent, 0.1),
      night: deepen(mix(accent, ink, 0.35), 0.06),
      lumut: deepen(mix(accent, ink, 0.1), 0.09),
      line: mix(paper, ink, 0.16),
      emas: mix("#B8995E", accent, 0.2),
      ukir: mix("#A88A62", accent, 0.3),
      tex: accent,
      goldLight: brighten(mix("#E8D7A8", accent, 0.12), 0.62),
    }),
  roles: [
    { key: "--inv-paper", label: "Latar" },
    { key: "--inv-wash", label: "Kartu" },
    { key: "--pk-pasir", label: "Pasir" },
    { key: "--inv-accent", label: "Aksen" },
    { key: "--inv-ink", label: "Teks" },
    { key: "--inv-night", label: "Bagian gelap" },
    { key: "--pk-lumut", label: "Bagian gelap kedua" },
    { key: "--inv-gold-light", label: "Teks terang" },
    { key: "--pk-emas", label: "Emas" },
    { key: "--pk-ukir", label: "Ukiran" },
    { key: "--inv-line", label: "Garis" },
  ],
  base: (v) => ({ paper: v["--inv-paper"], accent: v["--inv-accent"], ink: v["--inv-ink"] }),
  swatch: ["--inv-paper", "--pk-pasir", "--inv-accent", "--inv-night", "--pk-lumut"],
  checks: [
    { fg: "--inv-ink", bg: "--inv-paper", label: "Teks di latar terang" },
    { fg: "--inv-accent", bg: "--inv-paper", label: "Aksen dan tautan" },
    { fg: "--inv-ink", bg: "--pk-pasir", label: "Teks di latar pasir" },
    { fg: "--inv-wash", bg: "--inv-night", label: "Teks di bagian gelap" },
    { fg: "--inv-wash", bg: "--pk-lumut", label: "Teks di bagian gelap kedua" },
  ],
};
