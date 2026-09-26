"use server";

import { updateTag } from "next/cache";
import { currentAdmin } from "@/lib/admin-auth";
import { wishesTag } from "@/lib/guestbook";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Result = { ok: true } | { ok: false; error: string };

async function invitationId(slug: string): Promise<string | null> {
  if (!(await currentAdmin())) return null;
  const { data } = await supabaseAdmin().from("invitations").select("id").eq("slug", slug).maybeSingle();
  return data?.id ?? null;
}

export async function deleteResponse(slug: string, kind: "rsvp" | "wish", id: number): Promise<Result> {
  const invitation = await invitationId(slug);
  if (!invitation) return { ok: false, error: "Sesi berakhir. Silakan masuk lagi." };
  const { error } = await supabaseAdmin()
    .from(kind === "rsvp" ? "rsvps" : "wishes")
    .delete()
    .eq("id", id)
    .eq("invitation_id", invitation);
  if (error) return { ok: false, error: "Gagal menghapus." };
  if (kind === "wish") updateTag(wishesTag(slug));
  return { ok: true };
}
