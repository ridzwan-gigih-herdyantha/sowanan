import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/admin";
import { cleanArticleHtml, excerptOf } from "./sanitize";

export const ARTICLES_TAG = "articles";

export type ArticleSummary = { slug: string; title: string; category: string; thumbnail: string; excerpt: string; createdAt: string; updatedAt: string };
export type Article = ArticleSummary & { content: string };

type Row = { slug: string; title: string; category: string; thumbnail: string; content: string; created_at: string; updated_at: string };

const COLS = "slug, title, category, thumbnail, content, created_at, updated_at";

const summary = (r: Row): ArticleSummary => ({
  slug: r.slug,
  title: r.title,
  category: r.category,
  thumbnail: r.thumbnail,
  excerpt: excerptOf(r.content),
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

// Untuk halaman publik, terbaru dulu. Baru diperbarui lewat updateTag(ARTICLES_TAG) saat admin menyimpan atau menghapus.
// Kalau gagal dibaca, misalnya migrasi belum dijalankan, hasil kosong hanya di-cache sebentar.
export async function getArticles(): Promise<ArticleSummary[]> {
  "use cache";
  cacheTag(ARTICLES_TAG);
  if (!hasSupabase()) {
    cacheLife("max");
    return [];
  }
  const { data, error } = await supabaseAdmin().from("articles").select(COLS).eq("published", true).order("created_at", { ascending: false });
  if (error) {
    cacheLife("minutes");
    return [];
  }
  cacheLife("max");
  return (data as Row[]).map(summary);
}

export async function getArticle(slug: string): Promise<Article | null> {
  "use cache";
  cacheTag(ARTICLES_TAG);
  if (!hasSupabase()) {
    cacheLife("max");
    return null;
  }
  const { data, error } = await supabaseAdmin().from("articles").select(COLS).eq("slug", slug).eq("published", true).maybeSingle();
  if (error || !data) {
    cacheLife("minutes");
    return null;
  }
  cacheLife("max");
  return { ...summary(data as Row), content: cleanArticleHtml((data as Row).content) };
}
