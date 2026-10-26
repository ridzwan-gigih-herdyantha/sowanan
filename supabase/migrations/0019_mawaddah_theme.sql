-- Add Mawaddah to the Islami catalog using the couple-name demo slug.
update public.settings s
set data = jsonb_set(
  s.data,
  '{themes}',
  coalesce(s.data -> 'themes', '[]'::jsonb) || '[{"id":"faris-najwa","on":true,"name":"Mawaddah","slug":"faris-najwa","demo":"/faris-najwa","tier":"lengkap","category":"islami","style":"zamrud / geometri Andalusia","image":"/img/faris-najwa/cover.webp","screen":"/img/faris-najwa/hero.webp"}]'::jsonb
)
where s.id = 1
  and not exists (
    select 1 from jsonb_array_elements(coalesce(s.data -> 'themes', '[]'::jsonb)) e
    where e ->> 'id' = 'faris-najwa' or e ->> 'slug' = 'faris-najwa'
  );
