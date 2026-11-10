import { SECTION_KEYS, type SectionKey } from "./schema";

// Judul tiap section: label kecil di atas judul, judul, dan subjudul di bawahnya. Tiap tema punya bawaan sendiri,
// mempelai boleh menggantinya. Isian kosong berarti memakai bawaan tema.
export const HEADING_PARTS = { label: "Label kecil", title: "Judul", subtitle: "Subjudul" } as const;
export type HeadingPart = keyof typeof HEADING_PARTS;
export type Heading = Record<HeadingPart, string>;
export type ThemeHeadings = Partial<Record<SectionKey, Partial<Heading>>>;

const EMPTY: Heading = { label: "", title: "", subtitle: "" };

export const headingPath = (section: string, part: HeadingPart) => `copy.headings.${section}.${part}`;

// Judul yang dipakai tema: isian mempelai bila ada, selain itu bawaan tema.
export function mergeHeadings(defaults: ThemeHeadings = {}, custom: Record<string, Partial<Heading>> = {}) {
  const out = {} as Record<SectionKey, Heading>;
  for (const k of SECTION_KEYS) {
    const base = { ...EMPTY, ...defaults[k] };
    const own = custom[k] ?? {};
    out[k] = { label: own.label?.trim() || base.label, title: own.title?.trim() || base.title, subtitle: own.subtitle?.trim() || base.subtitle };
  }
  return out;
}
