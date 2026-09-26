import { z } from "zod";

const req = (label: string, max = 200) => z.string().trim().min(1, `${label} wajib diisi.`).max(max, `${label} maksimal ${max} karakter.`);
const opt = (max = 300) => z.string().trim().max(max).optional();
const media = (label: string) => req(label, 500);

const person = z.object({
  name: req("Nama panggilan", 40),
  full: req("Nama lengkap", 80),
  role: req("Keterangan (putra/putri dari)", 40),
  parents: req("Nama orang tua", 160),
  photo: opt(500),
  flower: opt(60),
  latin: opt(80),
});

const schedule = z.object({
  time: z.string().regex(/^\d{2}\.\d{2}$/, "Jam format 08.00."),
  name: req("Nama acara", 60),
  until: z
    .string()
    .regex(/^\d{2}\.\d{2}$/, "Jam format 08.00.")
    .optional(),
});

const storyItem = z.object({
  title: req("Judul cerita", 60),
  date: req("Tanggal cerita", 20),
  image: media("Foto cerita"),
  short: req("Ringkasan cerita", 200),
  long: req("Cerita lengkap", 1200),
  video: z.object({ src: media("Video"), poster: media("Poster video") }).optional(),
  no: opt(10),
  place: opt(60),
});

const photo = z.object({
  src: media("Foto"),
  w: z.number().int().positive(),
  h: z.number().int().positive(),
  alt: req("Keterangan foto", 160),
  caption: opt(60),
  no: opt(10),
});

const account = z.object({
  bank: req("Nama bank", 40),
  number: req("Nomor rekening", 40),
  holder: req("Atas nama", 80),
});

const section = <T extends z.ZodRawShape>(shape: T) => z.object({ enabled: z.boolean(), ...shape });

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

export const TIMEZONES = { WIB: "+07:00", WITA: "+08:00", WIT: "+09:00" } as const;

export const invitationDataSchema = z.object({
  monogram: req("Monogram", 12),
  couple: z.object({ groom: person, bride: person }),
  event: z.object({
    start: z.iso.datetime({ offset: true, error: "Tanggal mulai tidak valid." }),
    end: z.iso.datetime({ offset: true, error: "Tanggal selesai tidak valid." }),
    timezone: z.enum(["WIB", "WITA", "WIT"]),
    city: req("Kota", 60),
    venue: z.object({ name: req("Nama tempat", 80), address: req("Alamat", 200), mapUrl: z.url("Link peta tidak valid.") }),
    schedule: z.array(schedule).min(1, "Minimal satu acara."),
    rsvpDeadline: req("Batas konfirmasi", 40),
  }),
  copy: z.object({
    tagline: opt(120),
    quote: opt(300),
    honor: req("Kalimat kehormatan", 400),
    heroQuote: opt(300),
    rsvpQuote: opt(200),
    latinPair: opt(80),
    collection: opt(20),
    credit: opt(120),
  }),
  share: z.object({
    description: req("Deskripsi untuk mesin pencari", 200),
    ogDescription: req("Deskripsi preview WhatsApp", 160),
  }),
  media: z.object({
    hero: media("Foto hero"),
    heroWide: media("Foto hero lebar"),
    og: media("Gambar preview WhatsApp"),
    music: media("Musik latar"),
    venue: opt(500),
    couple: opt(500),
    closing: opt(500),
    detail: opt(500),
    rsvp: opt(500),
  }),
  sections: z.object({
    couple: section({ photos: z.array(z.object({ src: media("Foto"), alt: req("Keterangan foto", 160) })).optional() }),
    story: section({ items: z.array(storyItem) }),
    collage: section({ polaroids: z.array(z.object({ src: media("Foto"), caption: req("Keterangan", 40), rotate: z.number() })) }).optional(),
    specimens: section({
      items: z.array(z.object({ src: media("Foto"), w: z.number(), h: z.number(), latin: req("Nama latin", 80), local: req("Nama lokal", 60), no: req("Nomor", 10) })),
    }).optional(),
    event: section({}),
    countdown: section({}),
    gallery: section({ photos: z.array(photo) }),
    quiz: section({}).optional(),
    rsvp: section({}),
    gifts: section({ accounts: z.array(account), qris: opt(500), note: opt(200) }),
    wishes: section({}),
    closing: section({}),
  }),
});

export type InvitationData = z.infer<typeof invitationDataSchema>;
export type SectionKey = (typeof SECTION_KEYS)[number];
