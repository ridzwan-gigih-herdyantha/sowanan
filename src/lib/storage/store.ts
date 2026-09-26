import type { SupabaseClient } from "@supabase/supabase-js";
import { BUCKET, fileName, parseFileName, PURPOSES, type Purpose } from "./media.ts";
import { processImage } from "./process.ts";

export type StoredMedia = { path: string; name: string; width?: number; height?: number; bytes: number; contentType: string };

export async function nextIndex(sb: SupabaseClient, slug: string, purpose: Purpose): Promise<number> {
  const { data } = await sb.storage.from(BUCKET).list(slug, { limit: 1000 });
  const used = (data ?? []).map((f) => parseFileName(f.name)).filter((p) => p?.purpose === purpose).map((p) => p!.index);
  return used.length ? Math.max(...used) + 1 : 1;
}

type Input = { slug: string; purpose: Purpose; buffer: Buffer; contentType: string; index?: number };

export async function storeMedia(sb: SupabaseClient, { slug, purpose, buffer, contentType, index }: Input): Promise<StoredMedia> {
  const preset = PURPOSES[purpose];
  let out: { buffer: Buffer; ext: string; contentType: string; width?: number; height?: number };

  if (preset.kind === "image") {
    out = await processImage(buffer, purpose);
  } else {
    const ext = (preset.types as Record<string, string>)[contentType];
    if (!ext) throw new Error(`Format ${contentType || "tidak dikenal"} tidak didukung untuk ${preset.label}.`);
    if (buffer.byteLength > preset.maxBytes) throw new Error(`${preset.label} maksimal ${Math.round(preset.maxBytes / 1024 / 1024)}MB.`);
    out = { buffer, ext, contentType };
  }

  const n = index ?? (await nextIndex(sb, slug, purpose));
  const name = fileName(purpose, n, out.ext);
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(`${slug}/${name}`, out.buffer, { contentType: out.contentType, upsert: true, cacheControl: "31536000" });
  if (error) throw new Error(`Gagal mengunggah: ${error.message}`);

  return {
    path: `${slug}/${name}?v=${Date.now().toString(36)}`,
    name,
    width: out.width,
    height: out.height,
    bytes: out.buffer.byteLength,
    contentType: out.contentType,
  };
}
