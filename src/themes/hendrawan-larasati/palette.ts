import { deepen, mix, type ThemePalette, type Vars } from "../palette";

type Hl = {
  paper: string;
  wash: string;
  night: string;
  accent: string;
  gold: string;
  goldLight: string;
  ink: string;
  line: string;
  tape: string;
  tagA: string;
  tagB: string;
  noteA: string;
  noteB: string;
};

const vars = (c: Hl): Vars => ({
  "--inv-paper": c.paper,
  "--inv-wash": c.wash,
  "--inv-night": c.night,
  "--inv-accent": c.accent,
  "--inv-gold": c.gold,
  "--inv-gold-light": c.goldLight,
  "--inv-ink": c.ink,
  "--inv-line": c.line,
  "--inv-tape": c.tape,
  "--inv-tag-a": c.tagA,
  "--inv-tag-b": c.tagB,
  "--inv-note-a": c.noteA,
  "--inv-note-b": c.noteB,
});

// Palet Herbarium. Warna aksen dipakai untuk judul, hijau daun untuk keterangan, dan dua warna pastel untuk label gantung.
export const palette: ThemePalette = {
  presets: [
    {
      id: "anggrek",
      name: "Anggrek",
      vars: vars({ paper: "#F4EFE6", wash: "#FAF7F1", night: "#2A1422", accent: "#5E1F3D", gold: "#2F4A36", goldLight: "#D4B06A", ink: "#1F1B1D", line: "#BDB1A4", tape: "#B08A3E", tagA: "#C6A9C4", tagB: "#B8C4A8", noteA: "#E6D8E4", noteB: "#DDE3D3" }),
    },
    {
      id: "lavender",
      name: "Lavender",
      vars: vars({ paper: "#F2F0F2", wash: "#F9F8FA", night: "#241A33", accent: "#4B3A78", gold: "#3E5A4A", goldLight: "#CDB36F", ink: "#1D1B22", line: "#BCB4C2", tape: "#A98F55", tagA: "#BDB3D6", tagB: "#B6C6B4", noteA: "#E3DEEE", noteB: "#DCE5DA" }),
    },
    {
      id: "sage",
      name: "Sage",
      vars: vars({ paper: "#F1F2EA", wash: "#F8F9F4", night: "#1C2A22", accent: "#3D5E48", gold: "#6B4E3A", goldLight: "#D0B06C", ink: "#1B1F1C", line: "#B5BBAA", tape: "#A8904F", tagA: "#B9CBB2", tagB: "#D6BFA8", noteA: "#DFE8DA", noteB: "#EDE1D3" }),
    },
    {
      id: "persik",
      name: "Persik",
      vars: vars({ paper: "#F7EFE8", wash: "#FCF8F4", night: "#3A1E16", accent: "#9A4A32", gold: "#4A5A3A", goldLight: "#D9AE6E", ink: "#221A17", line: "#C9B6A6", tape: "#B98A4A", tagA: "#E3B9A6", tagB: "#BFCBA8", noteA: "#F3DDD2", noteB: "#E0E6D4" }),
    },
  ],
  derive: ({ paper, accent, ink }) => {
    const gold = mix("#2F4A36", accent, 0.3);
    return vars({
      paper,
      accent,
      ink,
      gold,
      wash: mix(paper, "#FFFFFF", 0.5),
      night: deepen(mix(accent, ink, 0.4), 0.03),
      goldLight: mix("#D4B06A", accent, 0.1),
      line: mix(paper, ink, 0.25),
      tape: mix("#B08A3E", accent, 0.2),
      tagA: mix(accent, paper, 0.68),
      tagB: mix(gold, paper, 0.68),
      noteA: mix(accent, paper, 0.84),
      noteB: mix(gold, paper, 0.84),
    });
  },
  base: (v) => ({ paper: v["--inv-paper"], accent: v["--inv-accent"], ink: v["--inv-ink"] }),
  swatch: ["--inv-paper", "--inv-accent", "--inv-gold", "--inv-tag-a", "--inv-tag-b"],
  checks: [
    { fg: "--inv-ink", bg: "--inv-paper", label: "Teks di latar terang" },
    { fg: "--inv-accent", bg: "--inv-paper", label: "Judul dan aksen" },
    { fg: "--inv-gold", bg: "--inv-paper", label: "Teks keterangan hijau" },
    { fg: "--inv-ink", bg: "--inv-tag-a", label: "Teks di label gantung" },
  ],
};
