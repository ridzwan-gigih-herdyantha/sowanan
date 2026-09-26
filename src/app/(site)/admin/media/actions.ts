"use server";

import { randomUUID } from "node:crypto";
import { currentAdmin } from "@/lib/admin-auth";
import { BUCKET, IMAGE_TYPES, isPurpose, mediaUrl, MAX_RAW_IMAGE_BYTES, parseFileName, PURPOSES } from "@/lib/storage/media";
import { storeMedia, type StoredMedia } from "@/lib/storage/store";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { validateSlug } from "@/lib/reserved-slugs";
import { themeMedia } from "@/themes/media";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export type MediaFile = { name: string; path: string; url: string; purpose: string; index: number; bytes: number; contentType: string; updatedAt: string };

async function guard(slug: string): Promise<string | null> {
  if (!(await currentAdmin())) return "Sesi berakhir. Silakan masuk lagi.";
  if (!validateSlug(slug).ok) return "Slug undangan tidak valid.";
  return null;
}

export async function createUploadTicket(input: { slug: string; purpose: string; type: string; size: number }): Promise<Result<{ path: string; token: string }>> {
  const denied = await guard(input.slug);
  if (denied) return { ok: false, error: denied };
  if (!isPurpose(input.purpose)) return { ok: false, error: "Kegunaan file tidak dikenal." };
  const { data: inv } = await supabaseAdmin().from("invitations").select("theme").eq("slug", input.slug).maybeSingle();
  if (!inv) return { ok: false, error: "Undangan tidak ditemukan." };
  if (!themeMedia(inv.theme).includes(input.purpose)) return { ok: false, error: "Kegunaan file ini tidak dipakai di tema undangan tersebut." };

  const preset = PURPOSES[input.purpose];
  if (preset.kind === "image") {
    if (!IMAGE_TYPES.includes(input.type)) return { ok: false, error: "Format gambar harus JPG, PNG, WebP, HEIC, atau AVIF." };
    if (input.size > MAX_RAW_IMAGE_BYTES) return { ok: false, error: "Foto maksimal 25MB." };
  } else {
    if (!(input.type in preset.types)) return { ok: false, error: `Format ${preset.label.toLowerCase()} tidak didukung.` };
    if (input.size > preset.maxBytes) return { ok: false, error: `${preset.label} maksimal ${Math.round(preset.maxBytes / 1024 / 1024)}MB.` };
  }

  const path = `tmp/${randomUUID()}`;
  const { data, error } = await supabaseAdmin().storage.from(BUCKET).createSignedUploadUrl(path);
  if (error) return { ok: false, error: "Gagal menyiapkan upload." };
  return { ok: true, data: { path, token: data.token } };
}

export async function finalizeUpload(input: { slug: string; purpose: string; tmpPath: string; type: string; index?: number }): Promise<Result<StoredMedia & { url: string }>> {
  const denied = await guard(input.slug);
  if (denied) return { ok: false, error: denied };
  if (!isPurpose(input.purpose) || !/^tmp\/[0-9a-f-]{36}$/.test(input.tmpPath)) return { ok: false, error: "Permintaan tidak valid." };

  const bucket = supabaseAdmin().storage.from(BUCKET);
  try {
    const { data, error } = await bucket.download(input.tmpPath);
    if (error || !data) return { ok: false, error: "File sementara tidak ditemukan. Unggah ulang." };
    const stored = await storeMedia(supabaseAdmin(), {
      slug: input.slug,
      purpose: input.purpose,
      buffer: Buffer.from(await data.arrayBuffer()),
      contentType: input.type,
      index: input.index,
    });
    return { ok: true, data: { ...stored, url: mediaUrl(stored.path) } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal memproses file." };
  } finally {
    await bucket.remove([input.tmpPath]);
  }
}

export async function listMedia(slug: string): Promise<Result<MediaFile[]>> {
  const denied = await guard(slug);
  if (denied) return { ok: false, error: denied };
  const { data, error } = await supabaseAdmin().storage.from(BUCKET).list(slug, { limit: 1000, sortBy: { column: "name", order: "asc" } });
  if (error) return { ok: false, error: "Gagal membaca storage." };

  const files: MediaFile[] = [];
  for (const f of data ?? []) {
    const parsed = parseFileName(f.name);
    if (!parsed || !isPurpose(parsed.purpose)) continue;
    const version = new Date(f.updated_at ?? f.created_at ?? Date.now()).getTime().toString(36);
    const path = `${slug}/${f.name}?v=${version}`;
    files.push({
      name: f.name,
      path,
      url: mediaUrl(path),
      purpose: parsed.purpose,
      index: parsed.index,
      bytes: Number(f.metadata?.size ?? 0),
      contentType: String(f.metadata?.mimetype ?? ""),
      updatedAt: f.updated_at ?? "",
    });
  }
  files.sort((a, b) => a.purpose.localeCompare(b.purpose) || a.index - b.index);
  return { ok: true, data: files };
}

export async function deleteMedia(slug: string, name: string): Promise<Result<null>> {
  const denied = await guard(slug);
  if (denied) return { ok: false, error: denied };
  if (!parseFileName(name)) return { ok: false, error: "Nama file tidak valid." };
  const { error } = await supabaseAdmin().storage.from(BUCKET).remove([`${slug}/${name}`]);
  if (error) return { ok: false, error: "Gagal menghapus." };
  return { ok: true, data: null };
}
