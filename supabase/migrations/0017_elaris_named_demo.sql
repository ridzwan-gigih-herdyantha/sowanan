-- Gunakan nama pasangan untuk slug demo Elaris.
update public.settings s
set data = jsonb_set(
  s.data,
  '{themes}',
  (
    select jsonb_agg(
      case when e ->> 'id' = 'elaris' or e ->> 'slug' = 'elaris'
        then e || '{"slug":"raka-anindya","demo":"/raka-anindya"}'::jsonb
        else e
      end
      order by ord
    )
    from jsonb_array_elements(s.data -> 'themes') with ordinality as t(e, ord)
  )
)
where s.id = 1
  and exists (
    select 1 from jsonb_array_elements(s.data -> 'themes') e
    where e ->> 'id' = 'elaris' or e ->> 'slug' = 'elaris'
  );
