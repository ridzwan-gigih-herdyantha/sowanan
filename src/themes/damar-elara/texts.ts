import type { ThemeTexts } from "@/lib/invitation/texts";

// Teks bawaan tiap bagian, boleh diganti mempelai di editor.
export const texts: ThemeTexts = {
  hero: {
    kicker: ["Label pembuka", "Nocturne"],
    tagline: ["Sambutan", "Sebuah malam, dua hati, satu janji."],
    venue: ["Label tempat", "Tempat"],
    button: ["Tombol", "Masuk ke cerita"],
    imageLabel: ["Label foto", "Still no. 01"],
    imageTitle: ["Judul foto", "Satu malam untuk dikenang"],
    footer: ["Kalimat penutup hero", "A love letter after dark"],
  },
  couple: {
    label: ["Label kecil", "Dua jiwa"],
    title: ["Judul", "Dalam satu cerita"],
  },
  story: {
    label: ["Label kecil", "Catatan di antara waktu"],
    title: ["Judul", "Sebelum malam ini"],
    subtitle: ["Subjudul", "Beberapa bab kecil membawa kami menuju satu janji yang ingin dirayakan bersama."],
    chapter: ["Label bab", "Bab"],
    chapters: ["Kata untuk jumlah bab", "bab"],
  },
  event: {
    label: ["Label kecil", "Sebuah malam yang dinanti"],
    title: ["Judul", "Saat kita bertemu"],
    subtitle: ["Subjudul", "Simpan tanggal ini. Kami menantikan malam yang penuh cerita bersama Anda."],
    dateLabel: ["Label tanggal acara", "The wedding night"],
    place: ["Label tempat", "Tempat perayaan"],
    address: ["Label alamat", "Alamat"],
    venueImage: ["Label foto tempat", "The venue"],
    map: ["Tombol peta", "Buka peta"],
    calendar: ["Tombol kalender", "Simpan tanggal"],
  },
  countdown: {
    days: ["Satuan hari", "Hari"],
    hours: ["Satuan jam", "Jam"],
    minutes: ["Satuan menit", "Menit"],
  },
  gallery: {
    label: ["Label kecil", "Fragmen kenangan"],
    title: ["Judul", "Cahaya yang tersisa"],
  },
  rsvp: {
    label: ["Label kecil", "Mohon balasan"],
    title: ["Judul", "Konfirmasi kehadiran"],
  },
  gifts: {
    label: ["Label kecil", "Tanda kasih"],
    title: ["Judul", "Doa kalian berarti"],
    subtitle: ["Subjudul", "Bila berkenan berbagi tanda kasih, kami menerimanya dengan penuh syukur."],
    bank: ["Label bank", "Bank"],
    number: ["Label nomor rekening", "Nomor"],
    holder: ["Label pemilik", "a.n."],
    copy: ["Tombol salin", "Salin nomor rekening"],
    qrisLabel: ["Label QRIS", "QRIS"],
    qris: ["Petunjuk QRIS", "Pindai QRIS dari aplikasi bank atau e-wallet."],
  },
  wishes: {
    label: ["Label kecil", "Ucapan dan doa"],
    title: ["Judul", "Tinggalkan sepatah kata"],
    subtitle: ["Subjudul", "Setiap doa dan kata baik dari Anda akan menjadi kenangan berharga bagi kami."],
  },
  closing: {
    label: ["Label kecil", "Terima kasih"],
    thanks: ["Ucapan terima kasih", "Atas doa dan kehadiran yang menghangatkan malam kami."],
  },
};
