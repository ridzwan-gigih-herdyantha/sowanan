import "server-only";
import { validGuestToken } from "@/lib/checkin";
import { SESSION_COLS, type GuestSession } from "@/lib/guests";
import { clientIp, countAttempts, pruneAttempts, recordAttempt } from "@/lib/login-attempts";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { withSessions, type InvitationView } from "./view";

// Undangan private hanya terbuka lewat kode tamu (guests.qr_token) atau kode mempelai (invitations.couple_code).
// Kode selalu diperiksa di server dan daftar tamu tidak pernah ikut ke browser. Tamu datang langsung tidak dihitung
// karena kodenya dibuat lewat QR absensi yang bisa dipakai siapa pun di lokasi.

export type Pass = { ok: true; code: string; name: string; sessionId: number | null } | { ok: false; limited: boolean };

const MINUTE = 60_000;
// Hanya kode salah yang dihitung. Longgar karena banyak tamu bisa memakai satu IP operator seluler yang sama.
const WRONG_CODE = { max: 20, window: 10 * MINUTE };
const scopeOf = (slug: string) => `undangan:${slug}`;

export async function codeLimited(slug: string): Promise<boolean> {
  return (await countAttempts(scopeOf(slug), WRONG_CODE.window, await clientIp())) >= WRONG_CODE.max;
}

export async function noteWrongCode(slug: string) {
  await recordAttempt(scopeOf(slug), await clientIp());
  await pruneAttempts(scopeOf(slug), 24 * 60 * MINUTE);
}

export async function checkPass(invitationId: string, slug: string, code: string): Promise<Pass> {
  if (!code) return { ok: false, limited: false };
  if (await codeLimited(slug)) return { ok: false, limited: true };
  if (validGuestToken(code)) {
    const sb = supabaseAdmin();
    const [guest, couple] = await Promise.all([
      sb.from("guests").select("name, session_id").eq("invitation_id", invitationId).eq("qr_token", code).eq("walk_in", false).maybeSingle(),
      sb.from("invitations").select("id").eq("id", invitationId).eq("couple_code", code).maybeSingle(),
    ]);
    if (guest.data) return { ok: true, code, name: guest.data.name, sessionId: guest.data.session_id ?? null };
    if (couple.data) return { ok: true, code, name: "", sessionId: null };
    // Gangguan database bukan salah kode, jadi tidak dihitung. Undangan tetap tertutup.
    if (guest.error || couple.error) return { ok: false, limited: false };
  }
  await noteWrongCode(slug);
  return { ok: false, limited: false };
}

// Isi undangan untuk pemilik kode: jam sesinya dan kode untuk link di kalender.
export async function guestView(view: InvitationView, invitationId: string, pass: Extract<Pass, { ok: true }>): Promise<InvitationView> {
  const sb = supabaseAdmin();
  const [sessions, row] = await Promise.all([
    sb.from("invitation_sessions").select(SESSION_COLS).eq("invitation_id", invitationId).order("time").order("id"),
    sb.from("invitations").select("session_item").eq("id", invitationId).maybeSingle(),
  ]);
  return { ...withSessions(view, (sessions.data ?? []) as GuestSession[], row.data?.session_item ?? null, pass.sessionId), accessCode: pass.code };
}
