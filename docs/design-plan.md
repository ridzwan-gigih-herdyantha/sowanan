# Design Plan: Undangan Contoh 1 `/andi-rina`

**Konsep: "A Love Story, Printed Wrong"**

Undangan yang terasa seperti majalah editorial dicetak di atas kertas undangan, lalu ditempeli cetakan foto film dari jalanan kota saat golden hour. Kertasnya disobek, ditempel, dan disegel.

Ada dua acuan:

- **Referensi 1** untuk layout dan elemen kertas: nama besar rata kiri, tepi sobek, foto berbingkai lengkung, kolase polaroid, segel lilin.
- **Foto di `Assets/sowanan/andi-rina`** untuk warna dan suasana: prewedding urban, pengantin berhijab, jalanan kota, tembok oker, bayangan teal, grading film teal-oranye. Suasananya cocok dengan jalanan Semarang.

Porsi rasa:

- 75% editorial elegan
- 15% playful
- 10% brutalist, yaitu nama raksasa yang keluar dari grid dan tepi kertas yang sobek

**Mobile-first.** Semua keputusan dirancang di 375px dulu. Desktop adalah pengembangan, bukan titik awal.

Dasar brief: PRD Sowanan 2.2 dan 4.

- Nama fiktif, foto stok bebas lisensi, tanggal karangan
- Tujuh fitur wajib: RSVP, peta lokasi, hitung mundur, buku ucapan, amplop digital, galeri, musik latar
- Ringan dibuka dengan sinyal lemah
- Preview WhatsApp benar
- Dipakai untuk rekaman materi promosi
- Harus beda nuansa dengan `/bagas-sekar`

## Data contoh

| | |
|---|---|
| Mempelai | **Andi** Pratama, putra Bapak Hadi Susanto & Ibu Wulan Sari<br>**Rina** Maharani, putri Bapak Joko Santoso & Ibu Endah Lestari |
| Tanggal | Sabtu, 12 Desember 2026 |
| Acara | Akad 08.00 WIB, Resepsi 11.00 sampai 14.00 WIB |
| Tempat | Pendopo Kembang Sore, Jl. Kembang Sore No. 12, Semarang (fiktif) |
| Batas RSVP | 1 Desember 2026 |
| Link tamu | `sowanan.com/andi-rina?to=Bu+Sri` |

Rekening dan QRIS memakai nomor yang jelas palsu (`0000 1111 2222`) plus label "contoh", supaya tidak ada yang benar-benar mentransfer.

## Foto

Sembilan foto Pexels karya mornwish, berlisensi Pexels (bebas dipakai komersial, tanpa wajib atribusi). Semuanya pasangan yang sama, jadi ceritanya konsisten.

| No | File | Isi | Dipakai di |
|---|---|---|---|
| 1 | `36412361` | Bergandengan di jalan, backlight, potret | **Hero** mobile |
| 2 | `36412364` | Duduk berdua di tembok oker, lanskap | **og:image**, Hero desktop, Cerita "Tumbuh Bersama" |
| 3 | `36412367` | Kaki melangkah dan bayangan di aspal | Polaroid, Galeri |
| 4 | `36412368` | Menyeberang jalan dari dua arah | Cerita "Pertama Bertemu", Galeri |
| 5 | `36412369` | Duduk menatap cahaya, tembok grafiti, potret | **Kedua Mempelai** full-bleed |
| 6 | `36412809` | Tangan bercincin, cahaya amber | Cerita "Lamaran", Polaroid |
| 7 | `36412810` | Tangan di kaca berembun, cincin | Polaroid, Galeri |
| 8 | `36412870` | Sepatu, jas, dan buket di kain merah | Cerita "Hari Pernikahan", Penutup |
| 9 | `36412872` | Bangku rotan dan kain merah di taman | **Foto venue** Hari H, Galeri |

Galeri memakai crop berbeda dari foto yang sama supaya tidak terasa berulang (misalnya close-up wajah dari foto 2, sepatu dari foto 1, cincin dari foto 7).

Semua foto dikonversi ke WebP dan AVIF dalam beberapa ukuran. Foto hero di mobile maksimal 120KB, foto lain maksimal 80KB. File asli yang 0.5 sampai 4MB tidak pernah dikirim ke tamu.

## Palette

Diambil dari foto supaya halaman dan foto terasa satu grading.

| Nama | Hex | Diambil dari | Peran |
|---|---|---|---|
| Paper | `#F6EEE3` | Highlight hangat | Latar utama, bertekstur kertas |
| Wash | `#EAD9C2` | Cahaya di tangan dan kaca | Section kedua, latar kolase |
| **Night teal** | `#0B2327` | Bayangan di aspal | Section gelap |
| **Teal** | `#1F4449` | Bayangan yang lebih terang | Aksen utama: nama, heading, tombol, link |
| Amber | `#B07A3A` | Tembok oker | Angka besar, garis, stempel tanggal film. Hanya untuk teks besar di atas terang |
| Amber light | `#D39B59` | Pantulan cahaya | Aksen di atas night teal |
| Ink | `#1C1916` | | Teks utama |
| Hairline | `#A08F74` | Aspal hangat | Garis tipis pemisah |

Kontras:

| Kombinasi | Rasio | Status |
|---|---|---|
| Teal di atas paper | 9.0:1 | Lolos AA untuk semua ukuran |
| Amber light di atas night teal | 6.7:1 | Lolos AA |
| Amber di atas paper | 3.1:1 | Hanya untuk teks ≥24px atau dekorasi |

Merah kain di foto 8 dan 9 tidak dijadikan warna UI. Warna itu cukup muncul di foto, supaya halaman tidak jatuh ke pola "gelap + satu aksen vermilion".

Ritme section: PAPER → NIGHT (foto) → PAPER → WASH → NIGHT → PAPER. Dua section bersebelahan tidak boleh berwarna sama.

## Type

| Peran | Font | Pakai untuk |
|---|---|---|
| Display | **Bodoni Moda** (400, 500, italic 400) | Nama, heading, kutipan italic, "&" bergaya swash |
| Pendukung | **Archivo** (400, 500) | Tanggal, label, tombol, form, alamat, body |

Kutipan italic Bodoni menggantikan font tulisan tangan. Body tetap Archivo karena Bodoni ukuran kecil sulit dibaca di HP.

Type scale (mobile, lalu desktop):

| Elemen | Ukuran |
|---|---|
| Nama hero | `clamp(64px, 20vw, 150px)`, line-height 0.92 |
| Heading section | `clamp(36px, 9vw, 64px)` |
| Angka hitung mundur | `clamp(96px, 32vw, 220px)` |
| Kutipan italic | 20px / 24px |
| Body | 15px / 16px, line-height 1.65 |
| Label | 11px, uppercase, tracking 0.22em |
| Stempel tanggal film | Archivo 500, 12px, amber, seperti cetakan tanggal kamera film `'26 12 12` |

Budget font total maksimal 120KB. Kalau Bodoni Moda terlalu besar, fallback ke Playfair Display.

## Elemen khas

| Elemen | Cara bikin | Berat |
|---|---|---|
| Tepi kertas sobek antar section dan di tepi foto | SVG mask inline, 2 variasi | < 2KB |
| Foto berbingkai lengkung (arch) di Cerita | `border-radius` atas 999px | 0 |
| Kolase polaroid miring | CSS: border krem tebal, rotasi -4° sampai 3°, shadow tipis | 0 |
| Stempel tanggal film di sudut foto | Teks amber, pengganti ranting botani referensi 1 | 0 |
| Segel lilin monogram **A&R** | Foto segel lilin stok (WebP transparan) diwarnai amber gelap + monogram teks | < 20KB |
| Lencana teks melingkar "Andi & Rina · 12.12.2026" | SVG `textPath`, statis | < 1KB |
| Tekstur kertas dan grain film | Satu WebP grain kecil, di-tile dengan opacity rendah | < 8KB |

Ranting botani dari referensi 1 saya ganti dengan stempel tanggal film. Ranting cocok untuk foto pantai dan bunga, sedangkan foto ini urban dan sinematik.

## Layout

**Konsep:** satu kolom yang terasa seperti halaman majalah disusun bertumpuk. Setiap section punya layout sendiri, tapi disatukan oleh tipografi, palet, sobekan kertas, dan grain film.

### 0. Pintu (mobile)

```
┌───────────────────────────┐
│░░░░░░ tekstur paper ░░░░░░│
│                           │
│   PERNIKAHAN              │
│   Andi & Rina             │  teal
│                           │
│   Kepada Yth.             │
│   Bu Sri                  │
│                           │
│          ◉  segel A&R     │
│    Ketuk segel untuk      │
│    membuka undangan       │
└───────────────────────────┘
```

Kalau tidak ada `?to=`, baris tamu diganti input opsional "Boleh tahu namamu?" dengan pilihan lewati. Selain segel, ada juga tombol teks "Buka Undangan" untuk aksesibilitas.

### 1. Hero (mobile)

```
┌───────────────────────────┐
│ A&R                    ♫  │
│                           │
│ PERNIKAHAN                │
│ Andi                      │  teal, sangat besar, rata kiri
│   & Rina                  │  "&" italic swash amber
│                           │
│ Dua hati, satu perjalanan │  italic
│      ┌────────────────────│
│      │                    │  foto 1 (bergandengan),
│      │   FOTO 1           │  mulai 48px dari kiri,
│   ◎  │                    │  menempel ke tepi kanan layar
│      │        '26 12 12   │  stempel tanggal film
│      └~~~~~~~~~~~~~~~~~~~~│  tepi bawah sobek
│ │ 12 . 12 . 2026          │
│ │ Semarang, Indonesia     │
│ Gulir ↓                   │
└───────────────────────────┘
```

### 1. Hero (desktop, ≥980px)

Seperti referensi 1: nama dan tanggal di kolom kiri, foto 2 (lanskap) besar di kanan dengan tepi kanan sobek, kutipan italic dan lencana di sidebar tipis.

### Urutan section

| # | Section | Latar | Layout mobile | Foto | Fitur PRD |
|---|---|---|---|---|---|
| 0 | **Pintu** | Paper | Tengah, segel lilin | | Nama tamu, pemicu musik |
| 1 | **Hero** | Paper | Nama raksasa + foto offset kanan | 1 | |
| 2 | **Cerita** | Wash | 4 kartu foto lengkung, geser horizontal | 4, 2, 6, 8 | |
| 3 | **Kedua Mempelai** | Night (foto) | Foto full-bleed, nama dan orang tua di atas foto | 5 | |
| 4 | **Kutipan & Kolase** | Paper | Kutipan italic + 3 polaroid + segel | 3, 7, 6 | |
| 5 | **Hari H** | Wash | Poster bertumpuk: tanggal, jadwal, foto venue | 9 | Peta lokasi |
| 6 | **Menuju Hari H** | Night | Angka raksasa amber | | Hitung mundur |
| 7 | **Galeri** | Paper | Kolase foto tertempel, miring, tumpang tindih | crop dari semua | Galeri |
| 8 | **Kamu** | Wash | Pertanyaan pilihan ganda | | |
| 9 | **Konfirmasi** | Paper | RSVP bergaya percakapan | | RSVP |
| 10 | **Tanda Kasih** | Wash | Dua kartu rekening + QRIS | | Amplop digital |
| 11 | **Tinggalkan Pesan** | Paper | Form + dinding catatan kertas | | Buku ucapan |
| 12 | **Penutup** | Night | Hampir kosong, foto kecil | 8 | |
| 13 | **Kaki** | Paper | Monogram, kutipan, "Dibuat dengan Sowanan" | | |

Tombol musik mengambang di pojok kanan bawah (area jempol) dan tampil di semua section.

### Detail per section

**2. Cerita.** Empat kartu dengan foto berbingkai lengkung:

1. *Pertama Bertemu* (foto 4, menyeberang dari dua arah)
2. *Tumbuh Bersama* (foto 2)
3. *Lamaran* (foto 6, cincin)
4. *Hari Pernikahan* (foto 8)

Tiap kartu berisi tanggal dan dua baris cerita. Di mobile, kartu digeser horizontal dengan scroll-snap CSS, jadi tanpa JS. Ketuk kartu untuk membuka cerita lengkap dan foto yang lebih besar.

Angka 01 sampai 04 wajar di sini karena isinya memang urutan waktu.

**3. Kedua Mempelai.** Foto 5 full-bleed. Sisi kiri foto yang gelap dan teal jadi tempat teks, jadi tidak perlu overlay berat. Tepi bawahnya sobek.

Nama "Andi" dan "Rina" berwarna paper, masing-masing dengan "Putra dari..." / "Putri dari...".

**4. Kutipan & Kolase.** Kutipan italic *"Bukan tentang siapa yang paling sempurna, tapi tentang dua orang yang selalu memilih berjalan bersama."* Di bawahnya tiga polaroid miring (foto 3, 7, 6) dan segel lilin A&R, seperti referensi 1.

**5. Hari H.** Susunan poster di mobile:

1. SABTU
2. 12 . 12 . 2026
3. Jadwal dengan garis vertikal tipis: 08.00 Akad Nikah, 11.00 Resepsi
4. Foto 9 (bangku rotan di taman) sebagai suasana venue
5. Alamat
6. Tombol outline **Buka Peta** (link Google Maps, tanpa library peta)
7. Kalimat kehormatan italic

**6. Menuju Hari H.** Teks "SAMPAI KAMI BILANG" lalu "SAH" dalam ukuran raksasa, angka berwarna amber light. Hanya dua angka yang tampil, hari dan jam.

Setelah tanggal lewat, tampilannya berubah jadi "HARINYA SUDAH TIBA."

Ada tombol **Simpan ke Kalender**, berupa file `.ics` dan link Google Calendar.

**7. Galeri.** Judul italic *"Momen yang ingin kami simpan"*. Delapan cetakan foto dalam kolase miring dan saling tumpuk, dengan caption dan stempel tanggal film.

Di mobile, kolasenya dua kolom yang tidak rata. Ketuk foto untuk membuka lightbox.

**8. Kamu.** Pertanyaan *"Kamu datang bawa apa?"* dengan empat pilihan:

- Kenangan baik
- Hati yang lapang
- Energi berlebih
- Jujur, demi makanannya

Tiap pilihan memunculkan balasan berbeda. Jawaban tidak disimpan.

**9. Konfirmasi.** Gaya input mengikuti referensi 1: kotak tipis bergaris hairline dengan tombol outline teal.

- Langkah 1: *"Kamu bisa datang?"* dengan pilihan HADIR atau BERHALANGAN
- Langkah 2, kalau hadir: *"Datang dengan siapa?"* dengan pilihan SENDIRI atau BERDUA

Nama sudah terisi dari Pintu dan masih bisa diubah. Batas konfirmasi 1 Desember 2026. Setelah dikirim, tampil *"Siap. Tempatmu kami simpan."*

**10. Tanda Kasih.** Pembukanya *"Doa restu kalian sudah lebih dari cukup. Bagi yang ingin berbagi..."* Lalu dua kartu rekening dengan tombol **Salin**, plus QRIS.

**11. Tinggalkan Pesan.** Form berisi nama dan pesan. Setelah dikirim, pesan berubah jadi catatan kertas yang menempel ke dinding bersama pesan tamu lain. Dinding memuat 12 pesan terbaru, sisanya lewat tombol "muat lagi".

**12. Penutup.** *"Terima kasih atas doa dan kehadirannya."*, foto kecil (crop buket dari foto 8), lalu "Andi & Rina 12 . 12 . 2026". Di bawahnya: *"Kamu scroll sampai sini. Kami sudah suka kamu."*

**13. Kaki.** Monogram A&R, kutipan *"Entah bagaimana, kami saling menemukan."*, dan link kecil "Dibuat dengan Sowanan" ke homepage. Link ini jalur promosi dari setiap undangan yang disebar.

### Sudut

Foto, polaroid, dan catatan kertas bersudut tajam. Foto di Cerita memakai bingkai lengkung. Tombol dan input memakai `rounded-sm`, sama dengan homepage.

## Motion moment

**Satu momen orkestrasi: segel dibuka.** Saat tamu mengetuk segel lilin, ini yang terjadi berurutan:

1. Segel mengecil dan memudar (180ms).
2. Panel Pintu bergeser ke atas (450ms, ease-out).
3. Hero muncul: "Andi", "& Rina", lalu foto 1 masuk berurutan, masing-masing 400ms dengan jeda 80ms.

Momen ini dipilih karena di sinilah undangan berubah dari "link" menjadi "pengalaman", dan karena ini adegan pembuka video promosi. Segel lilin juga langsung menyambung ke konsep kertas undangan.

Selain itu, motion hanya dipakai sebagai respons aksi tamu:

- Membuka kartu Cerita
- Memilih jawaban di section Kamu
- Pindah langkah RSVP
- Catatan kertas menempel ke dinding
- Membuka lightbox galeri
- Salin nomor rekening

Tidak ada reveal saat scroll, parallax, atau lencana yang berputar. Semua hanya `transform` dan `opacity`, dan menghormati `prefers-reduced-motion`.

## Lottie

**Tidak ada.** Semua elemen khas cukup dibuat dengan SVG dan CSS, dan setiap file Lottie menambah beban di sinyal lemah.

## Budget performa

| Item | Batas |
|---|---|
| Sebelum Pintu dibuka | HTML, CSS, font, tekstur, segel. Maksimal 250KB |
| Foto hero | WebP maksimal 120KB, mulai dimuat saat Pintu tampil |
| Foto lain | WebP maksimal 80KB, lazy-load |
| JavaScript | Maksimal 120KB gzip. Library `motion` hanya di komponen yang memakainya |
| Musik | MP3 96kbps bebas royalti, `preload="none"`, dimuat setelah segel dibuka |
| Preview WhatsApp | og:title "Andi & Rina \| Sabtu, 12 Desember 2026", og:image 1200×630 dari foto 2 |

## Review: yang saya ubah dari brief dan alasannya

| Dari brief | Jadi | Alasan |
|---|---|---|
| Raka & Nadya, Yogyakarta, 12.10.25 | Andi & Rina, Semarang, 12.12.2026 | Slug PRD dan data yang sudah dipakai di homepage |
| Palet sand, blush, terracotta, espresso | Paper, wash, teal, night teal, amber | Diturunkan dari foto yang disediakan (grading teal-oranye). Palet pastel akan bertabrakan dengan foto. Terracotta di atas sand juga hanya 3.9:1, tidak lolos AA |
| Coastal film photography | Urban golden hour film | Mengikuti isi foto: jalanan kota, tembok oker, bayangan panjang |
| Ranting botani (referensi 1) | Stempel tanggal film | Lebih cocok dengan foto urban dan sinematik |
| Dominan brutalist dengan banyak section gelap | Dominan editorial elegan, gelap hanya di mempelai, hitung mundur, dan penutup | Mengikuti referensi 1. Brutalist tersisa di nama raksasa dan tepi sobek |
| Inter / DM Sans | Archivo | Skill melarang Inter. Archivo tetap netral dan jelas di layar kecil |
| Font tulisan tangan | Bodoni Moda italic | Hemat satu file font |
| Salinan bahasa Inggris | Bahasa Indonesia | Tamu lintas usia. Referensi pun memakai bahasa Indonesia untuk isi |
| Tamu wajib mengetik nama | Nama dari link `?to=`, input hanya opsional | Homepage menjanjikan nama tamu muncul lewat link. Memaksa mengetik menambah hambatan |
| Timeline + "Choose Your Memory" terpisah | Satu section Cerita dengan kartu lengkung | Isinya tumpang tindih, dan bentuknya mengikuti referensi |
| RSVP langkah 3 (makanan, kursi, dansa) | Dihapus | PRD 2.3: RSVP hanya mengumpulkan nama dan jumlah kehadiran |
| Parallax foto pasangan, lencana berputar | Dihapus | Aturan satu momen motion per halaman, dan membebani HP kelas bawah |
| Panah di akhir tombol | Hanya di tombol outline Buka Peta dan Kirim, sebagai ikon | Mengikuti referensi |
| Tidak ada amplop digital, musik, simpan ke kalender | Ditambahkan | Wajib di PRD atau dijanjikan di homepage |
| Hitung mundur di akhir | Setelah Hari H | Lebih berguna saat dibaca bersama tanggal |
| Tidak ada | Link "Dibuat dengan Sowanan" di kaki | Setiap undangan jadi jalur promosi |

## Tema kedua `/bagas-sekar`

Usulan: **referensi 2**, monokrom dengan beton, hitam, dan abu hangat. Struktur section dan semua komponen fiturnya sama dengan tema ini, jadi yang berganti hanya palet, foto, tekstur, dan beberapa layout.

Nuansanya jelas beda (minimalis arsitektural lawan film urban hangat), dan pengerjaannya jauh lebih cepat. Butuh satu set foto pasangan lain yang cocok dengan nuansa monokrom.

Plan detailnya menyusul setelah tema ini disetujui.

## Yang dibutuhkan sebelum mulai kode

- **Persetujuan plan ini**
- **Segel lilin** transparan. Saya cari yang berlisensi bebas, kecuali Anda sudah punya
- **Satu lagu bebas royalti**
