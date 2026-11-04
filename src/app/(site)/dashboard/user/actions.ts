"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { checkInManual, manualCheckinClosed, setCheckedIn } from "@/lib/checkin";
import { coupleEmailForSlug } from "@/lib/couple-account";
import { coupleInvitation } from "@/lib/couple-auth";
import * as guestList from "@/lib/guest-list";
import type { GuestRow, GuestSession } from "@/lib/guests";
import { archiveInfo, isDemo } from "@/lib/invitation/archive";
import { invitationRules } from "@/lib/invitation/rules";
import { invitationDataSchema } from "@/lib/invitation/schema";
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

// Mempelai boleh menyembunyikan dan menampilkan lagi ucapan di undangannya, kecuali yang disembunyikan admin.
export async function coupleHideWish(slug: string, wishId: number, hidden: boolean): Promise<HideResult> {
  const found = await coupleInvitation(slug);
  if (!found) return { ok: false, error: "Sesi berakhir. Silakan masuk lagi." };
  const { data: wish } = await supabaseAdmin().from("wishes").select("hidden_by").eq("id", wishId).eq("invitation_id", found.invitation.id).maybeSingle();
  if (!wish) return { ok: false, error: "Ucapan tidak ditemukan." };
  if (wish.hidden_by === "admin") return { ok: false, error: "Ucapan ini disembunyikan tim Sowanan. Hubungi kami kalau ingin ditampilkan lagi." };
  return setWishHidden(slug, found.invitation.id, wishId, hidden, "mempelai");
}

// Tamu ditandai sudah dikirimi link saat mempelai membuka WhatsApp dari dashboard, sama seperti di admin.
export async function coupleMarkSent(slug: string, guestId: number): Promise<{ ok: true; data: string } | { ok: false; error: string }> {
  const found = await coupleInvitation(slug);
  if (!found) return { ok: false, error: "Sesi berakhir. Silakan masuk lagi." };
  const at = new Date().toISOString();
  const { error } = await supabaseAdmin().from("guests").update({ sent_at: at }).eq("id", guestId).eq("invitation_id", found.invitation.id);
  if (error) return { ok: false, error: "Gagal menandai terkirim." };
  return { ok: true, data: at };
}

// Cadangan kalau pemindaian QR bermasalah: penerima tamu mencari nama lalu menandai hadir, mengikuti jam absensi.
export async function coupleSetPresent(slug: string, guestId: number, present: boolean): Promise<{ ok: true; data: string | null } | { ok: false; error: string }> {
  const found = await coupleInvitation(slug);
  if (!found) return { ok: false, error: "Sesi berakhir. Silakan masuk lagi." };
  const closed = await manualCheckinClosed(slug);
  if (closed) return { ok: false, error: closed };
  const guest = await setCheckedIn(found.invitation.id, guestId, present);
  if (!guest) return { ok: false, error: "Gagal menyimpan. Coba lagi." };
  return { ok: true, data: guest.checked_in_at };
}

// Nama yang tidak ada di daftar tamu dicatat sebagai datang langsung.
export async function coupleAddWalkIn(slug: string, name: string): Promise<{ ok: true; data: GuestRow } | { ok: false; error: string }> {
  const found = await coupleInvitation(slug);
  if (!found) return { ok: false, error: "Sesi berakhir. Silakan masuk lagi." };
  const closed = await manualCheckinClosed(slug);
  if (closed) return { ok: false, error: closed };
  const guest = await checkInManual(found.invitation.id, name);
  if (!guest) return { ok: false, error: "Gagal mencatat. Coba lagi." };
  return { ok: true, data: guest as GuestRow };
}

// Pembeli mengelola tamu, sesi, dan mode private kalau paket atau add-on menyediakannya. Setelah arsip semuanya
// terkunci, sama seperti editor undangan. Link dan kode yang sudah ada tetap berlaku.
async function manage(slug: string): Promise<{ id: string } | { error: string }> {
  const found = await coupleInvitation(slug);
  if (!found) return { error: "Sesi berakhir. Silakan masuk lagi." };
  const { id, theme, data } = found.invitation;
  const parsed = invitationDataSchema.safeParse(data);
  if (parsed.success && archiveInfo(parsed.data, Date.now(), isDemo(slug, theme)).archived) return { error: "Undangan sudah menjadi arsip, jadi tidak bisa diubah lagi." };
  if ((await invitationRules(slug))?.rules.locked.tamu_terundang) return { error: "Fitur ini belum termasuk paket undanganmu." };
  return { id };
}

export async function coupleAddGuests(slug: string, input: unknown): Promise<guestList.Result<{ added: GuestRow[]; skipped: number }>> {
  const ctx = await manage(slug);
  return "error" in ctx ? { ok: false, error: ctx.error } : guestList.insertGuests(ctx.id, input);
}

export async function coupleDeleteGuest(slug: string, guestId: number): Promise<guestList.Result<null>> {
  const ctx = await manage(slug);
  return "error" in ctx ? { ok: false, error: ctx.error } : guestList.removeGuests(ctx.id, [guestId]);
}

export async function coupleSetGuestSession(slug: string, guestId: number, sessionId: number | null): Promise<guestList.Result<number | null>> {
  const ctx = await manage(slug);
  return "error" in ctx ? { ok: false, error: ctx.error } : guestList.assignSession(ctx.id, guestId, sessionId);
}

export async function coupleSetPrivate(slug: string, on: boolean): Promise<guestList.Result<null>> {
  const ctx = await manage(slug);
  return "error" in ctx ? { ok: false, error: ctx.error } : guestList.switchPrivate(slug, on);
}

export async function coupleAddSession(slug: string, input: unknown): Promise<guestList.Result<GuestSession>> {
  const ctx = await manage(slug);
  return "error" in ctx ? { ok: false, error: ctx.error } : guestList.addSession(ctx.id, input);
}

export async function coupleUpdateSession(slug: string, sessionId: number, input: unknown): Promise<guestList.Result<GuestSession>> {
  const ctx = await manage(slug);
  return "error" in ctx ? { ok: false, error: ctx.error } : guestList.updateSession(ctx.id, sessionId, input);
}

export async function coupleRemoveSession(slug: string, sessionId: number): Promise<guestList.Result<null>> {
  const ctx = await manage(slug);
  return "error" in ctx ? { ok: false, error: ctx.error } : guestList.removeSession(ctx.id, sessionId);
}

export async function coupleSetSessionItem(slug: string, name: string): Promise<guestList.Result<null>> {
  const ctx = await manage(slug);
  return "error" in ctx ? { ok: false, error: ctx.error } : guestList.saveSessionItem(ctx.id, name);
}

// Keluar dari perangkat ini saja. Perangkat lain tetap masuk sampai password diganti admin.
export async function coupleLogout() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/dashboard/user/login");
}
