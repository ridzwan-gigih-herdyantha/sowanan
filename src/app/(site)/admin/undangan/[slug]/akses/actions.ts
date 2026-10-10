"use server";

import { currentAdmin } from "@/lib/admin-auth";
import { createCoupleAccount, deleteCoupleAccount, resetCouplePassword, type AccountResult } from "@/lib/couple-account";
import { isDemo } from "@/lib/invitation/archive";
import { supabaseAdmin } from "@/lib/supabase/admin";

const SESSION_ENDED = "Sesi berakhir. Silakan masuk lagi.";

// Undangan contoh tidak punya akun mempelai.
async function invitation(slug: string): Promise<{ id: string; slug: string } | null> {
  if (!(await currentAdmin())) return null;
  const { data } = await supabaseAdmin().from("invitations").select("id, slug, theme").eq("slug", slug).maybeSingle();
  if (!data || isDemo(data.slug, data.theme)) return null;
  return { id: data.id, slug: data.slug };
}

export async function createAccount(slug: string): Promise<AccountResult> {
  const inv = await invitation(slug);
  if (!inv) return { ok: false, error: SESSION_ENDED };
  return createCoupleAccount(inv.id, inv.slug);
}

export async function resetPassword(slug: string): Promise<AccountResult> {
  const inv = await invitation(slug);
  if (!inv) return { ok: false, error: SESSION_ENDED };
  return resetCouplePassword(inv.id);
}

export async function removeAccount(slug: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const inv = await invitation(slug);
  if (!inv) return { ok: false, error: SESSION_ENDED };
  return deleteCoupleAccount(inv.id);
}
