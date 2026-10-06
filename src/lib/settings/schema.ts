import { z } from "zod";
import { THEME_NAMES } from "@/themes/media";

export const PACKAGE_IDS = ["dasar", "lengkap", "istimewa"] as const;
export type PackageId = (typeof PACKAGE_IDS)[number];
export const PACKAGE_NAMES: Record<PackageId, string> = { dasar: "Dasar", lengkap: "Lengkap", istimewa: "Istimewa" };

// Ikon fitur di homepage. Gambarnya ada di components/home/features.tsx.
export const ICONS = {
  centang: "Centang",
  peta: "Peta",
  amplop: "Amplop",
  foto: "Foto",
  pesan: "Pesan",
  jam: "Jam",
  musik: "Musik",
  bagikan: "Bagikan",
  orang: "Orang",
  tautan: "Tautan",
} as const;
export type IconId = keyof typeof ICONS;

// Paket paling rendah yang boleh memakai sebuah tema.
export const THEME_TIERS = { semua: "Semua paket", lengkap: "Lengkap dan Istimewa", istimewa: "Istimewa" } as const;
export type ThemeTier = keyof typeof THEME_TIERS;

// Kunci sistem di isi paket. Hanya kunci ini yang dibaca aplikasi.
export const SYSTEM_KEYS = {
  jumlah_tema: "Dihitung otomatis dari tab Tema",
  galeri_foto: "Membatasi jumlah foto galeri di editor undangan",
  bagian_tambahan: "Membatasi jumlah bagian tambahan di luar tema di editor undangan",
  musik_sendiri: "Membuka unggah musik sendiri di editor undangan",
  warna_tema: "Membuka ganti palet dan font di editor undangan",
  cerita: "Membuka bagian Cerita di editor undangan",
  nama_tamu: "Membuka halaman nama tamu",
  ekspor_excel: "Membuka unduh Excel di halaman RSVP dan daftar tamu",
  qr_absensi: "Membuka QR kehadiran tamu dan halaman pemindai di lokasi",
} as const;
export type SystemKey = keyof typeof SYSTEM_KEYS;
// Kunci berjumlah dicatat sebagai angka, sisanya cukup termasuk atau tidak.
export const COUNT_KEYS: SystemKey[] = ["jumlah_tema", "galeri_foto", "bagian_tambahan"];
export type FeatureKey = Exclude<SystemKey, "jumlah_tema" | "galeri_foto" | "bagian_tambahan">;
export const FEATURE_KEYS = Object.keys(SYSTEM_KEYS).filter((k) => !COUNT_KEYS.includes(k as SystemKey)) as FeatureKey[];
// Add-on bisa membuka satu kunci. Untuk kunci berjumlah, tambahan per unit diisi di kolom amount.
export const AMOUNT_KEYS = ["galeri_foto", "bagian_tambahan"] as const;
export const UNLOCK_KEYS = [...AMOUNT_KEYS, ...FEATURE_KEYS] as const;
export type UnlockKey = (typeof UNLOCK_KEYS)[number];

export const ACTIVE_MONTHS = [3, 6, 12, 24] as const;

const THEME_SLUGS = Object.keys(THEME_NAMES) as [string, ...string[]];

const str = (label: string, max: number) => z.string().trim().max(max, `${label} maksimal ${max} karakter.`);
const req = (label: string, max: number) => str(label, max).min(1, `${label} wajib diisi.`);
const rupiah = (label: string) =>
  z.number({ error: `${label} wajib diisi angka.` }).int(`${label} harus bilangan bulat.`).min(0, `${label} tidak boleh negatif.`).max(100_000_000, `${label} terlalu besar.`);
const count = (label: string, min: number, max: number) =>
  z.number({ error: `${label} wajib diisi angka.` }).int(`${label} harus bilangan bulat.`).min(min, `${label} minimal ${min}.`).max(max, `${label} maksimal ${max}.`);
const id = z.string().max(40);
// Tujuan tautan: kosong, anchor (#harga), jalur di situs (/ketentuan), atau alamat lengkap.
const href = (label: string) =>
  z
    .string()
    .trim()
    .max(300, `${label} terlalu panjang.`)
    .refine((v) => v === "" || /^#[\w-]+$/.test(v) || /^\/[^\s]*$/.test(v) || /^https?:\/\/\S+$/.test(v), `${label} harus berupa #anchor, /halaman, atau https://alamat.`);
const time = (label: string) => z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, `${label} harus format JJ:MM.`);

const section = (label: string) => z.object({ title: req(`Judul ${label}`, 40), sub: str(`Penjelas ${label}`, 240) });

const cell = z.object({ on: z.boolean(), n: count("Jumlah", 0, 9999).nullable() });

const pkg = (name: string) =>
  z.object({
    on: z.boolean(),
    price: rupiah(`Harga ${name}`),
    badge: str(`Label kecil ${name}`, 22),
    blurb: str(`Kalimat penjelas ${name}`, 60),
    // Pengerjaan berupa rentang hari kerja. slaMax kosong berarti sama dengan sla.
    sla: count(`Pengerjaan ${name}`, 1, 30),
    slaMax: z.preprocess((v) => (v === "" || v === null ? undefined : v), count(`Pengerjaan paling lama ${name}`, 1, 60).optional()),
    revision: str(`Revisi ${name}`, 30).default(""),
    // Tidak tampil lagi sejak undangan menjadi arsip permanen. Disimpan untuk data lama.
    active: count(`Masa aktif ${name}`, 1, 60),
  });

export const settingsSchema = z
  .object({
    version: z.literal(2),
    hero: z.object({
      eyebrow: str("Teks kecil di atas judul", 60),
      title: req("Judul", 70),
      sub: str("Kalimat penjelas", 320),
      cta1: req("Label tombol utama", 28),
      cta1Href: href("Tujuan tombol utama"),
      cta2: str("Label tombol kedua", 28),
      cta2Href: href("Tujuan tombol kedua"),
      note: str("Catatan di bawah tombol", 120),
    }),
    sections: z.object({
      tema: section("pilihan tema").extend({ foot: str("Kalimat di bawah daftar tema", 160) }),
      fitur: section("fitur"),
      harga: section("harga").extend({ foot: str("Kalimat di bawah harga", 240).default("") }),
      addon: section("tambahan"),
      cara: section("cara pesan"),
      faq: section("tanya jawab"),
    }),
    features: z
      .array(z.object({ id, on: z.boolean(), name: req("Nama fitur", 30), text: str("Keterangan fitur", 90), icon: z.enum(Object.keys(ICONS) as [IconId, ...IconId[]]), label: str("Label fitur", 30) }))
      .max(30, "Fitur maksimal 30."),
    steps: z.array(z.object({ id, title: req("Judul langkah", 24), text: str("Penjelasan langkah", 110) })).max(8, "Langkah maksimal 8."),
    closing: z.object({ title: req("Judul penutup", 50), text: str("Kalimat penutup", 160), button: req("Label tombol penutup", 28) }),
    footer: z.object({ line1: str("Baris footer", 80), line2: str("Baris kedua footer", 60) }),
    themes: z
      .array(
        z.object({
          id,
          on: z.boolean(),
          name: req("Nama tema", 24),
          slug: z.enum(THEME_SLUGS, "Slug tema tidak dikenal."),
          demo: href("Tautan demo"),
          tier: z.enum(Object.keys(THEME_TIERS) as [ThemeTier, ...ThemeTier[]]),
          style: str("Deskripsi tema", 90),
          image: str("Gambar sampul", 300),
        }),
      )
      .max(30, "Tema maksimal 30."),
    faq: z.array(z.object({ id, on: z.boolean(), q: req("Pertanyaan", 80), a: req("Jawaban", 600) })).max(30, "Tanya jawab maksimal 30."),
    terms: z.object({
      date: req("Tanggal berlaku", 40),
      title: req("Judul halaman", 50),
      intro: str("Paragraf pembuka", 4000),
      articles: z.array(z.object({ id, on: z.boolean(), title: req("Judul pasal", 60), body: str("Isi pasal", 20000) })).max(40, "Pasal maksimal 40."),
    }),
    packages: z.object({ dasar: pkg("Dasar"), lengkap: pkg("Lengkap"), istimewa: pkg("Istimewa") }),
    matrix: z
      .array(
        z.object({
          id,
          label: req("Isi paket", 60),
          kind: z.enum(["check", "count"]),
          // Cara menulis jumlah di kartu harga, {n} diganti angkanya. Contoh: {n} foto, sampai {n} bagian.
          unit: str("Format jumlah", 40).default(""),
          key: z.enum(["", ...(Object.keys(SYSTEM_KEYS) as SystemKey[])]),
          cells: z.object({ dasar: cell, lengkap: cell, istimewa: cell }),
        }),
      )
      .max(40, "Isi paket maksimal 40 baris."),
    addons: z
      .array(
        z.object({
          id,
          on: z.boolean(),
          name: req("Nama tambahan", 46),
          price: rupiah("Harga tambahan"),
          scope: str("Berlaku untuk", 60),
          unlock: z.enum(["", ...UNLOCK_KEYS]).default(""),
          amount: count("Tambahan per unit", 0, 500).default(0),
        }),
      )
      .max(30, "Tambahan maksimal 30."),
    contact: z.object({
      wa: z.string().trim().regex(/^628\d{7,12}$/, "Nomor WhatsApp harus format 628xxx, 10 sampai 15 digit."),
      instagram: z
        .string()
        .trim()
        .transform((v) => v.replace(/^@/, ""))
        .pipe(z.string().regex(/^[A-Za-z0-9._]{1,30}$/, "Username Instagram hanya huruf, angka, titik, dan garis bawah.")),
      email: z.union([z.literal(""), z.email("Email tidak valid.")]),
      city: str("Kota", 40),
      open: time("Jam buka"),
      close: time("Jam tutup"),
      days: str("Hari operasional", 40),
    }),
    wa: z.object({ general: str("Pesan pembuka", 200), plan: str("Pesan pembuka dari kartu harga", 200) }),
    payment: z.object({
      bank: req("Nama bank", 40),
      accountName: req("Nama rekening", 80),
      accountNumber: z.string().trim().regex(/^[0-9][0-9 -]{4,29}$/, "Nomor rekening hanya angka, 5 sampai 30 digit."),
      dp: count("Persentase uang muka", 0, 100),
      qrisNmid: str("NMID QRIS", 40),
      qrisImage: str("Gambar QRIS", 300),
      note: str("Catatan di bawah kartu harga", 400),
    }),
  })
  .superRefine((s, ctx) => {
    const slugs = new Set<string>();
    s.themes.forEach((t, i) => {
      if (slugs.has(t.slug)) ctx.addIssue({ code: "custom", path: ["themes", i, "slug"], message: "Slug ini sudah dipakai tema lain." });
      slugs.add(t.slug);
    });
    const keys = new Set<string>();
    s.matrix.forEach((r, i) => {
      if (!r.key) return;
      if (keys.has(r.key)) ctx.addIssue({ code: "custom", path: ["matrix", i, "key"], message: "Kunci ini sudah dipakai baris lain." });
      const wantCount = COUNT_KEYS.includes(r.key);
      if (wantCount !== (r.kind === "count")) {
        ctx.addIssue({ code: "custom", path: ["matrix", i, "kind"], message: wantCount ? "Kunci ini harus bertipe Berjumlah." : "Kunci ini harus bertipe Centang." });
      }
      keys.add(r.key);
    });
    for (const p of PACKAGE_IDS) {
      const pk = s.packages[p];
      if (pk.slaMax !== undefined && pk.slaMax < pk.sla) {
        ctx.addIssue({ code: "custom", path: ["packages", p, "slaMax"], message: "Paling lama tidak boleh lebih cepat dari paling cepat." });
      }
    }
    if (!PACKAGE_IDS.some((p) => s.packages[p].on)) ctx.addIssue({ code: "custom", path: ["packages", "dasar", "on"], message: "Minimal satu paket harus tampil." });
    s.addons.forEach((a, i) => {
      if ((AMOUNT_KEYS as readonly string[]).includes(a.unlock) && a.amount < 1) {
        ctx.addIssue({ code: "custom", path: ["addons", i, "amount"], message: a.unlock === "galeri_foto" ? "Isi jumlah foto yang ditambahkan per unit." : "Isi jumlah bagian yang ditambahkan per unit." });
      }
    });
    if (s.contact.open >= s.contact.close) ctx.addIssue({ code: "custom", path: ["contact", "close"], message: "Jam tutup harus setelah jam buka." });
  });

export type Settings = z.infer<typeof settingsSchema>;
export type ThemeEntry = Settings["themes"][number];
export type MatrixRow = Settings["matrix"][number];

export const newId = () => Math.random().toString(36).slice(2, 10);
