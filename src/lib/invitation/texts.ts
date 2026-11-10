// Teks tetap di tiap bagian undangan (label, judul, petunjuk, tombol). Tiap tema mendaftarkan teks bawaannya per
// grup editor, mempelai boleh menggantinya. Isian kosong berarti memakai bawaan tema.
// Kode dalam kurung kurawal diganti data undangan, jadi teks tetap ikut bila nama atau tanggal diubah.
export const TOKENS = {
  pria: "nama panggilan mempelai pria",
  wanita: "nama panggilan mempelai wanita",
  tanggal: "tanggal singkat, misalnya 05 . 03 . 2026",
  tanggal_bulan: "tanggal dengan nama bulan, misalnya 05 Maret 2026",
  tanggal_titik: "tanggal rapat, misalnya 05.03.2026",
  bulan_tahun: "bulan dan tahun, misalnya Maret 2026",
  hari: "hari dan tanggal lengkap",
  koleksi: "nomor koleksi",
  tempat: "kota",
  kode: "kode tanggal (hari dan bulan)",
} as const;
// Isian berisi tanda ini menyembunyikan teksnya.
export const HIDE = "-";
export type TokenValues = Record<keyof typeof TOKENS, string>;

// [nama isian di editor, teks bawaan]
export type TextSlot = [label: string, value: string];
export type ThemeTexts = Record<string, Record<string, TextSlot>>;

export const textPath = (group: string, slot: string) => `copy.texts.${group}.${slot}`;

// Tanggal dengan format pilihan: {tgl:FORMAT} memakai tanggal acara, {tgl:FORMAT:2026-12-18} memakai tanggal itu.
// Huruf format: EEEE nama hari, d atau dd tanggal, MM bulan angka, MMMM nama bulan, yy atau yyyy tahun.
export type DateParts = { y: number; m: number; d: number };
const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const pad = (n: number) => String(n).padStart(2, "0");

export function formatDate({ y, m, d }: DateParts, fmt: string) {
  const parts: Record<string, string> = {
    EEEE: DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()],
    dd: pad(d),
    d: String(d),
    MMMM: MONTHS[m - 1],
    MM: pad(m),
    yyyy: String(y),
    yy: pad(y % 100),
  };
  return fmt.replace(/EEEE|dd|d|MMMM|MM|yyyy|yy/g, (k) => parts[k]);
}

export const isoParts = (iso: string): DateParts | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? { y: +m[1], m: +m[2], d: +m[3] } : null;
};

// Pilihan format di editor, urut dari yang paling sering dipakai.
export const DATE_FORMATS = ["dd.MM.yyyy", "dd MMMM yyyy", "EEEE, d MMMM yyyy", "dd/MM/yyyy", "dd/MM/yy", "MM/dd/yyyy", "yyyy-MM-dd", "dd . MM . yyyy", "dd MMMM", "dd.MM", "MMMM yyyy"];
// Format kode tanggal lama, dipakai sebagai format bawaan isian tanggal di editor.
export const DATE_TOKENS: Record<string, string> = { tanggal: "dd . MM . yyyy", tanggal_bulan: "dd MMMM yyyy", tanggal_titik: "dd.MM.yyyy", bulan_tahun: "MMMM yyyy", hari: "EEEE, d MMMM yyyy" };
// Teks bawaan yang isinya hanya satu kode tanggal diisi lewat pemilih tanggal, bukan ketikan.
export const dateTokenOf = (value: string) => /^\{(\w+)\}$/.exec(value)?.[1] ?? "";
export const isDateSlot = (value: string) => dateTokenOf(value) in DATE_TOKENS;
export const dateCode = (fmt: string, date = "") => `{tgl:${fmt}${date ? `:${date}` : ""}}`;
export function parseDateCode(value: string) {
  const m = /^\{tgl:([^:}]+)(?::(\d{4}-\d{2}-\d{2}))?\}$/.exec(value.trim());
  return m ? { fmt: m[1], date: m[2] ?? "" } : null;
}

const fill = (value: string, vars: TokenValues, day: DateParts) =>
  value
    .replace(/\{tgl:([^:}]+)(?::(\d{4}-\d{2}-\d{2}))?\}/g, (_, fmt: string, date?: string) => formatDate((date && isoParts(date)) || day, fmt))
    .replace(/\{(\w+)\}/g, (all, k: string) => (k in vars ? vars[k as keyof TokenValues] : all));

// Teks yang dipakai tema per grup, dan tanda mana yang diganti mempelai. Tema memakai tanda itu untuk teks bawaan yang
// punya gaya khusus, misalnya tanda & bergaya miring di antara nama.
export function resolveTexts(defs: ThemeTexts = {}, own: Record<string, Record<string, string>> = {}, vars: TokenValues, day: DateParts) {
  const texts: Record<string, Record<string, string>> = {};
  const custom: Record<string, Record<string, boolean>> = {};
  for (const [group, slots] of Object.entries(defs)) {
    texts[group] = {};
    custom[group] = {};
    for (const [slot, [, value]] of Object.entries(slots)) {
      const mine = own[group]?.[slot]?.trim() ?? "";
      texts[group][slot] = mine === HIDE ? "" : fill(mine || value, vars, day);
      custom[group][slot] = Boolean(mine);
    }
  }
  return { texts, custom };
}
