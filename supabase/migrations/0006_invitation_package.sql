-- Paket yang dibeli klien. Kosong berarti belum ditentukan.
alter table public.invitations add column if not exists package text;
alter table public.invitations drop constraint if exists invitations_package_check;
alter table public.invitations add constraint invitations_package_check check (package is null or package in ('dasar', 'lengkap', 'istimewa'));
