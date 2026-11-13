import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/article/load";
import { listPublishedSlugs } from "@/lib/invitation/load";
import { getSettings, THEME_CATEGORIES } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";
import { THEME_NAMES } from "@/themes/media";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, settings, slugs] = await Promise.all([getArticles(), getSettings(), listPublishedSlugs()]);
  const published = new Set(slugs);
  // Hanya demo tema yang tampil di katalog dan sudah terbit. Undangan klien tidak pernah dimasukkan.
  const demos = [...new Set(settings.themes.filter((t) => t.on && t.slug in THEME_NAMES && published.has(t.slug)).map((t) => t.slug))];
  // Kategori tanpa tema aktif berujung 404, jadi tidak dimasukkan.
  const categories = Object.keys(THEME_CATEGORIES).filter((k) => settings.themes.some((t) => t.on && t.category === k));
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/tema`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/undangan-digital-murah`, changeFrequency: "monthly", priority: 0.8 },
    ...categories.map((k) => ({ url: `${SITE_URL}/tema/${k}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...demos.map((slug) => ({ url: `${SITE_URL}/${slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: `${SITE_URL}/artikel`, changeFrequency: "weekly", priority: 0.6 },
    ...articles.map((a) => ({ url: `${SITE_URL}/artikel/${a.slug}`, lastModified: a.updatedAt, changeFrequency: "monthly" as const, priority: 0.5 })),
    { url: `${SITE_URL}/ketentuan`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
