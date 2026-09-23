import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// PRD 2.7: sitemap hanya homepage dan ketentuan.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/ketentuan`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
