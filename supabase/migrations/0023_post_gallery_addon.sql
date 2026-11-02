-- Kunci galeri_pasca untuk add-on Galeri pasca acara. Baris isi paket ditambahkan tersembunyi dan mati di semua
-- paket, jadi kuota foto pasca acara hanya datang dari add-on, 10 foto per unit. Add-on yang sudah dibuat admin
-- dicocokkan lewat nama. Kalau belum ada, add-on ditambahkan mati sampai teks harga dan ketentuan yang baru tayang.
-- Deploy kode dulu sebelum menjalankan ini, karena kode lama tidak mengenal kunci ini.
-- Aman dijalankan ulang. Setelah dijalankan, simpan sekali dari admin Pengaturan atau deploy ulang.

update public.settings s
set data = jsonb_set(
  s.data,
  '{matrix}',
  (s.data -> 'matrix') || $row$[
  { "id": "pasca", "label": "Galeri pasca acara", "kind": "count", "unit": "{n} foto", "key": "galeri_pasca", "hidden": true,
    "cells": { "dasar": { "on": false, "n": null }, "lengkap": { "on": false, "n": null }, "istimewa": { "on": false, "n": null } } }
]$row$::jsonb
)
where s.id = 1 and jsonb_typeof(s.data -> 'matrix') = 'array'
  and not exists (select 1 from jsonb_array_elements(s.data -> 'matrix') m where m ->> 'key' = 'galeri_pasca' or m ->> 'id' = 'pasca');

update public.settings s
set data = jsonb_set(
  s.data,
  '{addons}',
  (
    select jsonb_agg(
      case when e ->> 'name' = 'Galeri pasca acara, per 10 foto'
        then jsonb_set(jsonb_set(e, '{unlock}', '"galeri_pasca"'), '{amount}', '10')
        else e
      end
      order by n
    )
    from jsonb_array_elements(s.data -> 'addons') with ordinality as t(e, n)
  )
)
where s.id = 1 and jsonb_typeof(s.data -> 'addons') = 'array' and jsonb_array_length(s.data -> 'addons') > 0;

update public.settings s
set data = jsonb_set(
  s.data,
  '{addons}',
  (s.data -> 'addons') || $addon$[
  { "id": "pasca", "on": false, "name": "Galeri pasca acara, per 10 foto", "price": 25000, "scope": "Semua paket", "unlock": "galeri_pasca", "amount": 10 }
]$addon$::jsonb
)
where s.id = 1 and jsonb_typeof(s.data -> 'addons') = 'array'
  and not exists (select 1 from jsonb_array_elements(s.data -> 'addons') x where x ->> 'unlock' = 'galeri_pasca' or x ->> 'id' = 'pasca');
