# Design Plan: Halaman Artikel

**Konsep: "Catatan yang enak dibaca sampai habis"**

Artikel di Sowanan dibaca seperti tulisan di majalah pernikahan, bukan seperti daftar kartu blog. Satu tulisan terbaru tampil besar, sisanya berbaris rapi dengan garis tipis, dan halaman baca memberi ruang penuh untuk teks.

Audiens: pasangan dan keluarga yang sedang menyiapkan pernikahan, kebanyakan membuka dari HP lewat pencarian atau tautan yang dibagikan. Tugas halaman: membuat mereka selesai membaca, lalu kenal dengan Sowanan. Header, footer, dan tombol WhatsApp sama dengan beranda, jadi jalan untuk memesan tetap ada tanpa menyisipkan iklan di tengah tulisan.

Halaman publik: `/artikel` (daftar) dan `/artikel/[slug]` (baca). Halaman admin: `/admin/artikel`, `/admin/artikel/baru`, `/admin/artikel/[id]`.

## Palette

Tidak menambah warna. Brief meminta setema dengan situs, jadi semuanya token yang sudah ada di `globals.css`.

| Nama | Hex | Peran |
|---|---|---|
| Ivory | `#FAF7F2` | Latar halaman daftar dan halaman baca |
| Ink | `#1F1A17` | Judul |
| Ink soft | `#463C36` | Isi artikel, lebih lembut dari judul untuk bacaan panjang |
| Ink mute | `#6E6158` | Tanggal dan keterangan |
| Wine | `#7C2B3E` | Kategori, tautan di isi, garis kemajuan baca, hover judul |
| Line | `#E7DDD4` | Garis antarbaris daftar, tepi gambar dan tabel |
| Blush | `#F4EAE6` | Latar kutipan di isi artikel, sama dengan kutipan di `/ketentuan` |

## Type

Dua typeface yang sudah dipakai situs. Cormorant untuk suara judul, Jost untuk bacaan.

| Elemen | Typeface | Ukuran |
|---|---|---|
| Judul halaman baca (h1) | Cormorant Garamond 500 | `clamp(36px, 5.5vw, 56px)`, leading 1.08 |
| Judul tulisan terbaru di daftar | Cormorant Garamond 500 | `clamp(30px, 4vw, 44px)` |
| Judul baris daftar | Cormorant Garamond 500 | 24px |
| Subjudul isi (h2 / h3) | Cormorant Garamond 500 | 30px / 24px |
| Isi artikel | Jost 400 | 17px, leading 1.75, lebar maksimal 68ch |
| Kategori | Jost 500 | 14px, huruf biasa, warna wine |
| Tanggal | Jost 400 | 14px, ink mute |

## Layout

Daftar artikel memakai satu tulisan besar lalu baris bergaris, bukan grid kartu. Semua rata kiri dalam `Container` yang sama dengan beranda (1120px).

```
/artikel, desktop                             /artikel, 375px
+-----------------------------------------+   +-------------------+
| Header situs                            |   | Header situs      |
+-----------------------------------------+   +-------------------+
| Artikel                                 |   | Artikel           |
| Kalimat pengantar singkat               |   | Pengantar         |
|                                         |   |                   |
| +----------------------+  Kategori      |   | +---------------+ |
| |                      |  Judul tulisan |   | | Thumbnail 3:2 | |
| |   Thumbnail 3:2      |  terbaru besar |   | +---------------+ |
| |                      |  Cuplikan isi  |   | Kategori          |
| +----------------------+  5 Nov 2026    |   | Judul terbaru     |
| --------------------------------------- |   | Cuplikan          |
| Judul tulisan        Kategori  [thumb]  |   | 5 Nov 2026        |
| 3 Nov 2026                              |   | ----------------- |
| --------------------------------------- |   | Kategori  [thumb] |
| Judul tulisan        Kategori  [thumb]  |   | Judul             |
+-----------------------------------------+   +-------------------+

/artikel/[slug]
+-----------------------------------------+
| Header situs                            |
|=====....  garis kemajuan baca           |
| Kategori                                |
| Judul artikel besar                     |
| Dibuat 5 Nov 2026   Diperbarui 9 Nov    |
| +-------------------------------------+ |
| |        Thumbnail lebar 3:2          | |
| +-------------------------------------+ |
|    Isi artikel, kolom 68ch              |
|    Subjudul, gambar, kutipan, tabel     |
| ----------------------------------------|
| Tulisan lain (maksimal 3 baris)         |
+-----------------------------------------+
```

Teks "Diperbarui" hanya muncul kalau tanggalnya berbeda dari tanggal dibuat.

Admin mengikuti gaya admin yang ada: daftar seperti `/admin/undangan`, form memakai `Card` dan kelas di `settings/styles.ts`, editor memakai gaya `.sowanan-rte`.

## Motion moment

Satu momen: **garis kemajuan baca** setipis 2px warna wine di bawah header pada halaman baca, bergerak mengikuti gulir memakai `scaleX`. Letaknya di sini karena tugas halaman ini memang membuat orang selesai membaca, dan garis itu memberi tahu seberapa jauh lagi.

Tidak ada animasi masuk di halaman daftar maupun halaman baca, supaya thumbnail sebagai LCP langsung tampil. Hover judul hanya berganti warna 150ms. Saat `prefers-reduced-motion`, garis tidak ditampilkan.

## Lottie

Tidak dipakai. Tidak ada ilustrasi yang menambah nilai di halaman bacaan, dan repo belum punya folder `public/animations`.

## Review plan

Pilihan yang diganti karena hanya default:

- Grid tiga kolom kartu blog diganti satu tulisan besar dan baris bergaris.
- Fade-up per bagian diganti garis kemajuan baca.
- Kategori sebagai eyebrow huruf besar diganti huruf biasa warna wine.
- Keterangan yang disambung titik tengah diganti tanggal dan kategori di posisi terpisah.

Yang sengaja dipertahankan: kombinasi latar krem dan judul serif masuk daftar pola generik, tapi ini identitas Sowanan dan brief meminta setema.

## Batas pekerjaan

Termasuk: menu Artikel di header, footer, dan bilah admin; sitemap; `artikel` sebagai slug terlarang untuk undangan; satu artikel contoh.

Belum termasuk: filter kategori di halaman daftar dan paginasi publik. Keduanya baru berguna setelah artikelnya banyak.
