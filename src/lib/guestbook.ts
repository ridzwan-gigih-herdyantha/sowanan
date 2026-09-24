import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";

export type Wish = { name: string; message: string };

export const wishesTag = (slug: string) => `wishes-${slug}`;

export async function getInvitationId(slug: string): Promise<string | null> {
  "use cache";
  cacheTag(`invitation-${slug}`);
  if (!hasSupabase()) {
    cacheLife("max");
    return null;
  }
  const { data, error } = await supabaseAdmin().from("invitations").select("id").eq("slug", slug).maybeSingle();
  if (error || !data) {
    cacheLife("minutes");
    return null;
  }
  cacheLife("max");
  return data.id;
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
    .select("name, message")
    .eq("invitation_id", id)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) {
    cacheLife("minutes");
    return [];
  }
  cacheLife("max");
  return data;
}
