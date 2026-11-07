-- Undangan khusus tamu terundang: mode private per undangan, kode mempelai, dan pembagian sesi.
-- private: undangan hanya terbuka lewat link berisi kode tamu valid (guests.qr_token) atau kode mempelai.
-- couple_code: kode mempelai, dibuat otomatis, supaya mempelai tidak terkunci dari undangannya sendiri.
-- session_item: nama item susunan acara yang dibagi sesi. Kosong berarti seluruh susunan acara diganti sesi.
-- guests.session_id: sesi tamu. Kosong berarti semua sesi.
-- Jalankan ini sebelum deploy kode, karena kode baru membaca kolom ini. Lanjutkan dengan 0028 setelah deploy.
-- Aman dijalankan ulang.

alter table public.invitations add column if not exists private boolean not null default false;
alter table public.invitations add column if not exists couple_code text;
alter table public.invitations alter column couple_code set default substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);
update public.invitations set couple_code = substr(replace(gen_random_uuid()::text, '-', ''), 1, 16) where couple_code is null;
create unique index if not exists invitations_couple_code_idx on public.invitations (couple_code);
alter table public.invitations add column if not exists session_item text;

create table if not exists public.invitation_sessions (
  id bigint generated always as identity primary key,
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  time text not null,
  until text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists invitation_sessions_invitation_idx on public.invitation_sessions (invitation_id, time);
alter table public.invitation_sessions enable row level security;

-- Sesi yang masih dipakai tamu tidak bisa dihapus, supaya tamunya tidak diam-diam melihat semua sesi.
alter table public.guests add column if not exists session_id bigint references public.invitation_sessions(id);
create index if not exists guests_session_idx on public.guests (session_id);
