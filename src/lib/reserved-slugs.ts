export const RESERVED_SLUGS = new Set([
  "tema",
  "harga",
  "order",
  "ketentuan",
  "masuk",
  "kelola",
  "blog",
  "reseller",
  "admin",
  "api",
  "demo",
  "panduan",
  "kontak",
  "img",
  "sitemap.xml",
  "robots.txt",
  "favicon.ico",
]);

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type SlugCheck = { ok: true } | { ok: false; reason: string };

export function validateSlug(slug: string): SlugCheck {
  if (slug.length < 3 || slug.length > 60) {
    return { ok: false, reason: "Slug harus 3 sampai 60 karakter." };
  }
  if (!SLUG_PATTERN.test(slug)) {
    return { ok: false, reason: "Slug hanya boleh huruf kecil, angka, dan tanda hubung." };
  }
  if (RESERVED_SLUGS.has(slug)) {
    return { ok: false, reason: `"${slug}" dipakai halaman sistem.` };
  }
  return { ok: true };
}
