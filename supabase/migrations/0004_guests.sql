-- Daftar tamu per undangan. Link personal memakai ?to=<nama>.
create table if not exists public.guests (
  id bigint generated always as identity primary key,
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  phone text check (phone ~ '^62[0-9]{7,13}$'),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists guests_invitation_idx on public.guests (invitation_id, created_at);
alter table public.guests enable row level security;

-- Template pesan WhatsApp untuk tamu. Placeholder: {nama} {link} {mempelai} {tanggal}
alter table public.invitations add column if not exists guest_message text;
