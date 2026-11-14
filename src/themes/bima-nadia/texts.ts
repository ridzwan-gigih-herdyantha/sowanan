import type { ThemeTexts } from "@/lib/invitation/texts";

// Teks khas Bima Nadia disamakan dengan tampilan tema dan dapat diubah di editor.
export const texts: ThemeTexts = {
  hero: {
    kicker: ["Label pembuka", "Undangan Pernikahan"],
    doorMoonSuffix: ["Keterangan bulan di sampul", "di malam pernikahan"],
    doorGuestLabel: ["Sapaan tamu di sampul", "Kepada"],
    doorOpen: ["Tombol buka undangan", "Buka undangan"],
    doorSkip: ["Tombol lewati animasi sampul", "Lewati"],
    moonIntro: ["Keterangan bulan di pembuka", "di malam pernikahan,"],
    moonSuffix: ["Keterangan terang bulan", "terang"],
  },
  couple: {
    title: ["Judul bagian mempelai", "Dua cahaya, satu malam"],
  },
  story: {
    title: ["Judul cerita", "Di bawah bulan yang berganti"],
    moonSuffix: ["Keterangan bulan di cerita", "malam itu"],
  },
  event: {
    title: ["Judul detail acara", "Malam yang kami nantikan"],
    moonSuffix: ["Keterangan bulan di detail acara", "tampak terang malam itu"],
    place: ["Label tempat", "Tempat"],
    address: ["Label alamat", "Alamat"],
    map: ["Tombol peta", "Lihat peta"],
    calendar: ["Tombol kalender", "Simpan ke kalender"],
  },
  countdown: {
    title: ["Judul hitung mundur", "Menghitung malam"],
    last: ["Label di bawah bulan terakhir", "Malam itu"],
    done: ["Teks saat harinya tiba", "Malam ini"],
    days: ["Satuan hari", "Hari"],
    hours: ["Satuan jam", "Jam"],
    minutes: ["Satuan menit", "Menit"],
  },
  gallery: {
    title: ["Judul galeri", "Potongan malam-malam kami"],
  },
  rsvp: {
    title: ["Judul konfirmasi", "Konfirmasi kehadiran"],
  },
  gifts: {
    title: ["Judul hadiah", "Doa restu Anda sudah lebih dari cukup"],
    subtitle: ["Keterangan hadiah", "Bagi yang ingin memberi tanda kasih, dapat melalui rekening atau QRIS berikut."],
    bank: ["Label bank", "Bank"],
    number: ["Label nomor rekening", "Nomor"],
    holder: ["Awalan nama pemilik", "a.n."],
    copy: ["Tombol salin rekening", "Salin nomor rekening"],
    qrisLabel: ["Label QRIS", "QRIS"],
    qris: ["Petunjuk QRIS", "Pindai dari aplikasi bank atau e-wallet."],
  },
  wishes: {
    title: ["Judul buku ucapan", "Titipkan satu bintang untuk kami"],
    subtitle: ["Keterangan buku ucapan", "Setiap ucapan menjadi satu bintang di langit ini. Ketuk bintang untuk membacanya."],
  },
  closing: {
    title: ["Judul penutup", "Sampai jumpa di bawah bulan yang sama."],
    thanks: ["Ucapan terima kasih", "Atas kehadiran dan doa restu yang Anda berikan, kami ucapkan terima kasih yang setulus-tulusnya."],
    label: ["Label nama mempelai", "Kami yang berbahagia"],
  },
};
