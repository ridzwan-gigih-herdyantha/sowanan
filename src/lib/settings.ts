import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";

export const SETTINGS_TAG = "settings";

export const settingsSchema = z.object({
  waNumber: z.string().regex(/^628\d{7,12}$/, "Format nomor 628xxx"),
  priceHemat: z.number().int().nonnegative(),
  priceLengkap: z.number().int().nonnegative(),
  priceDesain: z.number().int().nonnegative(),
  sla: z.string().min(1),
  activePeriod: z.string().min(1),
  revisionsHemat: z.number().int().nonnegative(),
  revisionsLengkap: z.number().int().nonnegative(),
  revisionsDesain: z.number().int().nonnegative(),
  maxPhotosHemat: z.number().int().positive(),
  dpPercent: z.number().int().min(0).max(100),
  instagram: z.string().min(1),
  operatingHours: z.string().min(1),
});

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

export function formatRupiah(value: number): string {
  return "Rp" + value.toLocaleString("id-ID");
}

export function waLink(number: string, text?: string): string {
  const url = `https://wa.me/${number}`;
  return text ? `${url}?text=${encodeURIComponent(text)}` : url;
}
