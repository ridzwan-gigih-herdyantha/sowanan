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
3. Isi `ADMIN_EMAIL` dan `ADMIN_PASSWORD` di `.env.local`, lalu `pnpm create-admin`.

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

`pnpm dev` · `pnpm build` · `pnpm typecheck` · `pnpm lint` · `pnpm create-admin`
