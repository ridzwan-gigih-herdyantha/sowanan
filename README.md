# Sowanan

Website jasa undangan pernikahan digital | sowanan.com. Next.js 16 (App Router, Cache Components) + Supabase + Tailwind v4.

## Setup

```bash
pnpm install
cp .env.example .env.local   # isi kredensial Supabase & Meta Pixel
pnpm dev
```

Tanpa env Supabase, homepage tetap jalan dengan `DEFAULT_SETTINGS` di `src/lib/settings.ts`.

### Supabase

1. Buat project (region Singapore), jalankan file di `supabase/migrations/` berurutan (`0001`, `0002`, ...) di SQL Editor.
2. Authentication → matikan "Allow new users to sign up".
3. Isi `ADMIN_EMAIL` dan `ADMIN_PASSWORD` di `.env`, lalu `pnpm create-admin`.

### Data undangan

Isi undangan (mempelai, acara, cerita, galeri, rekening, section aktif) disimpan di kolom `invitations.data` dengan skema `src/lib/invitation/schema.ts`. Tiga undangan contoh ada di `supabase/seed/invitations/*.json`.

```bash
pnpm seed-invitations            # semua
pnpm seed-invitations andi-rina  # satu undangan
```

Seed memvalidasi data dengan skema yang sama, lalu upsert per slug. Ucapan contoh di `supabase/seed/wishes.json` hanya ditambahkan kalau belum ada. Tanpa env Supabase, halaman undangan membaca file seed langsung.

### Menambah undangan

Lewat admin: `/admin/undangan`, isi link dan tema, lalu lengkapi di editor. Draf tersimpan otomatis. Tombol Simpan versi final hanya jalan kalau isian wajib lengkap (aturannya di `src/lib/invitation/spec.ts`), dan switch Tayang membuka undangan ke publik. Daftar tamu ada di tab Tamu (tempel daftar atau import .xlsx/.csv).

Lewat terminal, membuat draf kosong:

```bash
pnpm create-invitation <slug> <tema>
# contoh: pnpm create-invitation budi-ani andi-rina
```

Slug divalidasi dulu (`src/lib/reserved-slugs.ts`): 3 sampai 60 karakter, huruf kecil, angka, dan tanda hubung, tidak boleh memakai slug sistem (tema, harga, order, ketentuan, masuk, kelola, blog, reseller, admin, api, demo, panduan, kontak), dan belum dipakai undangan lain. Database juga menolak slug terlarang lewat constraint `invitations_slug_not_reserved`. Slug permanen setelah link disebar.

## Struktur

| Path | Isi |
| --- | --- |
| `src/app/page.tsx` | Homepage, static; nilai dari `getSettings()` |
| `src/app/[slug]` | Halaman undangan (noindex) |
| `src/app/ketentuan` | Ketentuan layanan |
| `src/app/admin` | Pengaturan admin (noindex) |
| `src/lib/settings.ts` | Pengaturan + cache (`cacheTag("settings")`, invalidate dengan `updateTag`) |
| `src/lib/reserved-slugs.ts` | Slug terlarang + validasi |
| `src/components/meta-pixel.tsx` | Meta Pixel + event Lead/Contact untuk semua link `wa.me` |
| `supabase/migrations/` | Skema database, dijalankan berurutan |
| `supabase/seed/` | Data undangan contoh dan ucapan contoh |
| `src/lib/invitation/` | Skema data undangan, loader (cache per slug), dan view untuk tema |

## Scripts

`pnpm dev` · `pnpm build` · `pnpm typecheck` · `pnpm lint` · `pnpm create-admin` · `pnpm create-invitation` · `pnpm seed-invitations`
