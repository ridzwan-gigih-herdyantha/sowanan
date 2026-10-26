-- Tambahkan tema Elaris ke daftar tema yang tersimpan, tanpa mengubah entri yang sudah ada.
update public.settings s
set data = jsonb_set(
  s.data,
  '{themes}',
  (s.data -> 'themes') || '[{"id":"elaris","on":true,"name":"Elaris","slug":"elaris","demo":"/elaris","tier":"lengkap","category":"elegan","style":"editorial / zaitun","image":"/img/tema-elaris-buka.svg","screen":""}]'::jsonb
)
where s.id = 1
  and jsonb_typeof(s.data -> 'themes') = 'array'
  and not exists (
    select 1 from jsonb_array_elements(s.data -> 'themes') e
    where e ->> 'slug' = 'elaris' or e ->> 'id' = 'elaris'
  );
