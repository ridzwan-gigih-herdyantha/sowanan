# Design Plan: Undangan Contoh 2 `/bagas-sekar`

**Konsep: "Ruang yang Kami Bangun"**

Undangan yang terasa seperti katalog pameran arsitektur: beton, cahaya keras, bayangan tajam, dan banyak ruang kosong. Tenang, dewasa, dan hampir tanpa warna.

Acuan visualnya **referensi 2**: monokrom, beton, nama serif besar, section gelap dengan foto hitam-putih, garis vertikal tipis, dan layout "The Details" yang rapi seperti tabel.

Tema ini sengaja berlawanan dengan `/andi-rina`:

| | andi-rina | bagas-sekar |
|---|---|---|
| Rasa | Film urban hangat, playful | Arsitektural, tenang, formal |
| Warna | Teal, amber, krem | Monokrom: batu, abu, grafit |
| Tepi | Kertas sobek, polaroid miring | Garis lurus, sudut tajam, grid ketat |
| Pintu | Segel lilin | Dua dinding beton yang bergeser membuka |
| Galeri | Kolase tertempel | Grid asimetris yang rapi |
| Nada tulisan | Santai, bercanda | Puitis, singkat |

Porsi rasa: 70% editorial minimalis, 25% brutalist (skala tipografi ekstrem, blok beton), 5% kejutan.

**Mobile-first.** Semua keputusan dirancang di 375px dulu.

Dasar brief: PRD Sowanan 2.2 dan 4. Fitur wajib sama dengan tema 1: RSVP, peta lokasi, hitung mundur, buku ucapan, amplop digital, galeri, musik latar.

## Data contoh

| | |
|---|---|
| Mempelai | **Bagas** Wicaksono, putra Bapak Arif Wicaksono & Ibu Ratna Dewi<br>**Sekar** Ayuningtyas, putri Bapak Budi Hartono & Ibu Sri Wahyuni |
| Tanggal | Minggu, 14 Februari 2027 |
| Acara | Akad 09.00 WIB, Resepsi 11.00 sampai 14.00 WIB |
| Tempat | Galeri Lantai Tiga, Jl. Prawirotaman No. 7, Yogyakarta (fiktif) |
| Batas RSVP | 1 Februari 2027 |
| Link tamu | `sowanan.com/bagas-sekar?to=Pak+Joko` |

Kota dibuat berbeda dari tema 1 (Yogyakarta, bukan Semarang) supaya dua contoh terasa seperti dua klien nyata. Rekening dan QRIS tetap contoh palsu dengan label "contoh".

## Palette

Monokrom murni. Tidak ada warna aksen. Hierarki dibangun lewat skala, ketebalan, dan inversi terang-gelap.

| Nama | Hex | Peran |
|---|---|---|
| Stone | `#E8E5E0` | Latar utama, beton muda |
| Concrete | `#D6D2CB` | Section kedua |
| Graphite | `#1A1A19` | Section gelap |
| Ink | `#121212` | Teks utama, nama, tombol |
| Ash | `#5C5853` | Teks sekunder |
| Mist | `#BDB8B0` | Teks sekunder di atas graphite |
| Rule | `#9D978F` | Garis tipis |

Kontras:

| Kombinasi | Rasio | Status |
|---|---|---|
| Ink di atas stone | 15:1 | Lolos AA |
| Ash di atas stone | 5.6:1 | Lolos AA |
| Mist di atas graphite | 8.8:1 | Lolos AA |

Ritme section: STONE → GRAPHITE → STONE → CONCRETE → GRAPHITE → STONE.

Kenapa tanpa aksen: satu aksen di atas monokrom akan jatuh ke pola "gelap + satu warna mencolok" yang dihindari skill. Referensinya juga tidak memakai aksen.

## Type

| Peran | Font | Pakai untuk |
|---|---|---|
| Display | **Newsreader** (400, italic 400) | Nama, heading, kutipan, angka besar |
| Pendukung | **Schibsted Grotesk** (400, 500) | Label, tanggal, tombol, form, body |

Keduanya berbeda dari tema 1 (Bodoni Moda + Archivo) dan dari homepage (Cormorant + Jost). Newsreader adalah serif editorial bernuansa koran dengan kontras sedang, lebih tenang dari Bodoni dan mirip referensi 2. Schibsted Grotesk adalah grotesk editorial yang tegas di ukuran kecil.

Type scale (mobile, lalu desktop):

| Elemen | Ukuran |
|---|---|
| Nama hero | `clamp(72px, 22vw, 160px)`, line-height 0.9, tracking -0.02em |
| Heading section | `clamp(34px, 8vw, 56px)` |
| Angka hitung mundur | `clamp(120px, 40vw, 280px)`, satu angka per baris |
| Kutipan italic | 20px / 24px |
| Body | 15px / 16px, line-height 1.7 |
| Label | 11px, uppercase, tracking 0.24em, weight 500 |

Budget font maksimal 90KB.

## Elemen khas

| Elemen | Cara bikin | Berat |
|---|---|---|
| Garis vertikal tipis sebagai pemisah dan penunjuk | Border 1px | 0 |
| Blok beton: panel solid yang menimpa sebagian foto | Div dengan latar stone atau graphite | 0 |
| Tekstur beton halus di latar stone | WebP grain, lebih halus dari tema 1 | < 10KB |
| Penghitung slide "01 / 03" | Teks | 0 |
| Monogram "B / S" | Teks serif | 0 |
| Foto hitam-putih | Didesaturasi di pipeline aset, bukan filter CSS | 0 |

Tidak ada tepi sobek, polaroid, segel, atau lencana melingkar. Tema ini justru hidup dari garis yang lurus.

## Layout

**Konsep:** grid 12 kolom yang ketat, dengan satu elemen per section yang sengaja keluar dari grid (nama raksasa, angka raksasa, atau foto yang menembus tepi layar).

### 0. Pintu (mobile)

```
┌──────────────┬──────────────┐
│              │              │
│  BAGAS       │              │  dua panel beton (stone)
│              │              │  garis tengah tipis
│              │       SEKAR  │
│              │              │
│      Untuk Pak Joko         │
│                             │
│      [ BUKA UNDANGAN ]      │  tombol outline ink
│                             │
│  14 . 02 . 2027             │
└──────────────┴──────────────┘
```

Kalau tidak ada `?to=`, baris tamu diganti input opsional, sama seperti tema 1.

### 1. Hero (mobile)

```
┌───────────────────────────┐
│ B / S                  ♫  │
│───────────────────────────│
│ KAMI MENGUNDANGMU         │
│ KE PERNIKAHAN             │
│                           │
│ Bagas                     │  ink, sangat besar
│ & Sekar                   │
│                           │
│ ┌─────────────────────┐   │
│ │                     │   │  foto potret hitam-putih,
│ │   FOTO TANGGA /     │   │  menembus tepi kanan layar
│ │   BETON             │   │
│ │                     │───│
│ └─────────────────────┘   │
│ │                         │  garis vertikal
│ │ 14 . 02 . 2027          │
│ │ Yogyakarta              │
│                           │
│ Dua hati, satu arah.      │  italic
└───────────────────────────┘
```

### 1. Hero (desktop, ≥980px)

Seperti referensi 2: nama raksasa di kiri, foto beton tinggi di tengah menembus tepi atas, kolom sempit di kanan berisi kutipan italic dan satu foto detail kecil (bunga di atas beton).

### Urutan section

| # | Section | Latar | Layout mobile | Fitur PRD |
|---|---|---|---|---|
| 0 | **Pintu** | Stone | Dua panel beton | Nama tamu, pemicu musik |
| 1 | **Hero** | Stone | Nama raksasa + foto tembus tepi | |
| 2 | **Kedua Mempelai** | Graphite | Nama, orang tua, foto dengan penghitung 01 / 03, bisa digeser | |
| 3 | **Cerita** | Stone | Timeline vertikal dengan garis tipis, 4 momen, bisa diketuk | |
| 4 | **Detail Acara** | Concrete | Tabel: tanggal, jadwal, tempat, foto venue | Peta lokasi |
| 5 | **Menuju Hari H** | Graphite | Angka raksasa bertumpuk | Hitung mundur |
| 6 | **Galeri** | Stone | Grid asimetris 2 kolom, sudut tajam | Galeri |
| 7 | **Konfirmasi** | Graphite + foto lanskap | Kutipan di atas foto, form di bawahnya | RSVP |
| 8 | **Tanda Kasih** | Stone | Dua baris rekening seperti tabel + QRIS | Amplop digital |
| 9 | **Doa & Ucapan** | Concrete | Form + daftar ucapan bergaris | Buku ucapan |
| 10 | **Penutup** | Graphite | "Terima kasih atas doa dan kehadirannya.", nama, tanggal | |
| 11 | **Kaki** | Stone | Monogram, "Dibuat dengan Sowanan" | |

Section "Kamu" (kuis) dari tema 1 **tidak dipakai**. Nada tema ini lebih tenang, dan menghapusnya membuat dua contoh terasa lebih berbeda.

### Detail per section

**2. Kedua Mempelai.** Mengikuti referensi 2. Di mobile, nama Bagas dan Sekar beserta orang tua ada di atas, lalu foto hitam-putih yang bisa digeser (scroll-snap CSS, tanpa JS) dengan penghitung "01 / 03". Di desktop jadi tiga kolom: nama, foto, kutipan.

**3. Cerita.** Timeline vertikal di mobile: garis tipis di kiri, tiap momen punya tahun besar, judul, dan satu kalimat. Ketuk untuk membuka foto dan cerita lengkap. Ini memakai komponen modal yang sama dengan tema 1.

**4. Detail Acara.** Seperti tabel katalog:

```
MINGGU
14 . 02 . 2027
───────────────────────────
09.00    Akad Nikah
11.00    Resepsi, sampai 14.00
───────────────────────────
Galeri Lantai Tiga
Jl. Prawirotaman No. 7, Yogyakarta
[ LIHAT PETA ]
───────────────────────────
FOTO VENUE (beton, hitam-putih)
```

**5. Menuju Hari H.** Angka raksasa bertumpuk vertikal: "108" lalu label HARI, "06" lalu label JAM. Setelah tanggal lewat: "HARI INI." Plus tombol simpan ke kalender.

**7. Konfirmasi.** Seperti referensi 2: foto lanskap berkabut hitam-putih dengan kutipan italic *"Kehadiranmu adalah hadiah terindah bagi kami."*, lalu form RSVP bergaya gelap. Memakai komponen RSVP percakapan yang sama, dengan warna terbalik.

**9. Doa & Ucapan.** Ucapan ditampilkan sebagai daftar bergaris seperti buku tamu, bukan catatan kertas miring.

### Sudut

Semua sudut tajam (0px), termasuk foto. Tombol dan input tetap `rounded-sm` supaya konsisten dengan homepage dan tema 1.

## Motion moment

**Satu momen orkestrasi: dinding bergeser.** Saat tamu menekan Buka Undangan:

1. Panel kiri bergeser ke kiri dan panel kanan ke kanan, 500ms, ease-out.
2. Hero muncul: nama "Bagas" dan "& Sekar" naik 16px dan memudar masuk, 400ms dengan jeda 80ms. Foto masuk terakhir.

Momen ini dipilih karena "ruang yang terbuka" adalah inti konsep tema ini, dan berbeda jelas dari segel lilin tema 1 di video promosi.

Selain itu, motion hanya respons aksi tamu (buka cerita, geser foto, langkah RSVP, kirim ucapan, salin rekening). Tidak ada reveal saat scroll dan tidak ada parallax. Semua hanya `transform` dan `opacity`, dan menghormati `prefers-reduced-motion`.

## Lottie

**Tidak ada.**

## Budget performa

Sama dengan tema 1: font maksimal 90KB, foto hero maksimal 120KB, foto lain maksimal 80KB, musik 96kbps dengan `preload="none"`. Total sebelum Pintu dibuka sekitar 350KB, didominasi runtime Next.js.

## Kode yang dipakai ulang dari tema 1

- Shell, nama tamu, dan musik (Pintu diberi varian "dinding" selain "segel")
- Modal, RSVP, buku ucapan, salin rekening, hitung mundur, kalender
- Server action dan cache ucapan

Yang baru hanya layout section, palet, font, dan pipeline aset hitam-putih. Perkiraan pengerjaan satu hari setelah foto tersedia.

## Yang dibutuhkan sebelum mulai kode

1. **Persetujuan plan ini.**
2. **Foto pasangan** (satu pasangan yang sama, nuansa arsitektur beton, modernis, cahaya keras). Warna tidak masalah karena akan saya jadikan hitam-putih. Minimal 10 foto:

   | Jumlah | Kebutuhan |
   |---|---|
   | 1 | Potret untuk hero mobile (tangga, lorong, atau dinding beton) |
   | 1 | Lanskap untuk hero desktop dan preview WhatsApp |
   | 3 | Pasangan untuk slider Kedua Mempelai |
   | 4 | Momen Cerita (boleh detail: tangan, cincin, bunga, sepatu) |
   | 1 | Bangunan untuk foto venue |
   | 1 | Lanskap berkabut atau pegunungan untuk section Konfirmasi |

   Galeri memakai crop dari foto-foto di atas. Letakkan di `Assets/sowanan/bagas-sekar`, satu folder dengan `andi-rina`.

3. **Satu lagu bebas royalti** dengan nuansa berbeda dari tema 1, misalnya piano atau ambient yang tenang.

## Revisi layout v2 (25 September 2026)

Tujuan: layout Bagas & Sekar harus jelas berbeda dari Andi & Rina (majalah film) dan Hendrawan & Larasati (herbarium). Palet monokrom, font, foto hitam-putih, dan pintu dinding tetap.

Konsep kerangka: **katalog pameran**. Halaman dibaca seperti tur di galeri, setiap section adalah satu "Ruang" dengan label ruang, garis grid arsitektural tipis terlihat di latar, dan keterangan karya ala museum.

| Section | Sebelum | Sesudah |
|---|---|---|
| Hero | Tiga kolom: nama, foto, tanggal | Foto potret tinggi di kiri, nama "Bagas & Sekar" ditulis vertikal raksasa di kolom kanan, strip data di bawah |
| Kedua Mempelai | Section gelap, slider di tengah | Ruang 1: dinding pameran terang, slider foto dengan kartu keterangan museum per mempelai |
| Cerita | Timeline vertikal | Ruang 2: daftar indeks katalog, tiap baris berisi tahun, judul, kalimat, dan thumbnail kecil |
| Detail Acara | Tabel + foto venue | Ruang 3: papan jadwal dengan jam raksasa, lalu pelat venue |
| Menuju Hari H | Tetap | Ruang 4, tetap gelap dengan angka bertumpuk |
| Galeri | Grid rata | Ruang 5: gantungan pameran, satu karya besar dan sisanya kecil, tiap foto punya keterangan karya |
| Konfirmasi, Tanda Kasih, Doa, Penutup | Tetap | Tetap, diberi label ruang |

Garis grid: 4 kolom di mobile, 12 kolom di desktop, garis 1px dengan opacity rendah, hanya di section terang.
