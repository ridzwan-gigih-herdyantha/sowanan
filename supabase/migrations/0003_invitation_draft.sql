-- Draf editor admin. Halaman publik tetap membaca kolom data, draf baru pindah ke data saat diterbitkan.
alter table public.invitations add column if not exists draft jsonb;
alter table public.invitations drop constraint if exists invitations_draft_object;
alter table public.invitations add constraint invitations_draft_object check (draft is null or jsonb_typeof(draft) = 'object');
