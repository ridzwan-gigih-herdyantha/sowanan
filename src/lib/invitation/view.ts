import { mediaUrl as u } from "@/lib/storage/media";
import type { InvitationData, SectionKey } from "./schema";

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

export function toView(slug: string, d: InvitationData) {
  const p = parts(d.event.start, d.event.timezone);
  const s = d.sections;
  const enabled = Object.fromEntries(Object.entries(s).map(([k, v]) => [k, Boolean(v?.enabled)])) as Record<SectionKey, boolean>;

  return {
    slug,
    monogram: d.monogram,
    groom: { ...d.couple.groom, photo: u(d.couple.groom.photo ?? d.media.hero) },
    bride: { ...d.couple.bride, photo: u(d.couple.bride.photo ?? d.media.hero) },
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
    credit: d.copy.credit ?? "",
    place: d.event.city,
    venue: d.event.venue,
    events: d.event.schedule,
    rsvpDeadline: d.event.rsvpDeadline,
    tagline: d.copy.tagline ?? "",
    quote: d.copy.quote ?? "",
    honor: d.copy.honor,
    heroQuote: d.copy.heroQuote ?? "",
    rsvpQuote: d.copy.rsvpQuote ?? "",
    latinPair: d.copy.latinPair ?? "",
    collection: d.copy.collection ?? "",
    share: d.share,
    images: {
      hero: u(d.media.hero),
      heroWide: u(d.media.heroWide),
      og: u(d.media.og),
      venue: u(d.media.venue ?? d.media.hero),
      couple: u(d.media.couple ?? d.media.heroWide),
      closing: u(d.media.closing ?? d.media.hero),
      detail: u(d.media.detail ?? d.media.hero),
      rsvp: u(d.media.rsvp ?? d.media.heroWide),
      qris: u(s.gifts.qris ?? ""),
    },
    giftNote: s.gifts.note ?? "",
    music: u(d.media.music),
    story: s.story.items.map((i) => ({ ...i, image: u(i.image), video: i.video && { src: u(i.video.src), poster: u(i.video.poster) } })),
    gallery: s.gallery.photos.map((p) => ({ ...p, src: u(p.src) })),
    gifts: s.gifts.accounts,
    couplePhotos: (s.couple.photos ?? []).map((p) => ({ ...p, src: u(p.src) })),
    polaroids: (s.collage?.polaroids ?? []).map((p) => ({ ...p, src: u(p.src) })),
    specimens: (s.specimens?.items ?? []).map((p) => ({ ...p, src: u(p.src) })),
    on: enabled,
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
