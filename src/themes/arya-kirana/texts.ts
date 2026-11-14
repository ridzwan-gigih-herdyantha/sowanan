import type { ThemeTexts } from "@/lib/invitation/texts";

// Teks khas Arya Kirana disamakan dengan tampilan tema dan dapat diubah di editor.
export const texts: ThemeTexts = {
  hero: {
    kicker: ["Label pembuka", "Undangan Pernikahan"],
  },
  couple: {
    label: ["Label bagian mempelai", "Kedua mempelai"],
    title: ["Judul bagian mempelai", "Dengan memohon rahmat Tuhan"],
  },
  story: {
    label: ["Label bagian cerita", "Cerita kami"],
    title: ["Judul cerita", "Perjalanan sampai hari ini"],
  },
  event: {
    label: ["Label detail acara", "Waktu dan tempat"],
    title: ["Judul detail acara", "Hari yang kami nantikan"],
    place: ["Label tempat", "Tempat"],
    address: ["Label alamat", "Alamat"],
    map: ["Tombol peta", "Lihat peta"],
    calendar: ["Tombol kalender", "Simpan ke kalender"],
  },
  countdown: {
    label: ["Label hitung mundur", "Menuju hari bahagia"],
    title: ["Judul hitung mundur", "Menghitung hari"],
    done: ["Teks saat harinya tiba", "Hari ini"],
  },
  gallery: {
    label: ["Label galeri", "Galeri"],
    title: ["Judul galeri", "Lembar-lembar kenangan"],
  },
  rsvp: {
    label: ["Label konfirmasi", "Mohon balasan"],
    title: ["Judul konfirmasi", "Konfirmasi kehadiran"],
  },
  gifts: {
    label: ["Label hadiah", "Tanda kasih"],
    title: ["Judul hadiah", "Doa restu Anda sudah lebih dari cukup"],
    subtitle: ["Keterangan hadiah", "Bagi yang ingin memberi tanda kasih, dapat melalui rekening atau QRIS berikut."],
    bank: ["Label bank", "Bank"],
    number: ["Label nomor rekening", "Nomor"],
    holder: ["Awalan nama pemilik", "a.n."],
    qrisLabel: ["Label QRIS", "QRIS"],
    qris: ["Petunjuk QRIS", "Pindai dari aplikasi bank atau e-wallet."],
  },
  wishes: {
    label: ["Label doa dan ucapan", "Doa dan ucapan"],
    title: ["Judul doa dan ucapan", "Titipkan doa untuk kami"],
  },
  closing: {
    label: ["Label penutup", "Kami yang berbahagia"],
    thanks: ["Ucapan terima kasih", "Atas kehadiran dan doa restu yang Anda berikan, kami ucapkan terima kasih yang setulus-tulusnya."],
  },
};
