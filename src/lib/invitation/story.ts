import { hijri } from "@/lib/hijri";
import { pasaran } from "@/lib/javanese";
import { SITE_URL } from "@/lib/site";
import { storyFonts } from "@/themes/fonts";
import { resolvePalette } from "@/themes/palettes";
import type { FrameSlot, Frames } from "./frame";
import { cleanFrames } from "./frame";
import type { InvitationData } from "./schema";
import { toView } from "./view";

// x dan y adalah titik fokus dalam persen, z adalah zoom, sama dengan pengaturan posisi foto di editor.
export type StoryPhoto = { src: string; x: number; y: number; z: number };

export type StoryData = {
  theme: string;
  groom: string;
  bride: string;
  monogram: string;
  initials: [string, string];
  date: string;
  weekday: string;
  day: string;
  month: string;
  year: string;
  dateShort: string;
  stamp: string;
  hijri: string;
  pasaran: string;
  venue: string;
  city: string;
  headline: string;
  tagline: string;
  latinPair: string;
  aksara: { groom: string; bride: string };
  link: string;
  colors: { paper: string; ink: string; accent: string; gold: string; night: string; wash: string; card: string; goldLight: string; line: string };
  palette: Record<string, string>;
  // plain berarti ligatur font itu dimatikan. customName berarti font nama dipilih di add-on.
  fonts: ReturnType<typeof storyFonts>;
  photos: { hero: StoryPhoto | null; wide: StoryPhoto | null; couple: StoryPhoto | null; closing: StoryPhoto | null; venue: StoryPhoto | null; groom: StoryPhoto | null; bride: StoryPhoto | null; extra: StoryPhoto[] };
};

const toPhoto = (src: string, frames: Frames, slot?: FrameSlot): StoryPhoto | null => {
  if (!src) return null;
  const f = slot ? frames[slot]?.hp : undefined;
  return { src, x: f?.x ?? 50, y: f?.y ?? 50, z: f?.z ?? 1 };
};

// Isi gambar story: nama, tanggal, lokasi, dan alamat link, dengan palet, font, dan foto undangan.
// Kosong kalau nama atau tanggal belum diisi, karena gambarnya tidak bisa dipakai tanpa keduanya.
export function storyData(slug: string, d: InvitationData, theme: string): StoryData | null {
  const groom = d.couple.groom.name.trim();
  const bride = d.couple.bride.name.trim();
  if (!groom || !bride || !Number.isFinite(Date.parse(d.event.start))) return null;
  const v = toView(slug, d, theme);
  const p = resolvePalette(theme, d.style);
  const frames = cleanFrames(d.frames);
  const ink = p["--inv-ink"] ?? "#1F1A17";
  const paper = p["--inv-paper"] ?? "#FFFFFF";
  const accent = p["--inv-accent"] ?? ink;
  const gold = p["--inv-gold"] ?? accent;
  const initials: [string, string] = [groom.charAt(0).toUpperCase(), bride.charAt(0).toUpperCase()];
  // Foto cadangan untuk template kolase, urut dari galeri lalu foto pasangan dan cerita.
  const extra = [...v.gallery, ...v.postGallery, ...v.couplePhotos, ...v.story.map((s) => ({ src: s.image }))].map((x) => toPhoto(x.src, frames)).filter((x): x is StoryPhoto => Boolean(x)).slice(0, 6);
  return {
    theme,
    groom,
    bride,
    monogram: d.monogram.trim() || initials.join(" & "),
    initials,
    date: v.dateLong,
    weekday: v.dayLabel,
    day: v.dateLong.split(" ")[1] ?? "",
    month: v.dateLong.split(" ")[2] ?? "",
    year: v.dateLong.split(" ")[3] ?? "",
    dateShort: v.dateShort,
    stamp: v.filmStamp,
    hijri: hijri(d.event.start, d.event.timezone),
    pasaran: pasaran(d.event.start, d.event.timezone),
    venue: v.venue.name,
    city: v.cityShort,
    headline: v.headline,
    tagline: v.tagline,
    latinPair: v.latinPair,
    aksara: { groom: d.couple.groom.aksara.trim(), bride: d.couple.bride.aksara.trim() },
    link: `${new URL(SITE_URL).host}/${slug}`,
    colors: {
      paper,
      ink,
      accent,
      gold,
      night: p["--inv-night"] ?? ink,
      wash: p["--inv-wash"] ?? paper,
      card: p["--inv-card"] ?? paper,
      goldLight: p["--inv-gold-light"] ?? gold,
      line: p["--inv-line"] ?? gold,
    },
    palette: p,
    fonts: storyFonts(theme, d.style),
    photos: {
      hero: toPhoto(v.images.hero, frames, d.media.hero ? "hero" : "heroWide"),
      wide: toPhoto(v.images.heroWide, frames, d.media.heroWide ? "heroWide" : "hero"),
      couple: toPhoto(v.images.couple, frames, d.media.couple ? "couple" : undefined),
      closing: toPhoto(v.images.closing, frames, d.media.closing ? "closing" : undefined),
      venue: toPhoto(v.images.venue, frames, d.media.venue ? "venue" : undefined),
      groom: toPhoto(v.groom.photo, frames, d.couple.groom.photo ? "groom" : undefined),
      bride: toPhoto(v.bride.photo, frames, d.couple.bride.photo ? "bride" : undefined),
      extra,
    },
  };
}
