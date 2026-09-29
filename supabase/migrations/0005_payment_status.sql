-- Status pembayaran. Undangan belum lunas tampil dengan watermark BELUM AKTIF.
alter table public.invitations add column if not exists payment_status text not null default 'belum_lunas';
alter table public.invitations drop constraint if exists invitations_payment_status_check;
alter table public.invitations add constraint invitations_payment_status_check check (payment_status in ('belum_lunas', 'lunas'));

-- Undangan contoh di homepage selalu lunas.
update public.invitations set payment_status = 'lunas' where slug in ('andi-rina', 'bagas-sekar', 'hendrawan-larasati');
