-- Kunci gambar_story untuk add-on Gambar undangan untuk story. Baris isi paket ditambahkan tersembunyi dan mati di
-- semua paket, jadi gambar story hanya terbuka lewat add-on. Add-on yang sudah dibuat admin dicocokkan lewat nama.
-- Kalau belum ada, add-on ditambahkan mati sampai teks harga dan ketentuan yang baru tayang.
-- Deploy kode dulu sebelum menjalankan ini, karena kode lama tidak mengenal kunci ini.
-- Aman dijalankan ulang. Setelah dijalankan, simpan sekali dari admin Pengaturan atau deploy ulang.

update public.settings s
set data = jsonb_set(
  s.data,
  '{matrix}',
  (s.data -> 'matrix') || $row$[
  { "id": "story", "label": "Gambar undangan untuk story", "kind": "check", "unit": "", "key": "gambar_story", "hidden": true,
    "cells": { "dasar": { "on": false, "n": null }, "lengkap": { "on": false, "n": null }, "istimewa": { "on": false, "n": null } } }
]$row$::jsonb
)
where s.id = 1 and jsonb_typeof(s.data -> 'matrix') = 'array'
  and not exists (select 1 from jsonb_array_elements(s.data -> 'matrix') m where m ->> 'key' = 'gambar_story' or m ->> 'id' = 'story');

update public.settings s
set data = jsonb_set(
  s.data,
  '{addons}',
  (
    select jsonb_agg(case when e ->> 'name' = 'Gambar undangan untuk story' then jsonb_set(e, '{unlock}', '"gambar_story"') else e end order by n)
    from jsonb_array_elements(s.data -> 'addons') with ordinality as t(e, n)
  )
)
where s.id = 1 and jsonb_typeof(s.data -> 'addons') = 'array' and jsonb_array_length(s.data -> 'addons') > 0;

update public.settings s
set data = jsonb_set(
  s.data,
  '{addons}',
  (s.data -> 'addons') || $addon$[
  { "id": "story", "on": false, "name": "Gambar undangan untuk story", "price": 25000, "scope": "Semua paket", "unlock": "gambar_story", "amount": 0 }
]$addon$::jsonb
)
where s.id = 1 and jsonb_typeof(s.data -> 'addons') = 'array'
  and not exists (select 1 from jsonb_array_elements(s.data -> 'addons') x where x ->> 'unlock' = 'gambar_story' or x ->> 'id' = 'story');
