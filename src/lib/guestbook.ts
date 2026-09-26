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
  const { data, error } = await supabaseAdmin()
    .from("wishes")
    .select("id, name, message")
    .eq("invitation_id", id)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) {
    cacheLife("minutes");
    return [];
  }
  cacheLife("max");
  return data.map((w) => ({ ...w, id: String(w.id) }));
}
