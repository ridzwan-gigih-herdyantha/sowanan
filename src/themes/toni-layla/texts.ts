import type { ThemeTexts } from "@/lib/invitation/texts";

// Teks bawaan tiap bagian, boleh diganti mempelai di editor.
export const texts: ThemeTexts = {
  hero: {
    kicker: ["Label di atas nama", "UNDANGAN PERNIKAHAN"],
    names: ["Nama mempelai", "{pria} & {wanita}"],
    date: ["Tanggal", "{tanggal}"],
    place: ["Kota", "{tempat}"],
  },
  couple: {
    label: ["Label kecil", "KEDUA MEMPELAI"],
    title: ["Judul", "Kami berdua"],
    groom: ["Label mempelai pria", "Mempelai pria"],
    bride: ["Label mempelai wanita", "Mempelai wanita"],
  },
  story: {
    label: ["Label kecil", "CERITA"],
    title: ["Judul", "Sampai di sini"],
  },
  event: {
    label: ["Label kecil", "HARI H"],
    title: ["Judul", "Waktu dan tempat"],
    place: ["Label tempat", "Tempat"],
    address: ["Label alamat", "Alamat"],
    map: ["Tombol peta", "Lihat peta"],
    calendar: ["Tombol kalender", "Simpan ke kalender"],
  },
  countdown: {
    label: ["Label kecil", "HITUNG MUNDUR"],
    title: ["Judul", "Menuju hari itu"],
    done: ["Teks saat harinya tiba", "Hari ini"],
    calendar: ["Tombol kalender", "Simpan ke kalender"],
  },
  gallery: {
    label: ["Label kecil", "GALERI"],
    title: ["Judul", "Potongan kecil"],
  },
  rsvp: {
    label: ["Label kecil", "KONFIRMASI"],
    title: ["Judul", "RSVP"],
  },
  gifts: {
    label: ["Label kecil", "TANDA KASIH"],
    title: ["Judul", "Doa restu cukup"],
    subtitle: ["Subjudul", "Bagi yang ingin memberi tanda kasih, dapat melalui rekening atau QRIS berikut."],
    bank: ["Label bank", "Bank"],
    number: ["Nomor rekening", "Nomor"],
    holder: ["Awalan nama pemilik", "a.n."],
    qris: ["Petunjuk QRIS", "Pindai dari aplikasi bank atau e-wallet."],
  },
  wishes: {
    label: ["Label kecil", "BUKU TAMU"],
    title: ["Judul", "Kirim pesan"],
  },
  closing: {
    label: ["Label kecil", "PENUTUP"],
    title: ["Judul", "Terima kasih"],
    thanks: ["Ucapan terima kasih", "Atas kehadiran dan doa restu yang Anda berikan, kami ucapkan terima kasih yang setulus-tulusnya."],
    names: ["Nama mempelai", "{pria} & {wanita}"],
    date: ["Tanggal", "{tanggal}"],
  },
};
