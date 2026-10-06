-- Tamu yang memindai QR mempelai di lokasi tapi tidak ada di daftar tamu dicatat sebagai datang langsung.
alter table public.guests add column if not exists walk_in boolean not null default false;
