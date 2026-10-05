-- Add-on yang sudah dibayar per undangan, berupa jumlah per id add-on di pengaturan.
-- Contoh: {"foto": 2, "musik": 1}. Add-on membuka batas paket di editor, misalnya +10 foto galeri per unit.
alter table public.invitations add column if not exists addons jsonb not null default '{}'::jsonb;
