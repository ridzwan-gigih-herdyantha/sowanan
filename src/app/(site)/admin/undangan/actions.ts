"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/admin-auth";
import { INVITATIONS_TAG, invitationTag } from "@/lib/invitation/load";
import { packageIssues } from "@/lib/invitation/package-check";
import { archiveInfo, editLocked, isDemo } from "@/lib/invitation/archive";
import { invitationRules } from "@/lib/invitation/rules";
import { emptyInvitationData, invitationDataSchema, type InvitationData } from "@/lib/invitation/schema";
import { checkInvitation, type Issue } from "@/lib/invitation/spec";
import { getSettingsFresh, PACKAGE_IDS, PACKAGE_NAMES, packageRules, themeAvailable, type PackageId, type Purchased, type Settings } from "@/lib/settings";
import { validateSlug } from "@/lib/reserved-slugs";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { BUCKET } from "@/lib/storage/media";
import { wishesTag } from "@/lib/guestbook";
import { THEME_NAMES } from "@/themes/media";

type Result = { ok: true; at: string } | { ok: false; error: string; issues?: Issue[] };

const SESSION_ENDED = "Sesi berakhir. Silakan masuk lagi.";

function refresh(slug: string) {
  updateTag(invitationTag(slug));
  updateTag(INVITATIONS_TAG);
}

async function themeOf(slug: string): Promise<string | null> {
  const { data } = await supabaseAdmin().from("invitations").select("theme").eq("slug", slug).maybeSingle();
  return data?.theme ?? null;
}

// Undangan beku tidak bisa diubah kecuali admin membukanya sementara.
async function frozen(slug: string): Promise<boolean> {
  const { data } = await supabaseAdmin().from("invitations").select("slug, theme, data, unlocked_until").eq("slug", slug).maybeSingle();
  if (!data) return false;
  const parsed = invitationDataSchema.safeParse(data.data);
  if (!parsed.success) return false;
  return editLocked(archiveInfo(parsed.data, Date.now(), isDemo(data.slug, data.theme)), data.unlocked_until);
}

const FROZEN = "Undangan ini sudah menjadi arsip dan tidak bisa diubah. Buka kunci sementara kalau perlu koreksi.";

async function issuesFor(data: InvitationData, slug: string, theme: string): Promise<Issue[]> {
  const info = await invitationRules(slug);
  return [...checkInvitation(data, theme), ...(info ? packageIssues(data, theme, info.rules) : [])];
}

// Tema hanya boleh dipakai paket yang tercantum di kolom Tersedia di paket, selama baris jumlah_tema ada di isi paket.
function themeError(s: Settings, theme: string, pkg: PackageId): string | null {
  const entry = s.themes.find((t) => t.slug === theme);
  if (!entry || themeAvailable(s, entry.tier, pkg)) return null;
  return `Tema ${entry.name} tidak tersedia di paket ${PACKAGE_NAMES[pkg]}.`;
}

export type CreateState = { error?: string; slug?: string };

export async function createInvitation(_: CreateState, form: FormData): Promise<CreateState> {
  if (!(await currentAdmin())) return { error: SESSION_ENDED };
  const slug = String(form.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const theme = String(form.get("theme") ?? "");
  const pkg = String(form.get("package") ?? "");
  const check = validateSlug(slug);
  if (!check.ok) return { error: check.reason, slug };
  if (!(PACKAGE_IDS as readonly string[]).includes(pkg)) return { error: "Pilih paket.", slug };
  if (!THEME_NAMES[theme]) return { error: "Pilih tema.", slug };
  const settings = await getSettingsFresh();
  const themeIssue = themeError(settings, theme, pkg as PackageId);
  if (themeIssue) return { error: themeIssue, slug };

  const sb = supabaseAdmin();
  const { data: taken } = await sb.from("invitations").select("id").eq("slug", slug).maybeSingle();
  if (taken) return { error: `Link sowanan.com/${slug} sudah dipakai.`, slug };

  // Bagian yang tidak termasuk paket dibuat dalam keadaan mati.
  const empty = emptyInvitationData();
  if (packageRules(settings, pkg).locked.cerita) empty.sections.story.enabled = false;
  const { error } = await sb.from("invitations").insert({ slug, theme, package: pkg, published: false, data: empty, draft: empty });
  if (error) return { error: "Gagal membuat undangan.", slug };
  refresh(slug);
  redirect(`/admin/undangan/${slug}`);
}

export async function saveDraft(slug: string, draft: unknown): Promise<Result> {
  if (!(await currentAdmin())) return { ok: false, error: SESSION_ENDED };
  if (await frozen(slug)) return { ok: false, error: FROZEN };
  const parsed = invitationDataSchema.safeParse(draft);
  if (!parsed.success) return { ok: false, error: "Format draf tidak valid." };
  const { error } = await supabaseAdmin().from("invitations").update({ draft: parsed.data }).eq("slug", slug);
  if (error) return { ok: false, error: "Draf gagal tersimpan." };
  return { ok: true, at: new Date().toISOString() };
}

export async function publishDraft(slug: string, draft: unknown): Promise<Result> {
  if (!(await currentAdmin())) return { ok: false, error: SESSION_ENDED };
  if (await frozen(slug)) return { ok: false, error: FROZEN };
  const theme = await themeOf(slug);
  if (!theme) return { ok: false, error: "Undangan tidak ditemukan." };
  const parsed = invitationDataSchema.safeParse(draft);
  if (!parsed.success) return { ok: false, error: "Format draf tidak valid." };

  const issues = await issuesFor(parsed.data, slug, theme);
  if (issues.length) return { ok: false, error: `${issues.length} isian perlu dilengkapi.`, issues };

  const { error } = await supabaseAdmin().from("invitations").update({ data: parsed.data, draft: parsed.data }).eq("slug", slug);
  if (error) return { ok: false, error: "Gagal menyimpan." };
  refresh(slug);
  return { ok: true, at: new Date().toISOString() };
}

export async function setPublished(slug: string, published: boolean): Promise<Result> {
  if (!(await currentAdmin())) return { ok: false, error: SESSION_ENDED };
  const sb = supabaseAdmin();
  const { data: row } = await sb.from("invitations").select("theme, data").eq("slug", slug).maybeSingle();
  if (!row) return { ok: false, error: "Undangan tidak ditemukan." };

  if (published) {
    const parsed = invitationDataSchema.safeParse(row.data);
    const issues = parsed.success ? await issuesFor(parsed.data, slug, row.theme) : [];
    if (!parsed.success || issues.length) return { ok: false, error: "Simpan versi lengkap dulu sebelum ditayangkan.", issues };
  }

  const { error } = await sb.from("invitations").update({ published }).eq("slug", slug);
  if (error) return { ok: false, error: "Gagal mengubah status." };
  refresh(slug);
  return { ok: true, at: new Date().toISOString() };
}

export async function setPaymentStatus(slug: string, paid: boolean): Promise<Result> {
  if (!(await currentAdmin())) return { ok: false, error: SESSION_ENDED };
  const { error } = await supabaseAdmin()
    .from("invitations")
    .update({ payment_status: paid ? "lunas" : "belum_lunas" })
    .eq("slug", slug);
  if (error) return { ok: false, error: "Gagal mengubah status pembayaran." };
  refresh(slug);
  return { ok: true, at: new Date().toISOString() };
}

export async function setPackage(slug: string, pkg: string): Promise<Result> {
  if (!(await currentAdmin())) return { ok: false, error: SESSION_ENDED };
  if (!(PACKAGE_IDS as readonly string[]).includes(pkg)) return { ok: false, error: "Pilih paket." };
  const theme = await themeOf(slug);
  if (!theme) return { ok: false, error: "Undangan tidak ditemukan." };
  const themeIssue = themeError(await getSettingsFresh(), theme, pkg as PackageId);
  if (themeIssue) return { ok: false, error: themeIssue };
  const { error } = await supabaseAdmin().from("invitations").update({ package: pkg }).eq("slug", slug);
  if (error) return { ok: false, error: "Gagal menyimpan paket." };
  // Halaman publik membaca paket untuk nama tamu dan batas bagian tambahan.
  refresh(slug);
  return { ok: true, at: new Date().toISOString() };
}

// Add-on yang sudah dibayar. Hanya id add-on di pengaturan yang disimpan, jumlahnya 0 sampai 20 unit.
export async function setAddons(slug: string, addons: Purchased): Promise<Result> {
  if (!(await currentAdmin())) return { ok: false, error: SESSION_ENDED };
  const known = new Set((await getSettingsFresh()).addons.map((a) => a.id));
  const clean: Purchased = {};
  for (const [id, n] of Object.entries(addons ?? {})) {
    const units = Math.floor(Number(n));
    if (known.has(id) && units > 0) clean[id] = Math.min(units, 20);
  }
  const { error } = await supabaseAdmin().from("invitations").update({ addons: clean }).eq("slug", slug);
  if (error) return { ok: false, error: "Gagal menyimpan add-on." };
  refresh(slug);
  return { ok: true, at: new Date().toISOString() };
}

// Buka editor undangan beku selama 24 jam untuk koreksi, misalnya tanggal acara yang salah ketik.
export async function unlockArchive(slug: string): Promise<Result> {
  if (!(await currentAdmin())) return { ok: false, error: SESSION_ENDED };
  const until = new Date(Date.now() + 86_400_000).toISOString();
  const { error } = await supabaseAdmin().from("invitations").update({ unlocked_until: until }).eq("slug", slug);
  if (error) return { ok: false, error: "Gagal membuka kunci." };
  return { ok: true, at: until };
}

// Catat bahwa klien sudah diberi tahu undangannya akan diarsipkan.
export async function markArchiveNotified(slug: string, notified: boolean): Promise<Result> {
  if (!(await currentAdmin())) return { ok: false, error: SESSION_ENDED };
  const at = notified ? new Date().toISOString() : null;
  const { error } = await supabaseAdmin().from("invitations").update({ archive_notified_at: at }).eq("slug", slug);
  if (error) return { ok: false, error: "Gagal menyimpan." };
  return { ok: true, at: at ?? "" };
}

type DeleteSummary = { couple: string; rsvps: number; wishes: number; guests: number; files: number };

async function storageFiles(slug: string): Promise<string[]> {
  const out: string[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabaseAdmin().storage.from(BUCKET).list(slug, { limit: 1000, offset });
    if (error || !data?.length) break;
    out.push(...data.filter((f) => f.id).map((f) => `${slug}/${f.name}`));
    if (data.length < 1000) break;
  }
  return out;
}

// Yang ikut terhapus, ditampilkan di dialog konfirmasi sebelum admin menghapus.
export async function deleteSummary(slug: string): Promise<{ ok: true; data: DeleteSummary } | { ok: false; error: string }> {
  if (!(await currentAdmin())) return { ok: false, error: SESSION_ENDED };
  const sb = supabaseAdmin();
  const { data: row } = await sb.from("invitations").select("id, theme, data, draft").eq("slug", slug).maybeSingle();
  if (!row) return { ok: false, error: "Undangan tidak ditemukan." };
  if (isDemo(slug, row.theme)) return { ok: false, error: "Undangan contoh dipakai di homepage dan tidak bisa dihapus." };
  const count = async (table: string) => (await sb.from(table).select("id", { count: "exact", head: true }).eq("invitation_id", row.id)).count ?? 0;
  const [rsvps, wishes, guests, files] = await Promise.all([count("rsvps"), count("wishes"), count("guests"), storageFiles(slug)]);
  const parsed = invitationDataSchema.safeParse(row.draft ?? row.data);
  const couple = parsed.success ? [parsed.data.couple.groom.name, parsed.data.couple.bride.name].filter(Boolean).join(" & ") : "";
  return { ok: true, data: { couple, rsvps, wishes, guests, files: files.length } };
}

// Hapus permanen. RSVP, ucapan, dan daftar tamu ikut terhapus lewat foreign key, berkas di storage dihapus di sini.
export async function deleteInvitation(slug: string, confirmSlug: string): Promise<{ ok: true; warning?: string } | { ok: false; error: string }> {
  if (!(await currentAdmin())) return { ok: false, error: SESSION_ENDED };
  if (confirmSlug.trim() !== slug) return { ok: false, error: "Ketik slug undangan dengan tepat untuk menghapus." };
  const sb = supabaseAdmin();
  const { data: row } = await sb.from("invitations").select("theme").eq("slug", slug).maybeSingle();
  if (!row) return { ok: false, error: "Undangan tidak ditemukan." };
  if (isDemo(slug, row.theme)) return { ok: false, error: "Undangan contoh dipakai di homepage dan tidak bisa dihapus." };

  // Baris dihapus dulu. Kalau storage gagal, yang tersisa hanya berkas yatim, bukan undangan tanpa foto.
  const { error } = await sb.from("invitations").delete().eq("slug", slug);
  if (error) return { ok: false, error: "Gagal menghapus undangan." };
  refresh(slug);
  updateTag(wishesTag(slug));

  const files = await storageFiles(slug);
  let failed = 0;
  for (let i = 0; i < files.length; i += 100) {
    const { error: e } = await sb.storage.from(BUCKET).remove(files.slice(i, i + 100));
    if (e) failed += files.slice(i, i + 100).length;
  }
  return failed ? { ok: true, warning: `Undangan terhapus, tapi ${failed} berkas di storage gagal dihapus. Hapus manual dari halaman Media.` } : { ok: true };
}
