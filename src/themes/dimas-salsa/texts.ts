import type { ThemeTexts } from "@/lib/invitation/texts";

// Teks khas tema Peta Dalam dapat diubah melalui editor tanpa mengubah gaya visualnya.
export const texts: ThemeTexts = {
  hero: {
    label: ["Sapaan pembuka", "Selamat datang"],
  },
  couple: {
    label: ["Judul bagian mempelai", "Mempelai"],
  },
  story: {
    label: ["Judul bagian cerita", "Cerita kami"],
    chapter: ["Label awal bab", "Bab"],
  },
  event: {
    label: ["Judul bagian acara", "Acara"],
    map: ["Tombol peta", "Buka peta"],
    calendar: ["Tombol kalender", "Simpan ke kalender"],
  },
  gallery: {
    label: ["Judul bagian galeri", "Galeri"],
    postLabel: ["Judul galeri pasca acara", "Galeri Pasca Acara"],
  },
  rsvp: {
    label: ["Judul bagian konfirmasi", "Konfirmasi kehadiran"],
  },
  gifts: {
    label: ["Judul bagian hadiah", "Kotak angpao"],
    qris: ["Keterangan QRIS", "QRIS"],
    holder: ["Awalan nama pemilik", "a.n."],
  },
  wishes: {
    label: ["Judul bagian ucapan", "Buku ucapan"],
    title: ["Judul panel ucapan", "Buku ucapan"],
    panel: ["Judul panel pelaminan", "Pelaminan dan buku ucapan"],
  },
  closing: {
    panel: ["Judul panel pelaminan", "Pelaminan"],
    thanksBefore: ["Awal ucapan penutup", "Terima kasih,"],
    thanksAfter: ["Akhir ucapan penutup", "sudah hadir dan mendoakan kami."],
    title: ["Judul penutup", "Tamat"],
    subtitle: ["Keterangan penutup", "Terima kasih sudah berkunjung"],
    date: ["Kalimat penutup", "Sampai jumpa {tanggal_bulan}"],
    credit: ["Label pemeran utama", "Pemeran utama"],
    family: ["Label keluarga", "Bersama keluarga"],
    location: ["Label lokasi", "Lokasi"],
    guest: ["Label tamu", "Tamu istimewa"],
  },
};
