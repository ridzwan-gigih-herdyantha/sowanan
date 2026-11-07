-- Kunci undangan_kedua untuk add-on Undangan kedua untuk acara terpisah. Baris isi paket ditambahkan tersembunyi dan
-- mati di semua paket, jadi duplikat undangan hanya terbuka lewat add-on. Add-on yang sudah dibuat admin dicocokkan
-- lewat nama. Kalau belum ada, add-on ditambahkan mati sampai teks harga dan ketentuan yang baru tayang.
-- Deploy kode dulu sebelum menjalankan ini, karena kode lama tidak mengenal kunci ini.
-- Aman dijalankan ulang. Setelah dijalankan, simpan sekali dari admin Pengaturan atau deploy ulang.

update public.settings s
set data = jsonb_set(
  s.data,
  '{matrix}',
  (s.data -> 'matrix') || $row$[
  { "id": "kedua", "label": "Undangan kedua untuk acara terpisah", "kind": "check", "unit": "", "key": "undangan_kedua", "hidden": true,
    "cells": { "dasar": { "on": false, "n": null }, "lengkap": { "on": false, "n": null }, "istimewa": { "on": false, "n": null } } }
]$row$::jsonb
)
where s.id = 1 and jsonb_typeof(s.data -> 'matrix') = 'array'
  and not exists (select 1 from jsonb_array_elements(s.data -> 'matrix') m where m ->> 'key' = 'undangan_kedua' or m ->> 'id' = 'kedua');

update public.settings s
set data = jsonb_set(
  s.data,
  '{addons}',
  (
    select jsonb_agg(case when e ->> 'name' = 'Undangan kedua untuk acara terpisah' then jsonb_set(e, '{unlock}', '"undangan_kedua"') else e end order by n)
    from jsonb_array_elements(s.data -> 'addons') with ordinality as t(e, n)
  )
)
where s.id = 1 and jsonb_typeof(s.data -> 'addons') = 'array' and jsonb_array_length(s.data -> 'addons') > 0;

update public.settings s
set data = jsonb_set(
  s.data,
  '{addons}',
  (s.data -> 'addons') || $addon$[
  { "id": "kedua", "on": false, "name": "Undangan kedua untuk acara terpisah", "price": 50000, "scope": "Lengkap dan Istimewa", "unlock": "undangan_kedua", "amount": 0 }
]$addon$::jsonb
)
where s.id = 1 and jsonb_typeof(s.data -> 'addons') = 'array'
  and not exists (select 1 from jsonb_array_elements(s.data -> 'addons') x where x ->> 'unlock' = 'undangan_kedua' or x ->> 'id' = 'kedua');
