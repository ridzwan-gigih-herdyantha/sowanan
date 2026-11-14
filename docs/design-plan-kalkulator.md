# Design plan: Kalkulator harga (beranda, #hitung)

Tugas section: calon klien memilih tema, paket, dan add-on, lalu langsung melihat total dan uang mukanya,
kemudian mengirim pilihan itu ke WhatsApp tanpa mengetik ulang.

## Palette (mewarisi token beranda)
- `blush #f4eae6`: latar section. Memisahkan kalkulator dari section Harga yang gelap tepat di atasnya.
- `ivory #faf7f2`: kertas nota ringkasan, terasa seperti kuitansi di atas meja.
- `ink #1f1a17` / `ink-body #574b43`: teks.
- `wine #7c2b3e`: pilihan aktif dan tombol kirim, sama dengan tombol utama situs.
- `line #e7ddd4`: garis pemisah nota.

## Type
- Cormorant (serif): judul langkah dan angka harga, termasuk total besar.
- Jost (sans): label, keterangan, tombol.
- Skala: judul section mengikuti SectionTitle; judul langkah 24px; total 44px; baris nota 15px.

## Layout
Dua kolom di desktop: kiri tiga langkah berurutan (1 Tema, 2 Paket, 3 Add-on, memang urutan, jadi bernomor),
kanan nota ringkasan yang menempel saat digulir. Di HP nota turun ke bawah, dan ada bilah total menempel di
bawah layar yang menunjuk ke nota.

```
| 1 Tema   [img][img][img][img] → geser |  +-- Nota ---------------+
| 2 Paket  ( Dasar )( Lengkap )( Ist. )  |  | Tema   Andi & Rina     |
| 3 Add-on [x] Tambah foto   - 2 +  50rb |  | Paket Lengkap   249rb  |
|          [ ] Video YouTube       25rb  |  | + Foto x2        50rb  |
|                                        |  | Total          299rb   |
|                                        |  | DP 50%         150rb   |
|                                        |  | [Kirim ke WhatsApp]    |
```

## Motion
Tidak ada orkestrasi baru (budget halaman sudah dipakai di hero). Hanya motion respons aksi: angka total
berganti dengan geser-pudar singkat (160ms) saat pilihan berubah, dan baris nota baru muncul dengan fade.
Semua dimatikan saat prefers-reduced-motion.

## Lottie
Tidak ada.
