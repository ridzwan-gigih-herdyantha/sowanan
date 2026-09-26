import type { Purpose } from "@/lib/storage/media";

const BASE: Purpose[] = ["hero", "herowide", "og", "venue", "story", "video", "poster", "gallery", "qris", "music"];

export const THEME_MEDIA: Record<string, Purpose[]> = {
  "andi-rina": [...BASE, "couple", "polaroid", "closing"],
  "bagas-sekar": [...BASE, "couple", "rsvp"],
  "hendrawan-larasati": [...BASE, "groom", "bride", "specimen"],
};

export const THEME_NAMES: Record<string, string> = {
  "andi-rina": "Senja Kota",
  "bagas-sekar": "Ruang",
  "hendrawan-larasati": "Herbarium",
};

export function invitationLabel(slug: string, theme: string): string {
  const name = THEME_NAMES[theme] ?? theme;
  return slug === theme ? `Contoh tema ${name}` : `${slug} (tema ${name})`;
}

export const themeMedia = (theme: string): Purpose[] => THEME_MEDIA[theme] ?? BASE;
