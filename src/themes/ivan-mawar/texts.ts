import type { ThemeTexts } from "@/lib/invitation/texts";

// Teks bawaan tiap bagian, boleh diganti mempelai di editor.
export const texts: ThemeTexts = {
  hero: {
    kicker: ["Label di atas nama", "Pernikahan"],
    doorKicker: ["Sampul: label di atas nama", "Undangan pernikahan"],
    doorFor: ["Sampul: label nama tamu", "Kepada Yth."],
    doorButton: ["Sampul: tombol buka", "Buka undangan"],
  },
  couple: {
    label: ["Label kecil", "Kedua mempelai"],
    title: ["Judul", "Dengan memohon rahmat Tuhan"],
  },
  story: {
    label: ["Label kecil", "Cerita kami"],
    title: ["Judul", "Perjalanan sampai hari ini"],
  },
  event: {
    label: ["Label kecil", "Simpan tanggalnya"],
    map: ["Tombol peta", "Petunjuk arah"],
    calendar: ["Tombol kalender", "Simpan ke kalender"],
  },
  countdown: {
    label: ["Label kecil", "Menuju hari bahagia"],
    title: ["Judul", "Menghitung hari"],
    done: ["Teks saat harinya tiba", "Hari ini"],
  },
  gallery: {
    label: ["Label kecil", "Momen kami"],
    title: ["Judul", "Galeri"],
  },
  rsvp: {
    label: ["Label kecil", "Mohon balasan"],
    title: ["Judul", "Konfirmasi kehadiran"],
  },
  gifts: {
    label: ["Label kecil", "Tanda kasih"],
    title: ["Judul", "Doa restu Anda sudah lebih dari cukup"],
    subtitle: ["Subjudul", "Bagi yang ingin memberi tanda kasih, dapat melalui rekening atau QRIS berikut."],
    holder: ["Awalan nama pemilik", "a.n."],
    qrisLabel: ["Label QRIS", "QRIS"],
    qris: ["Petunjuk QRIS", "Pindai dari aplikasi bank atau e-wallet."],
  },
  wishes: {
    label: ["Label kecil", "Doa dan ucapan"],
    title: ["Judul", "Titipkan doa untuk kami"],
  },
  closing: {
    title: ["Judul", "Terima kasih"],
    body: ["Kalimat terima kasih", "Atas kehadiran dan doa restu yang Anda berikan, kami ucapkan terima kasih yang setulus-tulusnya."],
    label: ["Label di atas nama", "Kami yang berbahagia"],
  },
};
