import { THEME_CATEGORIES, type PackageId, type Settings } from "@/lib/settings/schema";
import { formatRupiah } from "@/lib/settings/text";

// Judul dan deskripsi untuk mesin pencari. Merek dan kata kunci undangan pernikahan digital selalu ikut.
const BRAND = "Sowanan";
const MAX_DESCRIPTION = 160;

// Demo tema, misalnya "Tema Game Co-op Adventure". Nama, kategori, dan nuansa diambil dari katalog tema di pengaturan.
export function demoSeo(s: Settings, slug: string, fallbackName: string, packages: PackageId[]) {
  const entry = s.themes.find((t) => t.slug === slug);
  const category = entry ? THEME_CATEGORIES[entry.category].replace("/", " ") : "";
  const label = [category, entry?.name || fallbackName].filter(Boolean).join(" ");
  const mood = entry?.style ? `, bernuansa ${entry.style.replace(/\s*\/\s*/g, " dan ")}` : "";
  const prices = packages.map((id) => s.packages[id].price);
  const from = prices.length ? ` mulai ${formatRupiah(Math.min(...prices))}` : "";
  // Harga di depan, karena Google memotong deskripsi di sekitar 160 karakter.
  return {
    title: `Tema ${label} | Undangan Pernikahan Digital ${BRAND}`,
    description: `Demo tema ${label} dari ${BRAND}, undangan pernikahan digital${from}${mood}. Lengkap dengan RSVP, peta, ucapan, dan amplop digital.`,
  };
}

// Kalimat utuh dari awal teks yang muat, supaya deskripsi tidak terpotong di tengah kalimat.
function opening(text: string, room: number) {
  if (text.length <= room) return text;
  let out = "";
  for (const sentence of text.match(/[^.!?]+[.!?]+/g) ?? []) {
    const next = `${out} ${sentence.trim()}`.trim();
    if (next.length > room) break;
    out = next;
  }
  return out || `${text.slice(0, text.lastIndexOf(" ", room - 3))}...`;
}

// Artikel: kalimat pembuka artikel, lalu kategori dan merek.
export function articleSeo(a: { title: string; category: string; text: string }) {
  const category = a.category.trim().toLowerCase();
  const tail = `Artikel ${category ? `${category} ` : ""}dari ${BRAND}, undangan pernikahan digital.`;
  return {
    title: `${a.title} | Artikel ${BRAND}`,
    description: `${opening(a.text, MAX_DESCRIPTION - tail.length - 1)} ${tail}`,
  };
}
