-- Add the new Dark/Moody theme to the catalog if it is not already present.
update public.settings s
set data = jsonb_set(
  s.data,
  '{themes}',
  (s.data -> 'themes') || '[{"id":"nocturne","on":true,"name":"Nocturne","slug":"damar-elara","demo":"/damar-elara","tier":"lengkap","category":"gelap","style":"burgundy / candlelight","image":"/img/nocturne/cover.webp","screen":"/img/nocturne/hero.webp"}]'::jsonb
)
where s.id = 1
  and jsonb_typeof(s.data -> 'themes') = 'array'
  and not exists (
    select 1 from jsonb_array_elements(s.data -> 'themes') e
    where e ->> 'slug' = 'nocturne' or e ->> 'id' = 'nocturne'
  );
