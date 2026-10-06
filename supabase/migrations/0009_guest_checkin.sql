-- QR absensi tamu di lokasi (paket Istimewa).
-- qr_token: kode unik tiap tamu, ikut di link pribadi (?k=) dan menjadi isi QR.
-- checked_in_at: kapan tamu dipindai atau ditandai hadir oleh penerima tamu.
-- checkin_token: kode rahasia halaman pemindai /absen/<kode> untuk penerima tamu.
alter table public.guests add column if not exists qr_token text;
alter table public.guests alter column qr_token set default substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);
update public.guests set qr_token = substr(replace(gen_random_uuid()::text, '-', ''), 1, 16) where qr_token is null;
create unique index if not exists guests_qr_token_idx on public.guests (qr_token);
alter table public.guests add column if not exists checked_in_at timestamptz;

alter table public.invitations add column if not exists checkin_token text;
create unique index if not exists invitations_checkin_token_idx on public.invitations (checkin_token);
