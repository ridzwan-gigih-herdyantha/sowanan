import type { ThemeTexts } from "@/lib/invitation/texts";

// Teks bawaan tiap bagian, boleh diganti mempelai di editor.
export const texts: ThemeTexts = {
  hero: {
    kicker: ["Label pembuka", "Undangan pernikahan"],
    tagline: ["Sambutan", "Dengan penuh syukur, kami mengundang Anda."],
    button: ["Tombol", "Lihat undangan"],
    venue: ["Label tempat", "Tempat perayaan"],
  },
  couple: {
    label: ["Label kecil", "Dua keluarga"],
    title: ["Judul", "Dengan memohon restu"],
  },
  story: {
    label: ["Label kecil", "Catatan perjalanan"],
    title: ["Judul", "Kisah yang membawa kami ke sini"],
  },
  event: {
    label: ["Label kecil", "Simpan tanggalnya"],
    place: ["Label tempat acara", "Lokasi"],
    address: ["Label alamat", "Alamat"],
    map: ["Tombol peta", "Buka peta"],
    calendar: ["Tombol kalender", "Simpan tanggal"],
  },
  countdown: {
    done: ["Teks saat harinya tiba", "Hari yang dinanti telah tiba"],
    days: ["Satuan hari", "Hari"],
    hours: ["Satuan jam", "Jam"],
    minutes: ["Satuan menit", "Menit"],
  },
  gallery: {
    label: ["Label kecil", "Kilasan hari kami"],
    title: ["Judul", "Dalam bingkai kenangan"],
  },
  rsvp: {
    label: ["Label kecil", "Mohon balasan"],
    title: ["Judul", "Konfirmasi kehadiran"],
  },
  gifts: {
    label: ["Label kecil", "Tanda kasih"],
    title: ["Judul", "Doa Anda hadiah terbaik"],
    subtitle: ["Subjudul", "Bila berkenan berbagi tanda kasih, kami menerimanya dengan penuh syukur."],
    bank: ["Label bank", "Bank"],
    number: ["Label nomor rekening", "Nomor"],
    holder: ["Label pemilik", "a.n."],
    qrisLabel: ["Label QRIS", "QRIS"],
    qris: ["Petunjuk QRIS", "Pindai QRIS dari aplikasi bank atau e-wallet."],
    copy: ["Tombol salin rekening", "Salin nomor rekening"],
  },
  wishes: {
    label: ["Label kecil", "Doa dan ucapan"],
    title: ["Judul", "Sampaikan doa untuk kami"],
    subtitle: ["Subjudul", "Setiap doa dan kata baik dari Anda akan menjadi kenangan berharga bagi kami."],
  },
  closing: {
    label: ["Label kecil", "Terima kasih"],
    title: ["Judul", "Terima kasih"],
    thanks: ["Ucapan terima kasih", "Atas kehadiran dan doa yang mengiringi hari bahagia kami."],
  },
};
