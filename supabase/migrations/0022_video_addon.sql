-- Kunci video_youtube untuk add-on Video dari YouTube. Baris isi paket ditambahkan tersembunyi dan mati di semua
-- paket, jadi video hanya terbuka lewat add-on. Add-on yang sudah dibuat admin dicocokkan lewat nama. Kalau belum
-- ada, add-on ditambahkan dalam keadaan mati sampai teks harga dan ketentuan yang baru tayang.
-- Deploy kode dulu sebelum menjalankan ini, karena kode lama tidak mengenal kunci ini.
-- Aman dijalankan ulang. Setelah dijalankan, simpan sekali dari admin Pengaturan atau deploy ulang.

update public.settings s
set data = jsonb_set(
  s.data,
  '{matrix}',
  (s.data -> 'matrix') || $row$[
  { "id": "video", "label": "Video dari YouTube", "kind": "check", "unit": "", "key": "video_youtube", "hidden": true,
    "cells": { "dasar": { "on": false, "n": null }, "lengkap": { "on": false, "n": null }, "istimewa": { "on": false, "n": null } } }
]$row$::jsonb
)
where s.id = 1 and jsonb_typeof(s.data -> 'matrix') = 'array'
  and not exists (select 1 from jsonb_array_elements(s.data -> 'matrix') m where m ->> 'key' = 'video_youtube' or m ->> 'id' = 'video');

update public.settings s
set data = jsonb_set(
  s.data,
  '{addons}',
  (
    select jsonb_agg(case when e ->> 'name' = 'Video dari YouTube' then jsonb_set(e, '{unlock}', '"video_youtube"') else e end order by n)
    from jsonb_array_elements(s.data -> 'addons') with ordinality as t(e, n)
  )
)
where s.id = 1 and jsonb_typeof(s.data -> 'addons') = 'array' and jsonb_array_length(s.data -> 'addons') > 0;

update public.settings s
set data = jsonb_set(
  s.data,
  '{addons}',
  (s.data -> 'addons') || $addon$[
  { "id": "video", "on": false, "name": "Video dari YouTube", "price": 25000, "scope": "Semua paket", "unlock": "video_youtube", "amount": 0 }
]$addon$::jsonb
)
where s.id = 1 and jsonb_typeof(s.data -> 'addons') = 'array'
  and not exists (select 1 from jsonb_array_elements(s.data -> 'addons') x where x ->> 'unlock' = 'video_youtube' or x ->> 'id' = 'video');
