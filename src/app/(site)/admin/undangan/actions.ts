"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/admin-auth";
import { INVITATIONS_TAG, invitationTag } from "@/lib/invitation/load";
import { emptyInvitationData, invitationDataSchema } from "@/lib/invitation/schema";
import { checkInvitation, type Issue } from "@/lib/invitation/spec";
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

export type CreateState = { error?: string; slug?: string };

export async function createInvitation(_: CreateState, form: FormData): Promise<CreateState> {
  if (!(await currentAdmin())) return { error: SESSION_ENDED };
  const slug = String(form.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const theme = String(form.get("theme") ?? "");
  const check = validateSlug(slug);
  if (!check.ok) return { error: check.reason, slug };
  if (!THEME_NAMES[theme]) return { error: "Pilih tema.", slug };

  const sb = supabaseAdmin();
  const { data: taken } = await sb.from("invitations").select("id").eq("slug", slug).maybeSingle();
  if (taken) return { error: `Link sowanan.com/${slug} sudah dipakai.`, slug };

  const empty = emptyInvitationData();
  const { error } = await sb.from("invitations").insert({ slug, theme, published: false, data: empty, draft: empty });
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

  const issues = checkInvitation(parsed.data, theme);
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
    const issues = parsed.success ? checkInvitation(parsed.data, row.theme) : [];
    if (!parsed.success || issues.length) return { ok: false, error: "Simpan versi lengkap dulu sebelum ditayangkan.", issues };
  }

  const { error } = await sb.from("invitations").update({ published }).eq("slug", slug);
  if (error) return { ok: false, error: "Gagal mengubah status." };
  refresh(slug);
  return { ok: true, at: new Date().toISOString() };
}
