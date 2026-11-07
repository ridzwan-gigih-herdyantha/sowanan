import { GOOGLE_DECORATIVE_FONTS, GOOGLE_TEXT_FONTS } from "@/themes/google-fonts";

export const CUSTOM_FONT_SLOTS = [
  { key: "display", label: "Font judul" },
  { key: "body", label: "Font isi" },
  { key: "name", label: "Font nama mempelai" },
] as const;

export type CustomFontSlot = (typeof CUSTOM_FONT_SLOTS)[number]["key"];

const lookup = (list: readonly string[]) => new Map(list.map((name) => [name.toLowerCase(), name]));
const TEXT = lookup(GOOGLE_TEXT_FONTS);
const DECORATIVE = lookup(GOOGLE_DECORATIVE_FONTS);

// Nama font persis seperti di Google Fonts, tidak peka huruf besar kecil. Kosong bila tidak ada di katalog.
export const canonicalFont = (name: string) => {
  const key = name.trim().replace(/\s+/g, " ").toLowerCase();
  return TEXT.get(key) ?? DECORATIVE.get(key) ?? "";
};

export const isDecorativeFont = (name: string) => DECORATIVE.has(canonicalFont(name).toLowerCase());

// Alasan nama font tidak bisa dipakai di tempat itu. Kosong berarti boleh.
export function customFontProblem(slot: CustomFontSlot, name: string): string | undefined {
  const found = canonicalFont(name);
  if (!found) return `"${name}" tidak ditemukan di Google Fonts. Tulis nama font persis seperti di fonts.google.com.`;
  if (slot === "body" && DECORATIVE.has(found.toLowerCase())) return `${found} adalah font tulisan tangan atau dekoratif, jadi hanya untuk judul dan nama mempelai.`;
  return undefined;
}
