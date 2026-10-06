import { FEATURE_KEYS, PACKAGE_IDS, PACKAGE_NAMES, type FeatureKey, type MatrixRow, type PackageId, type Settings, type ThemeTier } from "./schema";

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

const days = (min: number, max: number) => (min === max ? `${min} hari kerja` : `${min} sampai ${max} hari kerja`);

// Waktu pengerjaan satu paket. Contoh: "2 sampai 3 hari kerja"
export const slaText = (pk: Settings["packages"][PackageId]) => days(pk.sla, pk.slaMax ?? pk.sla);

// Rentang semua paket yang tampil. Contoh: "1 sampai 7 hari kerja"
export function slaRange(s: Settings): string {
  const list = visiblePackages(s).map((p) => s.packages[p]);
  return days(Math.min(...list.map((pk) => pk.sla)), Math.max(...list.map((pk) => pk.slaMax ?? pk.sla)));
}

export function months(n: number): string {
  return n >= 24 && n % 12 === 0 ? `${n / 12} tahun` : `${n} bulan`;
}

// Paket dengan nilai sama digabung. Contoh: "Dasar 3 bulan, Lengkap dan Istimewa 12 bulan"
export function perPlan(s: Settings, field: "active" | "sla"): string {
  const groups = new Map<string, string[]>();
  for (const p of visiblePackages(s)) {
    const pk = s.packages[p];
    const text = field === "sla" ? slaText(pk) : months(pk.active);
    groups.set(text, [...(groups.get(text) ?? []), PACKAGE_NAMES[p]]);
  }
  return [...groups].map(([text, names]) => `${names.join(" dan ")} ${text}`).join(", ");
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
  harga_dasar: "harga paket Dasar",
  harga_lengkap: "harga paket Lengkap",
  harga_istimewa: "harga paket Istimewa",
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
    harga_dasar: formatRupiah(s.packages.dasar.price),
    harga_lengkap: formatRupiah(s.packages.lengkap.price),
    harga_istimewa: formatRupiah(s.packages.istimewa.price),
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

// Tema dibatasi per paket hanya kalau isi paket punya baris jumlah_tema, sama seperti kunci lain:
// baris dihapus berarti tidak dibatasi, dan kolom Tersedia di paket di tab Tema tidak dipakai.
export const themesLimited = (s: Pick<Settings, "matrix">) => s.matrix.some((r) => r.key === "jumlah_tema");
export const themeAvailable = (s: Pick<Settings, "matrix">, tier: ThemeTier, p: PackageId) => !themesLimited(s) || themeAllowed(tier, p);

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
  const unit = row.unit || (row.key === "galeri_foto" ? "{n} foto" : row.key === "bagian_tambahan" ? "sampai {n} bagian" : "{n}");
  return { on: true, note: unit.replaceAll("{n}", String(c.n)) };
}

// Add-on yang sudah dibayar per undangan: jumlah unit per id add-on.
export type Purchased = Record<string, number>;

export type PackageRules = {
  pkg: PackageId | null;
  // Tidak ada berarti jumlahnya tidak dibatasi paket.
  photos?: { max: number; note: string };
  extras?: { max: number; note: string };
  // Fitur yang terkunci beserta alasannya.
  locked: Partial<Record<FeatureKey, string>>;
};

// Aturan isi undangan dari paket ditambah add-on yang sudah dibayar. Paket belum dipilih berarti tanpa batasan.
export function packageRules(s: Pick<Settings, "matrix" | "addons">, pkg: string | null, bought: Purchased = {}): PackageRules {
  if (!pkg || !(PACKAGE_IDS as readonly string[]).includes(pkg)) return { pkg: null, locked: {} };
  const p = pkg as PackageId;
  const name = PACKAGE_NAMES[p];
  const units = (id: string) => Math.max(0, Math.floor(bought[id] ?? 0));
  const unlocking = (key: string) => s.addons.filter((a) => a.unlock === key);

  const locked: PackageRules["locked"] = {};
  for (const key of FEATURE_KEYS) {
    const row = s.matrix.find((r) => r.key === key);
    if (!row || row.cells[p].on || unlocking(key).some((a) => units(a.id) > 0)) continue;
    const addon = unlocking(key)[0];
    locked[key] = `Paket ${name} tidak termasuk ${row.label.toLowerCase()}.${addon ? ` Centang add-on ${addon.name} setelah dibayar.` : " Ganti ke paket yang menyediakannya."}`;
  }

  // Baris berjumlah yang dihapus atau bertanda tanpa batas berarti tidak dibatasi.
  const limit = (key: "galeri_foto" | "bagian_tambahan", unit: string, none: string) => {
    const row = s.matrix.find((r) => r.key === key);
    const base = row ? (row.cells[p].on ? row.cells[p].n : 0) : null;
    if (base === null) return undefined;
    const extra = unlocking(key).reduce((n, a) => n + units(a.id) * a.amount, 0);
    if (!base && !extra) {
      const addon = unlocking(key)[0];
      return { max: 0, note: `Paket ${name} ${none}.${addon ? ` Centang add-on ${addon.name} setelah dibayar.` : " Ganti ke paket yang menyediakannya."}` };
    }
    return { max: base + extra, note: `Paket ${name} maksimal ${base} ${unit}${extra ? `, ditambah ${extra} dari add-on` : ""}` };
  };
  const photos = limit("galeri_foto", "foto", "tidak termasuk galeri foto");
  const extras = limit("bagian_tambahan", "bagian tambahan", "tidak termasuk bagian tambahan di luar tema");
  return { pkg: p, photos, extras, locked };
}
