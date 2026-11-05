import { PACKAGE_NAMES } from "@/lib/settings/schema";
import type { PackageRules } from "@/lib/settings/text";
import { requirements, type ReqRow } from "./requirements";
import { EXTRA_KINDS, invitationDataSchema, type ExtraKind } from "./schema";

// Daftar data yang disalin dari halaman contoh, siap ditempel ke WhatsApp. Isiannya mengikuti requirements(), jadi
// isian baru di spec otomatis ikut. Dua daftar di bawah ini yang disesuaikan dengan balasan Checklist data di SOP.

// Isian yang diisi tim, tidak ditanyakan ke pembeli.
const HIDDEN = new Set(["monogram", "copy.honor", "share.ogDescription", "media.og"]);

// Nama isian untuk pembeli, kalau nama di editor terlalu teknis.
const LABELS: Record<string, string> = {
  "media.hero": "Foto utama, potret",
  "media.heroWide": "Foto utama, lanskap",
  "media.music": "Musik latar pilihan, judul atau linknya",
  "event.schedule": "Susunan acara, contoh akad dan resepsi",
  "couple.groom.role": "Keterangan, contoh Putra pertama dari",
  "couple.bride.role": "Keterangan, contoh Putri kedua dari",
  "event.start": "Tanggal dan jam mulai acara",
  "event.end": "Tanggal dan jam selesai acara",
  "event.rsvpDeadline": "Batas konfirmasi kehadiran",
};

function lineOf(r: ReqRow, rules: PackageRules) {
  const label = LABELS[r.key] ?? r.label;
  // Judul kelompok tanpa isian, misalnya Mempelai pria.
  if (r.heading && !r.type) return `_${label}_`;
  // Galeri paket tanpa batas tidak menyebut jumlah, sama seperti balasan Harga di SOP.
  const count = r.key === "sections.gallery.photos" && !rules.photos ? "" : r.count;
  const mark = [r.required ? "wajib" : "opsional", count].filter(Boolean).join(", ");
  return `${"  ".repeat(r.depth)}- ${label} (${mark})`;
}

// Warna dan font tidak ada di isian editor karena dipilih admin. Kalimatnya mengikuti butir 8 Checklist data di SOP.
function styleLine(rules: PackageRules) {
  if (!rules.locked.palet_custom) return "Boleh kirim palet acara dan nama font dari Google Fonts";
  if (!rules.locked.palet_varian) return "Pilih dari varian temanya, atau kirim palet acara dan nama font dari Google Fonts kalau mengambil tambahan custom";
  return "Memakai bawaan tema, atau pilih dari varian kalau mengambil tambahan varian";
}

// Data yang baru dibutuhkan kalau pembeli mengambil add-on, jadi tidak ada di isian paketnya.
function addonLines(rules: PackageRules) {
  return [
    ...(rules.locked.musik_sendiri ? ["Musik latar pilihan, judul atau linknya, kalau mengambil tambahan musik"] : []),
    ...(rules.locked.video_youtube ? ["Tautan video YouTube, kalau memakai tambahan video"] : []),
    ...(rules.pkg !== "dasar" ? ["Tanggal, jam, lokasi, dan link Google Maps acara kedua, kalau memakai undangan kedua"] : []),
  ];
}

export function requirementsText(theme: string, themeName: string, rules: PackageRules) {
  // Semua bagian dianggap terpakai karena daftar ini untuk calon pembeli, bukan untuk undangan tertentu.
  const { sections } = requirements(theme, rules, invitationDataSchema.parse({}));
  const blocks = sections.flatMap((s) => {
    const rows = s.rows.filter((r) => !HIDDEN.has(r.key));
    return rows.length ? [`*${s.title}*\n${rows.map((r) => lineOf(r, rules)).join("\n")}`] : [];
  });
  blocks.push(`*Warna dan font*\n- ${styleLine(rules)} (opsional)`);
  const addons = addonLines(rules);
  if (addons.length) blocks.push(`*Kalau mengambil tambahan*\n${addons.map((l) => `- ${l} (opsional)`).join("\n")}`);
  if (rules.extras?.max) {
    const kinds = (Object.keys(EXTRA_KINDS) as ExtraKind[]).filter((k) => k !== "bebas").map((k) => EXTRA_KINDS[k]);
    blocks.push(`*Bagian tambahan*\n- Pilih maksimal ${rules.extras.max} (opsional): ${kinds.join(", ")}`);
  }
  const pkg = rules.pkg ? `, paket ${PACKAGE_NAMES[rules.pkg]}` : "";
  return [`*Data undangan tema ${themeName}${pkg}*\nSemua foto opsional, boleh juga tanpa foto.`, ...blocks, "Boleh dikirim sekaligus ya, supaya pengerjaannya bisa langsung jalan."].join("\n\n");
}
