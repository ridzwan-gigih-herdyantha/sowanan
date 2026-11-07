// pnpm seed-testimonials
// Validasi supabase/seed/testimonials.json lalu tambahkan ke settings.data.testimonials.items.
// Testimoni dicocokkan per id: yang sudah ada dibiarkan, jadi aman dijalankan berulang dan isian admin tidak tertimpa.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Batasnya sama dengan testimonials di src/lib/settings/schema.ts.
const MAX_ITEMS = 30;
const seedSchema = z.array(
  z.object({
    id: z.string().min(1).max(40),
    on: z.boolean(),
    name: z.string().trim().min(1).max(60),
    rating: z.number().int().min(1).max(5),
    text: z.string().trim().min(1).max(600),
    photo: z.string().trim().max(300),
  }),
);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env");
  process.exit(1);
}
const sb = createClient(new URL(url).origin, key, { auth: { persistSession: false } });

const seed = seedSchema.safeParse(JSON.parse(readFileSync(new URL("../supabase/seed/testimonials.json", import.meta.url), "utf-8")));
if (!seed.success) {
  console.error(`x testimonials.json: ${seed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
  process.exit(1);
}

console.log(`Database: ${new URL(url).host}`);
const { data: row, error: readError } = await sb.from("settings").select("data").eq("id", 1).maybeSingle();
if (readError) {
  console.error(`x Gagal membaca pengaturan: ${readError.message}`);
  process.exit(1);
}

// Tanpa baris pengaturan, bagian lain memakai nilai bawaan aplikasi. Versi lama akan dibaca ulang dan testimoninya hilang.
const data: Record<string, unknown> = row?.data ?? { version: 2 };
if (data.version !== 2) {
  console.error("x Pengaturan masih versi lama. Buka lalu simpan Admin > Pengaturan sekali, kemudian jalankan lagi.");
  process.exit(1);
}

const current = (data.testimonials ?? {}) as { items?: { id: string }[] };
const items = current.items ?? [];
const have = new Set(items.map((t) => t.id));
const missing = seed.data.filter((t) => !have.has(t.id));
if (missing.length === 0) {
  console.log(`ok tidak ada perubahan, ${items.length} testimoni sudah tersimpan`);
  process.exit(0);
}
if (items.length + missing.length > MAX_ITEMS) {
  console.error(`x Testimoni maksimal ${MAX_ITEMS}. Tersimpan ${items.length}, akan ditambah ${missing.length}.`);
  process.exit(1);
}

const { error } = await sb.from("settings").upsert({
  id: 1,
  data: { ...data, testimonials: { ...current, items: [...items, ...missing] } },
  updated_at: new Date().toISOString(),
});
if (error) {
  console.error(`x Gagal menyimpan: ${error.message}`);
  process.exit(1);
}
console.log(`ok ${missing.length} testimoni ditambahkan, total ${items.length + missing.length}`);
console.log("Klik \"Muat ulang dari database\" di Admin > Pengaturan supaya homepage langsung memakai isi baru.");
