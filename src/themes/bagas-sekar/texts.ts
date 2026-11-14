import type { ThemeTexts } from "@/lib/invitation/texts";

// Teks khas Bagas Sekar disamakan dengan tampilan tema dan dapat diubah di editor.
export const texts: ThemeTexts = {
  hero: {
    kicker: ["Label pembuka", "KAMI MENGUNDANGMU KE PERNIKAHAN"],
  },
  couple: {
    label: ["Label bagian mempelai", "KEDUA MEMPELAI"],
  },
  story: {
    label: ["Label bagian cerita", "CERITA KAMI"],
    title: ["Judul cerita", "Ruang yang kami bangun, pelan-pelan."],
    subtitle: ["Keterangan cerita", "Scroll pelan-pelan. Tiap lembar menumpuk di atas yang sebelumnya."],
  },
  event: {
    label: ["Label detail acara", "DETAIL ACARA"],
    place: ["Label tempat", "TEMPAT"],
    address: ["Label alamat", "ALAMAT"],
    map: ["Tombol peta", "LIHAT PETA"],
  },
  countdown: {
    label: ["Label hitung mundur", "MENUJU HARI H"],
    title: ["Judul hitung mundur", "Menuju hari bahagia"],
    done: ["Teks saat harinya tiba", "HARI INI."],
    calendar: ["Tombol kalender", "SIMPAN KE KALENDER"],
  },
  gallery: {
    label: ["Label galeri", "GALERI"],
    title: ["Judul galeri", "Yang kami simpan."],
  },
  rsvp: {
    label: ["Label konfirmasi", "KONFIRMASI KEHADIRAN"],
  },
  gifts: {
    label: ["Label hadiah", "TANDA KASIH"],
    title: ["Judul hadiah", "Doa restu kalian sudah lebih dari cukup."],
    subtitle: ["Keterangan hadiah", "Bagi yang ingin memberi tanda kasih, dapat melalui rekening atau QRIS berikut."],
    bank: ["Label bank", "BANK"],
    number: ["Label nomor rekening", "NOMOR"],
    holder: ["Label pemilik rekening", "ATAS NAMA"],
    qrisLabel: ["Label QRIS", "QRIS"],
    qris: ["Petunjuk QRIS", "Pindai dari aplikasi bank atau e-wallet."],
  },
  wishes: {
    label: ["Label doa dan ucapan", "DOA & UCAPAN"],
    title: ["Judul doa dan ucapan", "Titipkan doa untuk kami."],
  },
  closing: {
    title: ["Ucapan penutup", "Terima kasih atas doa dan kehadirannya."],
  },
};
