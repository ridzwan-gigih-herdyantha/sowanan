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
    "harga",
    "Paket dan harga",
    `
Kami menyediakan tiga paket.

### Dasar (Rp49.000)

Satu tema pilihan Anda dari katalog, ditampilkan apa adanya. Galeri hingga 3 foto. Musik latar bawaan tema. Peta lokasi, hitung mundur, RSVP, buku ucapan, amplop digital, dan penyebaran tanpa batas jumlah tamu.

### Lengkap (Rp199.000)

Seluruh isi paket Dasar, dengan warna tema disesuaikan palet acara Anda. Galeri hingga 15 foto. Musik latar pilihan sendiri, cerita perjalanan, dan nama tamu yang muncul di undangan.

### Istimewa (Rp499.000)

Seluruh isi paket Lengkap, tanpa batas jumlah foto galeri, ditambah daftar tamu yang bisa diunduh ke Excel dan QR absensi tamu di lokasi. Pada paket ini Anda dapat meminta hingga 2 bagian tambahan yang belum ada di tema, atau meminta tema baru yang kami rancang khusus untuk Anda.

Bagian tambahan yang dimaksud adalah bagian yang menampilkan isi, misalnya denah lokasi, susunan acara, profil keluarga, atau informasi akomodasi. Permintaan yang memerlukan sistem baru, misalnya pemilihan kursi, undian, atau metode pembayaran di luar yang kami sediakan, tidak termasuk dalam paket ini dan akan kami tawarkan sebagai pekerjaan tersendiri.

Tema baru yang kami rancang untuk paket Istimewa dapat kami tambahkan ke katalog tema Sowanan setelah acara Anda selesai, dengan seluruh nama, foto, dan data acara Anda dihapus lebih dulu.

Harga di atas berlaku sekali bayar. Tidak ada biaya bulanan dan tidak ada biaya perpanjangan.
`,
  ),
  article(
    "bayar",
    "Pembayaran",
    `
Paket Dasar dibayar lunas di muka.

Paket Lengkap dan Istimewa dibayar dengan uang muka {dp} persen, dan sisanya dilunasi sebelum undangan dilepas tanpa watermark.

Pembayaran melalui transfer bank atau QRIS ke rekening yang kami sebutkan saat pemesanan. Pengerjaan dimulai setelah pembayaran yang disyaratkan kami terima.
`,
  ),
  article(
    "waktu",
    "Waktu pengerjaan",
    `
Waktu pengerjaan dihitung dalam hari kerja, terhitung setelah dua hal terpenuhi: data undangan yang lengkap kami terima, dan pembayaran yang disyaratkan masuk.

Pesanan dikerjakan berurutan sesuai waktu masuk. Pesanan yang masuk setelah pukul 15.00 dihitung mulai hari kerja berikutnya.

Jam kerja kami pukul 08.00 sampai 17.00, Senin sampai Sabtu. Hari Minggu dan hari libur nasional tidak dihitung sebagai hari kerja.

Waktu pengerjaan per paket:

- Dasar: 1 hari kerja
- Lengkap: 2 sampai 3 hari kerja
- Istimewa: 3 sampai 7 hari kerja

Permintaan revisi setelah undangan kami kirim dikerjakan berurutan juga, dan tidak termasuk dalam waktu pengerjaan di atas.
`,
  ),
  article(
    "revisi",
    "Revisi",
    `
**Dasar** mendapat 1 putaran revisi. Satu putaran berarti Anda mengumpulkan seluruh perubahan yang diinginkan dan mengirimkannya sekaligus. Revisi tambahan di luar itu dikenakan biaya yang kami sampaikan lebih dulu.

**Lengkap** mendapat revisi bebas sampai undangan Anda sebar.

**Istimewa** mendapat revisi bebas sampai undangan Anda sebar, ditambah 2 putaran revisi atas rancangan desain. Pada paket ini kami mengirim satu konsep desain lebih dulu, dan Anda dapat memintanya diubah dua kali sebelum kami lanjutkan ke pengerjaan.

Penggantian tema dapat dilakukan sebelum pengerjaan dimulai. Setelah pengerjaan dimulai, penggantian tema dihitung sebagai revisi.

Revisi mencakup perubahan isi dan tampilan dalam lingkup paket yang Anda beli. Permintaan yang keluar dari lingkup paket akan kami sampaikan sebagai penawaran terpisah, bukan ditolak begitu saja.
`,
  ),
  article(
    "aktif",
    "Arsip permanen",
    `
Undangan Anda tidak memiliki masa aktif dan tidak akan kami hapus.

Tiga puluh hari setelah tanggal acara, undangan berhenti menerima perubahan dan berubah menjadi arsip. Isinya tetap dapat dibuka siapa pun di alamat yang sama, selamanya, tanpa biaya tambahan.

Yang tetap ada pada arsip: nama mempelai, tanggal dan lokasi acara, peta, cerita, galeri foto, musik latar, dan ucapan yang sudah masuk.

Yang berhenti berfungsi pada arsip: panel ubah data, formulir RSVP, pengiriman ucapan baru, amplop digital, hitung mundur, dan tautan berisi nama tamu.

Tujuh hari sebelum undangan menjadi arsip, kami mengirimkan pemberitahuan beserta salinan daftar tamu dan rekap ucapan dalam bentuk berkas yang dapat Anda simpan.

Arsip permanen berlaku untuk undangan yang beralamat di sowanan.com. Undangan yang memakai domain milik Anda sendiri bergantung pada perpanjangan domain tersebut, yang berada di luar kendali kami.

Kami dapat memindahkan arsip ke alamat baru selama isinya tetap dapat diakses, dan akan memberi tahu Anda lebih dulu apabila itu terjadi. Apabila suatu saat layanan Sowanan berhenti beroperasi, kami memberi pemberitahuan sekurang-kurangnya 90 hari sebelumnya agar Anda sempat mengunduh arsip Anda.
`,
  ),
  article(
    "alamat",
    "Alamat undangan",
    `
Undangan Anda beralamat di sowanan.com diikuti nama yang Anda pilih, selama nama tersebut belum dipakai pemesan lain.

Apabila Anda menambahkan domain sendiri, domain tersebut kami daftarkan atas nama Anda, bukan atas nama Sowanan. Harga add-on sudah termasuk biaya pendaftaran untuk satu tahun pertama beserta pemasangannya.

Mulai tahun kedua, perpanjangan domain dilakukan langsung oleh Anda ke penyedia domain, dan biayanya mengikuti harga yang berlaku di sana. Apabila domain tidak diperpanjang, undangan Anda tetap dapat diakses di alamat sowanan.com seperti semula.
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
    "Isi undangan dan penggunaan sebagai contoh",
    `
Isi undangan sepenuhnya milik Anda. Anda bertanggung jawab atas kebenaran data acara dan atas hak pakai foto serta musik yang Anda kirimkan kepada kami.

Kami dapat menampilkan undangan Anda sebagai contoh karya di sowanan.com dan di media sosial Sowanan, setelah acara Anda selesai, dengan dua ketentuan.

Pertama, buku ucapan dan daftar RSVP disembunyikan pada versi yang ditampilkan sebagai contoh, sehingga nama dan pesan dari tamu Anda tidak ikut dipublikasikan.

Kedua, Anda dapat meminta undangan Anda dicabut dari halaman contoh kapan saja, dan kami akan mencabutnya tanpa menanyakan alasan. Pencabutan ini tidak memengaruhi arsip permanen Anda, yang tetap dapat diakses seperti biasa.
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
    harga: {
      title: "Harga",
      sub: "Bayar sekali, tidak ada biaya bulanan dan tidak ada biaya perpanjangan. Undangan tidak punya masa aktif: setelah acara selesai ia tersimpan permanen dan tetap bisa dibuka di alamat yang sama.",
      foot: "Butuh yang di luar ketiga paket ini, misalnya fitur khusus atau rangkaian acara yang panjang? [Ceritakan rencananya lewat WhatsApp]({wa_link}), kami buatkan penawaran tersendiri.",
    },
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
  footer: { line1: "Undangan pernikahan digital · {kota}", line2: "" },
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
    date: "5 Oktober 2026",
    title: "Syarat dan Ketentuan",
    intro:
      "Dokumen ini menjelaskan bagaimana layanan Sowanan bekerja: apa yang kami kerjakan, apa yang menjadi tanggung jawab Anda, dan apa yang terjadi bila ada perubahan. Dengan memesan undangan di Sowanan, Anda dianggap telah membaca dan menyetujui ketentuan di halaman ini.",
    articles: ARTICLES,
  },
  packages: {
    dasar: { on: true, price: 49000, badge: "", blurb: "Yang penting undangan cepat tersebar", sla: 1, revision: "1 putaran", active: 3 },
    lengkap: { on: true, price: 199000, badge: "Rekomendasi kami", blurb: "Disesuaikan dengan tema acara kalian", sla: 2, slaMax: 3, revision: "Bebas", active: 12 },
    istimewa: { on: true, price: 499000, badge: "", blurb: "Dirancang mengikuti permintaan kalian", sla: 3, slaMax: 7, revision: "Bebas", active: 12 },
  },
  matrix: [
    { id: "katalog", label: "Bebas pilih satu tema dari katalog", kind: "check", unit: "", key: "", cells: all },
    { id: "warna", label: "Warna tema disesuaikan palet acara", kind: "check", unit: "", key: "warna_tema", cells: cells(false, true, true) },
    { id: "modif", label: "Tema dimodifikasi atau dirancang baru", kind: "check", unit: "", key: "", cells: cells(false, false, true) },
    {
      id: "bagian",
      label: "Bagian tambahan di luar tema",
      kind: "count",
      unit: "sampai {n} bagian",
      key: "",
      cells: { dasar: { on: false, n: null }, lengkap: { on: false, n: null }, istimewa: { on: true, n: 2 } },
    },
    {
      id: "galeri",
      label: "Galeri foto",
      kind: "count",
      unit: "{n} foto",
      key: "galeri_foto",
      cells: { dasar: { on: true, n: 3 }, lengkap: { on: true, n: 15 }, istimewa: { on: true, n: null } },
    },
    { id: "musik", label: "Musik latar bawaan tema", kind: "check", unit: "", key: "", cells: all },
    { id: "musik2", label: "Musik latar pilihan sendiri", kind: "check", unit: "", key: "musik_sendiri", cells: cells(false, true, true) },
    { id: "cerita", label: "Cerita perjalanan kalian", kind: "check", unit: "", key: "cerita", cells: cells(false, true, true) },
    { id: "nama", label: "Nama tamu muncul di undangan", kind: "check", unit: "", key: "nama_tamu", cells: cells(false, true, true) },
    { id: "peta", label: "Peta lokasi dan hitung mundur", kind: "check", unit: "", key: "", cells: all },
    { id: "rsvp", label: "RSVP dan buku ucapan", kind: "check", unit: "", key: "", cells: all },
    { id: "amplop", label: "Amplop digital", kind: "check", unit: "", key: "", cells: all },
    { id: "sebar", label: "Sebar tanpa batas jumlah tamu", kind: "check", unit: "", key: "", cells: all },
    { id: "desain", label: "Revisi desain, 2 putaran", kind: "check", unit: "", key: "", cells: cells(false, false, true) },
    { id: "excel", label: "Daftar tamu diunduh ke Excel", kind: "check", unit: "", key: "ekspor_excel", cells: cells(false, false, true) },
    { id: "qr", label: "QR absensi tamu di lokasi", kind: "check", unit: "", key: "", cells: cells(false, false, true) },
    { id: "arsip", label: "Arsip permanen setelah acara", kind: "check", unit: "", key: "", cells: all },
  ],
  // Add-on lama yang tidak dijual lagi disembunyikan, bukan dihapus, supaya undangan yang sudah membelinya tetap terhitung.
  addons: [
    { id: "foto", on: true, name: "Tambah 10 foto galeri", price: 25000, scope: "Dasar dan Lengkap", unlock: "galeri_foto", amount: 10 },
    { id: "musik", on: true, name: "Musik latar pilihan sendiri", price: 25000, scope: "Dasar", unlock: "musik_sendiri", amount: 0 },
    { id: "gaya", on: true, name: "Ganti font atau palet warna", price: 35000, scope: "Dasar", unlock: "warna_tema", amount: 0 },
    { id: "domainmyid", on: true, name: "Alamat domain sendiri (.my.id)", price: 99000, scope: "Atas nama kalian, termasuk pendaftaran 1 tahun", unlock: "", amount: 0 },
    { id: "domain", on: true, name: "Alamat domain sendiri (.com)", price: 299000, scope: "Atas nama kalian, termasuk pendaftaran 1 tahun", unlock: "", amount: 0 },
    { id: "excel", on: false, name: "Ekspor daftar tamu ke Excel", price: 50000, scope: "Lengkap", unlock: "ekspor_excel", amount: 0 },
    { id: "kilat", on: false, name: "Pengerjaan kilat 24 jam", price: 99000, scope: "Dasar dan Lengkap", unlock: "", amount: 0 },
    { id: "perpanjang", on: false, name: "Perpanjangan masa aktif 1 tahun", price: 50000, scope: "Semua paket", unlock: "", amount: 0 },
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
    note: "Paket Dasar dibayar lunas di muka. Paket Lengkap dan Istimewa dengan uang muka {dp} persen, dilunasi sebelum undangan dilepas tanpa watermark. **Waktu pengerjaan dihitung setelah data lengkap dan pembayaran masuk.** Pesanan yang masuk setelah pukul 15.00 dihitung mulai hari kerja berikutnya.",
  },
};
