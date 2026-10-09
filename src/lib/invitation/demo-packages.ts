import { PACKAGE_IDS, PACKAGE_NAMES, type PackageId, type Settings } from "@/lib/settings/schema";
import { themeAvailable, type PackageRules } from "@/lib/settings/text";
import { limitExtras, type InvitationData } from "./schema";

// Undangan contoh bisa dilihat per paket. Paket tertinggi tampil di alamat demo biasa (/slug), paket lain di
// /slug/paket/<id>. Tampilan tablet dan HP menambahkan /tablet atau /hp di belakangnya.
export const TOP_PACKAGE: PackageId = PACKAGE_IDS[PACKAGE_IDS.length - 1];
export type DemoDevice = "desktop" | "tablet" | "hp";

export const asPackage = (v: string): PackageId | null => ((PACKAGE_IDS as readonly string[]).includes(v) ? (v as PackageId) : null);

export function demoHref(slug: string, pkg: PackageId, device: DemoDevice = "desktop") {
  const base = pkg === TOP_PACKAGE ? `/${slug}` : `/${slug}/paket/${pkg}`;
  return device === "desktop" ? base : `${base}/${device}`;
}

export type DemoPackage = { id: PackageId; name: string; available: boolean; note?: string };

// Paket yang tampil di halaman harga, beserta apakah tema ini boleh dipakai di paket itu.
export function demoPackages(s: Settings, theme: string): DemoPackage[] {
  const entry = s.themes.find((t) => t.slug === theme);
  const shown = PACKAGE_IDS.filter((id) => s.packages[id].on);
  const first = shown.find((id) => !entry || themeAvailable(s, entry.tier, id));
  return shown.map((id) => {
    const available = !entry || themeAvailable(s, entry.tier, id);
    return { id, name: PACKAGE_NAMES[id], available, note: available || !first ? undefined : `Tema ini mulai paket ${PACKAGE_NAMES[first]}` };
  });
}

// Isi undangan contoh disesuaikan aturan paket, supaya calon klien melihat apa yang didapat di tiap paket:
// bagian yang tidak termasuk disembunyikan, jumlah dipotong sesuai batas, musik dan gaya kembali ke bawaan tema.
export function applyPackage(d: InvitationData, rules: PackageRules): InvitationData {
  let out = d;
  if (rules.locked.cerita) out = { ...out, sections: { ...out.sections, story: { ...out.sections.story, enabled: false } } };
  if (rules.photos) {
    const max = rules.photos.max;
    const gallery = out.sections.gallery;
    out = { ...out, sections: { ...out.sections, gallery: { ...gallery, enabled: gallery.enabled && max > 0, photos: gallery.photos.slice(0, max) } } };
  }
  if (rules.extras) out = { ...out, extras: limitExtras(out.extras, rules.extras.max) };
  if (rules.locked.musik_sendiri) out = { ...out, media: { ...out.media, music: "" } };
  if (rules.locked.warna_tema) out = { ...out, style: { ...out.style, palette: "", font: "", nameFont: "" } };
  return out;
}
