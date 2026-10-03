import { PACKAGE_IDS, PACKAGE_NAMES, type MatrixRow, type PackageId, type Settings, type ThemeTier } from "./schema";

export function formatRupiah(value: number): string {
  return "Rp" + value.toLocaleString("id-ID");
}

export function waLink(number: string, text?: string): string {
  const url = `https://wa.me/${number}`;
  return text ? `${url}?text=${encodeURIComponent(text)}` : url;
}

// 6285877936091 menjadi +62 858-7793-6091
export function prettyWa(n: string) {
  const local = n.replace(/^62/, "");
  return `+62 ${local.slice(0, 3)}-${local.slice(3, 7)}-${local.slice(7)}`;
}

export const visiblePackages = (s: Settings): PackageId[] => PACKAGE_IDS.filter((p) => s.packages[p].on);

export function lowestPrice(s: Settings): number {
  return Math.min(...visiblePackages(s).map((p) => s.packages[p].price));
}

export function highestPrice(s: Settings): number {
  return Math.max(...visiblePackages(s).map((p) => s.packages[p].price));
}

// Contoh: "1 sampai 3 hari kerja"
export function slaRange(s: Settings): string {
  const days = visiblePackages(s).map((p) => s.packages[p].sla);
  const [min, max] = [Math.min(...days), Math.max(...days)];
  return min === max ? `${min} hari kerja` : `${min} sampai ${max} hari kerja`;
}

export function months(n: number): string {
  return n >= 24 && n % 12 === 0 ? `${n / 12} tahun` : `${n} bulan`;
}

// Paket dengan nilai sama digabung. Contoh: "Dasar 3 bulan, Lengkap dan Istimewa 12 bulan"
export function perPlan(s: Settings, field: "active" | "sla"): string {
  const groups = new Map<number, string[]>();
  for (const p of visiblePackages(s)) {
    const n = s.packages[p][field];
    groups.set(n, [...(groups.get(n) ?? []), PACKAGE_NAMES[p]]);
  }
  return [...groups].map(([n, names]) => `${names.join(" dan ")} ${field === "sla" ? `${n} hari kerja` : months(n)}`).join(", ");
}

// "08:00" dan "20:00" menjadi "08.00 sampai 20.00"
export const hours = (s: Settings) => `${s.contact.open.replace(":", ".")} sampai ${s.contact.close.replace(":", ".")}`;

export const generalWaLink = (s: Settings) => waLink(s.contact.wa, s.wa.general || undefined);

export function planWaLink(s: Settings, p: PackageId) {
  const text = (s.wa.plan || s.wa.general).replaceAll("{paket}", PACKAGE_NAMES[p]);
  return waLink(s.contact.wa, text || undefined);
}

// Kata pengganti yang boleh ditulis di teks pengaturan. Nilainya selalu mengikuti data terbaru.
export const VARIABLES: Record<string, string> = {
  harga: "harga paket termurah",
  waktu: "rentang waktu pengerjaan",
  pengerjaan: "waktu pengerjaan tiap paket",
  masa_aktif: "masa aktif tiap paket",
  dp: "persentase uang muka",
  jam: "jam layanan",
  hari: "hari operasional",
  kota: "kota",
  wa: "nomor WhatsApp",
  wa_link: "tautan chat WhatsApp",
  instagram: "username Instagram",
  email: "email",
  bank: "nama bank",
  rekening_nama: "nama rekening",
  rekening_nomor: "nomor rekening",
};

export function textVars(s: Settings): Record<string, string> {
  return {
    harga: formatRupiah(lowestPrice(s)),
    waktu: slaRange(s),
    pengerjaan: perPlan(s, "sla"),
    masa_aktif: perPlan(s, "active"),
    dp: String(s.payment.dp),
    jam: hours(s),
    hari: s.contact.days,
    kota: s.contact.city,
    wa: prettyWa(s.contact.wa),
    wa_link: generalWaLink(s),
    instagram: s.contact.instagram,
    email: s.contact.email,
    bank: s.payment.bank,
    rekening_nama: s.payment.accountName,
    rekening_nomor: s.payment.accountNumber,
  };
}

export function fill(text: string, vars: Record<string, string>): string {
  return text.replace(/\{([a-z_]+)\}/g, (m, k: string) => vars[k] ?? m);
}

// Tujuan tombol: kosong berarti WhatsApp.
export const resolveHref = (href: string, waHref: string) => href || waHref;

const TIER_RANK: Record<ThemeTier, number> = { semua: 0, lengkap: 1, istimewa: 2 };
export const themeAllowed = (tier: ThemeTier, p: PackageId) => PACKAGE_IDS.indexOf(p) >= TIER_RANK[tier];

export function themeCount(s: Settings, p: PackageId) {
  const active = s.themes.filter((t) => t.on);
  return { n: active.filter((t) => themeAllowed(t.tier, p)).length, total: active.length };
}

// Isi satu sel di kartu harga: termasuk atau tidak, dan keterangan kecil di bawahnya.
export function cellView(s: Settings, row: MatrixRow, p: PackageId): { on: boolean; note?: string } {
  if (row.key === "jumlah_tema") {
    const { n, total } = themeCount(s, p);
    return { on: n > 0, note: n === total ? `Semua ${total} tema` : `${n} dari ${total} tema` };
  }
  const c = row.cells[p];
  if (row.kind === "check" || !c.on) return { on: c.on };
  if (c.n === null) return { on: true, note: "Tanpa batas" };
  return { on: true, note: row.key === "galeri_foto" ? `${c.n} foto` : String(c.n) };
}

// Batas foto galeri untuk paket. undefined berarti paket belum dipilih atau baris tidak ada.
export function galleryLimit(s: Settings, p: string | null): number | null | undefined {
  if (!p || !(PACKAGE_IDS as readonly string[]).includes(p)) return undefined;
  const row = s.matrix.find((r) => r.key === "galeri_foto");
  if (!row) return undefined;
  const c = row.cells[p as PackageId];
  return c.on ? c.n : 0;
}
