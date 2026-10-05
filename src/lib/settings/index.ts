import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";
import { DEFAULT_SETTINGS } from "./defaults";
import { normalizeSettings } from "./legacy";
import type { Settings } from "./schema";

export * from "./schema";
export * from "./text";
export { DEFAULT_SETTINGS } from "./defaults";

export const SETTINGS_TAG = "settings";

// Untuk halaman publik. Di-cache tanpa batas waktu dan baru diperbarui lewat updateTag(SETTINGS_TAG),
// jadi perubahan langsung di database (misalnya lewat SQL editor) belum terlihat sebelum cache diperbarui.
export async function getSettings(): Promise<Settings> {
  "use cache";
  cacheTag(SETTINGS_TAG);
  cacheLife("max");
  return readSettings();
}

// Untuk admin. Selalu membaca database, supaya yang diubah dan disimpan admin adalah isi yang sebenarnya.
export async function getSettingsFresh(): Promise<Settings> {
  return readSettings();
}

async function readSettings(): Promise<Settings> {
  if (!hasSupabase()) return DEFAULT_SETTINGS;
  const { data, error } = await supabaseAdmin().from("settings").select("data").eq("id", 1).maybeSingle();
  if (error || !data) return DEFAULT_SETTINGS;
  return normalizeSettings(data.data);
}
