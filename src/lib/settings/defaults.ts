import type { Settings } from "./schema";

const cells = (dasar: boolean, lengkap: boolean, istimewa: boolean) => ({
  dasar: { on: dasar, n: null },
  lengkap: { on: lengkap, n: null },
  istimewa: { on: istimewa, n: null },
});
const all = cells(true, true, true);

const article = (id: string, title: string, body: string) => ({ id, on: true, title, body: body.trim() });

const ARTICLES = [
  article(
    "pesan",
    "Cara memesan",
    `
Seluruh pemesanan dilakukan lewat WhatsApp. Urutannya:

- Anda menghubungi kami dan memilih paket serta tema
- Kami kirim formulir isian data acara
- Anda melunasi DP dan mengirim data serta foto secara lengkap
- Kami mengabari bahwa data sudah lengkap dan pengerjaan dimulai
- Draf undangan dikirim dalam bentuk tautan
- Setelah revisi selesai dan pembayaran lunas, undangan siap disebar

Data yang dianggap lengkap meliputi nama kedua mempelai, nama orang tua, susunan dan waktu acara, alamat beserta titik lokasi, foto, serta nomor rekening untuk amplop digital bila dipakai.
`,
  ),
  article(
    "bayar",
    "Pembayaran",
    `
- Pembayaran melalui transfer bank atau QRIS ke rekening atas nama **{rekening_nama}**
- DP sebesar {dp}% dari total pesanan dibayar di awal. Pengerjaan dimulai setelah DP diterima
- Sisa pembayaran dilunasi setelah draf undangan Anda setujui
- Pembayaran dianggap sah setelah bukti transfer dikirim ke WhatsApp yang sama

> **Undangan yang belum lunas menampilkan tanda "SOWANAN.COM".**
>
> Selama pelunasan belum diterima, undangan tetap bisa Anda buka dan periksa, tetapi menampilkan tanda melintang di layar sehingga belum layak disebar ke tamu. Tanda tersebut kami hapus segera setelah pelunasan diterima, pada jam layanan.
`,
  ),
  article(
    "waktu",
    "Waktu pengerjaan",
    `
Waktu pengerjaan dihitung sejak kami mengabari Anda bahwa data sudah lengkap dan pengerjaan dimulai, bukan sejak pemesanan atau sejak DP diterima. Selama data masih kurang, hitungan belum berjalan.

- Hari kerja adalah Senin sampai Sabtu, di luar hari libur nasional
- Bila antrean sedang penuh, kami memberitahukan perkiraan waktu yang lebih panjang sebelum Anda melunasi DP, bukan setelahnya
- Pengerjaan kilat 24 jam tersedia sebagai tambahan dan memotong antrean
`,
  ),
  article(
    "revisi",
    "Revisi",
    `
**Anda bebas mengajukan revisi** sampai undangan disebar, atau sampai 14 hari sejak draf pertama dikirim, mana yang lebih dahulu tercapai.

### Satu revisi berarti satu kali kirim daftar perubahan

Kumpulkan dulu seluruh perubahan yang Anda inginkan dalam satu daftar, lalu kirim sekaligus. Kami kerjakan seluruhnya dalam satu putaran. Cara ini membuat pengerjaan lebih cepat dibandingkan mengirim perubahan satu per satu.

### Yang termasuk revisi

- Perubahan teks: nama, gelar, susunan acara, waktu, alamat
- Ganti atau tambah foto sesuai jumlah yang tersedia di paket
- Ganti titik lokasi, nomor rekening, dan tautan
- Penyesuaian warna, untuk paket yang menyediakannya

### Yang tidak termasuk revisi

- Ganti tema setelah draf disetujui. Ini dihitung sebagai pesanan baru
- Perubahan tata letak, ukuran, dan susunan bagian dari tema
- Penyuntingan foto seperti retouch, ganti latar, atau penggabungan gambar
- Penambahan fitur yang tidak ada di paket Anda

Revisi diterima dan dikerjakan pada jam layanan, setiap hari pukul {jam} WIB.
`,
  ),
  article(
    "aktif",
    "Masa aktif dan arsip",
    `
Masa aktif adalah periode undangan Anda dapat diakses penuh oleh tamu, dihitung sejak tautan undangan kami serahkan kepada Anda. Lamanya mengikuti paket yang dipilih.

Setelah masa aktif berakhir, undangan **tidak dihapus**. Undangan berubah menjadi arsip: halaman tetap bisa dibuka dan dibaca, sementara konfirmasi kehadiran dan buku ucapan ditutup. Data tamu yang sudah terkumpul tetap dapat Anda minta.

Masa aktif dapat diperpanjang kapan saja dengan biaya Rp 50.000 per tahun.

Ketentuan arsip ini berlaku selama layanan Sowanan beroperasi.
`,
  ),
  article(
    "alamat",
    "Alamat undangan",
    `
Setiap undangan memiliki alamat berupa sowanan.com diikuti nama yang Anda pilih, misalnya sowanan.com/andi-rina.

> **Alamat undangan tidak dapat diubah setelah draf disetujui.** Setelah tautan tersebar ke tamu, mengubahnya berarti seluruh tautan lama tidak lagi berfungsi. Pastikan alamat sudah sesuai sebelum Anda menyetujui draf.

Beberapa nama tidak dapat dipakai karena digunakan sistem kami. Bila nama pilihan Anda termasuk di dalamnya, kami akan menawarkan alternatif.
`,
  ),
  article(
    "musik",
    "Musik latar",
    `
Kami menyediakan daftar lagu bebas royalti yang aman dipakai. Bila Anda mengirim lagu sendiri, Anda menyatakan memiliki hak atau izin untuk menggunakannya.

Bila di kemudian hari ada gugatan hak cipta atas lagu yang Anda kirim, kami akan menonaktifkan lagu tersebut dari undangan Anda. Undangan tetap berjalan normal tanpa musik.
`,
  ),
  article(
    "data",
    "Data tamu dan kerahasiaan",
    `
- Konfirmasi kehadiran dan buku ucapan mengumpulkan nama tamu, jumlah kehadiran, dan pesan yang mereka tulis
- Data tersebut milik Anda. Kami tidak menjual, membagikan, atau menggunakannya untuk keperluan lain
- Anda dapat meminta salinan atau penghapusan data tamu kapan saja
- Pesan dan ucapan yang ditulis tamu bersifat terbuka dan dapat dilihat pengunjung lain undangan Anda
- Data pemesanan Anda kami simpan selama diperlukan untuk menjalankan layanan
`,
  ),
  article(
    "isi",
    "Isi undangan",
    `
Seluruh isi undangan berasal dari data yang Anda kirimkan. Kebenaran nama, gelar, tanggal, waktu, dan alamat menjadi tanggung jawab Anda, termasuk kesalahan yang baru disadari setelah undangan disebar.

Dengan mengirimkan foto, Anda menyatakan berhak menggunakannya. Kami dapat menolak pesanan yang isinya melanggar hukum, mengandung penipuan, atau memakai identitas pihak lain tanpa izin.

Kami tidak menampilkan undangan klien sebagai contoh di halaman mana pun tanpa izin Anda.
`,
  ),
  article(
    "batal",
    "Pembatalan",
    `
- Dibatalkan sebelum pengerjaan dimulai: DP dikembalikan penuh
- Dibatalkan setelah draf dikerjakan: DP tidak dapat dikembalikan, karena pekerjaan sudah berjalan
- Setelah pelunasan, pembayaran tidak dapat dikembalikan

Bila acara Anda ditunda, undangan tidak perlu dipesan ulang. Perubahan tanggal termasuk revisi biasa selama masih dalam masa aktif.
`,
  ),
  article(
    "batas",
    "Batas tanggung jawab",
    `
Kami berusaha menjaga undangan Anda dapat diakses sepanjang masa aktif. Namun gangguan yang berada di luar kendali kami, seperti gangguan penyedia server, jaringan internet, atau keadaan kahar, berada di luar tanggung jawab kami.

Bila terjadi gangguan, kami memperbaikinya secepat mungkin dan memperpanjang masa aktif undangan Anda selama durasi gangguan tersebut.

Tanggung jawab kami atas kerugian apa pun terbatas pada nilai yang telah Anda bayarkan untuk pesanan tersebut.
`,
  ),
  article(
    "ubah",
    "Perubahan ketentuan",
    `
Ketentuan ini dapat kami perbarui sewaktu-waktu. Ketentuan yang berlaku bagi pesanan Anda adalah yang tercantum pada saat pemesanan dilakukan. Tanggal berlaku versi terbaru selalu tertulis di bagian atas halaman ini.
`,
  ),
  article(
    "kontak",
    "Menghubungi kami",
    `
Pertanyaan mengenai ketentuan ini, atau permintaan terkait data Anda, dapat dikirim ke WhatsApp kami di [{wa}]({wa_link}), setiap hari pukul {jam} WIB.
`,
  ),
];

export const DEFAULT_SETTINGS: Settings = {
  version: 2,
  hero: {
    eyebrow: "Kabarnya sampai dulu, sebelum tamunya datang",
    title: "Undangan nikah digital, mulai {harga}.",
    sub: "Kirim nama, tanggal, lokasi, dan foto lewat WhatsApp. Undangan kalian jadi dalam {waktu}, tinggal disebar ke semua tamu.\n\nSudah termasuk peta lokasi, RSVP, buku ucapan, dan amplop digital. Tanpa biaya tambahan.",
    cta1: "Pesan lewat WhatsApp",
    cta1Href: "",
    cta2: "Lihat pilihan tema",
    cta2Href: "#tema",
    note: "Dibalas dalam 1 jam, jam {jam} · Bisa disebar ke berapa pun tamu",
  },
  sections: {
    tema: {
      title: "Pilihan tema",
      sub: "Pilih satu, lalu warnanya kami sesuaikan dengan tema acara kalian. Klik untuk membuka contoh aslinya.",
      foot: "Mau gaya yang belum ada di sini? [Kirim contohnya lewat WhatsApp]({wa_link}), kami buatkan.",
    },
    fitur: { title: "Fitur yang tersedia", sub: "Sebagian besar fitur ada di semua paket. Yang berlabel hanya tersedia di paket tertentu." },
    harga: { title: "Harga", sub: "Bayar sekali, tidak ada biaya bulanan. Tautan undangan dan hosting sudah termasuk selama masa aktif." },
    addon: { title: "Tambahan di luar paket", sub: "Bisa ditambahkan saat memesan. Sebutkan saja lewat WhatsApp." },
    cara: { title: "Cara pesan", sub: "" },
    faq: { title: "Yang sering ditanyakan", sub: "" },
  },
  features: [
    { id: "rsvp", on: true, name: "Konfirmasi kehadiran", text: "Tamu klik hadir atau tidak, dan kalian bisa lihat daftarnya kapan saja.", icon: "centang", label: "" },
    { id: "peta", on: true, name: "Peta lokasi", text: "Sekali ketuk langsung membuka rute di Google Maps tamu.", icon: "peta", label: "" },
    { id: "amplop", on: true, name: "Amplop digital", text: "Rekening dan QRIS dengan tombol salin, supaya tamu tidak salah ketik.", icon: "amplop", label: "" },
    { id: "galeri", on: true, name: "Galeri foto", text: "Foto prewedding ditata rapi dan tetap ringan waktu dibuka.", icon: "foto", label: "Paket Lengkap ke atas" },
    { id: "ucapan", on: true, name: "Buku ucapan", text: "Tamu menulis doa dan ucapan langsung di halaman undangan.", icon: "pesan", label: "" },
    { id: "mundur", on: true, name: "Hitung mundur", text: "Berjalan otomatis sampai hari H, plus tombol simpan ke kalender.", icon: "jam", label: "" },
    { id: "musik", on: true, name: "Musik latar", text: "Pilih lagunya sendiri, dan tamu tetap bisa mematikannya.", icon: "musik", label: "Paket Lengkap ke atas" },
    { id: "sebar", on: true, name: "Sebar tanpa batas", text: "Satu link untuk semua tamu, tanpa batas jumlah tamu.", icon: "bagikan", label: "" },
    { id: "tamu", on: true, name: "Nama tamu di undangan", text: "Setiap tamu disapa dengan namanya sendiri begitu undangan dibuka.", icon: "orang", label: "Paket Lengkap ke atas" },
    { id: "link", on: true, name: "Nama link sendiri", text: "Alamatnya sowanan.com/nama-kalian, bukan deretan angka acak.", icon: "tautan", label: "" },
  ],
  steps: [
    { id: "chat", title: "Chat WhatsApp", text: "Sebutkan tanggal acara dan tema yang dipilih. Kami bantu kalau masih bingung." },
    { id: "data", title: "Kirim data", text: "Nama, susunan acara, lokasi, dan foto. Ada formulir isian supaya tidak ada yang terlewat." },
    { id: "cek", title: "Cek dan revisi", text: "Dalam {waktu} kalian terima link draf. Kabari bagian mana yang mau diubah." },
    { id: "sebar", title: "Sebar", text: "Link siap dibagikan ke semua tamu lewat WhatsApp, IG, atau di mana saja." },
  ],
  closing: {
    title: "Tanggal acaranya kapan?",
    text: "Chat saja dulu, belum harus memesan. Kami balas dalam 1 jam di jam {jam}.",
    button: "Chat WhatsApp",
  },
  footer: { line1: "Undangan pernikahan digital · {kota}", line2: "Dibuat oleh Nine Dragon Labs" },
  themes: [
    { id: "senja", on: true, name: "Senja Kota", slug: "andi-rina", demo: "/andi-rina", tier: "semua", style: "film / urban", image: "/img/tema-andi-rina.webp" },
    { id: "ruang", on: true, name: "Ruang", slug: "bagas-sekar", demo: "/bagas-sekar", tier: "semua", style: "monokrom / minimalis", image: "/img/tema-bagas-sekar.webp" },
    { id: "herba", on: true, name: "Herbarium", slug: "hendrawan-larasati", demo: "/hendrawan-larasati", tier: "lengkap", style: "bunga / botani", image: "/img/tema-hendrawan-larasati.webp" },
    { id: "kelir", on: true, name: "Pakeliran", slug: "danang-kinanthi", demo: "/danang-kinanthi", tier: "lengkap", style: "jawa / wayang", image: "/img/tema-danang-kinanthi.webp" },
    { id: "sakinah", on: true, name: "Sakinah", slug: "fadhil-nayla", demo: "/fadhil-nayla", tier: "lengkap", style: "islami / geometri", image: "/img/tema-fadhil-nayla.webp" },
  ],
  faq: [
    {
      id: "lama",
      on: true,
      q: "Berapa lama jadinya?",
      a: "Tergantung paket: {pengerjaan}. Hitungan dimulai sejak kami mengabari bahwa data dan foto sudah lengkap, bukan sejak pemesanan. Kalau antrean sedang penuh, kami kabari di awal, bukan setelah lewat.",
    },
    { id: "teknis", on: true, q: "Saya tidak paham teknis, bisa?", a: "Bisa. Kalian cukup kirim data lewat WhatsApp, sisanya kami yang kerjakan sampai link siap sebar." },
    {
      id: "aktif",
      on: true,
      q: "Link-nya aktif sampai kapan?",
      a: "Paket {masa_aktif}, dihitung sejak tautan undangan kami serahkan. Setelah itu undangan menjadi arsip yang tetap bisa dibuka selama layanan beroperasi. Ketentuan lengkapnya ada di [halaman ketentuan](/ketentuan).",
    },
    {
      id: "revisi",
      on: true,
      q: "Bisa revisi berapa kali?",
      a: "Bebas revisi sampai undangan disebar, atau 14 hari sejak draf pertama dikirim, mana yang lebih dulu. Kirim semua perubahan sekaligus dalam satu daftar supaya lebih cepat dikerjakan.",
    },
    { id: "tamu", on: true, q: "Bisa untuk berapa tamu?", a: "Tidak dibatasi. Satu link bisa disebar ke berapa pun tamu tanpa biaya tambahan." },
    { id: "tema", on: true, q: "Kalau mau ganti tema di tengah jalan?", a: "Masih bisa selama draf belum disetujui. Setelah disetujui, ganti tema dihitung pesanan baru." },
    {
      id: "bayar",
      on: true,
      q: "Cara bayarnya?",
      a: "DP {dp}% di awal, sisanya setelah draf disetujui. Transfer atau QRIS. Undangan yang belum lunas menampilkan tanda SOWANAN.COM dan belum bisa disebar.",
    },
  ],
  terms: {
    date: "30 September 2026",
    title: "Syarat dan Ketentuan",
    intro:
      "Dokumen ini menjelaskan bagaimana layanan Sowanan bekerja: apa yang kami kerjakan, apa yang menjadi tanggung jawab Anda, dan apa yang terjadi bila ada perubahan. Dengan memesan undangan di Sowanan, Anda dianggap telah membaca dan menyetujui ketentuan di halaman ini.",
    articles: ARTICLES,
  },
  packages: {
    dasar: { on: true, price: 49000, badge: "", blurb: "Yang penting undangan cepat tersebar", sla: 3, active: 3 },
    lengkap: { on: true, price: 149000, badge: "Rekomendasi kami", blurb: "Paling seimbang antara fitur dan harga", sla: 2, active: 12 },
    istimewa: { on: true, price: 299000, badge: "", blurb: "Paling cepat jadi, siap untuk hari H", sla: 1, active: 12 },
  },
  matrix: [
    { id: "tema", label: "Pilihan tema", kind: "count", key: "jumlah_tema", cells: all },
    { id: "warna", label: "Warna tema disesuaikan", kind: "check", key: "", cells: cells(false, true, true) },
    {
      id: "galeri",
      label: "Galeri foto",
      kind: "count",
      key: "galeri_foto",
      cells: { dasar: { on: true, n: 3 }, lengkap: { on: true, n: 15 }, istimewa: { on: true, n: null } },
    },
    { id: "musik", label: "Musik latar bawaan tema", kind: "check", key: "", cells: all },
    { id: "musik2", label: "Musik latar pilihan sendiri", kind: "check", key: "", cells: cells(false, true, true) },
    { id: "cerita", label: "Cerita perjalanan kalian", kind: "check", key: "", cells: cells(false, true, true) },
    { id: "nama", label: "Nama tamu muncul di undangan", kind: "check", key: "", cells: cells(false, true, true) },
    { id: "peta", label: "Peta lokasi dan hitung mundur", kind: "check", key: "", cells: all },
    { id: "rsvp", label: "RSVP dan buku ucapan", kind: "check", key: "", cells: all },
    { id: "amplop", label: "Amplop digital", kind: "check", key: "", cells: all },
    { id: "sebar", label: "Sebar tanpa batas jumlah tamu", kind: "check", key: "", cells: all },
    { id: "excel", label: "Daftar tamu diunduh ke Excel", kind: "check", key: "", cells: cells(false, false, true) },
    { id: "qr", label: "QR absensi tamu di lokasi", kind: "check", key: "", cells: cells(false, false, true) },
    { id: "revisi", label: "Revisi bebas sampai undangan disebar", kind: "check", key: "", cells: all },
  ],
  addons: [
    { id: "foto", on: true, name: "Tambah 10 foto galeri", price: 25000, scope: "Dasar dan Lengkap" },
    { id: "gaya", on: true, name: "Ganti font atau palet warna", price: 35000, scope: "Dasar" },
    { id: "musik", on: true, name: "Musik pilihan sendiri", price: 25000, scope: "Dasar" },
    { id: "excel", on: true, name: "Ekspor daftar tamu ke Excel", price: 50000, scope: "Lengkap" },
    { id: "kilat", on: true, name: "Pengerjaan kilat 24 jam", price: 99000, scope: "Dasar dan Lengkap" },
    { id: "domain", on: true, name: "Alamat domain sendiri (.com)", price: 150000, scope: "Semua paket, termasuk domain 1 tahun" },
    { id: "perpanjang", on: true, name: "Perpanjangan masa aktif 1 tahun", price: 50000, scope: "Semua paket" },
  ],
  contact: { wa: "6281234567890", instagram: "sowanan.id", email: "", city: "Semarang", open: "08:00", close: "20:00", days: "" },
  wa: {
    general: "Halo Sowanan, saya mau tanya soal undangan pernikahan digital.",
    plan: "Halo Sowanan, saya mau pesan paket {paket}. Acaranya tanggal ",
  },
  payment: {
    bank: "BCA",
    accountName: "Sowanan",
    accountNumber: "0000000000",
    dp: 50,
    qrisNmid: "",
    qrisImage: "",
    note: "Pembayaran dengan uang muka {dp} persen. Undangan dilepas tanpa watermark setelah pelunasan.",
  },
};
