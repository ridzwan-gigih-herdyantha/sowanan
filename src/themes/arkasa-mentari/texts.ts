import type { ThemeTexts } from "@/lib/invitation/texts";

// Teks khas tema Petualang dapat diubah melalui editor tanpa mengubah gaya visualnya.
export const texts: ThemeTexts = {
  hero: {
    kicker: ["Label pembuka", "Undangan pernikahan"],
    mission: ["Label misi", "Misi utama"],
    missionTitle: ["Judul misi", "Antar {pria} menjemput {wanita}"],
    instruction: ["Petunjuk mulai", "Tahan tombol untuk berangkat, atau buka Peta"],
    intro: ["Judul prolog", "Prolog"],
  },
  couple: {
    sectionLabel: ["Judul pos mempelai", "Mempelai"],
    groomLabel: ["Label mempelai pria", "Mempelai pria"],
    brideLabel: ["Label mempelai wanita", "Mempelai wanita"],
  },
  story: {
    label: ["Label pos cerita", "Cerita"],
    chapter: ["Label bab cerita", "Checkpoint"],
  },
  event: {
    sectionLabel: ["Judul pos acara", "Acara"],
    label: ["Label misi acara", "Misi utama / Hari H"],
    map: ["Tombol peta", "Buka peta"],
    calendar: ["Tombol kalender", "Kalender"],
  },
  countdown: {
    sectionLabel: ["Judul pos hitung mundur", "Hitung mundur"],
    label: ["Label hitung mundur", "Menuju hari H"],
    title: ["Judul hitung mundur", "Memuat hari bahagia"],
  },
  gallery: {
    sectionLabel: ["Judul pos galeri", "Galeri"],
    label: ["Label galeri", "Album kenangan"],
    title: ["Judul galeri", "Tangkapan layar"],
  },
  rsvp: {
    sectionLabel: ["Judul pos konfirmasi", "RSVP"],
    label: ["Label konfirmasi", "Konfirmasi kehadiran"],
    title: ["Judul konfirmasi", "Gabung ke party?"],
    subtitle: ["Keterangan konfirmasi", "Petualangan ini lebih seru kalau kamu ikut. Kabari kami ya."],
  },
  gifts: {
    sectionLabel: ["Judul pos hadiah", "Hadiah"],
    label: ["Label hadiah", "Tanda kasih"],
    title: ["Judul hadiah", "Peti hadiah"],
    subtitle: ["Keterangan hadiah", "Doa restu sudah lebih dari cukup. Bagi yang ingin memberi tanda kasih, dapat melalui rekening atau QRIS berikut."],
    holder: ["Awalan nama pemilik", "a.n."],
    qris: ["Petunjuk QRIS", "Pindai dari aplikasi bank atau e-wallet."],
  },
  wishes: {
    sectionLabel: ["Judul pos ucapan", "Ucapan"],
    label: ["Label buku tamu", "Buku tamu"],
    title: ["Judul buku tamu", "Tinggalkan pesan"],
  },
  closing: {
    title: ["Judul penutup", "Tamat"],
    subtitle: ["Ucapan penutup", "Terima kasih sudah bermain bersama kami"],
    date: ["Kalimat penutup", "Petualangan baru dimulai {tanggal_titik}"],
    credit: ["Label pemeran utama", "Pemeran utama"],
    family: ["Label keluarga", "Bersama keluarga"],
    location: ["Label lokasi", "Lokasi"],
    guest: ["Label tamu", "Pemain tamu"],
  },
};
