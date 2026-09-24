import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";

export type Wish = { name: string; message: string };

export const wishesTag = (slug: string) => `wishes-${slug}`;

export async function getInvitationId(slug: string): Promise<string | null> {
  "use cache";
  cacheTag(`invitation-${slug}`);
  cacheLife("max");
  if (!hasSupabase()) return null;
  const { data } = await supabaseAdmin().from("invitations").select("id").eq("slug", slug).maybeSingle();
  return data?.id ?? null;
}

export async function getWishes(slug: string): Promise<Wish[]> {
  "use cache";
  cacheTag(wishesTag(slug));
  cacheLife("max");
  const id = await getInvitationId(slug);
  if (!id) return [];
  const { data } = await supabaseAdmin()
    .from("wishes")
    .select("name, message")
    .eq("invitation_id", id)
    .order("created_at", { ascending: false })
    .limit(30);
  return data ?? [];
}
