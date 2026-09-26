// pnpm seed-invitations [slug...]
// Validasi supabase/seed/invitations/*.json lalu upsert ke tabel invitations.
// Ucapan contoh di supabase/seed/wishes.json ditambahkan kalau belum ada.
import { readdirSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { invitationDataSchema } from "../src/lib/invitation/schema.ts";
import { validateSlug } from "../src/lib/reserved-slugs.ts";

const dir = new URL("../supabase/seed/", import.meta.url);
const only = process.argv.slice(2);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env");
  process.exit(1);
}
const sb = createClient(new URL(url).origin, key, { auth: { persistSession: false } });

const wishes: Record<string, { name: string; message: string }[]> = JSON.parse(readFileSync(new URL("wishes.json", dir), "utf-8"));
const files = readdirSync(new URL("invitations/", dir)).filter((f) => f.endsWith(".json"));
let failed = false;

for (const file of files) {
  const seed = JSON.parse(readFileSync(new URL(`invitations/${file}`, dir), "utf-8"));
  if (only.length && !only.includes(seed.slug)) continue;

  const slug = validateSlug(seed.slug);
  const data = invitationDataSchema.safeParse(seed.data);
  if (!slug.ok || !data.success) {
    failed = true;
    console.error(`x ${seed.slug}: ${slug.ok ? data.error?.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ") : slug.reason}`);
    continue;
  }

  const { data: row, error } = await sb
    .from("invitations")
    .upsert({ slug: seed.slug, theme: seed.theme, published: seed.published, data: data.data }, { onConflict: "slug" })
    .select("id")
    .single();
  if (error) {
    failed = true;
    console.error(`x ${seed.slug}: ${error.message}`);
    continue;
  }

  const { data: existing } = await sb.from("wishes").select("name, message").eq("invitation_id", row.id);
  const have = new Set((existing ?? []).map((w) => `${w.name}\n${w.message}`));
  const missing = (wishes[seed.slug] ?? []).filter((w) => !have.has(`${w.name}\n${w.message}`));
  if (missing.length) await sb.from("wishes").insert(missing.map((w) => ({ invitation_id: row.id, ...w })));

  console.log(`ok ${seed.slug} (tema ${seed.theme}, ${missing.length} ucapan contoh ditambahkan)`);
}

process.exit(failed ? 1 : 0);
