"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/admin-auth";
import { INVITATIONS_TAG, invitationTag } from "@/lib/invitation/load";
import { packageIssues } from "@/lib/invitation/package-check";
import { invitationRules } from "@/lib/invitation/rules";
import { emptyInvitationData, invitationDataSchema, type InvitationData } from "@/lib/invitation/schema";
import { checkInvitation, type Issue } from "@/lib/invitation/spec";
import { getSettings, PACKAGE_IDS, PACKAGE_NAMES, themeAvailable, type PackageId, type Purchased, type Settings } from "@/lib/settings";
import { validateSlug } from "@/lib/reserved-slugs";
import { supabaseAdmin } from "@/lib/supabase/admin";
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
  const themeIssue = themeError(await getSettings(), theme, pkg as PackageId);
  if (themeIssue) return { error: themeIssue, slug };

  const sb = supabaseAdmin();
  const { data: taken } = await sb.from("invitations").select("id").eq("slug", slug).maybeSingle();
  if (taken) return { error: `Link sowanan.com/${slug} sudah dipakai.`, slug };

  const empty = emptyInvitationData();
  const { error } = await sb.from("invitations").insert({ slug, theme, package: pkg, published: false, data: empty, draft: empty });
  if (error) return { error: "Gagal membuat undangan.", slug };
  refresh(slug);
  redirect(`/admin/undangan/${slug}`);
}

export async function saveDraft(slug: string, draft: unknown): Promise<Result> {
  if (!(await currentAdmin())) return { ok: false, error: SESSION_ENDED };
  const parsed = invitationDataSchema.safeParse(draft);
  if (!parsed.success) return { ok: false, error: "Format draf tidak valid." };
  const { error } = await supabaseAdmin().from("invitations").update({ draft: parsed.data }).eq("slug", slug);
  if (error) return { ok: false, error: "Draf gagal tersimpan." };
  return { ok: true, at: new Date().toISOString() };
}

export async function publishDraft(slug: string, draft: unknown): Promise<Result> {
  if (!(await currentAdmin())) return { ok: false, error: SESSION_ENDED };
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
  if (error) return { ok: false, error: "Gagal mengubah status pembayaran. Pastikan migrasi 0005 sudah dijalankan." };
  refresh(slug);
  return { ok: true, at: new Date().toISOString() };
}

export async function setPackage(slug: string, pkg: string): Promise<Result> {
  if (!(await currentAdmin())) return { ok: false, error: SESSION_ENDED };
  if (!(PACKAGE_IDS as readonly string[]).includes(pkg)) return { ok: false, error: "Pilih paket." };
  const theme = await themeOf(slug);
  if (!theme) return { ok: false, error: "Undangan tidak ditemukan." };
  const themeIssue = themeError(await getSettings(), theme, pkg as PackageId);
  if (themeIssue) return { ok: false, error: themeIssue };
  const { error } = await supabaseAdmin().from("invitations").update({ package: pkg }).eq("slug", slug);
  if (error) return { ok: false, error: "Gagal menyimpan paket. Pastikan migrasi 0006 sudah dijalankan." };
  return { ok: true, at: new Date().toISOString() };
}

// Add-on yang sudah dibayar. Hanya id add-on di pengaturan yang disimpan, jumlahnya 0 sampai 20 unit.
export async function setAddons(slug: string, addons: Purchased): Promise<Result> {
  if (!(await currentAdmin())) return { ok: false, error: SESSION_ENDED };
  const known = new Set((await getSettings()).addons.map((a) => a.id));
  const clean: Purchased = {};
  for (const [id, n] of Object.entries(addons ?? {})) {
    const units = Math.floor(Number(n));
    if (known.has(id) && units > 0) clean[id] = Math.min(units, 20);
  }
  const { error } = await supabaseAdmin().from("invitations").update({ addons: clean }).eq("slug", slug);
  if (error) return { ok: false, error: "Gagal menyimpan add-on. Pastikan migrasi 0007 sudah dijalankan." };
  return { ok: true, at: new Date().toISOString() };
}
