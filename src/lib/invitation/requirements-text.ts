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
  "couple.groom.role": "Keterangan, contoh Putra pertama dari",
  "couple.bride.role": "Keterangan, contoh Putri kedua dari",
  "event.start": "Tanggal dan jam mulai acara",
  "event.end": "Tanggal dan jam selesai acara",
  "event.rsvpDeadline": "Batas konfirmasi kehadiran",
};

function lineOf(r: ReqRow) {
  const label = LABELS[r.key] ?? r.label;
  // Judul kelompok tanpa isian, misalnya Mempelai pria.
  if (r.heading && !r.type) return `_${label}_`;
  const mark = [r.required ? "wajib" : "opsional", r.count].filter(Boolean).join(", ");
  return `${"  ".repeat(r.depth)}- ${label} (${mark})`;
}

export function requirementsText(theme: string, themeName: string, rules: PackageRules) {
  // Semua bagian dianggap terpakai karena daftar ini untuk calon pembeli, bukan untuk undangan tertentu.
  const { sections } = requirements(theme, rules, invitationDataSchema.parse({}));
  const blocks = sections.flatMap((s) => {
    const rows = s.rows.filter((r) => !HIDDEN.has(r.key));
    return rows.length ? [`*${s.title}*\n${rows.map(lineOf).join("\n")}`] : [];
  });
  if (!rules.locked.nama_tamu) blocks.push("*Tamu*\n- Daftar nama tamu yang diundang (opsional)");
  if (rules.extras?.max) {
    const kinds = (Object.keys(EXTRA_KINDS) as ExtraKind[]).filter((k) => k !== "bebas").map((k) => EXTRA_KINDS[k]);
    blocks.push(`*Bagian tambahan*\n- Pilih maksimal ${rules.extras.max} (opsional): ${kinds.join(", ")}`);
  }
  const pkg = rules.pkg ? `, paket ${PACKAGE_NAMES[rules.pkg]}` : "";
  return [`*Data undangan tema ${themeName}${pkg}*\nSemua foto opsional.`, ...blocks].join("\n\n");
}
