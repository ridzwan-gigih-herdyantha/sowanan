# Design Plan: CTA penutup dan footer homepage

**Konsep: "Ujung undangan, awal percakapan"**

CTA dan footer adalah halaman terakhir yang dilihat calon klien sebelum memutuskan chat. Sekarang keduanya hanya satu kalimat, satu tombol, dan satu baris tautan. Tugas barunya:

- **CTA** memberi alasan konkret untuk chat sekarang. Produknya ikut ditunjukkan, bukan hanya diceritakan.
- **Footer** menjadi peta situs kecil, sekaligus menambah tautan internal ke kelima undangan contoh (saran dari audit SEO).

Audiens: pasangan atau keluarga yang sudah scroll sampai bawah. Mereka sudah tertarik, tinggal ragu soal harga, waktu, dan kecepatan dibalas.

## Referensi dan yang diambil

| Situs | Diambil | Tidak diambil |
|---|---|---|
| Invitato | CTA dibagi dua: teks di kiri, visual di kanan. Footer berkolom dengan baris bawah. | Foto acara stok. Sowanan memakai sampul tema sendiri, karena itu produknya. |
| Merariq | Dua tombol (chat dan lihat tema), dan poin kepercayaan di bawah tombol. | Kartu putih mengambang dengan ornamen sudut. |
| Our Wedding Link | Kolom kontak berisi alamat yang bisa diklik langsung. | Kolom yang tidak relevan (produk lain, login, reseller). |

## Palette

Tidak menambah warna. Memakai token merek yang sudah ada, supaya bagian bawah menyatu dengan halaman di atasnya.

| Nama | Hex | Peran |
|---|---|---|
| Wine | `#7C2B3E` | Latar CTA, sama dengan sekarang. Warna paling kuat di halaman, jadi dipakai untuk ajakan terakhir. |
| Wine dark | `#5E1E2D` | Teks tombol utama, garis pemisah di atas wine |
| Paper | `#F3EDE7` | Tombol utama (latar), teks judul di atas wine (kontras 8,0) |
| Night | `#2A2320` | Latar footer, lebih hangat daripada hitam murni |
| Dusk light | `#DCD1C8` | Teks tautan footer, kontras 10,3 terhadap Night |
| Dusk | `#A6968B` | Label kolom dan teks kecil footer, kontras 5,4 terhadap Night |

## Type

Tetap dua typeface yang sudah dipakai homepage.

| Typeface | Peran | Ukuran |
|---|---|---|
| Cormorant Garamond | Judul CTA, nama merek di footer | Judul CTA `clamp(36px, 5vw, 56px)`, merek 24px |
| Jost | Teks CTA, poin, tautan, label | Teks CTA 17px, poin 15px, tautan footer 15px, label kolom 13px |

Label kolom footer memakai huruf biasa (bukan kapital semua), supaya tidak jatuh ke pola eyebrow kapital yang ada di mana-mana.

## Layout

### CTA

Satu kalimat konsep: **teks ajakan di kiri, tiga sampul tema yang ditumpuk seperti kartu undangan di kanan.** Yang terlihat terakhir sebelum chat adalah produknya sendiri.

```
Desktop (>= 980px), latar wine
+----------------------------------------------------------------+
|                                                                |
|  Tanggal acaranya kapan?                    .-----.            |
|                                         .-----.   |           |
|  Chat saja dulu, belum harus memesan.   |  .-----. |           |
|  Kami balas dalam 1 jam di jam ...      |  |     | |           |
|                                         |  | tema| |           |
|  [ (wa) Chat WhatsApp ] [ Lihat tema ]  '--|     |-'           |
|                                            '-----'             |
|  Mulai Rp49.000    Jadi 1 sampai 7 hari kerja    Tanpa batas tamu |
|                                                                |
+----------------------------------------------------------------+

Mobile (375px)
+---------------------------+
| Tanggal acaranya kapan?   |
| Chat saja dulu, ...       |
| [ (wa) Chat WhatsApp    ] |
| [ Lihat pilihan tema    ] |
| Mulai Rp49.000            |
| Jadi 1 sampai 7 hari kerja|
| Tanpa batas tamu          |
|      .---.---.---.        |  tiga sampul lebih kecil,
|      | tema tumpuk |      |  di bawah, rata tengah
|      '---'---'---'        |
+---------------------------+
```

- Rata kiri untuk teks, sama dengan section lain di homepage.
- Sampul tema diambil dari data tema di Pengaturan (tiga tema aktif pertama), sampul tengah lebih besar di depan. Seluruh tumpukan adalah satu tautan ke bagian pilihan tema, karena di sana semua tema bisa dibandingkan sebelum membuka demonya.
- Tombol WhatsApp memakai ikon WhatsApp, bukan panah.
- Tiga poin ditulis polos, dipisah jarak, tanpa titik tengah dan tanpa ikon centang.

### Footer

Satu kalimat konsep: **peta kecil berisi merek, isi halaman, contoh undangan, dan cara menghubungi.**

```
Desktop, latar night
+----------------------------------------------------------------+
|  [logo] Sowanan         Jelajahi        Contoh undangan  Hubungi|
|  Undangan pernikahan    Pilihan tema    Senja Kota      +62 858-|
|  digital, Semarang      Fitur           Ruang           @sowanan|
|  Dibuat oleh ...        Harga           Herbarium       08.00 s |
|                         Cara pesan      Pakeliran       Semarang|
|                         Tanya jawab     Sakinah                 |
|----------------------------------------------------------------|
|  (c) 2026 Sowanan                                    Ketentuan  |
+----------------------------------------------------------------+

Mobile: merek di atas, lalu Jelajahi dan Contoh undangan berdampingan
(dua kolom), Hubungi di bawahnya, lalu baris bawah. Baris bawah diberi
ruang di kanan supaya tidak tertutup tombol WhatsApp melayang.
```

- Tautan Jelajahi menuju anchor yang sudah ada (`#tema`, `#fitur`, `#harga`, `#cara`, `#tanya`), dengan label dari judul section di Pengaturan.
- Contoh undangan menuju `/andi-rina` dan seterusnya, dengan nama dari data tema di Pengaturan.
- Hubungi berisi nomor WA (bisa diklik), Instagram, email (kalau diisi), jam layanan, dan kota. Semuanya dari Pengaturan Kontak.

## Teks yang perlu ditambah ke Pengaturan

Halaman Pengaturan menjanjikan tidak ada teks yang tertanam di kode. Isian baru di tab Beranda, kartu Penutup:

| Isian | Contoh bawaan | Catatan |
|---|---|---|
| Label tombol kedua | Lihat pilihan tema | Menuju `#tema` |
| Tiga poin | `Mulai {harga}`, `Jadi dalam {waktu}`, `Tanpa batas jumlah tamu` | Boleh memakai kata pengganti, jadi ikut berubah kalau harga atau waktu berubah |
| Label kolom footer | Jelajahi, Contoh undangan, Hubungi | |

Semua isian baru punya nilai bawaan, jadi pengaturan yang tersimpan sekarang tetap valid tanpa perlu disimpan ulang.

## Motion moment

Homepage sudah punya momen utama di hero. CTA tidak menambah orkestrasi baru:

- Masuk ke layar memakai `reveal()` yang sama dengan section lain, supaya konsisten.
- Satu-satunya gerak baru dipicu pengguna: saat kursor di atas tumpukan sampul, ketiganya sedikit membuka seperti kipas (rotate dan translate, 180ms, ease-out). Ini menjelaskan bahwa sampul bisa diklik.
- Reduced motion: kipas tidak bergerak, posisi tetap terbuka sedikit.

## Lottie

Tidak ada. Visual utama sudah dari sampul tema, dan menambah Lottie di sini hanya akan menjadi dekorasi.

## Review rencana sendiri

| Bagian | Default untuk brief apa pun? | Keputusan |
|---|---|---|
| Palette | Tidak, memakai token merek Sowanan | Tetap |
| Type | Tidak, memakai pasangan homepage yang sudah ada | Tetap |
| CTA dibagi dua dengan foto | Ya, kalau fotonya stok | **Diganti**: visual kanan adalah sampul tema Sowanan sendiri |
| Poin kepercayaan dengan ikon centang | Ya, pola umum | **Diganti**: tulisan polos dari data harga dan waktu sungguhan |
| Label kolom kapital semua | Ya | **Diganti**: huruf biasa |
| Footer berkolom | Pola umum, tapi isinya spesifik (contoh undangan, kontak sungguhan) | Tetap |
