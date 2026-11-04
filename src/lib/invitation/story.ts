import { SITE_URL } from "@/lib/site";
import { storyFonts } from "@/themes/fonts";
import { resolvePalette } from "@/themes/palettes";
import type { InvitationData } from "./schema";
import { toView } from "./view";

export type StoryData = {
  groom: string;
  bride: string;
  date: string;
  venue: string;
  city: string;
  link: string;
  colors: { paper: string; ink: string; accent: string; gold: string };
  // plain berarti ligatur font itu dimatikan.
  fonts: { display: string; body: string; name: string; plainDisplay: boolean; plainName: boolean };
};

// Isi gambar story: nama, tanggal, lokasi, dan alamat link, dengan palet dan font undangan.
// Kosong kalau nama atau tanggal belum diisi, karena gambarnya tidak bisa dipakai tanpa keduanya.
export function storyData(slug: string, d: InvitationData, theme: string): StoryData | null {
  if (!d.couple.groom.name.trim() || !d.couple.bride.name.trim() || !Number.isFinite(Date.parse(d.event.start))) return null;
  const v = toView(slug, d, theme);
  const p = resolvePalette(theme, d.style);
  const ink = p["--inv-ink"] ?? "#1F1A17";
  const accent = p["--inv-accent"] ?? ink;
  return {
    groom: d.couple.groom.name.trim(),
    bride: d.couple.bride.name.trim(),
    date: v.dateLong,
    venue: v.venue.name,
    city: v.cityShort,
    link: `${new URL(SITE_URL).host}/${slug}`,
    colors: { paper: p["--inv-paper"] ?? "#FFFFFF", ink, accent, gold: p["--inv-gold"] ?? accent },
    fonts: storyFonts(theme, d.style),
  };
}
