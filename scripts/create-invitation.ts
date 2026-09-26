// pnpm create-invitation <slug> <tema>
// Contoh: pnpm create-invitation budi-ani andi-rina
import { existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { emptyInvitationData } from "../src/lib/invitation/schema.ts";
import { validateSlug } from "../src/lib/reserved-slugs.ts";

const [slug = "", theme = "", flag] = process.argv.slice(2);

const check = validateSlug(slug);
if (!check.ok) {
  console.error(`Slug ditolak: ${check.reason}`);
  process.exit(1);
}
if (!existsSync(new URL(`../src/themes/${theme}/index.tsx`, import.meta.url))) {
  console.error(`Tema "${theme}" tidak ada di src/themes.`);
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env");
  process.exit(1);
}

const sb = createClient(new URL(url).origin, key, { auth: { persistSession: false } });
const { data: taken } = await sb.from("invitations").select("id").eq("slug", slug).maybeSingle();
if (taken) {
  console.error(`Slug "${slug}" sudah dipakai undangan lain.`);
  process.exit(1);
}

if (flag === "--publish") {
  console.error("Undangan baru masih kosong. Isi lewat /admin/undangan lalu terbitkan dari sana.");
  process.exit(1);
}
const { error } = await sb.from("invitations").insert({ slug, theme, published: false, data: emptyInvitationData() });
if (error) {
  console.error("Gagal menyimpan:", error.message);
  process.exit(1);
}
console.log(`Undangan dibuat: sowanan.com/${slug} (tema ${theme}, draf). Isi di /admin/undangan/${slug}`);
console.log("Ingat: slug permanen setelah link disebar ke tamu.");
