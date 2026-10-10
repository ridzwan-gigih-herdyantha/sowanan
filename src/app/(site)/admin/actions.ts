"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSettingsFresh, SETTINGS_TAG, settingsSchema, type Settings } from "@/lib/settings";
import { currentAdmin, isAdminUser } from "@/lib/admin-auth";
import { clearAttempts, clientIp, countAttempts, recordAttempt } from "@/lib/login-attempts";
import { cleanHtml } from "@/lib/settings/sanitize";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

export type FormState = { ok: boolean; message: string; errors?: Record<string, string>; at?: number };

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60_000;

const loginSchema = z.object({
  email: z.email("Email tidak valid."),
  password: z.string().min(1, "Password wajib diisi."),
});

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  if (!hasSupabase()) return { ok: false, message: "Supabase belum dikonfigurasi." };

  const parsed = loginSchema.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  const ip = await clientIp();
  const count = await countAttempts("admin", WINDOW_MS, ip);
  if (count >= MAX_ATTEMPTS) {
    return { ok: false, message: "Terlalu banyak percobaan. Tunggu 1 menit lalu coba lagi." };
  }
  await recordAttempt("admin", ip);

  const supabase = await supabaseServer();
  const { data: signed, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    const left = MAX_ATTEMPTS - count - 1;
    return { ok: false, message: left > 0 ? `Email atau password salah. Sisa ${left} percobaan.` : "Email atau password salah. Tunggu 1 menit lalu coba lagi." };
  }

  // Akun mempelai tidak boleh masuk ke admin walau password-nya benar.
  if (!isAdminUser(signed.user)) {
    await supabase.auth.signOut();
    return { ok: false, message: "Akun ini tidak punya akses admin." };
  }

  await clearAttempts("admin", ip);
  redirect("/admin");
}

export async function logout() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/admin");
}

export async function saveSettings(json: string): Promise<FormState> {
  if (!(await currentAdmin())) return { ok: false, message: "Sesi berakhir. Silakan masuk lagi." };

  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { ok: false, message: "Data pengaturan tidak terbaca. Muat ulang halaman." };
  }
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[issue.path.join(".")] ??= issue.message;
    const n = Object.keys(errors).length;
    return { ok: false, message: `Ada ${n} isian yang perlu diperbaiki. Lihat tab bertanda titik merah.`, errors };
  }

  // Isi ketentuan dari editor dibersihkan sebelum disimpan supaya hanya tag yang diizinkan yang tersimpan.
  const terms = parsed.data.terms;
  const clean = {
    ...parsed.data,
    terms: { ...terms, intro: cleanHtml(terms.intro), articles: terms.articles.map((a) => ({ ...a, body: cleanHtml(a.body) })) },
  };

  const { error } = await supabaseAdmin()
    .from("settings")
    .upsert({ id: 1, data: clean, updated_at: new Date().toISOString() });
  if (error) return { ok: false, message: "Gagal menyimpan. Coba lagi." };

  updateTag(SETTINGS_TAG);
  return { ok: true, message: "Pengaturan tersimpan. Homepage dan ketentuan sudah memakai isi baru.", at: Date.now() };
}

// Ambil pengaturan terbaru dari database dan perbarui cache halaman publik. Dipakai setelah database
// diubah di luar aplikasi, misalnya lewat SQL editor Supabase, supaya homepage dan ketentuan ikut berubah.
export async function reloadSettings(): Promise<{ ok: true; settings: Settings } | { ok: false; message: string }> {
  if (!(await currentAdmin())) return { ok: false, message: "Sesi berakhir. Silakan masuk lagi." };
  const settings = await getSettingsFresh();
  updateTag(SETTINGS_TAG);
  return { ok: true, settings };
}
