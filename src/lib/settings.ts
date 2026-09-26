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

export const settingsSchema = z.object({
  waNumber: z.string().trim().regex(/^628\d{7,12}$/, "Nomor WhatsApp harus format 628xxx, 10 sampai 15 digit."),
  priceHemat: rupiah("Harga Hemat"),
  priceLengkap: rupiah("Harga Lengkap"),
  priceDesain: rupiah("Harga Desain Sendiri"),
  sla: text("SLA pengerjaan"),
  activePeriod: text("Masa aktif link"),
  revisionsHemat: count("Revisi Hemat", 0, 20).nullable(),
  revisionsLengkap: count("Revisi Lengkap", 0, 20).nullable(),
  revisionsDesain: count("Revisi Desain Sendiri", 0, 20).nullable(),
  maxPhotosHemat: count("Maksimal foto Hemat", 1, 200),
  dpPercent: count("Persentase DP", 0, 100),
  instagram: z
    .string()
    .trim()
    .transform((v) => v.replace(/^@/, ""))
    .pipe(z.string().regex(/^[A-Za-z0-9._]{1,30}$/, "Username Instagram hanya huruf, angka, titik, dan garis bawah.")),
  operatingHours: text("Jam operasional"),
});

export const REVISION_FIELDS = ["revisionsHemat", "revisionsLengkap", "revisionsDesain"] as const;

export const NUMBER_FIELDS = [
  "priceHemat",
  "priceLengkap",
  "priceDesain",
  "revisionsHemat",
  "revisionsLengkap",
  "revisionsDesain",
  "maxPhotosHemat",
  "dpPercent",
] as const;

export function parseSettingsForm(form: FormData) {
  const raw: Record<string, unknown> = {};
  for (const key of Object.keys(settingsSchema.shape)) {
    const v = String(form.get(key) ?? "").trim();
    if ((REVISION_FIELDS as readonly string[]).includes(key) && form.get(`${key}Unlimited`) === "on") {
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
  priceHemat: 99000,
  priceLengkap: 199000,
  priceDesain: 499000,
  sla: "2 sampai 3 hari kerja",
  activePeriod: "12 bulan",
  revisionsHemat: 2,
  revisionsLengkap: 3,
  revisionsDesain: 5,
  maxPhotosHemat: 10,
  dpPercent: 50,
  instagram: "sowanan.id",
  operatingHours: "08.00 sampai 20.00",
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

export function lowestPrice(s: Settings): number {
  return Math.min(s.priceHemat, s.priceLengkap, s.priceDesain);
}

export function highestPrice(s: Settings): number {
  return Math.max(s.priceHemat, s.priceLengkap, s.priceDesain);
}

export function formatRevisions(n: number | null, unit: string): string {
  return n === null ? "tanpa batas" : `${n}${unit}`;
}

export function formatRupiah(value: number): string {
  return "Rp" + value.toLocaleString("id-ID");
}

export function waLink(number: string, text?: string): string {
  const url = `https://wa.me/${number}`;
  return text ? `${url}?text=${encodeURIComponent(text)}` : url;
}
