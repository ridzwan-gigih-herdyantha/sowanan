import type { ThemeTexts } from "@/lib/invitation/texts";

// Teks bawaan tiap bagian, boleh diganti mempelai di editor.
export const texts: ThemeTexts = {
  hero: {
    kicker: ["Label di atas nama", "Undangan Pernikahan"],
    names: ["Nama mempelai", "{pria} & {wanita}"],
    date: ["Tanggal", "{tanggal}"],
    place: ["Kota", "{tempat}"],
  },
  couple: {
    label: ["Label kecil", "KEDUA MEMPELAI"],
    title: ["Judul", "Dua cahaya, satu malam"],
  },
  story: {
    label: ["Label kecil", "CERITA"],
    title: ["Judul", "Di bawah bulan yang berganti"],
  },
  event: {
    label: ["Label kecil", "HARI H"],
    title: ["Judul", "Malam yang kami nantikan"],
    place: ["Label tempat", "Tempat"],
    address: ["Label alamat", "Alamat"],
    map: ["Tombol peta", "Lihat peta"],
  },
  countdown: {
    label: ["Label kecil", "HITUNG MUNDUR"],
    title: ["Judul", "Menghitung malam"],
    last: ["Label di bawah bulan terakhir", "Malam itu"],
    done: ["Teks saat harinya tiba", "Malam ini"],
    calendar: ["Tombol kalender", "Simpan ke kalender"],
  },
  gallery: {
    label: ["Label kecil", "GALERI"],
    title: ["Judul", "Potongan malam-malam kami"],
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
    title: ["Judul", "Titipkan satu bintang untuk kami"],
    subtitle: ["Subjudul", "Setiap ucapan menjadi satu bintang di langit ini. Ketuk bintang untuk membacanya."],
  },
  closing: {
    label: ["Label kecil", "PENUTUP"],
    title: ["Judul", "Sampai jumpa di bawah bulan yang sama."],
    thanks: ["Ucapan terima kasih", "Atas kehadiran dan doa restu yang Anda berikan, kami ucapkan terima kasih yang setulus-tulusnya."],
    names: ["Nama mempelai", "Kami yang berbahagia"],
    date: ["Tanggal", "{tanggal}"],
  },
};
