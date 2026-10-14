import { mix, type ThemePalette, type Vars } from "../palette";

type Pt = {
  paper: string;
  wash: string;
  night: string;
  accent: string;
  gold: string;
  goldLight: string;
  ink: string;
  line: string;
  card: string;
  sky: string;
  horizon: string;
  hill: string;
  sun: string;
};

const vars = (c: Pt): Vars => ({
  "--inv-paper": c.paper,
  "--inv-wash": c.wash,
  "--inv-night": c.night,
  "--inv-accent": c.accent,
  "--inv-gold": c.gold,
  "--inv-gold-light": c.goldLight,
  "--inv-ink": c.ink,
  "--inv-line": c.line,
  "--inv-card": c.card,
  "--inv-sky": c.sky,
  "--inv-horizon": c.horizon,
  "--inv-hill": c.hill,
  "--inv-sun": c.sun,
});

// Palet Co-op Adventure: warna game piksel. Langit di hero, pembuka, dan penutup dibentuk dari pita warna antara
// langit atas dan cakrawala, dengan bukit dan matahari sendiri, jadi setiap palet punya suasana waktunya.
export const palette: ThemePalette = {
  presets: [
    {
      id: "siang",
      name: "Siang",
      // Bintang tidak tampil di langit siang.
      vars: {
        ...vars({
          paper: "#F3F9FF",
          wash: "#DDEEFB",
          night: "#22305A",
          accent: "#2F74D0",
          gold: "#4F5F80",
          goldLight: "#98A8C4",
          ink: "#1F2A44",
          line: "#1F2A44",
          card: "#FFFFFF",
          sky: "#2E6FC4",
          horizon: "#CDEBFF",
          hill: "#3E8A4C",
          sun: "#FFE27A",
        }),
        "--inv-stars": "0",
      },
    },
    {
      id: "senja",
      name: "Senja",
      vars: vars({
        paper: "#FFF4DE",
        wash: "#F8E2BC",
        night: "#2A1F3D",
        accent: "#E0533D",
        gold: "#7A5A48",
        goldLight: "#C49A78",
        ink: "#2A1F3D",
        line: "#2A1F3D",
        card: "#FFFBF0",
        sky: "#2A1F3D",
        horizon: "#F2B07E",
        hill: "#2A1F3D",
        sun: "#F7B98A",
      }),
    },
    {
      id: "hutan",
      name: "Hutan",
      vars: vars({
        paper: "#F1F5E4",
        wash: "#DCE8C0",
        night: "#1E2B23",
        accent: "#3E8E4F",
        gold: "#5E6B4E",
        goldLight: "#A3AF8A",
        ink: "#1E2B23",
        line: "#1E2B23",
        card: "#FAFCF2",
        sky: "#3D7FA8",
        horizon: "#E4F1D2",
        hill: "#2F6B3A",
        sun: "#FFF1B0",
      }),
    },
    {
      id: "malam",
      name: "Malam",
      vars: vars({
        paper: "#1D1830",
        wash: "#272040",
        night: "#100C1E",
        accent: "#F2B33D",
        gold: "#B9AFD6",
        goldLight: "#6F6890",
        ink: "#F4ECDC",
        line: "#F4ECDC",
        card: "#2A2346",
        sky: "#0C0A18",
        horizon: "#3B2F6B",
        hill: "#100C1E",
        sun: "#F4ECDC",
      }),
    },
  ],
  derive: ({ paper, accent, ink }) =>
    vars({
      paper,
      accent,
      ink,
      wash: mix(paper, accent, 0.14),
      night: mix(ink, "#000000", 0.25),
      gold: mix(ink, paper, 0.35),
      goldLight: mix(ink, paper, 0.6),
      line: ink,
      card: mix(paper, "#FFFFFF", 0.5),
      sky: mix(ink, "#000000", 0.25),
      horizon: mix(accent, "#FFE7A8", 0.55),
      hill: mix(ink, "#000000", 0.25),
      sun: mix(accent, "#FFE3A0", 0.7),
    }),
  roles: [
    { key: "--inv-paper", label: "Latar" },
    { key: "--inv-wash", label: "Latar kedua" },
    { key: "--inv-card", label: "Kotak" },
    { key: "--inv-ink", label: "Teks" },
    { key: "--inv-accent", label: "Aksen" },
    { key: "--inv-gold", label: "Teks redup" },
    { key: "--inv-gold-light", label: "Teks samar" },
    { key: "--inv-line", label: "Garis piksel" },
    { key: "--inv-night", label: "Kotak dialog" },
    { key: "--inv-sky", label: "Langit atas" },
    { key: "--inv-horizon", label: "Cakrawala" },
    { key: "--inv-hill", label: "Bukit" },
    { key: "--inv-sun", label: "Matahari" },
  ],
  base: (v) => ({ paper: v["--inv-paper"], accent: v["--inv-accent"], ink: v["--inv-ink"] }),
  swatch: ["--inv-sky", "--inv-horizon", "--inv-paper", "--inv-accent", "--inv-hill"],
  checks: [
    { fg: "--inv-ink", bg: "--inv-paper", label: "Teks di latar" },
    { fg: "--inv-ink", bg: "--inv-card", label: "Teks di kotak" },
    { fg: "--inv-paper", bg: "--inv-accent", label: "Teks di tombol" },
  ],
};
