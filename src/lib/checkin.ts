import "server-only";
import { randomBytes } from "node:crypto";
import { archiveInfo, isDemo } from "@/lib/invitation/archive";
import { invitationDataSchema, type InvitationData } from "@/lib/invitation/schema";
import { getSettingsFresh, packageRules, type Purchased } from "@/lib/settings";
import { supabaseAdmin } from "@/lib/supabase/admin";

// QR absensi milik mempelai. Satu QR per undangan dipasang di lokasi, berisi link /absen/<checkin_token>.
// Tamu memindainya dengan HP sendiri. Tamu yang pernah membuka link pribadinya (?k=) langsung dikenali,
// yang lain mengetik nama. Nama di luar daftar tamu dicatat sebagai datang langsung (walk_in).

export type CheckinResult =
  | { status: "ok" | "already"; name: string; at: string }
  | { status: "unknown" }
  | { status: "closed"; reason: string };

type InvitationRow = { id: string; slug: string; theme: string; data: unknown; package?: string | null; addons?: Purchased; checkin_opened_at?: string | null };

// Kolom checkin_opened_at (migrasi 0010) dan package, addons (0006, 0007) bisa belum ada, jadi dicoba bertahap.
const ROW_COLS = ["id, slug, theme, data, package, addons, checkin_opened_at", "id, slug, theme, data, package, addons", "id, slug, theme, data"];

const HOUR = 3_600_000;
// Absensi dibuka 3 jam sebelum acara sampai 3 jam setelah selesai, supaya foto QR yang tersebar tidak bisa dipakai dari rumah.
const OPEN_BEFORE = 3 * HOUR;
const CLOSE_AFTER = 3 * HOUR;

export const newCheckinToken = () => randomBytes(18).toString("base64url");
export const validGuestToken = (k: string) => /^[a-z0-9]{8,32}$/i.test(k);
const normalizeName = (s: string) => s.replace(/\s+/g, " ").trim();

// openedAt: admin menekan Buka sekarang. Absensi langsung terbuka, dan tutup sesuai jadwal atau 12 jam setelah dibuka, mana yang lebih lama.
export function checkinWindow(data: InvitationData, openedAt?: string | null): { from: Date; until: Date; manual: boolean } | null {
  const start = Date.parse(data.event.start);
  if (!Number.isFinite(start)) return null;
  const end = Date.parse(data.event.end);
  const from = start - OPEN_BEFORE;
  const until = (Number.isFinite(end) && end > start ? end : start + 12 * HOUR) + CLOSE_AFTER;
  const opened = openedAt ? Date.parse(openedAt) : NaN;
  if (Number.isFinite(opened) && opened < from) return { from: new Date(opened), until: new Date(Math.max(until, opened + 12 * HOUR)), manual: true };
  if (Number.isFinite(opened) && opened > until) return { from: new Date(opened), until: new Date(opened + 12 * HOUR), manual: true };
  return { from: new Date(from), until: new Date(until), manual: false };
}

const whenFmt = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
export const formatWhen = (d: Date) => `${whenFmt.format(d)} WIB`;

async function rulesLock(row: InvitationRow): Promise<string | null> {
  const rules = packageRules(await getSettingsFresh(), row.package ?? null, row.addons ?? {});
  return rules.locked.qr_absensi ?? rules.locked.nama_tamu ?? null;
}

async function bySlug(slug: string): Promise<InvitationRow | null> {
  for (const cols of ROW_COLS) {
    const { data, error } = await supabaseAdmin().from("invitations").select(cols).eq("slug", slug).maybeSingle();
    if (!error) return (data as unknown as InvitationRow) ?? null;
  }
  return null;
}

// Untuk halaman admin: apakah paket menyertakan QR absensi.
export async function qrEnabled(slug: string): Promise<{ enabled: boolean; reason?: string }> {
  const row = await bySlug(slug);
  if (!row) return { enabled: false };
  const lock = await rulesLock(row);
  return lock ? { enabled: false, reason: lock } : { enabled: true };
}

export type CheckinPage = { row: InvitationRow; couple: string; open: true } | { row: InvitationRow; couple: string; open: false; reason: string };

// Halaman yang terbuka setelah tamu memindai QR mempelai. Kode yang salah berarti halaman tidak ditemukan.
export async function checkinPage(token: string, now = Date.now()): Promise<CheckinPage | null> {
  if (!/^[A-Za-z0-9_-]{20,40}$/.test(token)) return null;
  let row: InvitationRow | null = null;
  for (const cols of ROW_COLS) {
    const res = await supabaseAdmin().from("invitations").select(cols).eq("checkin_token", token).maybeSingle();
    if (!res.error) {
      row = (res.data as unknown as InvitationRow) ?? null;
      break;
    }
  }
  if (!row) return null;
  const parsed = invitationDataSchema.safeParse(row.data);
  const couple = parsed.success ? [parsed.data.couple.groom.name, parsed.data.couple.bride.name].filter(Boolean).join(" & ") : row.slug;
  const closed = (reason: string): CheckinPage => ({ row: row!, couple, open: false, reason });

  const lock = await rulesLock(row);
  if (lock) return closed("Absensi untuk undangan ini belum tersedia.");
  if (!parsed.success) return closed("Data undangan belum lengkap.");
  const demo = isDemo(row.slug, row.theme);
  if (archiveInfo(parsed.data, now, demo).archived) return closed("Acara sudah lama selesai, absensi ditutup.");
  // Undangan contoh selalu terbuka untuk demo.
  const w = checkinWindow(parsed.data, row.checkin_opened_at);
  if (!demo && w) {
    if (now < w.from.getTime()) return closed(`Absensi dibuka mulai ${formatWhen(w.from)}.`);
    if (now > w.until.getTime()) return closed("Acara sudah selesai, absensi ditutup.");
  }
  return { row, couple, open: true };
}

const result = (status: "ok" | "already", g: { name: string; checked_in_at: string | null }): CheckinResult => ({ status, name: g.name, at: g.checked_in_at ?? new Date().toISOString() });

// Tamu yang dikenali dari kode link pribadinya.
export async function checkInByToken(invitationId: string, k: string): Promise<CheckinResult> {
  if (!validGuestToken(k)) return { status: "unknown" };
  const sb = supabaseAdmin();
  // Hanya mengisi yang masih kosong, jadi jam hadir pertama tidak tertimpa kalau tamu memindai dua kali.
  const { data: fresh } = await sb
    .from("guests")
    .update({ checked_in_at: new Date().toISOString() })
    .eq("invitation_id", invitationId)
    .eq("qr_token", k)
    .is("checked_in_at", null)
    .select("name, checked_in_at")
    .maybeSingle();
  if (fresh) return result("ok", fresh);
  const { data: known } = await sb.from("guests").select("name, checked_in_at").eq("invitation_id", invitationId).eq("qr_token", k).maybeSingle();
  return known ? result("already", known) : { status: "unknown" };
}

// Tamu yang mengetik nama. Nama yang sama persis dengan daftar tamu dicatat sebagai tamu itu, sisanya datang langsung.
export async function checkInByName(invitationId: string, raw: string): Promise<CheckinResult & { k?: string }> {
  const name = normalizeName(raw).slice(0, 80);
  if (name.length < 2) return { status: "unknown" };
  const sb = supabaseAdmin();
  const { data: matches } = await sb.from("guests").select("id, name, qr_token, checked_in_at").eq("invitation_id", invitationId).ilike("name", name.replace(/[%_\\]/g, "\\$&")).limit(2);
  const guest = matches?.length === 1 ? matches[0] : null;
  if (guest) {
    if (guest.checked_in_at) return { ...result("already", guest), k: guest.qr_token ?? undefined };
    const { data } = await sb.from("guests").update({ checked_in_at: new Date().toISOString() }).eq("id", guest.id).is("checked_in_at", null).select("name, checked_in_at").maybeSingle();
    return { ...result(data ? "ok" : "already", data ?? guest), k: guest.qr_token ?? undefined };
  }
  const { data: walkIn, error } = await sb
    .from("guests")
    .insert({ invitation_id: invitationId, name, checked_in_at: new Date().toISOString(), walk_in: true })
    .select("name, checked_in_at, qr_token")
    .single();
  if (error || !walkIn) return { status: "closed", reason: "Gagal mencatat. Coba lagi sebentar." };
  return { ...result("ok", walkIn), k: walkIn.qr_token ?? undefined };
}

export async function setCheckedIn(invitationId: string, guestId: number, present: boolean): Promise<{ checked_in_at: string | null } | null> {
  const { data } = await supabaseAdmin()
    .from("guests")
    .update({ checked_in_at: present ? new Date().toISOString() : null })
    .eq("invitation_id", invitationId)
    .eq("id", guestId)
    .select("checked_in_at")
    .maybeSingle();
  return data ?? null;
}

export type CheckinSchedule = { from: string; until: string; state: "before" | "open" | "after"; manual: boolean; canOpen: boolean };

// Untuk panel admin: jam buka dan tutup absensi, statusnya sekarang, dan apakah tombol Buka sekarang bisa dipakai.
export async function windowForSlug(slug: string, now = Date.now()): Promise<CheckinSchedule | null> {
  const row = await bySlug(slug);
  const parsed = row && invitationDataSchema.safeParse(row.data);
  if (!row || !parsed?.success || isDemo(row.slug, row.theme)) return null;
  const w = checkinWindow(parsed.data, row.checkin_opened_at);
  if (!w) return null;
  const state = now < w.from.getTime() ? "before" : now > w.until.getTime() ? "after" : "open";
  return { from: formatWhen(w.from), until: formatWhen(w.until), state, manual: w.manual, canOpen: "checkin_opened_at" in row };
}
