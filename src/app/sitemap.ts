import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/article/load";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getArticles();
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/tema`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/artikel`, changeFrequency: "weekly", priority: 0.6 },
    ...articles.map((a) => ({ url: `${SITE_URL}/artikel/${a.slug}`, lastModified: a.updatedAt, changeFrequency: "monthly" as const, priority: 0.5 })),
    { url: `${SITE_URL}/ketentuan`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
