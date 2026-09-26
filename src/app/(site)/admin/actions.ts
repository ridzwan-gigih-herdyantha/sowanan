"use server";

import { updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { parseSettingsForm, SETTINGS_TAG } from "@/lib/settings";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

export type FormState = { ok: boolean; message: string; errors?: Record<string, string>; at?: number };

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60_000;

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

const loginSchema = z.object({
  email: z.email("Email tidak valid."),
  password: z.string().min(1, "Password wajib diisi."),
});

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  if (!hasSupabase()) return { ok: false, message: "Supabase belum dikonfigurasi." };

  const parsed = loginSchema.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  const ip = await clientIp();
  const db = supabaseAdmin();
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count } = await db.from("login_attempts").select("id", { count: "exact", head: true }).eq("ip", ip).gte("created_at", since);
  if ((count ?? 0) >= MAX_ATTEMPTS) {
    return { ok: false, message: "Terlalu banyak percobaan. Tunggu 1 menit lalu coba lagi." };
  }
  await db.from("login_attempts").insert({ ip });

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    const left = MAX_ATTEMPTS - (count ?? 0) - 1;
    return { ok: false, message: left > 0 ? `Email atau password salah. Sisa ${left} percobaan.` : "Email atau password salah. Tunggu 1 menit lalu coba lagi." };
  }

  await db.from("login_attempts").delete().eq("ip", ip);
  redirect("/admin");
}

export async function logout() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/admin");
}

export async function saveSettings(_prev: FormState, form: FormData): Promise<FormState> {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { ok: false, message: "Sesi berakhir. Silakan masuk lagi." };

  const parsed = parseSettingsForm(form);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { ok: false, message: "Periksa lagi isian yang ditandai.", errors };
  }

  const { error } = await supabaseAdmin()
    .from("settings")
    .upsert({ id: 1, data: parsed.data, updated_at: new Date().toISOString() });
  if (error) return { ok: false, message: "Gagal menyimpan. Coba lagi." };

  updateTag(SETTINGS_TAG);
  return { ok: true, message: "Pengaturan tersimpan. Homepage sudah memakai nilai baru.", at: Date.now() };
}
