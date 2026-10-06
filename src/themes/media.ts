import type { Purpose } from "@/lib/storage/media";

const BASE: Purpose[] = ["hero", "herowide", "og", "venue", "story", "video", "poster", "gallery", "qris", "music", "extra"];

export const THEME_MEDIA: Record<string, Purpose[]> = {
  "andi-rina": [...BASE, "couple", "polaroid", "closing"],
  "bagas-sekar": [...BASE, "couple", "rsvp"],
  "hendrawan-larasati": [...BASE, "groom", "bride", "specimen"],
  "danang-kinanthi": [...BASE, "groom", "bride"],
  "fadhil-nayla": [...BASE, "groom", "bride"],
};

export const THEME_NAMES: Record<string, string> = {
  "andi-rina": "Senja Kota",
  "bagas-sekar": "Ruang",
  "hendrawan-larasati": "Herbarium",
  "danang-kinanthi": "Pakeliran",
  "fadhil-nayla": "Sakinah",
};

// Lagu bawaan tema, dipakai kalau undangan tidak mengunggah musik sendiri.
export const THEME_MUSIC: Record<string, string> = {
  "andi-rina": "andi-rina/music_1.mp3?v=mui043e0",
  "bagas-sekar": "bagas-sekar/music_1.mp3?v=mui04hdd",
  "hendrawan-larasati": "hendrawan-larasati/music_1.mp3?v=mui04xmy",
  "fadhil-nayla": "fadhil-nayla/music_1.mp3?v=mupcmw7s",
};

export function invitationLabel(slug: string, theme: string): string {
  const name = THEME_NAMES[theme] ?? theme;
  return slug === theme ? `Contoh tema ${name}` : `${slug} (tema ${name})`;
}

export const themeMedia = (theme: string): Purpose[] => THEME_MEDIA[theme] ?? BASE;
