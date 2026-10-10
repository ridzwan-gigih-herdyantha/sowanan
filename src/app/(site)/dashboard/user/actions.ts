"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { coupleEmailForSlug } from "@/lib/couple-account";
import { coupleInvitation } from "@/lib/couple-auth";
import { clearAttempts, clientIp, countAttempts, recordAttempt } from "@/lib/login-attempts";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { setWishHidden, type HideResult } from "@/lib/wishes";

export type LoginState = { message: string; username?: string };

const MINUTE = 60_000;
// Per IP 5 kali per menit, per akun 10 kali per 15 menit, supaya satu akun tidak bisa ditebak dari banyak IP.
const PER_IP = { max: 5, window: MINUTE };
const PER_ACCOUNT = { max: 10, window: 15 * MINUTE };
const WRONG = "Username atau password salah.";

const schema = z.object({
  username: z.string().trim().toLowerCase().min(1, "Username wajib diisi.").max(80),
  password: z.string().min(1, "Password wajib diisi.").max(200),
});

export async function coupleLogin(_prev: LoginState, form: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({ username: form.get("username"), password: form.get("password") });
  const username = String(form.get("username") ?? "").trim();
  if (!parsed.success) return { message: parsed.error.issues[0].message, username };

  const ip = await clientIp();
  const accountScope = `mempelai:${parsed.data.username}`;
  const [byIp, byAccount] = await Promise.all([countAttempts("mempelai", PER_IP.window, ip), countAttempts(accountScope, PER_ACCOUNT.window)]);
  if (byIp >= PER_IP.max) return { message: "Terlalu banyak percobaan. Tunggu 1 menit lalu coba lagi.", username };
  if (byAccount >= PER_ACCOUNT.max) return { message: "Terlalu banyak percobaan untuk akun ini. Tunggu 15 menit lalu coba lagi.", username };
  await Promise.all([recordAttempt("mempelai", ip), recordAttempt(accountScope, ip)]);

  // Pesan gagal selalu sama, jadi tidak bisa dipakai untuk menebak undangan mana yang punya akun.
  const email = await coupleEmailForSlug(parsed.data.username);
  if (!email) return { message: WRONG, username };
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: parsed.data.password });
  if (error || data.user?.app_metadata?.role !== "mempelai") {
    if (!error) await supabase.auth.signOut({ scope: "local" });
    return { message: WRONG, username };
  }

  await Promise.all([clearAttempts("mempelai", ip), clearAttempts(accountScope)]);
  redirect(`/dashboard/user/${parsed.data.username}`);
}

// Mempelai boleh menyembunyikan dan menampilkan lagi ucapan di undangannya sendiri, kecuali yang disembunyikan admin.
export async function coupleHideWish(slug: string, wishId: number, hidden: boolean): Promise<HideResult> {
  const found = await coupleInvitation(slug);
  if (!found) return { ok: false, error: "Sesi berakhir. Silakan masuk lagi." };
  const { data: wish } = await supabaseAdmin().from("wishes").select("hidden_by").eq("id", wishId).eq("invitation_id", found.invitation.id).maybeSingle();
  if (!wish) return { ok: false, error: "Ucapan tidak ditemukan." };
  if (wish.hidden_by === "admin") return { ok: false, error: "Ucapan ini disembunyikan tim Sowanan. Hubungi kami kalau ingin ditampilkan lagi." };
  return setWishHidden(slug, found.invitation.id, wishId, hidden, "mempelai");
}

// Keluar dari perangkat ini saja. Perangkat lain tetap masuk sampai password diganti admin.
export async function coupleLogout() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/dashboard/user/login");
}
