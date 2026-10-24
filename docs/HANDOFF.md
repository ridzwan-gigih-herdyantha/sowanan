# Hand-off developer Sowanan

Panduan singkat untuk developer yang melanjutkan proyek ini. Baca README dulu untuk setup dasar, dokumen ini menjelaskan cara kerja aplikasi dan hal yang gampang terlewat.

## Produk dalam satu paragraf

Sowanan menjual undangan pernikahan digital. Setiap undangan punya link sendiri (`sowanan.com/<slug>`), memakai salah satu tema, dan diisi admin lewat editor. Paket (Dasar, Lengkap, Istimewa) dan add-on menentukan fitur yang terbuka. Tamu bisa RSVP, menulis ucapan, dan dipindai QR-nya di lokasi. Mempelai punya dashboard sendiri untuk melihat RSVP, ucapan, dan mengirim link ke tamu.

## Stack

- Next.js 16 (App Router, Cache Components, `"use cache"`), React 19, Tailwind v4, Zod 4.
- Supabase: Postgres, Auth (admin dan mempelai), Storage (foto, video, musik).
- Vercel untuk hosting. Optimasi gambar Vercel dimatikan (`images.unoptimized` di `next.config.ts`) karena foto sudah diperkecil saat diunggah.
- pnpm. Next.js versi ini punya perubahan API, cek `node_modules/next/dist/docs/` sebelum memakai API yang belum familiar (lihat `AGENTS.md`).

## Menjalankan lokal

```bash
pnpm install
cp .env.example .env      # isi kredensial Supabase
pnpm dev
```

- Tanpa env Supabase, homepage memakai `DEFAULT_SETTINGS` dan undangan dibaca dari `supabase/seed/invitations/*.json`.
- Database baru: jalankan semua file `supabase/migrations/` berurutan di SQL Editor, lalu `pnpm create-admin` dan `pnpm seed-invitations`.
- Cek sebelum commit: `pnpm typecheck` dan `pnpm lint`.

## Peta folder

| Path | Isi |
| --- | --- |
| `src/app/[slug]` | Halaman undangan publik, versi per paket (`/paket/<id>`), bingkai HP dan tablet untuk contoh, file kalender `.ics`, aksi RSVP dan ucapan |
| `src/app/(site)` | Homepage, `/tema`, `/ketentuan`, admin, dashboard mempelai, pemindai QR (`/absen/<token>`) |
| `src/app/(site)/admin/undangan` | Daftar undangan dan semua tab satu undangan: editor, tamu, RSVP & ucapan, palet, akses mempelai |
| `src/app/(site)/admin/settings` | Pengaturan situs: harga, isi paket, add-on, tema di homepage, kontak, FAQ |
| `src/app/admin/pratinjau/[slug]` | Pratinjau draf di dalam iframe editor, plus bridge pesan ke editor |
| `src/themes/<slug>` | Satu tema: `index.tsx`, `palette.ts`, `fonts.ts` |
| `src/themes/*.ts` | Registri tema: komponen, nama, kegunaan media, palet, font |
| `src/components/invitation` | Komponen bersama undangan (shell, RSVP, ucapan, galeri, bagian tambahan) dan folder per gaya tema |
| `src/lib/invitation` | Skema data, spec editor, view untuk tema, loader dan cache, aturan paket, arsip, framing foto |
| `src/lib/settings` | Skema pengaturan, nilai bawaan, aturan paket (`packageRules`) |
| `src/lib/storage` | Kegunaan media dan ukurannya, pemrosesan gambar (sharp), penyimpanan |
| `supabase/migrations` | Skema database, berurutan |
| `supabase/seed` | Undangan contoh per tema dan ucapan contoh |
| `scripts` | CLI: buat admin, buat undangan, seed, olah aset tema |

## Alur data undangan

1. **Skema** (`lib/invitation/schema.ts`): bentuk JSON di kolom `invitations.data` dan `invitations.draft`. Hanya bentuk, aturan wajib ada di spec.
2. **Spec** (`lib/invitation/spec.ts`): daftar grup dan isian editor, label, batas karakter, isian wajib, tema yang memakainya (`themes: [...]`). Editor, validasi simpan, dan PDF kebutuhan data semuanya dibaca dari sini.
3. **View** (`lib/invitation/view.ts`): `toView()` mengubah data mentah jadi objek siap pakai tema (`inv`): tanggal terformat, URL media, palet dan font, bagian tambahan yang sudah dikelompokkan, props framing foto.
4. **Tema** menerima `inv` dan merender. Tema tidak membaca database.

Draf dan versi live terpisah. Editor menyimpan draf otomatis ke `draft`. Tombol Save version / Publish changes menyalin draf ke `data` setelah validasi. Switch Live mengubah `published`.

## Cache

- `getInvitation(slug)` di `lib/invitation/load.ts` memakai `"use cache"` dengan tag `invitation-<slug>`. Setiap aksi admin yang mengubah undangan memanggil `updateTag` untuk tag itu.
- Pengaturan situs di-cache tanpa batas (`getSettings`, tag `settings`). Admin memakai `getSettingsFresh`.
- Perubahan langsung lewat SQL tidak membersihkan cache. Setelah menjalankan SQL di produksi, simpan sekali dari admin atau deploy ulang.
- Undangan yang tidak ditemukan hanya di-cache beberapa menit.

## Editor admin

File utama: `src/app/(site)/admin/undangan/[slug]/editor.tsx`.

- Sidebar kiri: Setup (paket, gaya), Content (section tema), More (bagian tambahan, footer). Satu panel tampil sekaligus.
- Isian dirender `fields.tsx` dari spec. Tipe isian: text, textarea, media, datetime, select, number, list (dengan varian untuk bagian tambahan).
- Pratinjau di kanan adalah iframe `/admin/pratinjau/<slug>` seukuran layar HP (390 x 760). Draf tersimpan, lalu editor mengirim `sowanan:refresh` dan pratinjau memuat ulang data server.
- Bridge (`app/admin/pratinjau/[slug]/bridge.tsx`): klik teks di pratinjau untuk mengedit langsung, klik foto untuk lompat ke isiannya.
- Atur posisi foto (`frame-dialog.tsx`, `lib/invitation/frame.ts`): zoom dan titik fokus terpisah untuk HP dan layar lebar (batas 760px), disimpan di `data.frames`. Tema menyebar `{...inv.frame.<slot>}` ke img. Pratinjau dialog memakai `?atur`, yang melewati pembuka, loader, dan animasi masuk.
- Daftar kebutuhan data (PDF) dibuat dari daftar undangan (`requirements-builder.tsx`, `requirements-pdf.ts`), dicetak lewat dialog print browser.

## Paket dan add-on

- Isi paket diatur di admin pengaturan (matrix fitur per paket). Kunci sistem ada di `SYSTEM_KEYS` (`lib/settings/schema.ts`): galeri_foto, bagian_tambahan, musik_sendiri, warna_tema, cerita, nama_tamu, ekspor_excel, qr_absensi.
- `packageRules(settings, pkg, addons)` (`lib/settings/text.ts`) menghasilkan `locked` (fitur yang terkunci beserta alasannya), batas foto galeri, dan batas bagian tambahan.
- Teks alasan di `locked` ditulis untuk admin. Jangan tampilkan ke tamu atau mempelai, cukup sembunyikan fiturnya.
- Undangan contoh (`slug === theme`) tampil sebagai paket tertinggi, versi paket lain di `/<slug>/paket/<id>`.

## Status undangan yang memengaruhi tamu

- **Belum lunas** (`payment_status = 'belum_lunas'`): watermark tampil, RSVP dan ucapan dimatikan dengan pesan "undangan belum aktif". Aksi server juga menolak kiriman.
- **Arsip**: 30 hari setelah acara (`lib/invitation/archive.ts`). RSVP, ucapan baru, amplop, hitung mundur, dan link nama tamu berhenti. Admin bisa membuka kunci 24 jam untuk koreksi. Pemberitahuan ke klien muncul 7 hari sebelumnya di tab RSVP.
- **Nama tamu** (`?to=`) hanya dipakai bila paket termasuk nama_tamu. Kode `?k=` adalah token QR kehadiran per tamu.

## Mempelai

- Akun mempelai dibuat admin di tab Akses mempelai, terhubung lewat tabel `invitation_members`.
- Login di `/dashboard/user/login`, dashboard di `/dashboard/user/<slug>` (`lib/couple-auth.ts`). Mempelai hanya bisa membaca, menyembunyikan ucapan, dan menandai link tamu terkirim.
- `src/proxy.ts` menyegarkan sesi Supabase untuk `/admin` dan `/dashboard`.

## Media

- Upload dua tahap: browser mengunggah ke `tmp/` lewat signed URL, lalu `finalizeUpload` memproses (gambar diperkecil dan dijadikan WebP dengan sharp) dan menyimpan dengan nama `<kegunaan>_<n>.<ext>` di folder slug.
- Kegunaan dan ukuran ada di `PURPOSES` (`lib/storage/media.ts`). Video maksimal 15MB, musik 8MB, tidak dikompres. Video besar sebaiknya lewat YouTube di blok bebas.
- Tema hanya menerima kegunaan yang terdaftar di `THEME_MEDIA` (`themes/media.ts`).

## Menambah tema baru

1. Buat `src/themes/<slug>/` berisi `index.tsx`, `palette.ts`, `fonts.ts`. Komponen khusus taruh di `src/components/invitation/<gaya>/`.
2. Daftarkan di `themes/index.ts`, `themes/media.ts` (nama dan kegunaan media), `themes/palettes.ts`, `themes/fonts.ts`.
3. Isian khusus tema: tambah konstanta tema di `lib/invitation/spec.ts` dan sertakan di `themes: [...]` isian yang relevan. Kalau ada isian baru, tambahkan juga di `schema.ts` dan `view.ts`.
4. Pembuka baru: tambahkan jenis pintu di `components/invitation/shell.tsx` (union `Door`, cabang render, dan daftar kelas di `NO_DOOR`).
5. Pakai `{...inv.frame.<slot>}` di foto utama supaya Atur posisi berfungsi.
6. Seed undangan contoh di `supabase/seed/invitations/<slug>.json` (slug sama dengan nama tema), gambar sampul `public/img/tema-<slug>-buka.webp` dan `-isi.webp` (780 x 1688).
7. Tambahkan entri tema di admin pengaturan, atau lewat migrasi seperti `0013_settings_themes.sql`, supaya muncul di homepage.

## Database

Tabel utama: `settings` (satu baris JSON), `invitations`, `rsvps`, `wishes`, `guests`, `invitation_members`, `login_attempts`. Semua RLS aktif tanpa policy, aplikasi membaca lewat service role di server.

Migrasi dijalankan manual di SQL Editor sesuai urutan nomor. Migrasi data (`0012`, `0013`) aman dijalankan ulang.

## Konvensi

- Komentar berbahasa Indonesia, singkat, menjelaskan kode (kenapa, bukan apa). Tanpa em dash dan titik koma.
- Label UI campur: istilah antarmuka dalam bahasa Inggris (Live, Draft, Preview, Upload), penjelasan dan petunjuk dalam bahasa Indonesia.
- `src/app/globals.css` memakai CRLF di working tree. Jangan jalankan prettier pada file yang diformat manual.
- Skrip sekali pakai tidak masuk repo.
- Asumsikan tabel dan kolom sudah ada, tidak perlu cadangan untuk migrasi yang belum dijalankan.

## Hal yang gampang terlewat

- Tema game (Co-op Adventure) adalah side scroller. Fokus keyboard memindahkan karakter, jadi jendela modal di dalamnya memakai `<dialog>` dan mencegah fokus dari ketukan.
- Animasi masuk tema membaca `data-inv-state` dari shell. Komponen yang muncul setelah pembuka sebaiknya menunggu status open.
- `fillPreview` mengisi isian kosong draf dengan data undangan contoh supaya pratinjau tidak kosong. Teks contoh ditandai garis kuning.
- Undangan contoh hanya peragaan: RSVP dan ucapan dibalas berhasil tapi tidak disimpan.
- Folder `src/themes/halim-hannah` masih kosong, sisa rencana tema yang belum dibuat.
