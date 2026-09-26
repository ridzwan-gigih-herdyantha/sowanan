import type { Purpose } from "@/lib/storage/media";
import type { InvitationData, SectionKey } from "./schema";

const A = "andi-rina";
const B = "bagas-sekar";
const H = "hendrawan-larasati";

type Base = { path: string; label: string; themes?: string[]; hint?: string; required?: boolean };
export type Field =
  | (Base & { kind: "text" | "textarea"; max: number; format?: "url" | "time"; placeholder?: string })
  | (Base & { kind: "media"; purpose: Purpose; dims?: boolean })
  | (Base & { kind: "datetime" })
  | (Base & { kind: "select"; options: string[] })
  | (Base & { kind: "number"; min: number; max: number })
  | (Base & { kind: "heading" })
  | (Base & { kind: "list"; item: string; fields: Field[]; blank: Record<string, unknown>; min?: number; max?: number });

export type Group = { key: string; title: string; section?: SectionKey; themes?: string[]; note?: string; fields: Field[] };

const text = (path: string, label: string, max: number, extra: Partial<Base & { format: "url" | "time"; placeholder: string }> = {}): Field => ({
  kind: "text",
  path,
  label,
  max,
  required: true,
  ...extra,
});
const area = (path: string, label: string, max: number, extra: Partial<Base & { placeholder: string }> = {}): Field => ({ kind: "textarea", path, label, max, required: true, ...extra });
const media = (path: string, label: string, purpose: Purpose, extra: Partial<Base & { dims: boolean }> = {}): Field => ({
  kind: "media",
  path,
  label,
  purpose,
  required: true,
  ...extra,
});
const optional = { required: false };

const person = (key: "groom" | "bride", title: string): Field[] => [
  { kind: "heading", path: `couple.${key}`, label: title },
  text(`couple.${key}.full`, "Nama lengkap", 80, { themes: [B, H] }),
  text(`couple.${key}.role`, "Keterangan", 40, { placeholder: key === "groom" ? "Putra dari" : "Putri dari" }),
  area(`couple.${key}.parents`, "Nama orang tua", 160, { placeholder: "Bapak ... & Ibu ..." }),
  media(`couple.${key}.photo`, "Foto", key, { themes: [H], ...optional, hint: "Kosong berarti memakai foto hero." }),
  text(`couple.${key}.flower`, "Bunga", 60, { themes: [H], ...optional }),
  text(`couple.${key}.latin`, "Nama latin bunga", 80, { themes: [H], ...optional }),
];

export const GROUPS: Group[] = [
  {
    key: "hero",
    title: "Pembuka",
    note: "Selalu tampil.",
    fields: [
      text("couple.groom.name", "Nama panggilan pria", 40),
      text("couple.bride.name", "Nama panggilan wanita", 40),
      text("monogram", "Monogram", 12, { placeholder: "A & R" }),
      { kind: "datetime", path: "event.start", label: "Mulai acara", required: true },
      { kind: "datetime", path: "event.end", label: "Selesai acara", required: true },
      { kind: "select", path: "event.timezone", label: "Zona waktu", options: ["WIB", "WITA", "WIT"] },
      text("event.city", "Kota", 60, { placeholder: "Bandung, Jawa Barat" }),
      text("copy.tagline", "Tagline", 120, { themes: [A, B], ...optional }),
      text("copy.latinPair", "Pasangan nama latin", 80, { themes: [H], ...optional }),
      text("copy.collection", "Nomor koleksi", 20, { themes: [H], ...optional, placeholder: "No. 0508" }),
      media("media.hero", "Foto hero (potret)", "hero"),
      media("media.heroWide", "Foto hero lebar", "herowide", { hint: "Tampil di layar lebar." }),
      media("media.music", "Musik latar", "music"),
      {
        kind: "list",
        path: "sections.specimens.items",
        label: "Spesimen bunga",
        item: "Spesimen",
        themes: [H],
        min: 1,
        max: 6,
        blank: { src: "", w: 0, h: 0, latin: "", local: "", no: "" },
        fields: [media("src", "Foto", "specimen", { dims: true }), text("latin", "Nama latin", 80), text("local", "Nama lokal", 60), text("no", "Nomor", 10)],
      },
    ],
  },
  {
    key: "couple",
    title: "Mempelai",
    section: "couple",
    fields: [
      ...person("groom", "Mempelai pria"),
      ...person("bride", "Mempelai wanita"),
      { kind: "heading", path: "couple", label: "Tambahan" },
      area("copy.quote", "Kutipan", 300, { themes: [H], ...optional }),
      area("copy.heroQuote", "Kutipan", 300, { themes: [B], ...optional }),
      media("media.couple", "Foto berdua", "couple", { themes: [A], ...optional, hint: "Kosong berarti memakai foto hero lebar." }),
      {
        kind: "list",
        path: "sections.couple.photos",
        label: "Foto slider",
        item: "Foto",
        themes: [B],
        max: 8,
        blank: { src: "", alt: "" },
        fields: [media("src", "Foto", "photo"), text("alt", "Keterangan foto", 160)],
      },
    ],
  },
  {
    key: "story",
    title: "Cerita",
    section: "story",
    fields: [
      {
        kind: "list",
        path: "sections.story.items",
        label: "Cerita",
        item: "Cerita",
        min: 1,
        max: 8,
        blank: { title: "", date: "", image: "", short: "", long: "", no: "", place: "" },
        fields: [
          text("title", "Judul", 60),
          text("date", "Tanggal", 20, { placeholder: "14.02.2020" }),
          text("place", "Tempat", 60, { themes: [H], ...optional }),
          text("no", "Nomor", 10, { themes: [H], ...optional }),
          media("image", "Foto", "story"),
          area("short", "Ringkasan", 200),
          area("long", "Cerita lengkap", 1200),
          media("video.src", "Video", "video", { ...optional, hint: "Opsional. Menggantikan foto saat dibuka." }),
          media("video.poster", "Poster video", "poster", { ...optional }),
        ],
      },
    ],
  },
  {
    key: "collage",
    title: "Kolase",
    section: "collage",
    themes: [A],
    fields: [
      area("copy.quote", "Kutipan", 300, optional),
      {
        kind: "list",
        path: "sections.collage.polaroids",
        label: "Polaroid",
        item: "Polaroid",
        min: 1,
        max: 6,
        blank: { src: "", caption: "", rotate: 0 },
        fields: [media("src", "Foto", "polaroid"), text("caption", "Tulisan", 40), { kind: "number", path: "rotate", label: "Kemiringan (derajat)", min: -15, max: 15 }],
      },
    ],
  },
  {
    key: "event",
    title: "Acara",
    section: "event",
    fields: [
      area("copy.honor", "Kalimat kehormatan", 400),
      text("event.venue.name", "Nama tempat", 80),
      area("event.venue.address", "Alamat", 200),
      text("event.venue.mapUrl", "Link Google Maps", 500, { format: "url", placeholder: "https://maps.app.goo.gl/..." }),
      media("media.venue", "Foto tempat", "venue", { ...optional, hint: "Kosong berarti memakai foto hero." }),
      {
        kind: "list",
        path: "event.schedule",
        label: "Susunan acara",
        item: "Acara",
        min: 1,
        max: 6,
        blank: { time: "", name: "", until: "" },
        fields: [
          text("name", "Nama acara", 60, { placeholder: "Akad Nikah" }),
          text("time", "Jam mulai", 5, { format: "time", placeholder: "08.00" }),
          text("until", "Jam selesai", 5, { format: "time", placeholder: "11.00", ...optional }),
        ],
      },
    ],
  },
  { key: "countdown", title: "Hitung mundur", section: "countdown", fields: [] },
  {
    key: "gallery",
    title: "Galeri",
    section: "gallery",
    fields: [
      {
        kind: "list",
        path: "sections.gallery.photos",
        label: "Foto galeri",
        item: "Foto",
        min: 1,
        max: 24,
        blank: { src: "", w: 0, h: 0, alt: "", caption: "", no: "" },
        fields: [
          media("src", "Foto", "gallery", { dims: true }),
          text("alt", "Keterangan foto", 160),
          text("caption", "Judul kecil", 60, { themes: [H], ...optional }),
          text("no", "Nomor", 10, { themes: [H], ...optional }),
        ],
      },
    ],
  },
  { key: "quiz", title: "Kuis", section: "quiz", themes: [A], fields: [] },
  {
    key: "rsvp",
    title: "RSVP",
    section: "rsvp",
    fields: [
      text("event.rsvpDeadline", "Batas konfirmasi", 40, { placeholder: "24 April 2027" }),
      area("copy.rsvpQuote", "Kutipan", 200, { themes: [B], ...optional }),
      media("media.rsvp", "Foto latar", "rsvp", { themes: [B], ...optional }),
    ],
  },
  {
    key: "gifts",
    title: "Hadiah",
    section: "gifts",
    fields: [
      {
        kind: "list",
        path: "sections.gifts.accounts",
        label: "Rekening",
        item: "Rekening",
        max: 4,
        blank: { bank: "", number: "", holder: "" },
        fields: [text("bank", "Bank atau dompet digital", 40), text("number", "Nomor", 40), text("holder", "Atas nama", 80)],
      },
      media("sections.gifts.qris", "QRIS", "qris", optional),
      text("sections.gifts.note", "Catatan", 200, optional),
    ],
  },
  { key: "wishes", title: "Buku ucapan", section: "wishes", fields: [] },
  {
    key: "closing",
    title: "Penutup",
    section: "closing",
    fields: [media("media.closing", "Foto penutup", "closing", { themes: [A], ...optional, hint: "Kosong berarti memakai foto hero." })],
  },
  {
    key: "share",
    title: "Footer dan bagikan",
    note: "Selalu tampil.",
    fields: [
      text("copy.credit", "Kredit foto", 120, optional),
      area("share.description", "Deskripsi untuk mesin pencari", 200),
      area("share.ogDescription", "Deskripsi preview WhatsApp", 160),
      media("media.og", "Gambar preview WhatsApp", "og", { hint: "Dipotong otomatis ke 1200x630." }),
    ],
  },
];

export const forTheme = <T extends { themes?: string[] }>(items: T[], theme: string) => items.filter((i) => !i.themes || i.themes.includes(theme));

export function getIn(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]), obj);
}

export function setIn<T>(obj: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split(".");
  const src = (obj ?? {}) as Record<string, unknown>;
  const copy: Record<string, unknown> | unknown[] = Array.isArray(src) ? [...src] : { ...src };
  (copy as Record<string, unknown>)[head] = rest.length ? setIn(src[head], rest.join("."), value) : value;
  return copy as T;
}

export type Issue = { path: string; group: string; message: string };

const TIME = /^\d{2}\.\d{2}$/;

function checkFields(data: unknown, fields: Field[], theme: string, prefix: string, group: string, label: string, out: Issue[]) {
  for (const f of forTheme(fields, theme)) {
    const path = prefix + f.path;
    const value = getIn(data, path);
    const name = label + f.label;
    const push = (message: string) => out.push({ path, group, message });

    if (f.kind === "list") {
      const items = Array.isArray(value) ? value : [];
      if (f.min && items.length < f.min) push(`${name} minimal ${f.min}.`);
      if (f.max && items.length > f.max) push(`${name} maksimal ${f.max}.`);
      items.forEach((_, i) => checkFields(data, f.fields, theme, `${path}.${i}.`, group, `${f.item} ${i + 1}: `, out));
      continue;
    }
    if (f.kind === "heading" || f.kind === "select" || f.kind === "number") continue;

    const v = typeof value === "string" ? value.trim() : "";
    if (!v) {
      if (f.required) push(`${name} wajib diisi.`);
      continue;
    }
    if (f.kind === "datetime" && Number.isNaN(Date.parse(v))) push(`${name} tidak valid.`);
    if (f.kind === "text" || f.kind === "textarea") {
      if (v.length > f.max) push(`${name} maksimal ${f.max} karakter.`);
      if (f.format === "time" && !TIME.test(v)) push(`${name} pakai format 08.00.`);
      if (f.format === "url" && !/^https?:\/\/\S+\.\S+/.test(v)) push(`${name} harus diawali https://`);
    }
    if (f.kind === "media" && f.dims) {
      const base = path.slice(0, path.lastIndexOf("."));
      if (!(Number(getIn(data, `${base}.w`)) > 0 && Number(getIn(data, `${base}.h`)) > 0)) push(`${name} perlu diunggah ulang supaya ukurannya terbaca.`);
    }
  }
}

export function checkInvitation(data: InvitationData, theme: string): Issue[] {
  const out: Issue[] = [];
  for (const g of forTheme(GROUPS, theme)) {
    if (g.section && !data.sections[g.section].enabled) continue;
    checkFields(data, g.fields, theme, "", g.key, "", out);
  }
  const { start, end } = data.event;
  if (start && end && Date.parse(end) < Date.parse(start)) out.push({ path: "event.end", group: "hero", message: "Selesai acara harus setelah mulai acara." });
  if (data.sections.gifts.enabled && !data.sections.gifts.accounts.length && !data.sections.gifts.qris) {
    out.push({ path: "sections.gifts.accounts", group: "gifts", message: "Isi minimal satu rekening atau QRIS, atau matikan section Hadiah." });
  }
  return out;
}

export const patternOf = (path: string) => path.replace(/\.\d+(?=\.|$)/g, ".*");

// Semua isian per pola path, item list memakai *. Contoh: sections.story.items.*.place
export function fieldPatterns(): Map<string, Field> {
  const out = new Map<string, Field>();
  const walk = (fields: Field[], prefix: string) => {
    for (const f of fields) {
      if (f.kind === "list") walk(f.fields, `${prefix}${f.path}.*.`);
      else if (f.kind !== "heading") out.set(prefix + f.path, f);
    }
  };
  for (const g of GROUPS) walk(g.fields, "");
  return out;
}
