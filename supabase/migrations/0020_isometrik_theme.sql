-- Add Isometrik to the game catalog using the couple-name demo slug.
update public.settings s
set data = jsonb_set(
  s.data,
  '{themes}',
  coalesce(s.data -> 'themes', '[]'::jsonb) || '[{"id":"rafi-kayla","on":true,"name":"Isometrik","slug":"rafi-kayla","demo":"/rafi-kayla","tier":"lengkap","category":"game","style":"peta isometrik / gedung","image":"/img/rafi-kayla/cover.webp","screen":"/img/rafi-kayla/hero.webp"}]'::jsonb
)
where s.id = 1
  and not exists (
    select 1 from jsonb_array_elements(coalesce(s.data -> 'themes', '[]'::jsonb)) e
    where e ->> 'id' = 'rafi-kayla' or e ->> 'slug' = 'rafi-kayla'
  );
