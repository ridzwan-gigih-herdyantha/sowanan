import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getInvitation } from "@/lib/invitation/load";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type Wish = { id: string; name: string; message: string };

export const wishesTag = (slug: string) => `wishes-${slug}`;

export async function getInvitationId(slug: string): Promise<string | null> {
  return (await getInvitation(slug))?.id ?? null;
}

export async function getWishes(slug: string): Promise<Wish[]> {
  "use cache";
  cacheTag(wishesTag(slug));
  const id = await getInvitationId(slug);
  if (!id) {
    cacheLife("minutes");
    return [];
  }
  // Ucapan yang disembunyikan admin atau mempelai tidak tampil. Kalau kolomnya belum ada (migrasi 0011),
  // semua ucapan tetap tampil seperti sebelumnya.
  const query = () => supabaseAdmin().from("wishes").select("id, name, message").eq("invitation_id", id).order("created_at", { ascending: false }).limit(30);
  let { data, error } = await query().is("hidden_at", null);
  if (error && (error.code === "42703" || /hidden_at/.test(error.message))) ({ data, error } = await query());
  if (error || !data) {
    cacheLife("minutes");
    return [];
  }
  cacheLife("max");
  return data.map((w) => ({ ...w, id: String(w.id) }));
}
