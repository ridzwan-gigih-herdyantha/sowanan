import type { ThemeTexts } from "@/lib/invitation/texts";

// Teks bawaan tiap bagian, boleh diganti mempelai di editor.
export const texts: ThemeTexts = {
  hero: {
    number: ["Nomor di pojok kanan atas", "{koleksi}"],
    kicker: ["Label di atas nama", "UNDANGAN PERNIKAHAN"],
    names: ["Nama mempelai", "{pria} & {wanita}"],
    date: ["Tanggal", "{tanggal}"],
    place: ["Kota", "{tempat}"],
  },
  couple: {
    label: ["Label kecil", "KEDUA MEMPELAI"],
    title: ["Judul", "Dua spesimen yang akhirnya satu lembar."],
    subtitle: ["Subjudul", "Ketuk kartu untuk membaca label di baliknya."],
    flip: ["Petunjuk di muka kartu", "BALIK KARTU ↻"],
    tagGroom: ["Judul di balik kartu pria", "LABEL SPESIMEN"],
    numberGroom: ["Nomor di balik kartu pria", "No. {kode}-A"],
    favoriteGroom: ["Label bunga favorit pria", "SPESIMEN FAVORIT"],
    tagBride: ["Judul di balik kartu wanita", "LABEL SPESIMEN"],
    numberBride: ["Nomor di balik kartu wanita", "No. {kode}-B"],
    favoriteBride: ["Label bunga favorit wanita", "SPESIMEN FAVORIT"],
    back: ["Petunjuk di balik kartu", "KETUK UNTUK KEMBALI ↻"],
  },
  story: {
    label: ["Label kecil", "CERITA"],
    title: ["Judul", "Arsip perjalanan kami."],
  },
  event: {
    label: ["Label kecil", "HARI H"],
    title: ["Judul", "{hari}"],
    date: ["Label tanggal", "TANGGAL"],
    time: ["Label jam", "JAM"],
    place: ["Label tempat", "TEMPAT"],
    address: ["Label alamat", "ALAMAT"],
    map: ["Tombol peta", "BUKA PETA"],
  },
  countdown: {
    label: ["Label kecil", "MENUJU HARI H"],
    title: ["Judul", "Tiga label ini menghitung mundur untuk kami."],
    subtitle: ["Subjudul", "Sentuh labelnya."],
    done: ["Teks saat harinya tiba", "HARINYA TIBA."],
    calendar: ["Tombol kalender", "SIMPAN KE KALENDER"],
  },
  gallery: {
    label: ["Label kecil", "GALERI"],
    title: ["Judul", "Lembar-lembar yang kami simpan."],
  },
  rsvp: {
    label: ["Label kecil", "KARTU BALASAN"],
  },
  gifts: {
    label: ["Label kecil", "TANDA KASIH"],
    title: ["Judul", "Doa restu kalian sudah lebih dari cukup."],
    subtitle: ["Subjudul", "Bagi yang ingin memberi tanda kasih, dapat melalui rekening atau QRIS berikut."],
    bank: ["Label bank", "BANK"],
    number: ["Label nomor rekening", "NOMOR"],
    holder: ["Label pemilik", "ATAS NAMA"],
    qris: ["Petunjuk QRIS", "Pindai dari aplikasi bank atau e-wallet."],
  },
  wishes: {
    label: ["Label kecil", "BUKU TAMU"],
    title: ["Judul", "Gantungkan ucapanmu di sini."],
    subtitle: ["Subjudul", "Setiap ucapan jadi satu label dalam koleksi kami."],
  },
  closing: {
    label: ["Label kecil", "{koleksi}"],
    title: ["Judul", "Terima kasih telah menjadi bagian dari koleksi ini."],
    names: ["Nama mempelai", "{pria} & {wanita}"],
    date: ["Tanggal", "{tanggal}"],
  },
};
