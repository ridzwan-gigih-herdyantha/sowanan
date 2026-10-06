-- Arsip permanen. Undangan dibekukan 30 hari setelah acara, dihitung dari tanggal acara di data undangan.
-- unlocked_until: admin membuka editor sementara untuk koreksi setelah undangan beku.
-- archive_notified_at: kapan pemberitahuan tujuh hari sebelum beku dikirim ke klien.
alter table public.invitations add column if not exists unlocked_until timestamptz;
alter table public.invitations add column if not exists archive_notified_at timestamptz;
