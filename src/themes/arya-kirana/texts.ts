import type { ThemeTexts } from "@/lib/invitation/texts";

// Teks bawaan tiap bagian, boleh diganti mempelai di editor.
export const texts: ThemeTexts = {
  hero: {
    kicker: ["Label di atas nama", "Undangan Pernikahan"],
    names: ["Nama mempelai", "{pria} & {wanita}"],
    date: ["Tanggal", "{dates}"],
    place: ["Kota", "{tempat}"],
  },
  couple: {
    label: ["Label kecil", "KEDUA MEMPELAI"],
    title: ["Judul", "Dengan memohon rahmat Tuhan"],
  },
  story: {
    label: ["Label kecil", "CERITA"],
    title: ["Judul", "Perjalanan sampai hari ini"],
  },
  event: {
    label: ["Label kecil", "HARI H"],
    title: ["Judul", "Hari yang kami nantikan"],
    place: ["Label tempat", "Tempat"],
    address: ["Label alamat", "alamat"],
    map: ["Tombol peta", "Lihat peta"],
    calendar: ["Tombol kalender", "Simpan ke kalender"],
  },
  countdown: {
    label: ["Label kecil", "MENUJU HARI H"],
    title: ["Judul", "Menghitung hari"],
    done: ["Teks saat harinya tiba", "Hari ini"],
    calendar: ["Tombol kalender", "Simpan ke kalender"],
  },
  gallery: {
    label: ["Label kecil", "GALERI"],
    title: ["Judul", "Lembar-lembar kenangan"],
  },
  rsvp: {
    label: ["Label kecil", "KONFIRMASI"],
    title: ["Judul", "Konfirmasi kehadiran"],
  },
  gifts: {
    label: ["Label kecil", "TANDA KASIH"],
    title: ["Judul", "Doa restu Anda sudah lebih dari cukup"],
    subtitle: ["Subjudul", "Bagi yang ingin memberi tanda kasih, dapat melalui rekening atau QRIS berikut."],
    bank: ["Label bank", "Bank"],
    number: ["Nomor rekening", "Nomor"],
    holder: ["Awalan nama pemilik", "a.n."],
    qrisLabel: ["Label QRIS", "QRIS"],
    qris: ["Petunjuk QRIS", "Pindai dari aplikasi bank atau e-wallet."],
  },
  wishes: {
    label: ["Label kecil", "BUKU TAMU"],
    title: ["Judul", "Titipkan doa untuk kami"],
  },
  closing: {
    label: ["Label kecil", "PENUTUP"],
    thanks: ["Ucapan terima kasih", "Atas kehadiran dan doa restu yang Anda berikan, kami ucapkan terima kasih yang setulus-tulusnya."],
    names: ["Nama mempelai", "Kami yang berbahagia"],
    date: ["Tanggal", "{dates}"],
  },
};
