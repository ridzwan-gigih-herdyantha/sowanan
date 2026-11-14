import type { ThemeTexts } from "@/lib/invitation/texts";

// Teks bawaan tiap bagian, boleh diganti mempelai di editor.
export const texts: ThemeTexts = {
  hero: {
    kicker: ["Label di atas nama", "PERNIKAHAN"],
    names: ["Nama mempelai", "{pria} & {wanita}"],
    date: ["Tanggal", "{tanggal}"],
    place: ["Kota", "{tempat}"],
  },
  couple: {
    label: ["Label kecil", "KEDUA MEMPELAI"],
  },
  story: {
    label: ["Label kecil", "CERITA KAMI"],
    title: ["Judul", "Serangkaian kebetulan yang indah"],
    hintScroll: ["Petunjuk gulir (layar lebar)", "SCROLL UNTUK MEMUTAR FILM ↓"],
    hintSwipe: ["Petunjuk geser (ponsel)", "GESER UNTUK MEMUTAR FILM →"],
    end: ["Kalimat di akhir film", "Bersambung di hari H."],
  },
  event: {
    label: ["Label kecil", "HARI H"],
    title: ["Judul", "Simpan tiketmu."],
    ticket: ["Label tiket", "TIKET MASUK"],
    number: ["Nomor tiket", "No. {kode}"],
    for: ["Label nama tamu", "UNTUK"],
    guest: ["Nama tamu bila tidak ada", "Tamu Undangan"],
    place: ["Label tempat", "TEMPAT"],
    address: ["Label alamat", "ALAMAT"],
    stub: ["Teks di sobekan tiket", "SIMPAN SOBEKAN INI"],
    map: ["Tombol peta", "BUKA PETA"],
  },
  countdown: {
    label: ["Label kecil", "SAMPAI KAMI BILANG"],
    title: ["Judul", "SAH."],
    done: ["Teks saat harinya tiba", "HARINYA SUDAH TIBA."],
    calendar: ["Tombol kalender", "SIMPAN KE KALENDER"],
  },
  gallery: {
    label: ["Label kecil", "LEMBAR KONTAK"],
    title: ["Judul", "Momen yang ingin kami simpan"],
    roll: ["Label rol film", "ROL 01"],
    hint: ["Petunjuk sebelum dicuci", "KETUK NEGATIF UNTUK MENCUCI FOTONYA"],
    hintDone: ["Petunjuk sesudah dicuci", "SEMUA SUDAH DICUCI. KETUK UNTUK MEMPERBESAR"],
    developAll: ["Tombol cuci semua", "CUCI SEMUA"],
  },
  quiz: {
    label: ["Label kecil", "KAMU"],
    title: ["Judul", "Kamu datang bawa apa?"],
    option1: ["Pilihan 1", "Kenangan baik"],
    reply1: ["Jawaban pilihan 1", "Simpan baik-baik. Hari itu kita tambah satu lagi."],
    option2: ["Pilihan 2", "Hati yang lapang"],
    reply2: ["Jawaban pilihan 2", "Kalau begitu kamu datang ke tempat yang tepat."],
    option3: ["Pilihan 3", "Energi berlebih"],
    reply3: ["Jawaban pilihan 3", "Bagus. Lantai dansanya butuh kamu."],
    option4: ["Pilihan 4", "Jujur, demi makanannya"],
    reply4: ["Jawaban pilihan 4", "Kami hargai kejujuranmu. Prasmanan sudah menunggu."],
  },
  rsvp: {
    label: ["Label kecil", "KONFIRMASI KEHADIRAN"],
  },
  gifts: {
    label: ["Label kecil", "TANDA KASIH"],
    title: ["Judul", "Doa restu kalian sudah lebih dari cukup. Bagi yang ingin berbagi,"],
    holder: ["Awalan nama pemilik", "a.n."],
    qrisLabel: ["Label QRIS", "QRIS"],
    qris: ["Petunjuk QRIS", "Pindai dari aplikasi bank atau e-wallet."],
  },
  wishes: {
    label: ["Label kecil", "TINGGALKAN PESAN"],
    title: ["Judul", "Tulis sesuatu untuk mereka."],
  },
  closing: {
    title: ["Judul", "Terima kasih atas doa dan kehadirannya."],
    note1: ["Kalimat penutup baris 1", "Kamu scroll sampai sini."],
    note2: ["Kalimat penutup baris 2", "Kami sudah suka kamu."],
  },
  share: {
    footer: ["Kalimat di footer", "Entah bagaimana, kami saling menemukan."],
  },
};
