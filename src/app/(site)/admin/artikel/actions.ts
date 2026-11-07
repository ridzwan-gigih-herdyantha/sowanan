"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { currentAdmin } from "@/lib/admin-auth";
import { ARTICLES_TAG } from "@/lib/article/load";
import { cleanArticleHtml } from "@/lib/article/sanitize";
import { BUCKET } from "@/lib/storage/media";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type ArticleInput = { title: string; slug: string; category: string; thumbnail: string; content: string; published: boolean };
type SaveResult = { ok: true; id: string; updatedAt: string; content: string } | { ok: false; error: string; fields?: Record<string, string> };

const SESSION_ENDED = "Sesi berakhir. Silakan masuk lagi.";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const schema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi.").max(160, "Judul maksimal 160 karakter."),
  slug: z.string().min(3, "Alamat minimal 3 karakter.").max(80, "Alamat maksimal 80 karakter.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Alamat hanya boleh huruf kecil, angka, dan tanda hubung."),
  category: z.string().trim().max(40, "Kategori maksimal 40 karakter."),
  thumbnail: z.string().trim().max(300),
  content: z.string().max(200_000, "Isi artikel terlalu panjang."),
  published: z.boolean(),
});

export async function saveArticle(id: string | null, input: ArticleInput): Promise<SaveResult> {
  if (!(await currentAdmin())) return { ok: false, error: SESSION_ENDED };
  if (id && !UUID.test(id)) return { ok: false, error: "Permintaan tidak valid." };

  const parsed = schema.safeParse(input);
  const fields: Record<string, string> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) fields[String(issue.path[0])] ??= issue.message;
    return { ok: false, error: "Periksa lagi isian yang ditandai.", fields };
  }
  const content = cleanArticleHtml(parsed.data.content);
  // Draf boleh belum lengkap, tapi yang tayang harus lengkap. Aturan yang sama dijaga constraint di database.
  if (parsed.data.published) {
    if (!parsed.data.category) fields.category = "Kategori wajib diisi sebelum terbit.";
    if (!parsed.data.thumbnail) fields.thumbnail = "Thumbnail wajib ada sebelum terbit.";
    if (!content) fields.content = "Isi artikel wajib diisi sebelum terbit.";
    if (Object.keys(fields).length) return { ok: false, error: "Artikel belum lengkap untuk diterbitkan.", fields };
  }

  // Artikel baru memakai default database, supaya tanggal dibuat dan diperbarui persis sama.
  const row = { ...parsed.data, content };
  const articles = supabaseAdmin().from("articles");
  const { data, error } = await (id ? articles.update({ ...row, updated_at: new Date().toISOString() }).eq("id", id) : articles.insert(row)).select("id, updated_at").maybeSingle();
  if (error?.code === "23505") return { ok: false, error: "Periksa lagi isian yang ditandai.", fields: { slug: "Alamat ini sudah dipakai artikel lain." } };
  if (error) return { ok: false, error: "Gagal menyimpan. Coba lagi." };
  if (!data) return { ok: false, error: "Artikel tidak ditemukan. Mungkin sudah dihapus." };

  updateTag(ARTICLES_TAG);
  return { ok: true, id: data.id, updatedAt: data.updated_at, content };
}

const IMAGE_PATH = /site\/art(?:cover|img)_\d+\.[a-z0-9]+/g;
const imagesOf = (a: { thumbnail: string; content: string }) => new Set(`${a.thumbnail} ${a.content}`.match(IMAGE_PATH) ?? []);

export async function deleteArticle(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await currentAdmin())) return { ok: false, error: SESSION_ENDED };
  if (!UUID.test(id)) return { ok: false, error: "Permintaan tidak valid." };

  const sb = supabaseAdmin();
  const { data: rows, error: readError } = await sb.from("articles").select("id, thumbnail, content");
  if (readError) return { ok: false, error: "Gagal menghapus. Coba lagi." };
  const target = rows.find((r) => r.id === id);
  if (!target) return { ok: false, error: "Artikel tidak ditemukan. Mungkin sudah dihapus." };

  const { error } = await sb.from("articles").delete().eq("id", id);
  if (error) return { ok: false, error: "Gagal menghapus. Coba lagi." };
  updateTag(ARTICLES_TAG);

  // Gambar yang masih dipakai artikel lain, misalnya hasil salin tempel, tidak ikut dihapus. Gagal di sini hanya menyisakan berkas.
  const shared = new Set(rows.filter((r) => r.id !== id).flatMap((r) => [...imagesOf(r)]));
  const unused = [...imagesOf(target)].filter((p) => !shared.has(p));
  if (unused.length) await sb.storage.from(BUCKET).remove(unused);
  return { ok: true };
}
