import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";

export const SETTINGS_TAG = "settings";

const rupiah = (label: string) =>
  z.number({ error: `${label} wajib diisi angka.` }).int(`${label} harus bilangan bulat.`).min(0, `${label} tidak boleh negatif.`);
const count = (label: string, min = 0, max = 1000) =>
  z
    .number({ error: `${label} wajib diisi angka.` })
    .int(`${label} harus bilangan bulat.`)
    .min(min, `${label} minimal ${min}.`)
    .max(max, `${label} maksimal ${max}.`);
const text = (label: string) => z.string().trim().min(1, `${label} wajib diisi.`).max(80, `${label} maksimal 80 karakter.`);

export const PLANS = ["Dasar", "Lengkap", "Istimewa"] as const;
export type Plan = (typeof PLANS)[number];

export const settingsSchema = z.object({
  waNumber: z.string().trim().regex(/^628\d{7,12}$/, "Nomor WhatsApp harus format 628xxx, 10 sampai 15 digit."),
  priceDasar: rupiah("Harga Dasar"),
  priceLengkap: rupiah("Harga Lengkap"),
  priceIstimewa: rupiah("Harga Istimewa"),
  activeDasar: count("Masa aktif Dasar", 1, 60),
  activeLengkap: count("Masa aktif Lengkap", 1, 60),
  activeIstimewa: count("Masa aktif Istimewa", 1, 60),
  slaDasar: count("Pengerjaan Dasar", 1, 30),
  slaLengkap: count("Pengerjaan Lengkap", 1, 30),
  slaIstimewa: count("Pengerjaan Istimewa", 1, 30),
  photosDasar: count("Foto Dasar", 1, 500).nullable(),
  photosLengkap: count("Foto Lengkap", 1, 500).nullable(),
  photosIstimewa: count("Foto Istimewa", 1, 500).nullable(),
  dpPercent: count("Persentase DP", 0, 100),
  addonPhotos: rupiah("Harga tambah 10 foto"),
  addonStyle: rupiah("Harga ganti font atau palet"),
  addonMusic: rupiah("Harga musik pilihan sendiri"),
  addonExport: rupiah("Harga ekspor daftar tamu"),
  addonExpress: rupiah("Harga pengerjaan kilat"),
  addonDomain: rupiah("Harga domain sendiri"),
  addonExtend: rupiah("Harga perpanjangan masa aktif"),
  payBank: text("Nama bank"),
  payAccountName: text("Nama rekening"),
  payAccountNumber: z.string().trim().regex(/^[0-9][0-9 -]{4,29}$/, "Nomor rekening hanya angka, 5 sampai 30 digit."),
  qrisNmid: z.string().trim().max(40, "NMID QRIS maksimal 40 karakter."),
  qrisImage: z.string().trim().max(300),
  termsDate: text("Tanggal berlaku ketentuan"),
  instagram: z
    .string()
    .trim()
    .transform((v) => v.replace(/^@/, ""))
    .pipe(z.string().regex(/^[A-Za-z0-9._]{1,30}$/, "Username Instagram hanya huruf, angka, titik, dan garis bawah.")),
  operatingHours: text("Jam operasional"),
  waMessage: z.string().trim().max(500, "Template chat maksimal 500 karakter."),
});

export const UNLIMITED_FIELDS = ["photosDasar", "photosLengkap", "photosIstimewa"] as const;

export const NUMBER_FIELDS = [
  "priceDasar",
  "priceLengkap",
  "priceIstimewa",
  "activeDasar",
  "activeLengkap",
  "activeIstimewa",
  "slaDasar",
  "slaLengkap",
  "slaIstimewa",
  "photosDasar",
  "photosLengkap",
  "photosIstimewa",
  "dpPercent",
  "addonPhotos",
  "addonStyle",
  "addonMusic",
  "addonExport",
  "addonExpress",
  "addonDomain",
  "addonExtend",
] as const;

export function parseSettingsForm(form: FormData) {
  const raw: Record<string, unknown> = {};
  for (const key of Object.keys(settingsSchema.shape)) {
    const v = String(form.get(key) ?? "").trim();
    if ((UNLIMITED_FIELDS as readonly string[]).includes(key) && form.get(`${key}Unlimited`) === "on") {
      raw[key] = null;
      continue;
    }
    raw[key] = (NUMBER_FIELDS as readonly string[]).includes(key) ? (v === "" ? undefined : Number(v.replace(/[.\s]/g, ""))) : v;
  }
  return settingsSchema.safeParse(raw);
}

export type Settings = z.infer<typeof settingsSchema>;

// TODO: ganti dengan nilai asli dari tim Sowanan sebelum launch.
export const DEFAULT_SETTINGS: Settings = {
  waNumber: "6281234567890",
  priceDasar: 49000,
  priceLengkap: 149000,
  priceIstimewa: 299000,
  activeDasar: 3,
  activeLengkap: 12,
  activeIstimewa: 12,
  slaDasar: 3,
  slaLengkap: 2,
  slaIstimewa: 1,
  photosDasar: 3,
  photosLengkap: 15,
  photosIstimewa: null,
  dpPercent: 50,
  addonPhotos: 25000,
  addonStyle: 35000,
  addonMusic: 25000,
  addonExport: 50000,
  addonExpress: 99000,
  addonDomain: 150000,
  addonExtend: 50000,
  payBank: "BCA",
  payAccountName: "Sowanan",
  payAccountNumber: "0000000000",
  qrisNmid: "",
  qrisImage: "",
  termsDate: "30 September 2026",
  instagram: "sowanan.id",
  operatingHours: "08.00 sampai 20.00",
  waMessage: "Halo Sowanan, saya mau tanya soal undangan pernikahan digital.",
};

export async function getSettings(): Promise<Settings> {
  "use cache";
  cacheTag(SETTINGS_TAG);
  cacheLife("max");

  if (!hasSupabase()) return DEFAULT_SETTINGS;

  const { data, error } = await supabaseAdmin().from("settings").select("data").eq("id", 1).maybeSingle();
  if (error || !data) return DEFAULT_SETTINGS;

  const parsed = settingsSchema.partial().safeParse(data.data);
  return { ...DEFAULT_SETTINGS, ...(parsed.success ? parsed.data : {}) };
}

export const planValue = (s: Settings, field: "price" | "active" | "sla" | "photos", plan: Plan) => s[`${field}${plan}`];

export function lowestPrice(s: Settings): number {
  return Math.min(...PLANS.map((p) => s[`price${p}`]));
}

export function highestPrice(s: Settings): number {
  return Math.max(...PLANS.map((p) => s[`price${p}`]));
}

// Contoh: "1 sampai 3 hari kerja"
export function slaRange(s: Settings): string {
  const days = PLANS.map((p) => s[`sla${p}`]);
  const [min, max] = [Math.min(...days), Math.max(...days)];
  return min === max ? `${min} hari kerja` : `${min} sampai ${max} hari kerja`;
}

// Paket dengan nilai sama digabung. Contoh: "Dasar 3 bulan, Lengkap dan Istimewa 12 bulan"
export function perPlan(s: Settings, field: "active" | "sla", unit: string): string {
  const groups = new Map<number, string[]>();
  for (const p of PLANS) groups.set(s[`${field}${p}`], [...(groups.get(s[`${field}${p}`]) ?? []), p]);
  return [...groups].map(([n, plans]) => `${plans.join(" dan ")} ${n} ${unit}`).join(", ");
}

export function formatPhotos(n: number | null): string {
  return n === null ? "tanpa batas" : `${n} foto`;
}

export function formatRupiah(value: number): string {
  return "Rp" + value.toLocaleString("id-ID");
}

export function waLink(number: string, text?: string): string {
  const url = `https://wa.me/${number}`;
  return text ? `${url}?text=${encodeURIComponent(text)}` : url;
}
