import { z } from "zod";

// Bentuk data saja. Aturan wajib dan panjang ada di spec.ts supaya section yang mati boleh kosong.
const str = () => z.string().default("");
const num = () => z.number().default(0);
const list = <T extends z.ZodType>(item: T) => z.array(item).default([]);
const section = <T extends z.ZodRawShape>(shape: T) => z.object({ enabled: z.boolean().default(true), ...shape }).prefault({} as never);

const person = z
  .object({ name: str(), full: str(), role: str(), parents: str(), photo: str(), flower: str(), latin: str(), aksara: str() })
  .prefault({});

const storyItem = z.object({
  title: str(),
  date: str(),
  image: str(),
  short: str(),
  long: str(),
  video: z.object({ src: str(), poster: str() }).optional(),
  no: str(),
  place: str(),
});

const photo = z.object({ src: str(), w: num(), h: num(), alt: str(), caption: str(), no: str() });

export const SECTION_KEYS = [
  "couple",
  "story",
  "collage",
  "specimens",
  "event",
  "countdown",
  "gallery",
  "quiz",
  "rsvp",
  "gifts",
  "wishes",
  "closing",
] as const;

// Bagian tambahan di luar tema ditempatkan setelah pembuka atau setelah salah satu section.
export const EXTRA_ANCHORS = ["hero", ...SECTION_KEYS] as const;
export type ExtraAnchor = (typeof EXTRA_ANCHORS)[number];
// Warna latar bagian tambahan, semuanya diambil dari palet tema yang aktif.
export const EXTRA_TONES = { paper: "Latar utama tema", wash: "Latar kedua tema", accent: "Warna aksen tema", ink: "Gelap, warna teks tema" } as const;
export type ExtraTone = keyof typeof EXTRA_TONES;

export const TIMEZONES = { WIB: "+07:00", WITA: "+08:00", WIT: "+09:00" } as const;

export const invitationDataSchema = z.object({
  monogram: str(),
  couple: z.object({ groom: person, bride: person }).prefault({}),
  event: z
    .object({
      start: str(),
      end: str(),
      timezone: z.enum(["WIB", "WITA", "WIT"]).default("WIB"),
      city: str(),
      venue: z.object({ name: str(), address: str(), mapUrl: str() }).prefault({}),
      schedule: list(z.object({ time: str(), name: str(), until: str() })),
      rsvpDeadline: str(),
    })
    .prefault({}),
  copy: z
    .object({
      tagline: str(),
      quote: str(),
      honor: str(),
      heroQuote: str(),
      rsvpQuote: str(),
      latinPair: str(),
      collection: str(),
      credit: str(),
      sesanti: str(),
      sesantiArti: str(),
      ayat: str(),
      ayatArti: str(),
      ayatSumber: str(),
    })
    .prefault({}),
  share: z.object({ description: str(), ogDescription: str() }).prefault({}),
  style: z
    .object({
      palette: str(),
      font: str(),
      custom: z.object({ paper: str(), accent: str(), ink: str() }).prefault({}),
    })
    .prefault({}),
  media: z
    .object({ hero: str(), heroWide: str(), og: str(), music: str(), venue: str(), couple: str(), closing: str(), detail: str(), rsvp: str() })
    .prefault({}),
  sections: z
    .object({
      couple: section({ photos: list(z.object({ src: str(), alt: str() })) }),
      story: section({ items: list(storyItem) }),
      collage: section({ polaroids: list(z.object({ src: str(), caption: str(), rotate: num() })) }),
      specimens: section({ items: list(z.object({ src: str(), w: num(), h: num(), latin: str(), local: str(), no: str() })) }),
      event: section({}),
      countdown: section({}),
      gallery: section({ photos: list(photo) }),
      quiz: section({}),
      rsvp: section({}),
      gifts: section({ accounts: list(z.object({ bank: str(), number: str(), holder: str() })), qris: str(), note: str() }),
      wishes: section({}),
      closing: section({}),
    })
    .prefault({}),
  extras: list(
    z.object({
      title: str(),
      body: str(),
      photos: list(z.object({ src: str(), w: num(), h: num() })),
      videos: list(z.object({ src: str(), poster: str() })),
      tracks: list(z.object({ src: str(), cover: str(), title: str(), artist: str() })),
      tone: z.enum(Object.keys(EXTRA_TONES) as [ExtraTone, ...ExtraTone[]]).catch("paper"),
      after: z.enum(EXTRA_ANCHORS).catch("event"),
    }),
  ),
});

export type InvitationData = z.infer<typeof invitationDataSchema>;
export type SectionKey = (typeof SECTION_KEYS)[number];

export const emptyInvitationData = (): InvitationData => invitationDataSchema.parse({});
