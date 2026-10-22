import { PURPOSES, type Purpose } from "@/lib/storage/media";
import type { PackageRules } from "@/lib/settings/text";
import { EXTRA_KINDS, limitExtras, type InvitationData } from "./schema";
import { forTheme, GROUPS, type Field } from "./spec";

// Daftar kebutuhan data untuk klien, disusun dari isian editor sesuai tema, paket, bagian yang dipakai, dan bagian
// tambahan yang dipilih admin. key adalah jalur isian, dipakai untuk melewatkan isian opsional yang tidak diminta.

export type ReqRow = { key: string; label: string; type: string; note?: string; required: boolean; depth: number; heading?: boolean };
export type ReqSection = { key: string; title: string; note?: string; section?: string; rows: ReqRow[] };

// Keterangan tambahan per kegunaan foto, misalnya orientasi yang paling pas.
const SHAPE: Partial<Record<Purpose, string>> = {
  hero: "Potret (tegak).",
  herowide: "Lanskap (mendatar).",
  og: "Lanskap.",
  groom: "Potret, wajah terlihat jelas.",
  bride: "Potret, wajah terlihat jelas.",
  qris: "Gambar QRIS asli dari bank atau aplikasi pembayaran.",
  plan: "Tulisan di gambar harus terbaca.",
};

const mb = (bytes: number) => `${Math.round(bytes / 1024 / 1024)}MB`;

function typeOf(f: Field): { type: string; note?: string } {
  switch (f.kind) {
    case "media": {
      const p = PURPOSES[f.purpose];
      if (p.kind === "video") return { type: `Video MP4, maks ${mb(p.maxBytes)}` };
      if (p.kind === "audio") return { type: `Musik MP3, maks ${mb(p.maxBytes)}` };
      return { type: `Foto, lebar minimal ${p.width}px`, note: SHAPE[f.purpose] };
    }
    case "text":
      if (f.format === "url") return { type: "Tautan" };
      if (f.format === "time") return { type: "Jam, contoh 08.00" };
      if (f.format === "color") return { type: "Nama atau kode warna" };
      return { type: `Teks, maks ${f.max} karakter` };
    case "textarea":
      return { type: `Paragraf, maks ${f.max} karakter` };
    case "datetime":
      return { type: "Tanggal dan jam" };
    case "select":
      return { type: `Pilih salah satu: ${f.options.map((o) => f.labels?.[o] ?? o).join(", ")}` };
    case "number":
      return { type: `Angka ${f.min} sampai ${f.max}` };
    default:
      return { type: "" };
  }
}

// Isian yang ditentukan tim, bukan data dari klien. Deskripsi mesin pencari tidak ditanyakan karena undangan tidak
// diindeks, dan kredit foto diisi tim dari sumber fotonya.
const TEAM = new Set(["tone", "copy.credit", "share.description"]);
const internal = (f: Field) => f.kind === "anchor" || TEAM.has(f.path);

type Ctx = { theme: string; rules: PackageRules; skip: ReadonlySet<string> };

function rowsOf(fields: Field[], ctx: Ctx, depth: number, prefix = "", parentOptional = false, variant?: string): ReqRow[] {
  const { theme, rules, skip } = ctx;
  const out: ReqRow[] = [];
  for (const f of forTheme(fields, theme)) {
    const key = prefix + f.path;
    if (internal(f) || (f.when && (!variant || !f.when.includes(variant)))) continue;
    if (f.path === "media.music" && rules.locked.musik_sendiri) continue;
    if (f.kind === "heading") {
      out.push({ key, label: f.label, type: "", required: false, depth, heading: true });
      continue;
    }
    const required = (f.kind === "list" ? Boolean(f.min) : f.required !== false) && !parentOptional;
    if (!required && skip.has(key)) continue;
    // Contoh isian, kecuali jam yang contohnya sudah ada di jenis isian.
    const sample = "placeholder" in f && f.placeholder && !("format" in f && f.format === "time") ? f.placeholder : "";
    const placeholder = sample ? `Contoh: ${sample}${/[.!?]$/.test(sample) ? "" : "."}` : "";
    if (f.kind === "list") {
      const cap = f.path === "sections.gallery.photos" ? rules.photos?.max : f.path === "extras" ? rules.extras?.max : undefined;
      const max = cap === undefined ? f.max : Math.min(cap, f.max ?? cap);
      const count = [f.min ? `minimal ${f.min}` : "", max ? `maksimal ${max}` : ""].filter(Boolean).join(", ");
      out.push({ key, label: f.label, type: `Daftar ${f.item.toLowerCase()}${count ? `, ${count}` : ""}`, note: f.hint, required, depth, heading: true });
      out.push(...rowsOf(f.fields, ctx, depth + 1, `${key}.`, !f.min || parentOptional, variant));
      continue;
    }
    const { type, note } = typeOf(f);
    out.push({ key, label: f.label, type, note: [note, f.hint, placeholder].filter(Boolean).join(" ") || undefined, required, depth });
  }
  // Judul kelompok yang isiannya tidak dipakai di tema ini dibuang.
  return out.filter((r, i) => !r.heading || r.type || (out[i + 1] && out[i + 1].depth >= r.depth && !(out[i + 1].heading && !out[i + 1].type && out[i + 1].depth === r.depth)));
}

// Isian setiap bagian tambahan yang sudah ditambahkan, sesuai jenisnya. Judul yang sudah diisi admin tidak ditanyakan lagi.
function extraRows(list: Extract<Field, { kind: "list" }>, data: InvitationData, ctx: Ctx): ReqRow[] {
  const items = ctx.rules.extras ? limitExtras(data.extras, ctx.rules.extras.max) : data.extras;
  return items.flatMap((e, i) => [
    { key: `extras.${i}`, label: e.title.trim() || EXTRA_KINDS[e.kind], type: `Jenis: ${EXTRA_KINDS[e.kind]}`, required: false, depth: 0, heading: true },
    ...rowsOf(e.title.trim() ? list.fields.filter((f) => f.path !== "title") : list.fields, ctx, 1, `extras.${i}.`, false, e.kind),
  ]);
}

// Bagian yang tidak bisa dipakai di paket ini, misalnya Cerita yang tidak termasuk paket.
export const sectionLocked = (key: string, rules: PackageRules) => (key === "story" && Boolean(rules.locked.cerita)) || (key === "gallery" && rules.photos?.max === 0);

// skip berisi key isian opsional yang tidak diminta. Isian wajib selalu dicantumkan.
export function requirements(theme: string, rules: PackageRules, data: InvitationData, skip: ReadonlySet<string> = new Set()): { sections: ReqSection[]; automatic: string[] } {
  const ctx = { theme, rules, skip };
  const sections: ReqSection[] = [];
  const automatic: string[] = [];
  for (const g of forTheme(GROUPS, theme)) {
    if ((g.section && !data.sections[g.section].enabled) || sectionLocked(g.key, rules)) continue;
    const list = g.key === "extras" ? g.fields.find((f) => f.kind === "list") : undefined;
    const rows = list?.kind === "list" ? extraRows(list, data, ctx) : rowsOf(g.fields, ctx, 0);
    if (!rows.length) {
      if (g.key !== "extras") automatic.push(g.title);
      continue;
    }
    sections.push({ key: g.key, title: g.title, section: g.section, note: g.key === "extras" ? "Bagian di luar isi tema yang sudah disepakati." : g.note, rows });
  }
  return { sections, automatic };
}
