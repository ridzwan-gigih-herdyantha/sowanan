# Design Plan: Undangan Contoh 3 `/hendrawan-larasati`

**Konsep: "Herbarium"**

Undangan yang terasa seperti buku arsip botani: spesimen bunga yang ditempel di atas kertas herbarium, dengan label bernomor koleksi, pita perekat, kertas kalkir, dan nama latin.

Fotonya adalah pernikahan dengan busana adat Bali, berlatar pura dan puri bata merah dengan pintu kayu berukir. Bunga sangat lekat dengan Bali (kamboja, cempaka, sandat, melati), jadi herbariumnya berisi bunga-bunga itu.

Tema bunga yang sengaja menghindari klise undangan bunga: tidak ada rose gold, font tulisan tangan, atau bunga cat air.

Tema ini mengisi kartu ketiga di homepage (`[SLUG CONTOH 3]`).

| | andi-rina | bagas-sekar | hendrawan-larasati |
|---|---|---|---|
| Rasa | Film urban hangat | Monokrom, tenang | Botani, adat Bali, kaya warna |
| Warna | Teal, amber | Batu, grafit | Kertas arsip, plum, hijau daun, emas |
| Tepi | Kertas sobek | Garis lurus | Label spesimen, pita perekat, kertas kalkir |
| Pembuka | Segel lilin | Dinding bergeser | Lembar kalkir diangkat |
| Galeri | Kolase polaroid | Grid rapi | Lembar spesimen berlabel |

Porsi rasa: 70% editorial lembut, 20% arsip ilmiah (label, nomor koleksi, nama latin), 10% playful.

**Mobile-first.** Semua keputusan dirancang di 375px dulu.

Fitur wajib sama dengan tema lain: RSVP, peta lokasi, hitung mundur, buku ucapan, amplop digital, galeri, musik latar.

## Data contoh

| | |
|---|---|
| Mempelai | **Hendrawan** Putra, putra Bapak Made Suardana & Ibu Ketut Sriani<br>**Larasati** Dewi, putri Bapak Wayan Artawan & Ibu Nyoman Suarni |
| Tanggal | Sabtu, 8 Mei 2027 |
| Acara | Upacara Pernikahan 09.00 WITA, Resepsi 12.00 sampai 15.00 WITA |
| Tempat | Taman Sari Kembang, Jl. Raya Ubud No. 18, Gianyar, Bali (fiktif) |
| Batas RSVP | 24 April 2027 |
| Link tamu | `sowanan.com/hendrawan-larasati?to=Tante+Mira` |

Catatan:

- **Acara ditulis "Upacara Pernikahan", bukan "Akad Nikah"**, supaya sesuai dengan busana adat Bali di foto.
- **Zona waktu WITA** karena lokasinya Bali. Kode hitung mundur dan kalender akan memakai `+08:00`.
- **Nama orang tua bernuansa Bali**, dan tetap fiktif.

## Foto

Sembilan foto Pexels karya Ricky S, satu pasangan yang sama. Semuanya berfoto berdua, tidak ada potret sendiri, jadi potret masing-masing mempelai diambil dari crop.

| No | File | Isi | Dipakai di |
|---|---|---|---|
| 1 | `34905648` | Berpelukan dekat, latar taman, potret | **Hero** mobile |
| 2 | `34932572` | Duduk di depan pintu ukir, buket | Cerita "Tumbuh Bersama" |
| 3 | `34932591` | Duduk di gerbang pura, payung tedung | Cerita "Hari Pernikahan", Galeri |
| 4 | `34932593` | Di bawah lengkung bata, selendang terurai | **Foto venue** Hari H |
| 5 | `34932596` | Jauh di gerbang bata, lanskap | Cerita "Pertama Bertemu" |
| 6 | `34932597` | Berdiri, pengantin perempuan di belakang, buket | Galeri, **spesimen bunga** (crop buket) |
| 7 | `34932600` | Berdiri berdampingan, buket anggrek | **Potret Hendrawan** dan **potret Larasati** (crop kiri dan kanan) |
| 8 | `34932603` | Kecupan di dahi, lanskap | **Hero desktop** dan **og:image** |
| 9 | `34932604` | Berpelukan di balik pintu kayu berukir | Cerita "Lamaran", Galeri |

**Spesimen bunga** tidak perlu aset tambahan. Buket di foto 6 dan 7 (anggrek putih, mawar) di-crop jadi 3 sampai 4 "spesimen" kecil, lalu ditempel dengan pita perekat dan diberi label nama latin. Ini tetap setia dengan konsep herbarium: spesimen yang difoto dan ditempel ke lembar arsip.

## Palette

Diturunkan dari foto: plum gaun, lilac selendang, emas perhiasan, hijau daun tropis.

| Nama | Hex | Diambil dari | Peran |
|---|---|---|---|
| Herbarium | `#F4EFE6` | | Latar utama, kertas arsip |
| Vellum | `#FAF7F1` | | Kartu label, kertas kalkir |
| **Plum** | `#5E1F3D` | Gaun pengantin | Aksen utama: nama, heading, tombol |
| Leaf | `#2F4A36` | Daun tropis | Label spesimen, garis penanda |
| Lilac | `#C6A9C4` | Selendang | Latar kartu tertentu, dekorasi |
| Gold | `#B08A3E` | Perhiasan | Pita perekat, detail. Dekorasi saja |
| Ink | `#1F1B1D` | | Teks utama |
| Aubergine | `#2A1422` | Bayangan gaun | Section gelap |
| Line | `#BDB1A4` | | Garis tipis, bingkai label |

Kontras:

| Kombinasi | Rasio | Status |
|---|---|---|
| Plum di atas herbarium | 10.5:1 | Lolos AA |
| Leaf di atas herbarium | 8.5:1 | Lolos AA |
| Ink di atas herbarium | 14.9:1 | Lolos AA |
| Herbarium di atas aubergine | 15.0:1 | Lolos AA |

Ritme section: HERBARIUM → VELLUM → AUBERGINE → HERBARIUM → VELLUM → AUBERGINE. Section gelap hanya dua (Menuju Hari H dan Penutup).

## Type

| Peran | Font | Pakai untuk |
|---|---|---|
| Display | **Ibarra Real Nova** (400, italic 400) | Nama, heading, nama latin italic, angka |
| Pendukung | **Hanken Grotesk** (400, 500) | Label spesimen, tanggal, tombol, form, body |

Berbeda dari tema lain (Bodoni, Newsreader, Cormorant). Ibarra Real Nova adalah serif buku klasik bernuansa terbitan botani lama. Italic-nya dipakai untuk nama latin, sesuai konvensi penulisan ilmiah.

Type scale (mobile, lalu desktop):

| Elemen | Ukuran |
|---|---|
| Nama hero | `clamp(56px, 16vw, 128px)`, line-height 0.95 (nama lebih panjang dari tema lain) |
| Heading section | `clamp(32px, 8vw, 52px)` |
| Nama latin | italic 17px / 19px, leaf |
| Label spesimen | 11px, uppercase, tracking 0.2em, weight 500 |
| Body | 15px / 16px, line-height 1.7 |
| Angka hitung mundur | `clamp(96px, 30vw, 200px)` |

Budget font maksimal 90KB.

## Elemen khas

| Elemen | Cara bikin | Berat |
|---|---|---|
| **Label spesimen**: kotak bergaris tipis berisi nomor koleksi, nama, tanggal, lokasi | CSS border + grid | 0 |
| **Spesimen bunga**: crop buket dari foto, ditempel miring | Crop di pipeline aset | < 40KB per potong |
| **Pita perekat** yang menahan foto dan spesimen | Div emas semi-transparan, sedikit miring | 0 |
| **Kertas kalkir** untuk Pintu dan kutipan | Latar vellum dengan opacity + backdrop blur ringan | 0 |
| Tekstur serat kertas | WebP grain halus | < 10KB |

Nama latin spesimen: *Plumeria rubra* (kamboja), *Magnolia champaca* (cempaka), *Cananga odorata* (kenanga), *Jasminum sambac* (melati), *Phalaenopsis amabilis* (anggrek bulan).

Nomor koleksi ("No. 014") sengaja sebagai bagian dari konsep arsip. Nomornya fiktif dan tidak berurutan (014, 027, 031), supaya terbaca sebagai nomor katalog, bukan hiasan 01/02/03.

## Layout

**Konsep:** setiap section adalah satu "lembar herbarium". Isinya disusun rapi seperti koleksi museum, dengan label di pojok dan spesimen yang ditempel di beberapa titik.

### 0. Pintu (mobile)

```
┌───────────────────────────┐
│░░░ kertas kalkir (buram) ░│
│                           │
│   foto hero terlihat      │  foto dan nama di bawah kalkir,
│   samar di bawahnya       │  terlihat samar
│                           │
│   Hendrawan               │
│   & Larasati              │
│                           │
│ ┌───────────────────────┐ │
│ │ No. 0508              │ │  label spesimen
│ │ Untuk: Tante Mira     │ │
│ │ Ubud, 8 Mei 2027      │ │
│ └───────────────────────┘ │
│                           │
│   [ BUKA LEMBARNYA ]      │
└───────────────────────────┘
```

### 1. Hero (mobile)

```
┌───────────────────────────┐
│ H & L              No.0508│
│───────────────────────────│
│ Hendrawan                 │  plum, besar
│ & Larasati                │
│ Plumeria & Jasminum       │  nama latin italic leaf
│                           │
│  ┌────────────────────┐   │
│ ═╪═ pita               │   │  foto 1, ditahan dua pita
│  │                    │   │
│  │   FOTO PASANGAN    │   │
│  │                  ═╪═  │
│  └────────────────────┘   │
│ ┌─────────────────────┐   │
│ │ SABTU, 8 MEI 2027   │   │  label spesimen
│ │ UBUD, BALI          │   │
│ └─────────────────────┘   │
└───────────────────────────┘
```

### Urutan section

| # | Section | Latar | Layout mobile | Foto | Fitur PRD |
|---|---|---|---|---|---|
| 0 | **Pintu** | Kalkir di atas herbarium | Kertas kalkir + label | 1 (samar) | Nama tamu, pemicu musik |
| 1 | **Hero** | Herbarium | Nama + foto berpita + label | 1 / 8 | |
| 2 | **Kedua Mempelai** | Vellum | Dua kartu spesimen: potret, nama, orang tua, bunga favorit | crop 7 | |
| 3 | **Cerita** | Herbarium | 4 lembar bertumpuk, ketuk untuk membuka | 5, 2, 9, 3 | |
| 4 | **Hari H** | Vellum | Label spesimen besar: tanggal, jadwal, tempat | 4 | Peta lokasi |
| 5 | **Menuju Hari H** | Aubergine | Angka besar + satu spesimen | crop buket | Hitung mundur |
| 6 | **Galeri** | Herbarium | Grid lembar spesimen: foto + label kecil + pita | crop dari semua | Galeri |
| 7 | **Konfirmasi** | Vellum | RSVP percakapan di atas "kartu balasan" | | RSVP |
| 8 | **Tanda Kasih** | Herbarium | Dua label rekening + QRIS | | Amplop digital |
| 9 | **Buku Tamu** | Vellum | Form + ucapan sebagai "catatan kurator" | | Buku ucapan |
| 10 | **Penutup** | Aubergine | "Terima kasih telah menjadi bagian dari koleksi ini." | | |
| 11 | **Kaki** | Herbarium | Monogram, "Dibuat dengan Sowanan" | | |

### Detail per section

**2. Kedua Mempelai.** Dua kartu spesimen. Masing-masing berisi potret (crop dari foto 7), nama, "Putra/Putri dari", dan satu baris playful: *"Spesimen favorit: cempaka"* dan *"Spesimen favorit: anggrek bulan"*.

**3. Cerita.** Empat lembar yang bertumpuk sedikit miring, seperti arsip di meja. Tiap lembar punya label (nomor, tanggal, lokasi) dan satu kalimat. Ketuk untuk membuka foto dan cerita lengkap.

**6. Galeri.** Setiap foto punya label kecil di bawahnya (nomor, caption) dan satu pita perekat di sudut.

**9. Buku Tamu.** Setiap ucapan tampil seperti catatan kurator, dengan nama pengirim sebagai "Dicatat oleh".

### Sudut

Foto, label, dan kartu bersudut tajam, seperti kertas arsip. Tombol dan input `rounded-sm`, konsisten dengan tema lain.

## Motion moment

**Satu momen orkestrasi: lembar kalkir diangkat.** Saat tamu menekan Buka Lembarnya:

1. Kertas kalkir bergeser ke atas sambil memudar (500ms, ease-out). Foto dan nama di bawahnya jadi jelas.
2. Nama "Hendrawan" dan "& Larasati" naik 16px dan memudar masuk, lalu foto berpita masuk terakhir (400ms, jeda 80ms).

Momen ini dipilih karena mengangkat kalkir untuk melihat spesimen adalah gestur khas herbarium, dan jelas berbeda dari segel dan dinding di dua tema lain.

Selain itu motion hanya respons aksi tamu. Tidak ada reveal saat scroll, parallax, atau bunga berputar. Semua hanya `transform` dan `opacity`, dan menghormati `prefers-reduced-motion`.

## Lottie

**Tidak ada.**

## Budget performa

Sama dengan tema lain: font maksimal 90KB, foto hero maksimal 120KB, foto lain maksimal 80KB, musik 96kbps dengan `preload="none"`.

## Kode yang dipakai ulang

Shell (dengan varian Pintu baru "kalkir"), modal, RSVP, buku ucapan, salin rekening, hitung mundur, kalender, galeri, timeline modal, dan server action. Yang baru hanya layout section, palet, font, komponen label spesimen, dan varian Pintu.

## Yang dibutuhkan sebelum mulai kode

1. **Persetujuan plan ini**, terutama:
   - Palet dipimpin **plum**, bukan hijau, karena foto didominasi gaun plum
   - Acara ditulis **"Upacara Pernikahan"**, lokasi **Ubud, Bali**, zona waktu **WITA**
   - Spesimen bunga diambil dari **crop buket di foto**, tanpa aset bunga pres terpisah
2. **Satu lagu bebas royalti**, nuansa lembut. Instrumen gamelan atau rindik yang tenang akan pas sekali dengan foto.
