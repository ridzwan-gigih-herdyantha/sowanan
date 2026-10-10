import { mediaUrl as u } from "@/lib/storage/media";
import { THEME_MUSIC } from "@/themes/media";
import { resolveFonts } from "@/themes/fonts";
import { resolvePalette } from "@/themes/palettes";
import { RULE_ICONS, type ExtraAnchor, type ExtraKind, type ExtraTone, type InvitationData, type RuleIcon, type SectionKey } from "./schema";
import { extraAnchors, HEX } from "./spec";

const ZONES = { WIB: "Asia/Jakarta", WITA: "Asia/Makassar", WIT: "Asia/Jayapura" } as const;

function parts(iso: string, tz: keyof typeof ZONES) {
  const fmt = new Intl.DateTimeFormat("id-ID", {
    timeZone: ZONES[tz],
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(new Date(iso));
  const get = (t: string) => fmt.find((p) => p.type === t)?.value ?? "";
  const num = new Intl.DateTimeFormat("en-GB", { timeZone: ZONES[tz], day: "2-digit", month: "2-digit", year: "numeric" })
    .format(new Date(iso))
    .split("/");
  return { weekday: get("weekday"), day: get("day"), month: get("month"), year: get("year"), dd: num[0], mm: num[1], yyyy: num[2] };
}

export type ExtraView = {
  kind: ExtraKind;
  title: string;
  rundown: { time: string; name: string; note: string }[];
  plan: { src: string; w: number; h: number; alt: string } | null;
  colors: { name: string; hex: string }[];
  rules: { text: string; icon: RuleIcon }[];
  note: string;
  body: string;
  tone: ExtraTone;
  photos: { src: string; w: number; h: number; alt: string }[];
  videos: { src: string; poster: string }[];
  tracks: { src: string; cover: string; title: string; artist: string }[];
};

// Bagian tambahan dikelompokkan per posisi. Posisi yang tidak ada di tema (misalnya setelah ganti tema) tampil sebelum Penutup.
function groupExtras(d: InvitationData, theme: string) {
  const known = new Set(extraAnchors(theme).map((a) => a.value));
  const out: Partial<Record<ExtraAnchor, ExtraView[]>> = {};
  for (const e of d.extras) {
    const photos = e.photos.filter((p) => p.src).map((p, i) => ({ src: u(p.src), w: p.w || 1600, h: p.h || 1200, alt: `${e.title || "Foto"} ${i + 1}` }));
    const videos = e.videos.filter((v) => v.src).map((v) => ({ src: u(v.src), poster: u(v.poster) }));
    const tracks = e.tracks.filter((t) => t.src).map((t, i) => ({ src: u(t.src), cover: u(t.cover), title: t.title || `Lagu ${i + 1}`, artist: t.artist }));
    const rundown = e.kind === "rundown" ? e.rundown.filter((r) => r.time.trim() || r.name.trim()) : [];
    const plan = e.kind === "denah" && e.plan.src ? { src: u(e.plan.src), w: e.plan.w || 1600, h: e.plan.h || 1200, alt: e.title || "Denah lokasi" } : null;
    const rules =
      e.kind === "imbauan" ? e.rules.filter((r) => r.text.trim()).map((r) => ({ text: r.text.trim(), icon: (r.icon in RULE_ICONS ? r.icon : "umum") as RuleIcon })) : [];
    const colors = e.kind === "dresscode" ? e.colors.filter((c) => HEX.test(c.hex.trim())).map((c) => ({ name: c.name.trim(), hex: c.hex.trim() })) : [];
    // Jenis siap pakai tampil kalau isi utamanya ada. Blok bebas cukup salah satu isiannya terisi.
    const empty = { rundown: !rundown.length, denah: !plan, dresscode: !colors.length, imbauan: !rules.length, bebas: !e.title.trim() && !e.body.trim() && !photos.length && !videos.length && !tracks.length };
    if (empty[e.kind]) continue;
    const at = known.has(e.after) ? e.after : "wishes";
    const bebas = e.kind === "bebas";
    (out[at] ??= []).push({
      kind: e.kind,
      title: e.title,
      body: bebas ? e.body : "",
      rundown,
      plan,
      colors,
      rules,
      note: bebas ? "" : e.note.trim(),
      tone: e.tone,
      photos: bebas ? photos : [],
      videos: bebas ? videos : [],
      tracks: bebas ? tracks : [],
    });
  }
  return out;
}

export function toView(slug: string, d: InvitationData, theme = "") {
  const p = parts(d.event.start, d.event.timezone);
  const s = d.sections;
  const palette = resolvePalette(theme, d.style);
  const enabled = Object.fromEntries(Object.entries(s).map(([k, v]) => [k, Boolean(v.enabled)])) as Record<SectionKey, boolean>;

  return {
    slug,
    // Dipakai komponen bersama, misalnya bagian tambahan, untuk menyesuaikan gaya dengan tema.
    theme,
    monogram: d.monogram,
    groom: { ...d.couple.groom, photo: u(d.couple.groom.photo || d.media.hero) },
    bride: { ...d.couple.bride, photo: u(d.couple.bride.photo || d.media.hero) },
    date: d.event.start,
    end: d.event.end,
    tz: d.event.timezone,
    dayLabel: p.weekday,
    dateShort: `${p.dd} . ${p.mm} . ${p.yyyy}`,
    dateLong: `${p.weekday}, ${p.day} ${p.month} ${p.year}`,
    filmStamp: `'${p.yyyy.slice(2)} ${p.mm} ${p.dd}`,
    city: d.event.city,
    cityShort: d.event.city.split(",")[0].trim(),
    dayMonth: `${p.dd}.${p.mm}`,
    code: `${p.dd}${p.mm}`,
    credit: d.copy.credit,
    place: d.event.city,
    venue: d.event.venue,
    events: d.event.schedule.map((e) => ({ ...e, until: e.until || undefined })),
    rsvpDeadline: d.event.rsvpDeadline,
    tagline: d.copy.tagline,
    quote: d.copy.quote,
    honor: d.copy.honor,
    heroQuote: d.copy.heroQuote,
    rsvpQuote: d.copy.rsvpQuote,
    latinPair: d.copy.latinPair,
    collection: d.copy.collection,
    sesanti: d.copy.sesanti,
    sesantiArti: d.copy.sesantiArti,
    ayat: d.copy.ayat,
    ayatArti: d.copy.ayatArti,
    ayatSumber: d.copy.ayatSumber,
    share: d.share,
    images: {
      hero: u(d.media.hero),
      heroWide: u(d.media.heroWide),
      og: u(d.media.og),
      venue: u(d.media.venue || d.media.hero),
      couple: u(d.media.couple || s.couple.photos[0]?.src || d.media.heroWide),
      closing: u(d.media.closing || d.media.hero),
      detail: u(d.media.detail || d.media.hero),
      rsvp: u(d.media.rsvp || d.media.heroWide),
      qris: u(s.gifts.qris),
    },
    giftNote: s.gifts.note,
    music: u(d.media.music || THEME_MUSIC[theme] || ""),
    story: s.story.items.map((i) => ({ ...i, image: u(i.image), video: i.video?.src ? { src: u(i.video.src), poster: u(i.video.poster || i.image) } : undefined })),
    gallery: s.gallery.photos.map((p) => ({ ...p, src: u(p.src) })),
    gifts: s.gifts.accounts,
    couplePhotos: s.couple.photos.map((p) => ({ ...p, src: u(p.src) })),
    polaroids: s.collage.polaroids.map((p) => ({ ...p, src: u(p.src) })),
    specimens: s.specimens.items.map((p) => ({ ...p, src: u(p.src) })),
    on: enabled,
    extras: groupExtras(d, theme),
    palette,
    fonts: resolveFonts(theme, d.style),
    pageColor: palette["--inv-paper"] ?? "",
  };
}

export type InvitationView = ReturnType<typeof toView>;

export function calendarEventOf(v: InvitationView) {
  return {
    title: `Pernikahan ${v.groom.name} & ${v.bride.name}`,
    start: v.date,
    end: v.end,
    location: `${v.venue.name}, ${v.venue.address}`,
    details: `Undangan: https://sowanan.com/${v.slug}`,
  };
}
