import type { ThemeTexts } from "@/lib/invitation/texts";

// Teks bawaan tiap bagian, boleh diganti mempelai di editor.
export const texts: ThemeTexts = {
  hero: {
    kicker: ["Label pembuka", "Pernikahan"],
    intro: ["Label sambutan", "Pasu-pasu"],
    introTitle: ["Judul sambutan", "Dengan kasih dan berkat Tuhan"],
  },
  couple: {
    label: ["Label kecil", "Dua keluarga"],
    title: ["Judul", "Mempelai"],
  },
  story: {
    label: ["Label kecil", "Perjalanan"],
    title: ["Judul", "Kisah kami"],
    subtitle: ["Subjudul", "Gulir pelan, tiap lembar cerita akan menumpuk seperti ulos yang dilipat."],
  },
  event: {
    label: ["Label kecil", "Acara"],
    title: ["Judul", "Rangkaian acara"],
    place: ["Label tempat", "Tempat"],
    address: ["Label alamat", "Alamat"],
    map: ["Tombol peta", "Buka peta"],
    calendar: ["Tombol kalender", "Simpan ke kalender"],
  },
  countdown: {
    label: ["Label kecil", "Menuju hari H"],
    title: ["Judul", "Menuju hari bahagia"],
    done: ["Teks saat harinya tiba", "Hari yang dinanti telah tiba"],
    days: ["Satuan hari", "Hari"],
    hours: ["Satuan jam", "Jam"],
    minutes: ["Satuan menit", "Menit"],
  },
  gallery: {
    label: ["Label kecil", "Kenangan"],
    title: ["Judul", "Galeri"],
  },
  rsvp: {
    label: ["Label kecil", "Kehadiran"],
    title: ["Judul", "Konfirmasi kehadiran"],
  },
  gifts: {
    label: ["Label kecil", "Amplop digital"],
    title: ["Judul", "Tanda kasih"],
    subtitle: ["Subjudul", "Doa restu Bapak/Ibu/Saudara/i sudah lebih dari cukup. Bagi yang ingin memberi tanda kasih, rekeningnya ada di bawah ini."],
    bank: ["Label bank", "Bank"],
    number: ["Label nomor rekening", "Nomor"],
    holder: ["Label pemilik", "Atas nama"],
    qrisLabel: ["Label QRIS", "QRIS"],
    qris: ["Petunjuk QRIS", "Pindai QRIS dari aplikasi bank atau e-wallet."],
    copy: ["Tombol salin", "Salin nomor"],
  },
  wishes: {
    label: ["Label kecil", "Doa restu"],
    title: ["Judul", "Doa dan ucapan"],
  },
  closing: {
    label: ["Label kecil", "Dengan sukacita"],
    title: ["Judul", "Terima kasih"],
    thanks: ["Ucapan terima kasih", "Merupakan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu."],
  },
};
