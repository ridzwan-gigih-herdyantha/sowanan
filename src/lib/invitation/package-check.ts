import type { PackageRules } from "@/lib/settings/text";
import { countsAsExtra, type InvitationData } from "./schema";
import { forTheme, GROUPS, type Issue } from "./spec";

// Isian yang melebihi paket ditambah add-on. Dipakai editor dan diperiksa ulang di server saat simpan final dan tayang.
export function packageIssues(data: InvitationData, theme: string, rules: PackageRules): Issue[] {
  const out: Issue[] = [];
  const has = (section: string) => forTheme(GROUPS, theme).some((g) => g.section === section);

  const photos = data.sections.gallery.photos.length;
  if (rules.photos && has("gallery") && data.sections.gallery.enabled && photos > rules.photos.max) {
    out.push({
      path: "sections.gallery.photos",
      group: "gallery",
      message: rules.photos.max
        ? `${rules.photos.note}, sekarang ${photos}. Hapus ${photos - rules.photos.max} foto atau tambah add-on.`
        : `${rules.photos.note} Hapus semua foto atau matikan bagian Galeri.`,
    });
  }
  const extras = data.extras.filter(countsAsExtra).length;
  if (rules.extras && extras > rules.extras.max) {
    const { max, note } = rules.extras;
    out.push({ path: "extras", group: "extras", message: max ? `${note}, sekarang ${extras}. Hapus ${extras - max} bagian siap pakai.` : `${note} Hapus semua bagian siap pakai.` });
  }
  if (rules.locked.musik_sendiri && data.media.music) {
    out.push({ path: "media.music", group: "hero", message: `${rules.locked.musik_sendiri} Hapus musik yang diunggah.` });
  }
  if (rules.locked.cerita && has("story") && data.sections.story.enabled) {
    out.push({ path: "sections.story.items", group: "story", message: `${rules.locked.cerita} Matikan bagian Cerita.` });
  }
  if (rules.locked.warna_tema && (data.style.palette || data.style.font || data.style.nameFont)) {
    out.push({ path: "style", group: "gaya", message: `${rules.locked.warna_tema} Kembalikan ke palet dan font bawaan.` });
  }
  return out;
}
