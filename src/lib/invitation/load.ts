import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";
import { archiveInfo, isDemo } from "./archive";
import { invitationDataSchema, type InvitationData } from "./schema";

export type InvitationRecord = {
  id: string | null;
  slug: string;
  theme: string;
  published: boolean;
  paid: boolean;
  data: InvitationData;
  // Paket dan add-on yang dibayar. Undangan contoh tidak berpaket, jadi semua fitur aktif.
  pkg?: string | null;
  addons?: Record<string, number>;
  // Sudah dibekukan menjadi arsip permanen, 30 hari setelah acara.
  archived?: boolean;
};

export const invitationTag = (slug: string) => `invitation-${slug}`;
export const INVITATIONS_TAG = "invitations";

const SEED_DIR = path.join(process.cwd(), "supabase", "seed", "invitations");

async function fromSeed(slug: string): Promise<InvitationRecord | null> {
  try {
    const raw = JSON.parse(await readFile(path.join(SEED_DIR, `${slug}.json`), "utf-8"));
    return { id: null, slug, theme: raw.theme, published: raw.published, paid: true, data: invitationDataSchema.parse(raw.data) };
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

  const { data, error } = await supabaseAdmin().from("invitations").select("*").eq("slug", slug).maybeSingle();
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

  // Cache halaman kedaluwarsa sendiri saat undangan dibekukan, supaya tampilan arsip muncul tanpa perlu
  // disimpan ulang. Setelah beku isinya tidak berubah lagi, jadi boleh di-cache selamanya.
  const archive = archiveInfo(parsed.data, Date.now(), isDemo(data.slug, data.theme));
  const untilArchive = archive.archiveAt && !archive.archived ? Math.ceil((archive.archiveAt.getTime() - Date.now()) / 1000) : 0;
  if (untilArchive > 0) cacheLife({ stale: Math.min(300, untilArchive), revalidate: untilArchive, expire: untilArchive + 3600 });
  else cacheLife("max");

  return {
    id: data.id,
    slug: data.slug,
    theme: data.theme,
    published: data.published,
    paid: data.payment_status !== "belum_lunas",
    data: parsed.data,
    pkg: data.package ?? null,
    addons: data.addons ?? {},
    archived: archive.archived,
  };
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
