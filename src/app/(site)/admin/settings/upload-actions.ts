"use server";

import { randomUUID } from "node:crypto";
import { currentAdmin } from "@/lib/admin-auth";
import { BUCKET, IMAGE_TYPES, mediaUrl, MAX_RAW_IMAGE_BYTES } from "@/lib/storage/media";
import { storeMedia } from "@/lib/storage/store";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };
export type SitePurpose = "qris" | "cover";

// Gambar milik situs (QRIS pembayaran, sampul tema) disimpan di folder site/, terpisah dari folder undangan.
export async function createSiteUpload(type: string, size: number): Promise<Result<{ path: string; token: string }>> {
  if (!(await currentAdmin())) return { ok: false, error: "Sesi berakhir. Silakan masuk lagi." };
  if (!IMAGE_TYPES.includes(type)) return { ok: false, error: "Format gambar harus JPG, PNG, WebP, HEIC, atau AVIF." };
  if (size > MAX_RAW_IMAGE_BYTES) return { ok: false, error: "Gambar maksimal 25MB." };
  const path = `tmp/${randomUUID()}`;
  const { data, error } = await supabaseAdmin().storage.from(BUCKET).createSignedUploadUrl(path);
  if (error) return { ok: false, error: "Gagal menyiapkan upload." };
  return { ok: true, data: { path, token: data.token } };
}

export async function finalizeSiteUpload(tmpPath: string, type: string, purpose: SitePurpose): Promise<Result<{ path: string; url: string }>> {
  if (!(await currentAdmin())) return { ok: false, error: "Sesi berakhir. Silakan masuk lagi." };
  if (!/^tmp\/[0-9a-f-]{36}$/.test(tmpPath) || (purpose !== "qris" && purpose !== "cover")) return { ok: false, error: "Permintaan tidak valid." };
  const bucket = supabaseAdmin().storage.from(BUCKET);
  try {
    const { data, error } = await bucket.download(tmpPath);
    if (error || !data) return { ok: false, error: "File sementara tidak ditemukan. Unggah ulang." };
    const stored = await storeMedia(supabaseAdmin(), {
      slug: "site",
      purpose,
      buffer: Buffer.from(await data.arrayBuffer()),
      contentType: type,
      // QRIS selalu satu berkas yang ditimpa. Sampul tema mendapat nomor baru tiap unggahan.
      index: purpose === "qris" ? 1 : undefined,
    });
    return { ok: true, data: { path: stored.path, url: mediaUrl(stored.path) } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Gagal memproses gambar." };
  } finally {
    await bucket.remove([tmpPath]);
  }
}
