-- Pisahkan versi pixel art Isometrik menjadi tema Piksel dengan slug demo dimas-salsa.
-- Isometrik (rafi-kayla) kembali memakai peta lukisan.
update public.settings s
set data = jsonb_set(
  s.data,
  '{themes}',
  coalesce(s.data -> 'themes', '[]'::jsonb) || '[{"id":"dimas-salsa","on":true,"name":"Piksel","slug":"dimas-salsa","demo":"/dimas-salsa","tier":"lengkap","category":"game","style":"kota piksel / gedung","image":"/img/dimas-salsa/cover.webp","screen":"/img/dimas-salsa/hero.webp"}]'::jsonb
)
where s.id = 1
  and not exists (
    select 1 from jsonb_array_elements(coalesce(s.data -> 'themes', '[]'::jsonb)) e
    where e ->> 'id' = 'dimas-salsa' or e ->> 'slug' = 'dimas-salsa'
  );
