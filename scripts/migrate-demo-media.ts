// pnpm migrate-demo-media [slug...]
// Unggah aset undangan contoh dari public/img/<slug>/ ke Supabase Storage dengan nama <kegunaan>_<nomor>,
// lalu ganti path di supabase/seed/invitations/<slug>.json. Jalankan pnpm seed-invitations sesudahnya.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import type { Purpose } from "../src/lib/storage/media.ts";
import { storeMedia, type StoredMedia } from "../src/lib/storage/store.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env");
  process.exit(1);
}
const sb = createClient(new URL(url).origin, key, { auth: { persistSession: false } });

const TYPES: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", mp3: "audio/mpeg", mp4: "video/mp4" };
const seedDir = new URL("../supabase/seed/invitations/", import.meta.url);
const publicDir = new URL("../public/", import.meta.url);
const only = process.argv.slice(2);

type Obj = Record<string, unknown>;

for (const file of readdirSync(seedDir).filter((f) => f.endsWith(".json"))) {
  const seed = JSON.parse(readFileSync(new URL(file, seedDir), "utf-8"));
  if (only.length && !only.includes(seed.slug)) continue;

  const counters: Partial<Record<Purpose, number>> = {};
  const done = new Map<string, StoredMedia>();
  let uploaded = 0;
  let bytes = 0;

  async function put(obj: Obj, field: string, purpose: Purpose, dims = false) {
    const src = obj[field];
    if (typeof src !== "string" || !src.startsWith("/")) return;
    const cacheKey = `${purpose}:${src}`;
    let stored = done.get(cacheKey);
    if (!stored) {
      const ext = src.split(".").pop()!.toLowerCase();
      const index = (counters[purpose] = (counters[purpose] ?? 0) + 1);
      stored = await storeMedia(sb, {
        slug: seed.slug,
        purpose,
        buffer: readFileSync(new URL(src.slice(1), publicDir)),
        contentType: TYPES[ext] ?? "",
        index,
      });
      done.set(cacheKey, stored);
      uploaded++;
      bytes += stored.bytes;
      console.log(`  ${src} -> ${stored.name} (${Math.round(stored.bytes / 1024)}KB)`);
    }
    obj[field] = stored.path;
    if (dims && stored.width && stored.height) {
      obj.w = stored.width;
      obj.h = stored.height;
    }
  }

  console.log(seed.slug);
  const d = seed.data;
  const media = d.media as Obj;
  const s = d.sections;
  await put(media, "hero", "hero");
  await put(media, "heroWide", "herowide");
  await put(media, "og", "og");
  await put(media, "music", "music");
  for (const f of ["venue", "couple", "closing", "detail", "rsvp"] as const) await put(media, f, f);
  await put(d.couple.groom, "photo", "groom");
  await put(d.couple.bride, "photo", "bride");
  for (const item of s.story.items) {
    await put(item, "image", "story");
    if (item.video) {
      await put(item.video, "src", "video");
      await put(item.video, "poster", "poster");
    }
  }
  for (const p of s.gallery.photos) await put(p, "src", "gallery", true);
  for (const p of s.couple.photos ?? []) await put(p, "src", "photo");
  for (const p of s.collage?.polaroids ?? []) await put(p, "src", "polaroid");
  for (const p of s.specimens?.items ?? []) await put(p, "src", "specimen", true);
  await put(s.gifts, "qris", "qris");

  writeFileSync(new URL(file, seedDir), JSON.stringify(seed, null, 2) + "\n");
  console.log(`  ${uploaded} file, total ${Math.round(bytes / 1024)}KB`);
}
