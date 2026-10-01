# Design Plan: Tema 4 "Pakeliran" (adat Jawa)

**Konsep: undangan sebagai pagelaran wayang.**

Tamu tidak "membuka undangan", tetapi duduk di depan kelir (layar wayang). Blencong menyala, gunungan ditancapkan lalu digetarkan sebagai tanda pagelaran dimulai, dua tokoh wayang masuk sebagai bayangan lalu berubah menjadi emas prada, dan kelir terangkat memperlihatkan undangannya. Setelah itu isi undangan disusun seperti urutan lakon, ditutup dengan "tancep kayon": gunungan ditancapkan di tengah sebagai tanda pagelaran selesai.

Tiga tema yang ada sudah modern dan urban. Tema ini sengaja tradisional, tetapi tidak memakai klise undangan Jawa di marketplace (bingkai emas penuh, bunga melati clipart, gradasi emas mengkilap di semua tempat). Sikapnya: **tenang, membumi, sopan**. Emas hanya dipakai di tempat yang pantas, seperti prada pada wayang, bukan disiram ke seluruh halaman.

| | andi-rina | bagas-sekar | hendrawan-larasati | **Pakeliran** |
|---|---|---|---|---|
| Rasa | Film urban hangat | Monokrom tenang | Botani Bali | Adat Jawa, khidmat, membumi |
| Warna | Teal, amber | Batu, grafit | Kertas arsip, plum | Mori, soga, prada, wedel |
| Tepi | Kertas sobek | Garis lurus | Label, pita perekat | Lurik, pinggiran ukir lung-lungan |
| Pembuka | Segel lilin | Dinding bergeser | Kalkir diangkat | Pagelaran wayang 7 detik |
| Galeri | Kolase polaroid | Grid rapi | Lembar spesimen | Bilah gebyok (jendela kayu) |

Porsi rasa: 70% khidmat dan lapang, 20% ornamen (lurik, kawung, ukiran), 10% momen teater (pembuka dan penutup).

**Mobile-first.** Semua keputusan dirancang di 375px dulu. Fitur wajib sama dengan tema lain.

## Temuan riset yang membentuk arah

1. **Palet yang kamu bayangkan persis palet batik keraton klasik.** Batik sogan keraton memakai coklat soga, putih, dan biru tua nila (wedel). Coklat melambangkan tanah yang subur, kerendahan hati, dan sifat "membumi". Putih melambangkan kesucian dan ketenteraman. Biru tua melambangkan ketenangan dan kesetiaan. Jadi "down-to-earth dan sopan" punya dasar warna yang nyata, bukan tafsir bebas.
2. **Emas di wayang disebut prada**, dipakai untuk menandai tokoh dan statusnya. Di tema ini emas diperlakukan sama: prada pada tokoh dan gunungan, bukan warna latar.
3. **Gunungan (kayon)** adalah simbol pohon kehidupan dan alam semesta. Dalam pagelaran dipakai untuk membuka dan menutup adegan. Ini jadi struktur tema: dibuka gunungan, ditutup "tancep kayon".
4. **Wayang dilihat dari dua sisi.** Penonton di balik kelir melihat bayangan, penonton di sisi dalang melihat warna dan emas hasil tatah sungging. Ini jadi inti animasi pembuka: bayangan berubah menjadi emas.
5. **Lurik dan batik punya makna pernikahan.** Lurik kluwung dipakai di upacara pernikahan dan diletakkan di bawah bantal pengantin untuk keselamatan. Truntum melambangkan cinta yang tumbuh kembali, Sidomukti harapan hidup mulia dan bahagia, Kawung ketulusan berbuat baik.
6. **Ukiran gebyok Jepara** memakai motif lung-lungan (sulur tanaman yang menjalar), lambang pertumbuhan dan kesinambungan hidup.

### Rama dan Sinta, atau Kamajaya dan Kamaratih?

Brief menyebut Rama dan Sinta. Usulan saya **Kamajaya dan Kamaratih**, dengan Rama dan Sinta sebagai alternatif:

- Kamajaya dan Kamaratih adalah lambang pasangan dalam tradisi pernikahan Jawa sendiri. Nasihat pernikahan Jawa sering berbunyi "rukun seperti Kamajaya dan Kamaratih", dan keduanya digambar di kelapa gading saat mitoni.
- Kisah Rama dan Sinta memuat penculikan, perpisahan panjang, dan ujian api (Sinta obong). Sebagian orang Jawa menganggapnya kurang pas untuk doa pernikahan.
- Kamajaya dan Kamaratih juga lebih jarang dipakai di undangan digital, jadi lebih anti-mainstream.

Bentuk visual keduanya tetap wayang purwa gaya Surakarta atau Yogyakarta, full prada, jadi gambaran "sepasang wayang emas" dari brief tetap terwujud. **Keputusan ada di kamu.**

## Data contoh (fiktif)

| | |
|---|---|
| Mempelai | **Danang** Wicaksono, putra Bapak Suryo Hadiningrat & Ibu Sri Rahayu<br>**Kinanthi** Puspitasari, putri Bapak Bambang Widodo & Ibu Endang Lestari |
| Slug | `danang-kinanthi` |
| Tanggal | Sabtu Pon, 14 Agustus 2027 |
| Acara | Siraman, Midodareni, Ijab Qabul, Panggih, Resepsi |
| Tempat | Pendapa Ndalem Kusumo, Kotagede, Yogyakarta (fiktif) |

Nama "Kinanthi" dipilih karena itu nama tembang macapat yang bermakna "dituntun, bergandengan", pas untuk tema ini. Semua nama bisa diganti.

## Palette

| Nama | Hex | Asal | Peran |
|---|---|---|---|
| Mori | `#F5F1E8` | Kain mori sebelum dibatik, kain kelir | Latar utama |
| Soga | `#7A4A28` | Pewarna kayu soga | Aksen utama: heading, tombol, garis penting |
| Soga Tua | `#3A2317` | Sogan Yogya coklat kehitaman | Teks utama, pengganti hitam |
| Prada | `#B8913A` | Emas prada wayang | Ornamen dan tokoh saja, tidak untuk teks di atas Mori |
| Prada Terang | `#E2C37A` | Kilau prada | Teks dan garis emas di atas latar gelap |
| Wedel | `#1E2A44` | Nila batik wedel | Porsi 10%: pembuka pagelaran, hitung mundur, penutup |
| Garis | `#D9CDB8` | Serat mori | Garis tipis, bingkai |

Kontras (dihitung, WCAG):

| Kombinasi | Rasio | Status |
|---|---|---|
| Soga Tua di atas Mori | 13.0 | AA dan AAA |
| Soga di atas Mori | 6.6 | AA |
| Mori di atas Soga (tombol) | 6.6 | AA |
| Prada Terang di atas Wedel | 8.4 | AA dan AAA |
| Mori di atas Wedel | 12.7 | AA dan AAA |
| Prada di atas Wedel | 4.9 | AA |
| Prada di atas Mori | 2.6 | **Gagal**, jadi Prada tidak dipakai untuk teks di latar terang |

Hijau tua (gadung) sempat dipertimbangkan sebagai warna 10%. Wedel dipilih karena soga, putih, dan wedel adalah trio batik keraton yang sudah punya makna jelas. Kalau lebih suka hijau, cukup ganti satu variabel.

## Type

| Peran | Font | Alasan |
|---|---|---|
| Display: nama mempelai, judul bagian | **Marcellus** | Huruf kapital bergaya pahatan batu, mengingatkan prasasti dan relief candi (Prambanan memuat relief Ramayana). Belum dipakai tema lain. |
| Teks | **Alegreya Sans** | Humanis dengan jejak tulisan tangan, hangat seperti batik tulis, tetap sangat terbaca di HP |
| Aksara Jawa | **Noto Sans Javanese** | Hanya untuk aksen: "Sugeng Rawuh", nama mempelai dalam aksara, angka Jawa di hitung mundur. Dimuat dengan subset Javanese saja. |

Skala (mobile ke desktop):

| Token | Ukuran |
|---|---|
| Nama mempelai | `clamp(44px, 13vw, 96px)`, Marcellus, spasi huruf 0.04em |
| Judul bagian | `clamp(28px, 7vw, 44px)` Marcellus |
| Subjudul | 18px Alegreya Sans medium |
| Teks | 17px Alegreya Sans, line-height 1.7, lebar maks 62ch |
| Keterangan | 14px Alegreya Sans |
| Aksara Jawa | 20 sampai 28px, warna Soga atau Prada Terang |

Font yang sudah dipakai tema lain (Bodoni Moda, Ibarra Real Nova, Newsreader, Archivo, Hanken Grotesk, Schibsted Grotesk) dan font situs (Cormorant, Jost) sengaja dihindari.

## Ornamen

Semua ornamen geometris dibuat sebagai SVG atau CSS di kode, tanpa aset gambar tambahan:

- **Lurik**: garis-garis sejajar tipis (Soga, Prada, Wedel) sebagai pembatas bagian dan tepi tombol. Polanya mengikuti lurik kluwung yang dipakai di upacara pernikahan.
- **Kawung**: pola empat kelopak berulang sebagai tekstur tipis (opasitas rendah) di latar bagian gelap.
- **Pinggiran ukir lung-lungan**: sulur menjalar di sudut bingkai foto dan kartu acara. Sudut kiri atas digambar sekali lalu dicerminkan ke tiga sudut lain.
- **Truntum**: bunga kecil berulang sebagai latar bagian buku ucapan (cinta yang tumbuh kembali).

Yang perlu aset dari luar hanya **wayang dan gunungan**. Lihat bagian Aset.

## Layout

**Satu kalimat:** halaman dibaca seperti pagelaran, dari jejer (pembuka) sampai tancep kayon (penutup), di atas kain mori yang lapang, dengan emas hanya pada tokoh.

Hero di 375px, setelah kelir terangkat:

```
┌─────────────────────────────┐
│        ꦱꦸꦒꦼꦁꦫꦮꦸꦃ            │  aksara Jawa, Soga
│                             │
│          ▲                  │
│        ╱   ╲                │  foto mempelai dipotong
│      ╱ FOTO  ╲              │  berbentuk siluet gunungan
│     │ MEMPELAI │            │  (clip-path), garis Prada tipis
│     │          │            │
│     ╰──────────╯            │
│  ═══════════════════════    │  lurik kluwung
│                             │
│          DANANG             │  Marcellus, Soga Tua
│            &                │
│         KINANTHI            │
│                             │
│    Sabtu Pon                │  hari + pasaran Jawa, dihitung
│    14 Agustus 2027          │  otomatis dari tanggal
│    Kotagede, Yogyakarta     │
└─────────────────────────────┘
```

Rata tengah untuk hero dan penutup (sifatnya upacara). Isi bagian lain rata kiri supaya enak dibaca.

Urutan bagian, dinamai mengikuti pagelaran:

| Bagian | Nama di tema | Perlakuan |
|---|---|---|
| Hero | Jejer | Foto dalam siluet gunungan, nama, hari dan pasaran |
| Mempelai | Sepasang | Nama lengkap, nama dalam aksara Jawa, orang tua. Siluet kecil Kamajaya dan Kamaratih saling berhadapan |
| Cerita | Lakon | Adegan berjajar horizontal seperti wayang di kelir, bisa digeser. Foto berbingkai lurik |
| Acara | Pahargyan | Susunan acara adat (siraman sampai resepsi) di kartu berpinggiran ukir, peta, simpan ke kalender |
| Hitung mundur | Wedel | Latar Wedel dengan tekstur kawung, angka Latin besar dan angka Jawa kecil di bawahnya |
| Galeri | Gebyok | Foto seperti dilihat dari balik bilah jendela kayu. Bilah menutup foto dan membuka saat disentuh |
| RSVP | Konfirmasi | Formulir sederhana, garis lurik |
| Ucapan | Pangestu | Ucapan tampil sebagai lembar lontar memanjang, latar truntum |
| Hadiah | Tanda Kasih | Kartu rekening dan QRIS |
| Penutup | Tancep Kayon | Gunungan emas tertancap di tengah, "Matur nuwun", sesanti Jawa |

**Weton otomatis**: tanggal acara ditampilkan dengan pasaran Jawa (Legi, Pahing, Pon, Wage, Kliwon), dihitung dari tanggal. Ini detail yang hampir tidak pernah ada di undangan digital, tetapi sangat berarti bagi keluarga Jawa.

Yang sengaja dihindari: eyebrow huruf kapital kecil di atas setiap judul, penomoran 01/02/03, gradasi emas mengkilap sebagai dekorasi, bingkai emas penuh di setiap kartu.

## Motion

**Momen utama: pagelaran pembuka, sekitar 7 detik, setelah tamu menekan "Buka undangan".** Durasinya melebihi batas normal karena diminta brief. Sebagai gantinya, animasi lain di halaman dibuat sangat hemat.

| Waktu | Adegan | Teknik |
|---|---|---|
| 0.0 s | Latar meredup menjadi Wedel, musik gamelan mulai | opacity |
| 0.4 s | Blencong menyala: cahaya hangat di atas, berkedip pelan | opacity berulang |
| 0.8 s | Gunungan naik dari bawah ke tengah kelir | translateY, ease-out |
| 1.8 s | Gunungan digetarkan tiga kali, tanda pagelaran dimulai | rotate kecil |
| 2.6 s | Gunungan diangkat ke atas dan mengecil, panggung terbuka | translate dan scale |
| 3.0 s | Kamajaya masuk dari kiri, Kamaratih dari kanan, masih berupa bayangan, bergoyang pelan seperti dipegang dalang | translateX dan rotate |
| 4.4 s | Bayangan berubah menjadi emas prada | crossfade dua lapis gambar |
| 5.0 s | Lengan kedua tokoh bergerak saling menyapa | rotate lengan pada sendi bahu dan siku |
| 5.4 s | Nama mempelai muncul, disertai aksara Jawa | opacity |
| 6.2 s | Kelir terangkat, hero terlihat, gunungan mendarat kecil di atas hero | translateY |

Aturannya:

- **Tombol "Lewati"** muncul sejak 0.5 detik dan langsung membawa ke hero.
- **Hanya transform dan opacity.** Perubahan bayangan ke emas memakai dua lapis gambar (siluet dan emas) yang di-crossfade, bukan filter.
- **Reduced motion**: pagelaran dilewati, langsung tampil hero dengan sepasang wayang emas statis.
- Tidak menunda LCP. LCP adalah layar kelir sebelum dibuka, dan pagelaran baru dimuat setelah tamu menekan tombol. Aset pagelaran di-preload saat layar kelir tampil.

**Layar sebelum dibuka (kelir)**: kain mori dengan pinggiran lurik, gunungan emas kecil di tengah, "Sugeng Rawuh" dalam aksara Jawa dan Latin, nama tamu, tombol "Buka undangan". Masuknya cukup satu fade 400ms, karena pagelaran sesungguhnya dimulai setelah tombol ditekan.

Di dalam undangan tidak ada fade-up di setiap bagian. Yang bergerak hanya yang merespons aksi: galeri gebyok membuka saat disentuh, adegan cerita digeser, dan gunungan penutup tertancap satu kali saat bagian penutup terlihat.

## Lottie

Tidak perlu. Nyala blencong cukup dengan CSS, dan wayang lebih baik sebagai gambar berlapis yang digerakkan di kode supaya bisa dikendalikan per sendi. Kalau nanti ingin api blencong yang lebih hidup, satu Lottie api kecil (loop halus, di bawah 30KB) bisa ditambahkan dengan poster statis.

## Aset yang perlu disediakan

Wayang adalah karya gambar yang rumit. Saya tidak akan menggambarnya sendiri, karena hasil buatan kode akan terlihat kaku dan tidak menghormati pakem.

| Aset | Spesifikasi |
|---|---|
| Kamajaya dan Kamaratih (atau Rama dan Sinta), gaya wayang purwa, full prada | PNG atau WebP transparan, tinggi minimal 1600px. **Dipisah per bagian**: badan, lengan atas kiri, lengan bawah kiri, lengan atas kanan, lengan bawah kanan, supaya lengan bisa digerakkan seperti wayang asli. Target di bawah 120KB per tokoh setelah kompresi |
| Gunungan, full prada dengan tatahan | PNG atau WebP transparan, tinggi minimal 1600px, di bawah 150KB |
| Musik gamelan | Gending pernikahan seperti Kebo Giro atau Ketawang Puspawarna, rekaman bebas royalti, MP3 di bawah 3MB |
| Foto contoh | 8 sampai 10 foto satu pasangan berbusana adat Jawa (paes ageng atau solo basahan, beskap), dari Pexels atau sumber berlisensi bebas |

Sumber aset wayang yang aman: pesan ke ilustrator atau penatah wayang (paling ideal untuk dibedah per sendi), atau beli vektor berlisensi komersial (Vecteezy, Shutterstock) lalu dipisah per bagian. **Jangan mengambil gambar wayang acak dari internet**, karena banyak karya perajin yang tidak berlisensi. Siluet bayangan tidak perlu aset terpisah, karena bisa dibuat dari gambar emas yang sama.

Sampai aset datang, saya bisa membangun seluruh tema dengan wayang placeholder (siluet sederhana), lalu tinggal menukar gambarnya.

## Tambahan data

| Field | Keterangan |
|---|---|
| `copy.sesanti` | Pepatah Jawa di penutup beserta artinya, misalnya "Witing tresna jalaran saka kulina" |
| Nama dalam aksara Jawa | Opsional, diisi manual dan dicek klien. **Tidak diterjemahkan otomatis**, karena transliterasi nama yang salah akan memalukan |
| Pasaran | Tidak perlu diisi, dihitung otomatis dari tanggal acara |

Angka Jawa di hitung mundur cukup pemetaan digit (꧐ sampai ꧙), jadi aman dibuat otomatis.

## Review plan sendiri

| Bagian | Risiko jadi default | Yang diubah |
|---|---|---|
| Latar krem + serif + aksen coklat | Mirip pola "krem, serif, terakota" yang generik | Latar diikat ke kain mori dan kelir, 10% Wedel memberi kontras dingin yang tidak ada di pola generik, dan emas hanya pada tokoh |
| Serif untuk nama | Bisa jadi serif mewah biasa | Marcellus dipilih karena bentuk pahatannya mengacu prasasti dan relief candi, bukan sekadar "elegan" |
| Emas | Undangan Jawa umumnya bergradasi emas di mana-mana | Emas dibatasi pada prada wayang, gunungan, dan garis tipis |
| Animasi | Fade-up di setiap bagian | Satu pagelaran pembuka, sisanya hanya merespons aksi |
| Ornamen | Batik sebagai wallpaper penuh | Batik dan lurik jadi ornamen sekunder: pembatas, tekstur tipis, tepi |

## Perlu keputusan

1. **Tokoh wayang**: Kamajaya dan Kamaratih (usulan), atau Rama dan Sinta.
2. **Warna 10%**: Wedel biru tua (usulan) atau hijau tua gadung.
3. **Nama tema**: "Pakeliran" (usulan), atau nama lain.
4. **Data contoh**: Danang dan Kinanthi, atau nama lain.
5. **Aset**: siapa yang menyediakan wayang, gunungan, musik gamelan, dan foto. Selama menunggu, tema bisa saya bangun dengan placeholder.

## Referensi

- Gunungan dan filosofinya: [Kompas](https://regional.kompas.com/read/2022/02/02/180653778/sejarah-dan-filosofi-gunungan-wayang-kulit-digunakan-dalam-uang-logam?page=all), [detikEdu](https://www.detik.com/edu/detikpedia/d-7587505/gunungan-wayang-fungsi-jenis-simbol-dan-filosofinya)
- Figur Dewi Sinta dan warna wayang: [Jurnal ISI Yogyakarta](http://digilib.isi.ac.id/5208/6/JURNAL.pdf), [Indonesia Museum](https://indonesiamuseum.org/en/articles/wayang-kulit-symbolism-hidden-meanings-in-shadow-and-story)
- Kamajaya dan Kamaratih: [Radar Purworejo](https://radarpurworejo.jawapos.com/budaya/2144998062/raden-kamajaya-dan-dewi-kamaratih-dua-tokoh-wayang-yang-merepresentasikan-cinta-sejati), [Blog Hadisukirno](https://blog.hadisukirno.co.id/kamajaya-kamaratih-simbol-kerukunan-suami-istri/), [Inibaru](https://inibaru.id/tradisinesia/kamajaya-kamaratih-wayang-yang-digambar-pada-tradisi-mitoni)
- Tatah sungging, blencong, kelir: [Vokasi Kemdikbud](https://www.vokasi.kemdikbud.go.id/read/b/tatah-sungging-teknik-pembuatan-wayang-kulit-menurut-akn-seni-dan-budaya-yogyakarta), [Kompas Skola](https://www.kompas.com/skola/read/2024/06/02/080000069/peralatan-dalam-pertunjukan-wayang-dalam-bahasa-jawa?page=all)
- Batik sogan dan makna warna: [Kompas Yogyakarta](https://yogyakarta.kompas.com/read/2024/02/04/211611278/mengenal-batik-sogan-dari-asal-nama-hingga-perbedaan-gaya-solo-dan?page=all), [Kompasiana](https://www.kompasiana.com/nengfitrimaghfiroh3563/689d910d34777c68fb77c2e2/mengenal-filosofi-batik-sogan-dari-jantung-budaya-jawa), [Google Arts & Culture](https://artsandculture.google.com/story/batik-keraton-museum-batik-indonesia/NAVRePBbmpM9uA?hl=en), [RRI](https://rri.co.id/jakarta/regional/848772/makna-warna-dalam-busana-daerah)
- Lurik: [Farah.id](https://www.farah.id/read/2021/04/27/6239/bukan-sekadar-garis-inilah-filosofi-n-makna-simbolis-kain-lurik), [Jurnal Humaniora Binus](https://journal.binus.ac.id/index.php/Humaniora/article/download/3150/2536)
- Batik pernikahan: [Jurnal ISI Surakarta, Sidomukti](https://jurnal.isi-ska.ac.id/index.php/TXT/article/view/2810), [Batik Prabu Seno, Truntum](https://www.batikprabuseno.com/artikel/edukasi/batik-truntum/), [Wikipedia, motif batik](https://en.wikipedia.org/wiki/Indonesian_batik_patterns)
- Ukiran: [Masjid Gedhe Kauman](http://mesjidgedhe.or.id/filosofi-ukiran-dan-ornamen/), [Jati Nusantara](https://jatin.id/portofolio/gebyok-ukir-klasik-full-panel-jepara-rumah-adat-jawa-surabaya/)
- Aksara Jawa: [Noto Sans Javanese](https://fonts.google.com/noto/specimen/Noto+Sans+Javanese), [Wikipedia, aksara Jawa](https://en.wikipedia.org/wiki/Javanese_script)
