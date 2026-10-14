import type { Purpose } from "@/lib/storage/media";

const BASE: Purpose[] = ["hero", "herowide", "og", "venue", "story", "video", "poster", "gallery", "qris", "music", "extra", "plan", "thumb"];

export const THEME_MEDIA: Record<string, Purpose[]> = {
  "andi-rina": [...BASE, "couple", "polaroid", "closing"],
  "bagas-sekar": [...BASE, "couple", "rsvp"],
  "hendrawan-larasati": [...BASE, "groom", "bride", "specimen"],
  "danang-kinanthi": [...BASE, "groom", "bride"],
  "fadhil-nayla": [...BASE, "groom", "bride"],
  "arya-kirana": [...BASE, "groom", "bride", "closing"],
  "bima-nadia": [...BASE, "groom", "bride", "closing"],
  "toni-layla": [...BASE, "groom", "bride", "closing"],
  "arkasa-mentari": [...BASE, "groom", "bride", "closing"],
};

export const THEME_NAMES: Record<string, string> = {
  "andi-rina": "Senja Kota",
  "bagas-sekar": "Ruang",
  "hendrawan-larasati": "Herbarium",
  "danang-kinanthi": "Pakeliran",
  "fadhil-nayla": "Sakinah",
  "arya-kirana": "Sutra",
  "bima-nadia": "Rembulan",
  "toni-layla": "Lensa",
  "arkasa-mentari": "Co-op Adventure",
};

// Lagu bawaan tema, dipakai kalau undangan tidak mengunggah musik sendiri.
export const THEME_MUSIC: Record<string, string> = {
  "andi-rina": "andi-rina/music_1.mp3?v=mui043e0",
  "bagas-sekar": "bagas-sekar/music_1.mp3?v=mui04hdd",
  "hendrawan-larasati": "hendrawan-larasati/music_1.mp3?v=mui04xmy",
  "fadhil-nayla": "fadhil-nayla/music_1.mp3?v=mupcmw7s",
  "arya-kirana": "arya-kirana/music_1.mp3?v=mv4z7a8w",
  "bima-nadia": "bima-nadia/music_1.mp3?v=mv50biaj",
  "toni-layla": "toni-layla/music_1.mp3?v=mv62kl8d",
};

export function invitationLabel(slug: string, theme: string): string {
  const name = THEME_NAMES[theme] ?? theme;
  return slug === theme ? `Contoh tema ${name}` : `${slug} (tema ${name})`;
}

export const themeMedia = (theme: string): Purpose[] => THEME_MEDIA[theme] ?? BASE;
