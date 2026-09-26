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

1. Buat project (region Singapore), jalankan `supabase/schema.sql` di SQL Editor.
2. Authentication → matikan "Allow new users to sign up".
3. Isi `ADMIN_EMAIL` dan `ADMIN_PASSWORD` di `.env`, lalu `pnpm create-admin`.

### Menambah undangan

```bash
pnpm create-invitation <slug> <tema> [--publish]
# contoh: pnpm create-invitation budi-ani andi-rina --publish
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
| `supabase/schema.sql` | Tabel settings, invitations, rsvps, wishes, login_attempts |

## Scripts

`pnpm dev` · `pnpm build` · `pnpm typecheck` · `pnpm lint` · `pnpm create-admin` · `pnpm create-invitation`
