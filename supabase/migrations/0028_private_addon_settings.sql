-- Kunci tamu_terundang di pengaturan. Baris isi paket ditambahkan tersembunyi, termasuk di Istimewa. Add-on Lengkap
-- ditambahkan mati sampai teks harga dan ketentuan yang baru tayang.
-- Deploy kode dulu sebelum menjalankan ini, karena kode lama tidak mengenal kunci ini.
-- Aman dijalankan ulang. Setelah dijalankan, simpan sekali dari admin Pengaturan atau deploy ulang.

update public.settings s
set data = jsonb_set(
  s.data,
  '{matrix}',
  (s.data -> 'matrix') || $row$[
  { "id": "terundang", "label": "Undangan khusus tamu terundang", "kind": "check", "unit": "", "key": "tamu_terundang", "hidden": true,
    "cells": { "dasar": { "on": false, "n": null }, "lengkap": { "on": false, "n": null }, "istimewa": { "on": true, "n": null } } }
]$row$::jsonb
)
where s.id = 1 and jsonb_typeof(s.data -> 'matrix') = 'array'
  and not exists (select 1 from jsonb_array_elements(s.data -> 'matrix') m where m ->> 'key' = 'tamu_terundang' or m ->> 'id' = 'terundang');

update public.settings s
set data = jsonb_set(
  s.data,
  '{addons}',
  (s.data -> 'addons') || $addon$[
  { "id": "terundang", "on": false, "name": "Undangan khusus tamu terundang", "price": 50000, "scope": "Lengkap", "unlock": "tamu_terundang", "amount": 0 }
]$addon$::jsonb
)
where s.id = 1 and jsonb_typeof(s.data -> 'addons') = 'array'
  and not exists (select 1 from jsonb_array_elements(s.data -> 'addons') x where x ->> 'unlock' = 'tamu_terundang' or x ->> 'id' = 'terundang');
