alter table public.invitations drop constraint if exists invitations_data_object;
alter table public.invitations add constraint invitations_data_object check (jsonb_typeof(data) = 'object');

create index if not exists invitations_published_idx on public.invitations (published);

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end
$$;

drop trigger if exists invitations_touch_updated_at on public.invitations;
create trigger invitations_touch_updated_at
before update on public.invitations
for each row execute function public.touch_updated_at();

drop trigger if exists settings_touch_updated_at on public.settings;
create trigger settings_touch_updated_at
before update on public.settings
for each row execute function public.touch_updated_at();
