import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";
import { invitationDataSchema, type InvitationData } from "./schema";

export type InvitationRecord = { id: string | null; slug: string; theme: string; published: boolean; data: InvitationData };

export const invitationTag = (slug: string) => `invitation-${slug}`;
export const INVITATIONS_TAG = "invitations";

const SEED_DIR = path.join(process.cwd(), "supabase", "seed", "invitations");

async function fromSeed(slug: string): Promise<InvitationRecord | null> {
  try {
    const raw = JSON.parse(await readFile(path.join(SEED_DIR, `${slug}.json`), "utf-8"));
    return { id: null, slug, theme: raw.theme, published: raw.published, data: invitationDataSchema.parse(raw.data) };
  } catch {
    return null;
  }
}

export async function getInvitation(slug: string): Promise<InvitationRecord | null> {
  "use cache";
  cacheTag(invitationTag(slug));

  if (!hasSupabase()) {
    cacheLife("max");
    return fromSeed(slug);
  }

  const { data, error } = await supabaseAdmin().from("invitations").select("id, slug, theme, published, data").eq("slug", slug).maybeSingle();
  if (error || !data) {
    cacheLife("minutes");
    return null;
  }

  const parsed = invitationDataSchema.safeParse(data.data);
  if (!parsed.success) {
    console.error(`Data undangan "${slug}" tidak valid:`, parsed.error.issues.slice(0, 3));
    cacheLife("minutes");
    return null;
  }

  cacheLife("max");
  return { id: data.id, slug: data.slug, theme: data.theme, published: data.published, data: parsed.data };
}

export async function listPublishedSlugs(): Promise<string[]> {
  "use cache";
  cacheTag(INVITATIONS_TAG);

  if (!hasSupabase()) {
    cacheLife("max");
    const files = await readdir(SEED_DIR).catch(() => []);
    return files.filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
  }

  const { data, error } = await supabaseAdmin().from("invitations").select("slug").eq("published", true);
  if (error) {
    cacheLife("minutes");
    return [];
  }
  cacheLife("hours");
  return data.map((r) => r.slug);
}
