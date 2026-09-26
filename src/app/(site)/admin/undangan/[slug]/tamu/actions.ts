"use server";

import { z } from "zod";
import { currentAdmin } from "@/lib/admin-auth";
import { MAX_GUESTS, normalizePhone } from "@/lib/guests";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type Guest = { id: number; name: string; phone: string | null; sent_at: string | null };
type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const SESSION_ENDED = "Sesi berakhir. Silakan masuk lagi.";

async function invitationId(slug: string): Promise<string | null> {
  if (!(await currentAdmin())) return null;
  const { data } = await supabaseAdmin().from("invitations").select("id").eq("slug", slug).maybeSingle();
  return data?.id ?? null;
}

const guestsInput = z
  .array(z.object({ name: z.string().trim().min(1).max(80), phone: z.string().nullable() }))
  .min(1, "Belum ada nama.")
  .max(1000, "Maksimal 1000 tamu sekali tambah.");

export async function addGuests(slug: string, input: unknown): Promise<Result<{ added: Guest[]; skipped: number }>> {
  const id = await invitationId(slug);
  if (!id) return { ok: false, error: SESSION_ENDED };
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
  const { data, error } = await sb.from("guests").insert(rows).select("id, name, phone, sent_at");
  if (error) return { ok: false, error: "Gagal menyimpan daftar tamu." };
  return { ok: true, data: { added: data, skipped: parsed.data.length - fresh.length } };
}

export async function updateGuest(slug: string, guestId: number, name: string, phone: string): Promise<Result<Guest>> {
  const id = await invitationId(slug);
  if (!id) return { ok: false, error: SESSION_ENDED };
  const clean = name.replace(/\s+/g, " ").trim().slice(0, 80);
  if (!clean) return { ok: false, error: "Nama wajib diisi." };
  const normalized = phone.trim() ? normalizePhone(phone) : null;
  if (phone.trim() && !normalized) return { ok: false, error: "Nomor WhatsApp tidak valid." };
  const { data, error } = await supabaseAdmin()
    .from("guests")
    .update({ name: clean, phone: normalized })
    .eq("id", guestId)
    .eq("invitation_id", id)
    .select("id, name, phone, sent_at")
    .single();
  if (error) return { ok: false, error: "Gagal menyimpan." };
  return { ok: true, data };
}

export async function deleteGuests(slug: string, ids: number[] | "all"): Promise<Result<null>> {
  const id = await invitationId(slug);
  if (!id) return { ok: false, error: SESSION_ENDED };
  let q = supabaseAdmin().from("guests").delete().eq("invitation_id", id);
  if (ids !== "all") q = q.in("id", ids.slice(0, 1000));
  const { error } = await q;
  if (error) return { ok: false, error: "Gagal menghapus." };
  return { ok: true, data: null };
}

export async function markSent(slug: string, guestId: number, sent: boolean): Promise<Result<string | null>> {
  const id = await invitationId(slug);
  if (!id) return { ok: false, error: SESSION_ENDED };
  const at = sent ? new Date().toISOString() : null;
  const { error } = await supabaseAdmin().from("guests").update({ sent_at: at }).eq("id", guestId).eq("invitation_id", id);
  if (error) return { ok: false, error: "Gagal menandai." };
  return { ok: true, data: at };
}

export async function saveGuestMessage(slug: string, text: string): Promise<Result<null>> {
  if (!(await currentAdmin())) return { ok: false, error: SESSION_ENDED };
  const { error } = await supabaseAdmin()
    .from("invitations")
    .update({ guest_message: text.trim().slice(0, 2000) || null })
    .eq("slug", slug);
  if (error) return { ok: false, error: "Gagal menyimpan template." };
  return { ok: true, data: null };
}
