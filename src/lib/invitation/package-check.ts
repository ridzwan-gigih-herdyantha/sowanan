import type { PackageRules } from "@/lib/settings/text";
import { CUSTOM } from "@/themes/palette";
import type { PostGalleryWindow } from "./archive";
import { CUSTOM_FONT_SLOTS, customFontProblem } from "./custom-font";
import { countsAsExtra, type InvitationData } from "./schema";
import { forTheme, GROUPS, type Issue } from "./spec";

// Palet kustom dan palet varian dikunci terpisah. Kosong berarti palet bawaan, selalu boleh.
export function paletteLocked(palette: string, rules: PackageRules): string | undefined {
  if (!palette) return undefined;
  return palette === CUSTOM ? rules.locked.palet_custom : rules.locked.palet_varian;
}

// Batas foto pasca acara: kuota add-on selama masanya terbuka. Setelah masanya lewat jumlah foto tidak boleh
// bertambah dari versi tayang, tapi foto yang sudah ada boleh dihapus.
export function postGalleryCap(rules: PackageRules, win?: PostGalleryWindow): { max: number; note: string } | undefined {
  const quota = rules.postGallery;
  if (quota && !quota.max) return quota;
  if (win?.closed) return { max: quota ? Math.min(quota.max, win.published) : win.published, note: `Foto pasca acara hanya bisa ditambah sampai ${win.until}.` };
  if (!quota) return undefined;
  return { max: quota.max, note: `Kuota ${quota.max} foto dari add-on${win ? `, bisa ditambah sampai ${win.until}` : ""}.` };
}

// Isian yang melebihi paket plus add-on. Dipakai editor dan dicek ulang di server saat simpan final dan tayang.
export function packageIssues(data: InvitationData, theme: string, rules: PackageRules, win?: PostGalleryWindow): Issue[] {
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
  const post = data.postGallery.length;
  const postCap = postGalleryCap(rules, win);
  if (postCap && post > postCap.max) {
    out.push({ path: "postGallery", group: "pasca", message: `${postCap.note} Sekarang ${post} foto, hapus ${post - postCap.max}.` });
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
  const paletteLock = paletteLocked(data.style.palette, rules);
  if (paletteLock) {
    out.push({ path: "style.palette", group: "gaya", message: `${paletteLock} Kembalikan ke palet bawaan.` });
  }
  if (rules.locked.font_varian && (data.style.font || data.style.nameFont)) {
    out.push({ path: "style.font", group: "gaya", message: `${rules.locked.font_varian} Kembalikan ke font bawaan.` });
  }
  if (rules.locked.video_youtube && data.video) {
    out.push({ path: "video", group: "video", message: `${rules.locked.video_youtube} Hapus tautan video.` });
  }
  const customFonts = CUSTOM_FONT_SLOTS.filter((s) => data.style.customFont[s.key]);
  if (rules.locked.font_custom && customFonts.length) {
    out.push({ path: "style.customFont", group: "gaya", message: `${rules.locked.font_custom} Kosongkan font custom.` });
  } else {
    for (const s of customFonts) {
      const problem = customFontProblem(s.key, data.style.customFont[s.key]);
      if (problem) out.push({ path: "style.customFont", group: "gaya", message: `${s.label}: ${problem}` });
    }
  }
  return out;
}
