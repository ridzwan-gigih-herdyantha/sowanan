-- Samakan id tema, slug demo, dan direktori aset dengan nama pasangan contoh.
update public.settings s
set data = jsonb_set(
  s.data,
  '{themes}',
  (
    select jsonb_agg(
      case
        when e ->> 'id' in ('elaris', 'raka-anindya') or e ->> 'slug' in ('elaris', 'raka-anindya')
          then e || '{"id":"raka-anindya","slug":"raka-anindya","demo":"/raka-anindya","image":"/img/raka-anindya/cover.webp","screen":"/img/raka-anindya/hero.webp"}'::jsonb
        when e ->> 'id' in ('nocturne', 'damar-elara') or e ->> 'slug' in ('nocturne', 'damar-elara')
          then e || '{"id":"damar-elara","slug":"damar-elara","demo":"/damar-elara","image":"/img/damar-elara/cover.webp","screen":"/img/damar-elara/hero.webp"}'::jsonb
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
    where e ->> 'id' in ('elaris', 'raka-anindya', 'nocturne', 'damar-elara')
       or e ->> 'slug' in ('elaris', 'raka-anindya', 'nocturne', 'damar-elara')
  );
