import type { ThemeTexts } from "@/lib/invitation/texts";

// Teks bawaan tiap bagian, boleh diganti mempelai di editor.
export const texts: ThemeTexts = {
  couple: {
    label: ["Label kecil", "Kedua mempelai"],
    title: ["Judul", "Kami berdua"],
    groom: ["Label mempelai pria", "Mempelai pria"],
    bride: ["Label mempelai wanita", "Mempelai wanita"],
  },
  story: {
    label: ["Label kecil", "Cerita kami"],
    title: ["Judul", "Sampai di sini"],
  },
  event: {
    label: ["Label kecil", "Waktu dan tempat"],
    place: ["Label tempat", "Tempat"],
    address: ["Label alamat", "Alamat"],
    map: ["Tombol peta", "Lihat peta"],
    calendar: ["Tombol kalender", "Simpan ke kalender"],
  },
  countdown: {
    label: ["Label kecil", "Menuju hari itu"],
    done: ["Teks saat harinya tiba", "Hari ini"],
  },
  gallery: {
    label: ["Label kecil", "Galeri"],
    title: ["Judul", "Potongan kecil"],
  },
  rsvp: {
    label: ["Label kecil", "Konfirmasi kehadiran"],
    title: ["Judul", "RSVP"],
  },
  gifts: {
    label: ["Label kecil", "Tanda kasih"],
    title: ["Judul", "Doa restu cukup"],
    subtitle: ["Subjudul", "Bagi yang ingin memberi tanda kasih, dapat melalui rekening atau QRIS berikut."],
    bank: ["Label bank", "Bank"],
    number: ["Label nomor rekening", "Nomor"],
    holder: ["Awalan nama pemilik", "a.n."],
    qrisLabel: ["Label QRIS", "QRIS"],
    qris: ["Petunjuk QRIS", "Pindai dari aplikasi bank atau e-wallet."],
  },
  wishes: {
    label: ["Label kecil", "Doa dan ucapan"],
    title: ["Judul", "Kirim pesan"],
  },
  closing: {
    thanks: ["Ucapan terima kasih", "Atas kehadiran dan doa restu yang Anda berikan, kami ucapkan terima kasih yang setulus-tulusnya."],
  },
};
