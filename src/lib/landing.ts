import type { ThemeCategory } from "@/lib/settings/schema";

// Isi halaman kategori tema (/tema/<kategori>) dan halaman undangan murah. Teks boleh memakai {harga},
// {waktu}, dan {dp} yang diisi dari pengaturan. Tema yang tampil selalu diambil dari katalog yang aktif.

type Qa = { q: string; a: string };
export type CategoryCopy = { heading: string; intro: string; fits: string[]; faq: Qa[] };

export const CATEGORY_COPY: Record<ThemeCategory, CategoryCopy> = {
  minimalis: {
    heading: "Undangan Pernikahan Digital Tema Minimalis",
    intro:
      "Tema minimalis memberi ruang lega untuk nama kalian, tanggal, dan foto. Tanpa ornamen berlebihan, undangan terasa tenang dan tetap mudah dibaca di layar HP tamu.",
    fits: ["Pasangan yang suka tampilan bersih dan modern", "Acara sederhana atau intimate wedding", "Foto prewedding yang ingin jadi pusat perhatian"],
    faq: [
      { q: "Apakah tema minimalis terlihat terlalu polos?", a: "Tidak. Tata letak, huruf, dan jarak antarbagian dirancang supaya tetap terasa istimewa tanpa banyak hiasan." },
      { q: "Tema minimalis cocok untuk foto yang banyak?", a: "Cocok. Latar yang sederhana membuat foto lebih menonjol, termasuk di bagian galeri." },
    ],
  },
  elegan: {
    heading: "Undangan Pernikahan Digital Tema Elegan",
    intro:
      "Tema elegan memadukan huruf berkelas, warna lembut, dan detail yang halus. Cocok untuk kalian yang ingin undangan terasa resmi dan mewah, tapi tetap ringan dibuka di HP.",
    fits: ["Resepsi di gedung atau hotel", "Acara dengan tamu keluarga besar dan rekan kerja", "Pasangan yang suka nuansa klasik"],
    faq: [
      { q: "Undangan elegan harus mahal?", a: "Tidak. Semua tema elegan bisa dipakai di semua paket, mulai {harga}." },
      { q: "Bisa menyesuaikan warna dengan dekorasi acara?", a: "Bisa. Setiap tema punya 4 varian palet yang bisa dipilih mulai paket Lengkap, dan di paket Istimewa warnanya bisa disesuaikan dengan acara kalian." },
    ],
  },
  floral: {
    heading: "Undangan Pernikahan Digital Tema Floral",
    intro:
      "Tema floral menghadirkan bunga dan dedaunan sebagai hiasan utama, dari ilustrasi botani sampai lukisan cat air. Nuansanya hangat dan romantis, cocok untuk pernikahan yang ingin terasa lembut.",
    fits: ["Pernikahan bernuansa taman atau garden party", "Pasangan yang menyukai warna pastel", "Acara pagi atau siang hari"],
    faq: [
      { q: "Bunganya bisa diganti warnanya?", a: "Setiap tema punya 4 varian palet yang bisa dipilih mulai paket Lengkap. Pilih yang paling dekat dengan dekorasi acara kalian." },
      { q: "Apakah tema floral berat dibuka di HP?", a: "Tidak. Gambar dioptimalkan supaya tetap cepat dibuka, bahkan dengan sinyal yang kurang bagus." },
    ],
  },
  islami: {
    heading: "Undangan Pernikahan Digital Tema Islami",
    intro:
      "Tema islami memadukan ornamen geometri dan tata letak yang santun, lengkap dengan bagian ayat dan doa. Cocok untuk akad dan walimah yang ingin menonjolkan nilai keislaman dengan tampilan yang tetap modern.",
    fits: ["Akad nikah dan walimatul ursy", "Undangan yang menyertakan ayat dan doa pernikahan", "Keluarga yang ingin tampilan santun"],
    faq: [
      { q: "Ayatnya bisa diganti?", a: "Bisa. Teks Arab, arti, dan sumber ayat bisa diisi sendiri. Kalau dikosongkan, tema memakai QS. Ar-Rum ayat 21." },
      { q: "Bisa menampilkan jadwal akad dan resepsi terpisah?", a: "Bisa. Acara di hari atau tempat berbeda ditampilkan sebagai kartu masing-masing." },
    ],
  },
  adat: {
    heading: "Undangan Pernikahan Digital Tema Adat",
    intro:
      "Tema adat mengangkat budaya Nusantara, dari wayang Jawa sampai ulos Batak, ke dalam undangan digital. Cocok untuk pernikahan yang ingin tetap kental dengan tradisi keluarga.",
    fits: ["Pernikahan dengan rangkaian upacara adat", "Keluarga yang ingin tradisi tetap terasa di undangan", "Tamu dari keluarga besar lintas daerah"],
    faq: [
      { q: "Bisa menampilkan susunan acara adat?", a: "Bisa. Setiap acara, misalnya siraman atau resepsi, bisa ditulis dengan jam dan tempatnya sendiri." },
      { q: "Ada tema untuk adat daerah saya?", a: "Daftar tema adat terus bertambah. Kalau adat kalian belum ada, kirim contoh yang kalian suka lewat WhatsApp." },
    ],
  },
  game: {
    heading: "Undangan Pernikahan Digital Tema Game",
    intro:
      "Tema game mengubah undangan menjadi permainan kecil bergaya piksel. Tamu menjelajah, membuka cerita kalian, lalu sampai di detail acara, RSVP, dan amplop digital. Unik, seru, dan mudah dimainkan di HP.",
    fits: ["Pasangan yang suka game atau gaya retro", "Tamu muda yang senang hal interaktif", "Undangan yang ingin dibicarakan dan dibagikan"],
    faq: [
      { q: "Tamu yang tidak suka game tetap bisa membaca undangannya?", a: "Bisa. Kontrolnya sederhana, dan detail acara, RSVP, serta hadiah tetap mudah ditemukan." },
      { q: "Apakah tema game lebih mahal?", a: "Tidak. Tema game bisa dipakai di semua paket, mulai {harga}." },
    ],
  },
  vintage: {
    heading: "Undangan Pernikahan Digital Tema Vintage dan Retro",
    intro:
      "Tema vintage dan retro mengambil gaya foto film, tabloid lawas, dan warna yang sedikit pudar. Hasilnya undangan yang terasa personal dan penuh karakter.",
    fits: ["Pasangan yang suka gaya klasik atau nostalgia", "Konsep pernikahan bertema kota atau urban", "Foto prewedding bergaya film"],
    faq: [
      { q: "Foto saya harus bergaya vintage?", a: "Tidak harus, tapi foto dengan nuansa hangat atau hitam putih biasanya paling menyatu dengan tema ini." },
      { q: "Apakah tetap ada RSVP dan amplop digital?", a: "Ada. Semua fitur inti tetap tersedia di tema vintage dan retro." },
    ],
  },
  gelap: {
    heading: "Undangan Pernikahan Digital Tema Gelap",
    intro:
      "Tema gelap memakai latar malam, cahaya lilin, dan warna dalam yang dramatis. Cocok untuk resepsi malam atau pasangan yang ingin tampil beda dari undangan berlatar putih.",
    fits: ["Resepsi malam hari", "Konsep pernikahan yang dramatis dan intim", "Pasangan yang suka warna gelap"],
    faq: [
      { q: "Teksnya tetap mudah dibaca?", a: "Mudah. Warna teks dan latar dipilih supaya kontrasnya tetap nyaman dibaca, termasuk di layar HP." },
      { q: "Bisa dipakai untuk acara siang?", a: "Bisa. Tema gelap tetap cocok, hanya nuansanya lebih dramatis dibanding tema terang." },
    ],
  },
};

export const CHEAP_COPY = {
  heading: "Undangan Pernikahan Digital Murah, Mulai {harga}",
  intro:
    "Undangan digital tidak harus mahal. Di Sowanan, semua tema bisa dipakai di semua paket, termasuk paket termurah. Sekali bayar, tanpa biaya bulanan, dan undangan jadi dalam {waktu}.",
  points: [
    "Semua tema di katalog, termasuk tema game dan adat",
    "RSVP, peta lokasi, buku ucapan, dan amplop digital",
    "Sebar ke berapa pun tamu tanpa biaya tambahan",
    "Undangan tetap bisa dibuka setelah acara selesai",
  ],
  faq: [
    { q: "Kenapa bisa semurah itu?", a: "Kalian cukup kirim data lewat WhatsApp, lalu kami isi ke tema yang sudah jadi. Tidak ada biaya cetak, kirim, maupun desain dari nol." },
    { q: "Apakah semua tema bisa dipakai di paket termurah?", a: "Bisa. Semua tema di katalog tersedia di semua paket, mulai {harga}." },
    { q: "Ada biaya tambahan setelah bayar?", a: "Tidak ada biaya bulanan atau perpanjangan. Biaya tambahan hanya untuk add-on yang kalian pilih sendiri, seperti tambahan foto atau musik pilihan." },
  ],
};
