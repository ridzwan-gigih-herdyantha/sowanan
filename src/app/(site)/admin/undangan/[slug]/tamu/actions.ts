"use server";

import { currentAdmin } from "@/lib/admin-auth";
import { checkInManual, newCheckinToken, setCheckedIn } from "@/lib/checkin";
import * as guestList from "@/lib/guest-list";
import { GUEST_COLS, normalizePhone, type GuestSession } from "@/lib/guests";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type Guest = {
  id: number;
  name: string;
  phone: string | null;
  sent_at: string | null;
  qr_token?: string | null;
  checked_in_at?: string | null;
  // Tercatat lewat QR mempelai di lokasi tapi tidak ada di daftar tamu.
  walk_in?: boolean;
  // Kosong berarti semua sesi.
  session_id?: number | null;
};
type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const SESSION_ENDED = "Sesi berakhir. Silakan masuk lagi.";

async function invitationId(slug: string): Promise<string | null> {
  if (!(await currentAdmin())) return null;
  const { data } = await supabaseAdmin().from("invitations").select("id").eq("slug", slug).maybeSingle();
  return data?.id ?? null;
}

export async function addGuests(slug: string, input: unknown): Promise<Result<{ added: Guest[]; skipped: number }>> {
  const id = await invitationId(slug);
  if (!id) return { ok: false, error: SESSION_ENDED };
  return guestList.insertGuests(id, input);
}

export async function updateGuest(slug: string, guestId: number, name: string, phone: string): Promise<Result<Guest>> {
  const id = await invitationId(slug);
  if (!id) return { ok: false, error: SESSION_ENDED };
  const clean = name.replace(/\s+/g, " ").trim().slice(0, 80);
  if (!clean) return { ok: false, error: "Nama wajib diisi." };
  const normalized = phone.trim() ? normalizePhone(phone) : null;
  if (phone.trim() && !normalized) return { ok: false, error: "Nomor WhatsApp tidak valid." };
  const { error } = await supabaseAdmin().from("guests").update({ name: clean, phone: normalized }).eq("id", guestId).eq("invitation_id", id);
  if (error) return { ok: false, error: "Gagal menyimpan." };
  const { data } = await supabaseAdmin().from("guests").select(GUEST_COLS).eq("id", guestId).eq("invitation_id", id).maybeSingle();
  if (!data) return { ok: false, error: "Gagal memuat ulang tamu." };
  return { ok: true, data: data as unknown as Guest };
}

export async function deleteGuests(slug: string, ids: number[] | "all"): Promise<Result<null>> {
  const id = await invitationId(slug);
  if (!id) return { ok: false, error: SESSION_ENDED };
  return guestList.removeGuests(id, ids);
}

export async function setPrivateMode(slug: string, on: boolean): Promise<Result<null>> {
  if (!(await currentAdmin())) return { ok: false, error: SESSION_ENDED };
  return guestList.switchPrivate(slug, on);
}

export async function setGuestSession(slug: string, guestId: number, sessionId: number | null): Promise<Result<number | null>> {
  const id = await invitationId(slug);
  if (!id) return { ok: false, error: SESSION_ENDED };
  return guestList.assignSession(id, guestId, sessionId);
}

export async function createSession(slug: string, input: unknown): Promise<Result<GuestSession>> {
  const id = await invitationId(slug);
  if (!id) return { ok: false, error: SESSION_ENDED };
  return guestList.addSession(id, input);
}

export async function editSession(slug: string, sessionId: number, input: unknown): Promise<Result<GuestSession>> {
  const id = await invitationId(slug);
  if (!id) return { ok: false, error: SESSION_ENDED };
  return guestList.updateSession(id, sessionId, input);
}

export async function deleteSession(slug: string, sessionId: number): Promise<Result<null>> {
  const id = await invitationId(slug);
  if (!id) return { ok: false, error: SESSION_ENDED };
  return guestList.removeSession(id, sessionId);
}

export async function setSessionItem(slug: string, name: string): Promise<Result<null>> {
  const id = await invitationId(slug);
  if (!id) return { ok: false, error: SESSION_ENDED };
  return guestList.saveSessionItem(id, name);
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

export async function setGuestCheckin(slug: string, guestId: number, present: boolean): Promise<Result<string | null>> {
  const id = await invitationId(slug);
  if (!id) return { ok: false, error: SESSION_ENDED };
  const guest = await setCheckedIn(id, guestId, present);
  if (!guest) return { ok: false, error: "Gagal menyimpan." };
  return { ok: true, data: guest.checked_in_at };
}

// Nama yang tidak ada di daftar tamu dicatat sebagai datang langsung oleh penerima tamu.
export async function addWalkIn(slug: string, name: string): Promise<Result<Guest>> {
  const id = await invitationId(slug);
  if (!id) return { ok: false, error: SESSION_ENDED };
  const guest = await checkInManual(id, name);
  if (!guest) return { ok: false, error: "Gagal mencatat. Coba lagi." };
  return { ok: true, data: guest as Guest };
}

// Buka absensi sekarang walaupun belum jadwalnya, atau kembalikan ke jadwal acara.
export async function openCheckinNow(slug: string, open: boolean): Promise<Result<null>> {
  if (!(await currentAdmin())) return { ok: false, error: SESSION_ENDED };
  const { error } = await supabaseAdmin()
    .from("invitations")
    .update({ checkin_opened_at: open ? new Date().toISOString() : null })
    .eq("slug", slug);
  if (error) return { ok: false, error: "Gagal menyimpan." };
  return { ok: true, data: null };
}

// Link di QR kehadiran milik mempelai. Dibuat saat pertama diminta, atau diganti kalau QR lama bocor.
export async function checkinLink(slug: string, regenerate = false): Promise<Result<string>> {
  if (!(await currentAdmin())) return { ok: false, error: SESSION_ENDED };
  const sb = supabaseAdmin();
  const { data: row, error } = await sb.from("invitations").select("checkin_token").eq("slug", slug).maybeSingle();
  if (error) return { ok: false, error: "Gagal memuat QR kehadiran." };
  if (row?.checkin_token && !regenerate) return { ok: true, data: row.checkin_token };
  const token = newCheckinToken();
  const { error: e } = await sb.from("invitations").update({ checkin_token: token }).eq("slug", slug);
  if (e) return { ok: false, error: "Gagal membuat QR kehadiran." };
  return { ok: true, data: token };
}
