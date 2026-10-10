-- Akses mempelai ke dashboard (/dashboard/user).
-- Akun mempelai dibuat admin di Supabase Auth. Tabel ini mengikat akun ke undangan yang boleh dibuka.
-- Satu undangan bisa punya lebih dari satu pengelola, dan satu akun bisa memegang lebih dari satu undangan.
create table if not exists public.invitation_members (
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'mempelai' check (role in ('mempelai')),
  created_at timestamptz not null default now(),
  primary key (invitation_id, user_id)
);
create index if not exists invitation_members_user_idx on public.invitation_members (user_id);
-- Sama seperti tabel lain, hanya dibaca server lewat service role. Tanpa policy berarti tertutup untuk klien.
alter table public.invitation_members enable row level security;

-- Ucapan yang disembunyikan tidak tampil di undangan, tapi tetap tersimpan dan bisa ditampilkan lagi.
alter table public.wishes add column if not exists hidden_at timestamptz;
alter table public.wishes add column if not exists hidden_by text;
alter table public.wishes drop constraint if exists wishes_hidden_by_check;
alter table public.wishes add constraint wishes_hidden_by_check check (hidden_by is null or hidden_by in ('admin', 'mempelai'));

-- Percobaan login admin dan mempelai dihitung terpisah supaya tidak saling mengunci.
alter table public.login_attempts add column if not exists scope text not null default 'admin';
create index if not exists login_attempts_scope_ip_idx on public.login_attempts (scope, ip, created_at desc);

-- Slug yang dipakai halaman sistem. Disamakan dengan RESERVED_SLUGS di src/lib/reserved-slugs.ts.
alter table public.invitations drop constraint if exists invitations_slug_not_reserved;
alter table public.invitations add constraint invitations_slug_not_reserved check (
  slug not in ('tema','harga','order','ketentuan','masuk','kelola','blog',
               'reseller','admin','api','demo','panduan','kontak','img','undangan',
               'absen','dashboard','login')
);
