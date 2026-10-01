// Palet warna undangan. Setiap tema punya beberapa palet jadi (preset) dan satu cara menurunkan palet kustom
// dari tiga warna dasar. Nilai palet dipasang sebagai CSS variable di elemen terluar tema.

export type Vars = Record<`--${string}`, string>;
export type Base = { paper: string; accent: string; ink: string };
export type Preset = { id: string; name: string; vars: Vars };
export type Check = { fg: `--${string}`; bg: `--${string}`; label: string };

export type ThemePalette = {
  presets: Preset[];
  derive: (b: Base) => Vars;
  base: (v: Vars) => Base;
  swatch: `--${string}`[];
  checks: Check[];
};

export const CUSTOM = "kustom";

export const isHex = (s: string) => /^#[0-9a-f]{6}$/i.test(s);

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c: number[]) => "#" + c.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0")).join("").toUpperCase();

// Campur dua warna, t = porsi warna kedua.
export function mix(a: string, b: string, t: number) {
  const x = rgb(a);
  const y = rgb(b);
  return toHex(x.map((v, i) => v + (y[i] - v) * t));
}

export function luminance(h: string) {
  const [r, g, b] = rgb(h).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (hi + 0.05) / (lo + 0.05);
}

// Gelapkan sampai luminansinya di bawah batas, untuk latar bagian gelap.
export function deepen(h: string, max = 0.05) {
  let c = h;
  for (let i = 0; i < 12 && luminance(c) > max; i++) c = mix(c, "#000000", 0.18);
  return c;
}

// Terangkan sampai luminansinya di atas batas, untuk teks terang di latar gelap.
export function brighten(h: string, min = 0.6) {
  let c = h;
  for (let i = 0; i < 12 && luminance(c) < min; i++) c = mix(c, "#FFFFFF", 0.2);
  return c;
}

export const MIN_CONTRAST = 4.5;
