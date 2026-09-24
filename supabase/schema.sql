create table if not exists public.settings (
  id smallint primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict (id) do nothing;

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  theme text not null,
  data jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.invitations drop constraint if exists invitations_slug_not_reserved;
alter table public.invitations add constraint invitations_slug_not_reserved check (
  slug not in ('tema','harga','order','ketentuan','masuk','kelola','blog',
               'reseller','admin','api','demo','panduan','kontak','img','undangan')
);

create table if not exists public.rsvps (
  id bigint generated always as identity primary key,
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  attending boolean not null,
  guests smallint not null default 1 check (guests between 0 and 20),
  created_at timestamptz not null default now()
);
create index if not exists rsvps_invitation_idx on public.rsvps (invitation_id, created_at desc);

create table if not exists public.wishes (
  id bigint generated always as identity primary key,
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  message text not null check (char_length(message) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists wishes_invitation_idx on public.wishes (invitation_id, created_at desc);

create table if not exists public.login_attempts (
  id bigint generated always as identity primary key,
  ip text not null,
  created_at timestamptz not null default now()
);
create index if not exists login_attempts_ip_idx on public.login_attempts (ip, created_at desc);

alter table public.settings enable row level security;
alter table public.invitations enable row level security;
alter table public.rsvps enable row level security;
alter table public.wishes enable row level security;
alter table public.login_attempts enable row level security;

insert into public.invitations (slug, theme, published)
values ('andi-rina', 'andi-rina', true), ('bagas-sekar', 'bagas-sekar', true), ('hendrawan-larasati', 'hendrawan-larasati', true)
on conflict (slug) do nothing;
