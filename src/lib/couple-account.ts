import "server-only";
import { randomBytes, randomInt } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { isDemo } from "@/lib/invitation/archive";
import { supabaseAdmin, supabaseUrl } from "@/lib/supabase/admin";

// Akun mempelai untuk dashboard. Login memakai slug undangan sebagai username, jadi email di Supabase Auth
// hanya alamat internal yang tidak pernah dipakai mengirim surat. Akun dicari lewat invitation_members,
// bukan lewat email, supaya login tetap jalan walau slug undangan diganti.
const EMAIL_DOMAIN = "akun.sowanan.com";

export type CoupleAccount = { userId: string; email: string; createdAt: string; lastSignIn: string | null; passwordSetAt: string | null };

// Tanpa huruf dan angka yang mirip (0 O 1 l i) supaya mudah diketik ulang dari pesan WhatsApp.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%?&*";
export function newPassword(): string {
  const chars = Array.from({ length: 12 }, () => ALPHABET[randomInt(ALPHABET.length)]);
  return [chars.slice(0, 4), chars.slice(4, 8), chars.slice(8)].map((g) => g.join("")).join("-");
}

export async function getCoupleAccount(invitationId: string): Promise<CoupleAccount | null> {
  const sb = supabaseAdmin();
  const { data: member } = await sb.from("invitation_members").select("user_id").eq("invitation_id", invitationId).eq("role", "mempelai").limit(1).maybeSingle();
  if (!member) return null;
  const { data } = await sb.auth.admin.getUserById(member.user_id);
  if (!data.user) return null;
  return {
    userId: data.user.id,
    email: data.user.email ?? "",
    createdAt: data.user.created_at,
    lastSignIn: data.user.last_sign_in_at ?? null,
    passwordSetAt: (data.user.app_metadata?.password_set_at as string | undefined) ?? null,
  };
}

export type AccountResult = { ok: true; password: string } | { ok: false; error: string };

export async function createCoupleAccount(invitationId: string, slug: string): Promise<AccountResult> {
  if (await getCoupleAccount(invitationId)) return { ok: false, error: "Undangan ini sudah punya akun mempelai." };
  const sb = supabaseAdmin();
  const password = newPassword();
  const { data, error } = await sb.auth.admin.createUser({
    email: `${slug}.${randomBytes(2).toString("hex")}@${EMAIL_DOMAIN}`,
    password,
    email_confirm: true,
    app_metadata: { role: "mempelai", password_set_at: new Date().toISOString() },
  });
  if (error || !data.user) return { ok: false, error: "Gagal membuat akun." };
  const { error: linkError } = await sb.from("invitation_members").insert({ invitation_id: invitationId, user_id: data.user.id, role: "mempelai" });
  if (linkError) {
    await sb.auth.admin.deleteUser(data.user.id);
    return { ok: false, error: "Gagal membuat akun." };
  }
  return { ok: true, password };
}

// Password baru, lalu semua sesi akun itu dicabut supaya perangkat yang sudah masuk keluar.
export async function resetCouplePassword(invitationId: string): Promise<AccountResult> {
  const account = await getCoupleAccount(invitationId);
  if (!account) return { ok: false, error: "Undangan ini belum punya akun mempelai." };
  const sb = supabaseAdmin();
  const { data } = await sb.auth.admin.getUserById(account.userId);
  const password = newPassword();
  const { error } = await sb.auth.admin.updateUserById(account.userId, {
    password,
    app_metadata: { ...data.user?.app_metadata, role: "mempelai", password_set_at: new Date().toISOString() },
  });
  if (error) return { ok: false, error: "Gagal mengganti password." };
  await signOutEverywhere(account.email, password);
  return { ok: true, password };
}

// Supabase mencabut sesi lewat token milik pengguna itu, jadi masuk sekali dengan password baru lalu keluar
// dari semua perangkat. Sesi sementara ini ikut tercabut.
async function signOutEverywhere(email: string, password: string) {
  const temp = createClient(supabaseUrl(), process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data } = await temp.auth.signInWithPassword({ email, password });
  if (data.session) await supabaseAdmin().auth.admin.signOut(data.session.access_token, "global");
}

// Email login untuk username (slug undangan). Undangan contoh dan undangan tanpa akun tidak punya email.
export async function coupleEmailForSlug(slug: string): Promise<string | null> {
  const sb = supabaseAdmin();
  const { data: inv } = await sb.from("invitations").select("id, slug, theme").eq("slug", slug).maybeSingle();
  if (!inv || isDemo(inv.slug, inv.theme)) return null;
  const account = await getCoupleAccount(inv.id);
  return account?.email ?? null;
}

// Menghapus akun juga menghapus baris invitation_members lewat on delete cascade.
export async function deleteCoupleAccount(invitationId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const account = await getCoupleAccount(invitationId);
  if (!account) return { ok: true };
  const { error } = await supabaseAdmin().auth.admin.deleteUser(account.userId);
  return error ? { ok: false, error: "Gagal menghapus akun." } : { ok: true };
}
