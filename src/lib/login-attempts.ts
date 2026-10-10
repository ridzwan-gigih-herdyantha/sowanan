import "server-only";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Percobaan login dicatat per scope, misalnya "admin", "mempelai" per IP, dan "mempelai:<slug>" per akun,
// supaya percobaan di satu tempat tidak ikut mengunci tempat lain.

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

// Jumlah percobaan dalam jendela waktu. Tanpa ip berarti dihitung dari semua IP.
export async function countAttempts(scope: string, windowMs: number, ip?: string): Promise<number> {
  let q = supabaseAdmin()
    .from("login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("scope", scope)
    .gte("created_at", new Date(Date.now() - windowMs).toISOString());
  if (ip) q = q.eq("ip", ip);
  const { count } = await q;
  return count ?? 0;
}

export async function recordAttempt(scope: string, ip: string) {
  await supabaseAdmin().from("login_attempts").insert({ scope, ip });
}

export async function clearAttempts(scope: string, ip?: string) {
  let q = supabaseAdmin().from("login_attempts").delete().eq("scope", scope);
  if (ip) q = q.eq("ip", ip);
  await q;
}
