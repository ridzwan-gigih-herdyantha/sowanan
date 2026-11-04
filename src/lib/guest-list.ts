import "server-only";
import { updateTag } from "next/cache";
import { z } from "zod";
import { GUEST_COLS, MAX_GUESTS, normalizePhone, SESSION_COLS, type GuestRow, type GuestSession } from "@/lib/guests";
import { isDemo } from "@/lib/invitation/archive";
import { invitationTag } from "@/lib/invitation/load";
import { invitationRules } from "@/lib/invitation/rules";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Kelola daftar tamu, sesi, dan mode private. Dipakai aksi admin dan aksi mempelai, yang masing-masing memeriksa hak
// aksesnya lebih dulu. Kode tamu (qr_token) dibuat database saat baris tamu ditambahkan.

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const guestsInput = z
  .array(z.object({ name: z.string().trim().min(1).max(80), phone: z.string().nullable() }))
  .min(1, "Belum ada nama.")
  .max(1000, "Maksimal 1000 tamu sekali tambah.");

export async function insertGuests(id: string, input: unknown): Promise<Result<{ added: GuestRow[]; skipped: number }>> {
  const parsed = guestsInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const sb = supabaseAdmin();
  const { data: existing } = await sb.from("guests").select("name").eq("invitation_id", id).limit(MAX_GUESTS + 1);
  const seen = new Set((existing ?? []).map((g) => g.name.toLowerCase()));
  const fresh = parsed.data.filter((g) => {
    const key = g.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if ((existing?.length ?? 0) + fresh.length > MAX_GUESTS) return { ok: false, error: `Maksimal ${MAX_GUESTS} tamu per undangan.` };
  if (!fresh.length) return { ok: true, data: { added: [], skipped: parsed.data.length } };

  const rows = fresh.map((g) => ({ invitation_id: id, name: g.name, phone: g.phone ? normalizePhone(g.phone) : null }));
  const { data, error } = await sb.from("guests").insert(rows).select(GUEST_COLS);
  if (error) return { ok: false, error: "Gagal menyimpan daftar tamu." };
  return { ok: true, data: { added: data as unknown as GuestRow[], skipped: parsed.data.length - fresh.length } };
}

export async function removeGuests(id: string, ids: number[] | "all"): Promise<Result<null>> {
  let q = supabaseAdmin().from("guests").delete().eq("invitation_id", id);
  if (ids !== "all") q = q.in("id", ids.slice(0, 1000));
  const { error } = await q;
  if (error) return { ok: false, error: "Gagal menghapus." };
  return { ok: true, data: null };
}

// Kosong berarti semua sesi. Sesi harus milik undangan yang sama.
export async function assignSession(id: string, guestId: number, sessionId: number | null): Promise<Result<number | null>> {
  const sb = supabaseAdmin();
  if (sessionId !== null) {
    const { data } = await sb.from("invitation_sessions").select("id").eq("id", sessionId).eq("invitation_id", id).maybeSingle();
    if (!data) return { ok: false, error: "Sesi tidak ditemukan." };
  }
  const { error } = await sb.from("guests").update({ session_id: sessionId }).eq("id", guestId).eq("invitation_id", id);
  if (error) return { ok: false, error: "Gagal menyimpan sesi tamu." };
  return { ok: true, data: sessionId };
}

const clock = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3])[.:][0-5]\d$/, "Jam tidak valid.")
  .transform((s) => s.replace(":", "."));

const sessionInput = z
  .object({
    name: z.string().trim().min(1, "Nama sesi wajib diisi.").max(60, "Nama sesi maksimal 60 karakter."),
    time: clock,
    until: z.union([z.literal(""), clock]),
  })
  .refine((s) => !s.until || s.until > s.time, { message: "Jam selesai harus setelah jam mulai." });

export async function addSession(id: string, input: unknown): Promise<Result<GuestSession>> {
  const parsed = sessionInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { data, error } = await supabaseAdmin()
    .from("invitation_sessions")
    .insert({ invitation_id: id, ...parsed.data })
    .select(SESSION_COLS)
    .single();
  if (error || !data) return { ok: false, error: "Gagal menyimpan sesi." };
  return { ok: true, data: data as unknown as GuestSession };
}

export async function updateSession(id: string, sessionId: number, input: unknown): Promise<Result<GuestSession>> {
  const parsed = sessionInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { data, error } = await supabaseAdmin().from("invitation_sessions").update(parsed.data).eq("id", sessionId).eq("invitation_id", id).select(SESSION_COLS).maybeSingle();
  if (error || !data) return { ok: false, error: "Gagal menyimpan sesi." };
  return { ok: true, data: data as unknown as GuestSession };
}

// Sesi yang masih dipakai tamu tidak dihapus, supaya tamunya tidak diam-diam melihat semua sesi.
export async function removeSession(id: string, sessionId: number): Promise<Result<null>> {
  const sb = supabaseAdmin();
  const { count } = await sb.from("guests").select("id", { count: "exact", head: true }).eq("invitation_id", id).eq("session_id", sessionId);
  if (count) return { ok: false, error: `Sesi ini masih dipakai ${count} tamu. Pindahkan tamunya lebih dulu.` };
  const { error } = await sb.from("invitation_sessions").delete().eq("id", sessionId).eq("invitation_id", id);
  if (error) return { ok: false, error: "Gagal menghapus sesi." };
  return { ok: true, data: null };
}

export async function saveSessionItem(id: string, name: string): Promise<Result<null>> {
  const { error } = await supabaseAdmin()
    .from("invitations")
    .update({ session_item: name.trim().slice(0, 120) || null })
    .eq("id", id);
  if (error) return { ok: false, error: "Gagal menyimpan." };
  return { ok: true, data: null };
}

// Mematikan selalu boleh, supaya undangan yang add-on-nya dilepas tidak terkunci selamanya.
export async function switchPrivate(slug: string, on: boolean): Promise<Result<null>> {
  const info = await invitationRules(slug);
  if (!info) return { ok: false, error: "Undangan tidak ditemukan." };
  if (on && isDemo(slug, info.theme)) return { ok: false, error: "Undangan contoh tidak bisa dibuat private." };
  if (on && info.rules.locked.tamu_terundang) return { ok: false, error: "Mode private belum termasuk paket undangan ini." };
  const { error } = await supabaseAdmin().from("invitations").update({ private: on }).eq("slug", slug);
  if (error) return { ok: false, error: "Gagal menyimpan." };
  updateTag(invitationTag(slug));
  return { ok: true, data: null };
}
