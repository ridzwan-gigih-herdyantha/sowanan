-- Tamu yang memindai QR mempelai di lokasi tapi tidak ada di daftar tamu dicatat sebagai datang langsung.
alter table public.guests add column if not exists walk_in boolean not null default false;

-- Admin bisa membuka absensi lebih awal dari jadwal. Kosong berarti mengikuti jadwal acara.
alter table public.invitations add column if not exists checkin_opened_at timestamptz;
