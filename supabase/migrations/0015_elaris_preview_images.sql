-- Point the catalog mockups at real Elaris artwork and show its photo after opening.
update public.settings s
set data = jsonb_set(
  s.data,
  '{themes}',
  (
    select jsonb_agg(
      case when e ->> 'slug' = 'elaris' or e ->> 'id' = 'elaris'
        then e || '{"image":"/img/elaris/cover.webp","screen":"/img/elaris/hero.webp"}'::jsonb
        else e
      end
      order by ord
    )
    from jsonb_array_elements(s.data -> 'themes') with ordinality as t(e, ord)
  )
)
where s.id = 1
  and jsonb_typeof(s.data -> 'themes') = 'array'
  and exists (select 1 from jsonb_array_elements(s.data -> 'themes') e where e ->> 'slug' = 'elaris' or e ->> 'id' = 'elaris');
