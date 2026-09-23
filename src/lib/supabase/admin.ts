import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Client service-role: hanya dipakai di server (server action, server component).
// Semua tabel dikunci RLS untuk publik, jadi tulis/baca data lewat client ini.
let client: SupabaseClient | null = null;

export function hasSupabase(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function supabaseAdmin(): SupabaseClient {
  if (!hasSupabase()) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum di-set.");
  }
  client ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
