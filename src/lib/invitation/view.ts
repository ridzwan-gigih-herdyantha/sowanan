import type { GuestSession } from "@/lib/guests";
import { mediaUrl as u } from "@/lib/storage/media";
import { THEME_MUSIC } from "@/themes/media";
import { customFontLinks, resolveFonts } from "@/themes/fonts";
import { resolvePalette } from "@/themes/palettes";
import { THEME_HEADINGS } from "@/themes/headings";
import { mergeHeadings } from "./headings";
import { RULE_ICONS, type ExtraAnchor, type ExtraKind, type ExtraTone, type InvitationData, type RuleIcon, type SectionKey } from "./schema";
import { extraAnchors, HEX } from "./spec";
import { cleanFrames, frameProps } from "./frame";
import { streamOf } from "./stream";

const ZONES = { WIB: "Asia/Jakarta", WITA: "Asia/Makassar", WIT: "Asia/Jayapura" } as const;
const OFFSETS = { WIB: "+07:00", WITA: "+08:00", WIT: "+09:00" } as const;

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

// Ringkasan cerita dari awal cerita lengkap, dipotong di batas kata.
function excerpt(text: string, max = 140) {
  const t = text.trim();
  return t.length <= max ? t : `${t.slice(0, t.lastIndexOf(" ", max))}...`;
}

export type ExtraView = {
  kind: ExtraKind;
  title: string;
  rundown: { time: string; name: string; note: string }[];
  plan: { src: string; w: number; h: number; alt: string } | null;
  colors: { name: string; hex: string }[];
  rules: { text: string; icon: RuleIcon }[];
  // youtube berisi id video kalau tautannya bisa diputar di halaman. platform kosong berarti tidak dikenali.
  stream: { url: string; youtube: string; platform: string; time: string } | null;
  note: string;
  body: string;
  tone: ExtraTone;
  photos: { src: string; w: number; h: number; alt: string }[];
  videos: { src: string; poster: string }[];
  tracks: { src: string; cover: string; title: string; artist: string }[];
  youtube: { id: string; title: string }[];
  // Video dari add-on, bukan bagian tambahan isian admin.
  video?: boolean;
  // Galeri pasca acara dari add-on. Tema aula memberinya kios sendiri, bukan kios bagian tambahan.
  postGallery?: boolean;
};

const postPhotos = (d: InvitationData) => d.postGallery.filter((p) => p.src).map((p, i) => ({ ...p, src: u(p.src), w: p.w || 1600, h: p.h || 1200, alt: p.alt || `Foto pasca acara ${i + 1}` }));

// Dikelompokkan per posisi. Posisi yang tidak ada di tema (misal setelah ganti tema) tampil sebelum Penutup.
function groupExtras(d: InvitationData, theme: string) {
  const known = new Set(extraAnchors(theme).map((a) => a.value));
  const out: Partial<Record<ExtraAnchor, ExtraView[]>> = {};
  for (const e of d.extras) {
    const photos = e.photos.filter((p) => p.src).map((p, i) => ({ src: u(p.src), w: p.w || 1600, h: p.h || 1200, alt: `${e.title || "Foto"} ${i + 1}` }));
    const videos = e.videos.filter((v) => v.src).map((v) => ({ src: u(v.src), poster: u(v.poster) }));
    // Tautan YouTube yang id videonya tidak dikenali diabaikan.
    const youtube = e.youtube.map((y) => ({ id: streamOf(y.url.trim(), "", "")?.youtube ?? "", title: y.title.trim() })).filter((y) => y.id);
    const tracks = e.tracks.filter((t) => t.src).map((t, i) => ({ src: u(t.src), cover: u(t.cover), title: t.title || `Lagu ${i + 1}`, artist: t.artist }));
    const rundown = e.kind === "rundown" ? e.rundown.filter((r) => r.time.trim() || r.name.trim()) : [];
    const plan = e.kind === "denah" && e.plan.src ? { src: u(e.plan.src), w: e.plan.w || 1600, h: e.plan.h || 1200, alt: e.title || "Denah lokasi" } : null;
    const rules =
      e.kind === "imbauan" ? e.rules.filter((r) => r.text.trim()).map((r) => ({ text: r.text.trim(), icon: (r.icon in RULE_ICONS ? r.icon : "umum") as RuleIcon })) : [];
    const stream = e.kind === "siaran" ? streamOf(e.stream.url.trim(), e.stream.time.trim(), d.event.timezone) : null;
    const colors = e.kind === "dresscode" ? e.colors.filter((c) => HEX.test(c.hex.trim())).map((c) => ({ name: c.name.trim(), hex: c.hex.trim() })) : [];
    // Jenis siap pakai tampil kalau isi utamanya ada. Blok bebas cukup salah satu isiannya terisi.
    const empty = { rundown: !rundown.length, denah: !plan, dresscode: !colors.length, imbauan: !rules.length, siaran: !stream, bebas: !e.title.trim() && !e.body.trim() && !photos.length && !videos.length && !tracks.length && !youtube.length };
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
      stream,
      note: bebas ? "" : e.note.trim(),
      tone: e.tone,
      photos: bebas ? photos : [],
      videos: bebas ? videos : [],
      tracks: bebas ? tracks : [],
      youtube: bebas ? youtube : [],
    });
  }
  // Video add-on selalu di posisi yang sama di semua tema: setelah Galeri, mendahului bagian tambahan di sana.
  const video = streamOf(d.video.trim(), "", "");
  if (video?.youtube) {
    (out.gallery ??= []).unshift({
      kind: "siaran",
      title: "Video Kami",
      video: true,
      body: "",
      rundown: [],
      plan: null,
      colors: [],
      rules: [],
      stream: { ...video, platform: "" },
      note: "",
      tone: "paper",
      photos: [],
      videos: [],
      tracks: [],
      youtube: [],
    });
  }
  // Galeri pasca acara tepat setelah Galeri, jadi tetap tampil walau bagian Galeri dimatikan.
  const post = postPhotos(d);
  if (post.length) {
    (out.gallery ??= []).unshift({
      kind: "bebas",
      title: "Galeri Pasca Acara",
      postGallery: true,
      body: "",
      rundown: [],
      plan: null,
      colors: [],
      rules: [],
      stream: null,
      note: "",
      tone: "paper",
      photos: post,
      videos: [],
      tracks: [],
      youtube: [],
    });
  }
  return out;
}

export function toView(slug: string, d: InvitationData, theme = "") {
  const p = parts(d.event.start, d.event.timezone);
  const s = d.sections;
  const palette = resolvePalette(theme, d.style);
  const enabled = Object.fromEntries(Object.entries(s).map(([k, v]) => [k, Boolean(v.enabled)])) as Record<SectionKey, boolean>;
  // Undangan tanpa foto boleh: bagian yang isinya hanya foto disembunyikan.
  if (!s.gallery.photos.length) enabled.gallery = false;
  if (!s.collage.polaroids.length) enabled.collage = false;
  if (!s.specimens.items.length) enabled.specimens = false;
  const frames = cleanFrames(d.frames);
  const dateLong = `${p.weekday}, ${p.day} ${p.month} ${p.year}`;
  const events = d.event.schedule.map((e) => {
    // Tempat sendiri tidak mewarisi peta utama, supaya link tidak menunjuk lokasi lain.
    const own = Boolean(e.venue.trim() || e.address.trim() || e.mapUrl.trim());
    const day = e.date ? parts(`${e.date}T12:00:00+07:00`, "WIB") : null;
    return {
      ...e,
      until: e.until || undefined,
      dateLabel: day ? `${day.weekday}, ${day.day} ${day.month} ${day.year}` : dateLong,
      clock: e.time ? `${e.time}${e.until ? ` sampai ${e.until}` : ""} ${d.event.timezone}` : "",
      place: own ? { name: e.venue, address: e.address, mapUrl: e.mapUrl } : d.event.venue,
      separate: own || Boolean(e.date),
    };
  });

  return {
    slug,
    // Kode tamu di undangan private, supaya link di kalender tetap bisa dibuka.
    accessCode: "",
    // Dipakai komponen bersama, misalnya bagian tambahan, untuk menyesuaikan gaya dengan tema.
    theme,
    monogram: d.monogram,
    groom: { ...d.couple.groom, photo: u(d.couple.groom.photo || d.media.hero), frame: frameProps(frames, "groom") },
    bride: { ...d.couple.bride, photo: u(d.couple.bride.photo || d.media.hero), frame: frameProps(frames, "bride") },
    date: d.event.start,
    end: d.event.end,
    tz: d.event.timezone,
    dayLabel: p.weekday,
    dateShort: `${p.dd} . ${p.mm} . ${p.yyyy}`,
    dateLong,
    filmStamp: `'${p.yyyy.slice(2)} ${p.mm} ${p.dd}`,
    city: d.event.city,
    cityShort: d.event.city.split(",")[0].trim(),
    dayMonth: `${p.dd}.${p.mm}`,
    code: `${p.dd}${p.mm}`,
    credit: d.copy.credit,
    place: d.event.city,
    venue: d.event.venue,
    events,
    // Tema menampilkan Agenda miliknya kalau ada acara dengan tanggal atau tempat sendiri, atau tanpa jam.
    agenda: events.some((e) => e.separate || !e.time),
    rsvpDeadline: d.event.rsvpDeadline,
    tagline: d.copy.tagline,
    headline: d.copy.headline.trim() || d.event.city.split(",")[0].trim(),
    quote: d.copy.quote,
    honor: d.copy.honor,
    heroQuote: d.copy.heroQuote,
    rsvpQuote: d.copy.rsvpQuote,
    latinPair: d.copy.latinPair,
    collection: d.copy.collection,
    sesanti: d.copy.sesanti,
    sesantiArti: d.copy.sesantiArti,
    umpasa: d.copy.umpasa,
    umpasaArti: d.copy.umpasaArti,
    ayat: d.copy.ayat,
    ayatArti: d.copy.ayatArti,
    ayatSumber: d.copy.ayatSumber,
    headings: mergeHeadings(THEME_HEADINGS[theme], d.copy.headings),
    share: d.share,
    images: {
      hero: u(d.media.hero || d.media.heroWide),
      heroWide: u(d.media.heroWide || d.media.hero),
      og: u(d.media.og),
      venue: u(d.media.venue || d.media.hero),
      couple: u(d.media.couple || s.couple.photos[0]?.src || d.media.heroWide),
      closing: u(d.media.closing || d.media.hero),
      detail: u(d.media.detail || d.media.hero),
      rsvp: u(d.media.rsvp || d.media.heroWide),
      qris: u(s.gifts.qris),
    },
    // Atribut posisi dan zoom foto untuk img. heroArt untuk foto hero yang berganti potret dan lebar.
    frame: {
      hero: frameProps(frames, "hero"),
      heroWide: frameProps(frames, "heroWide"),
      heroArt: frameProps(frames, "hero", "heroWide"),
      couple: frameProps(frames, "couple"),
      venue: frameProps(frames, "venue"),
      closing: frameProps(frames, "closing"),
      rsvp: frameProps(frames, "rsvp"),
    },
    giftNote: s.gifts.note,
    music: u(d.media.music || THEME_MUSIC[theme] || ""),
    story: s.story.items.map((i) => ({ ...i, short: i.short.trim() || excerpt(i.long), image: u(i.image), video: i.video?.src ? { src: u(i.video.src), poster: u(i.video.poster || i.image) } : undefined })),
    gallery: s.gallery.photos.map((p) => ({ ...p, src: u(p.src) })),
    postGallery: postPhotos(d),
    gifts: s.gifts.accounts,
    couplePhotos: s.couple.photos.map((p) => ({ ...p, src: u(p.src) })),
    polaroids: s.collage.polaroids.map((p) => ({ ...p, src: u(p.src) })),
    specimens: s.specimens.items.map((p) => ({ ...p, src: u(p.src) })),
    on: enabled,
    extras: groupExtras(d, theme),
    palette,
    // Monogram ikut sebagai variabel supaya tempat foto yang kosong bisa menampilkannya tanpa perlu props.
    fonts: { ...resolveFonts(theme, d.style), "--inv-monogram": JSON.stringify(d.monogram || [d.couple.groom.name, d.couple.bride.name].map((n) => n.trim().charAt(0)).filter(Boolean).join(" & ")) },
    fontLinks: customFontLinks(d.style),
    pageColor: palette["--inv-paper"] ?? "",
  };
}

export type InvitationView = ReturnType<typeof toView>;

// Jam acara untuk satu tamu, dihitung di server supaya jam sesi lain tidak ikut terkirim ke browser. only kosong
// berarti semua sesi. Sesi menggantikan item yang dibagi. Item kosong atau namanya sudah berubah berarti seluruh
// susunan acara diganti, supaya tamu satu sesi tidak pernah melihat jam di luar sesinya.
export function withSessions(v: InvitationView, sessions: GuestSession[], item: string | null, only: number | null): InvitationView {
  const shown = only === null ? sessions : sessions.filter((s) => s.id === only);
  if (!shown.length) return v;
  const at = item ? v.events.findIndex((e) => e.name === item) : -1;
  const base = v.events[at];
  const entries = shown.map((s) => ({
    ...(base ?? { date: "", venue: "", address: "", mapUrl: "", dateLabel: v.dateLong, place: v.venue, separate: false }),
    name: base ? `${base.name}, ${s.name}` : s.name,
    time: s.time,
    until: s.until || undefined,
    clock: `${s.time}${s.until ? ` sampai ${s.until}` : ""} ${v.tz}`,
  }));
  const events = at < 0 ? entries : [...v.events.slice(0, at), ...entries, ...v.events.slice(at + 1)];
  if (only === null || !Date.parse(v.date)) return { ...v, events };
  // Hitung mundur dan kalender tamu satu sesi mengikuti jam sesinya.
  const p = parts(v.date, v.tz);
  const iso = (clock: string) => `${p.yyyy}-${p.mm}-${p.dd}T${clock.replace(".", ":")}:00${OFFSETS[v.tz]}`;
  const date = iso(shown[0].time);
  return { ...v, events, date, end: shown[0].until ? iso(shown[0].until) : new Date(Date.parse(date) + 2 * 3600_000).toISOString() };
}

export function calendarEventOf(v: InvitationView) {
  return {
    title: `Pernikahan ${v.groom.name} & ${v.bride.name}`,
    start: v.date,
    // Acara beberapa hari disimpan sebagai acara pertama, bukan satu acara sepanjang rentang hari.
    end: v.agenda && v.end.slice(0, 10) !== v.date.slice(0, 10) ? new Date(Date.parse(v.date) + 3 * 3600_000).toISOString() : v.end,
    location: `${v.venue.name}, ${v.venue.address}`,
    details: `Undangan: https://sowanan.com/${v.slug}${v.accessCode ? `?k=${v.accessCode}` : ""}`,
  };
}
