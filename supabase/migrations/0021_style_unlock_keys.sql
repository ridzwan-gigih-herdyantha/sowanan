-- Kunci warna_tema dipecah jadi palet_varian, palet_custom, font_varian, dan font_custom, supaya tiap add-on
-- bisa membuka satu bagian gaya. Baris isi paket dan add-on yang memakai warna_tema dipindah ke palet_varian,
-- jadi kartu harga tidak berubah. Baris kunci baru ditambahkan tersembunyi dari kartu harga, dan add-on baru
-- ditambahkan dalam keadaan mati sampai teks harga dan ketentuan yang baru tayang.
-- Aman dijalankan ulang. Setelah dijalankan, simpan sekali dari admin Pengaturan atau deploy ulang.

update public.settings s
set data = jsonb_set(
  s.data,
  '{matrix}',
  (
    select jsonb_agg(case when e ->> 'key' = 'warna_tema' then jsonb_set(e, '{key}', '"palet_varian"') else e end order by n)
    from jsonb_array_elements(s.data -> 'matrix') with ordinality as t(e, n)
  )
)
where s.id = 1 and jsonb_typeof(s.data -> 'matrix') = 'array' and jsonb_array_length(s.data -> 'matrix') > 0;

update public.settings s
set data = jsonb_set(
  s.data,
  '{matrix}',
  (s.data -> 'matrix') || coalesce((
    select jsonb_agg(r order by n)
    from jsonb_array_elements($rows$[
  { "id": "font", "label": "Font, pilih dari varian", "kind": "check", "unit": "", "key": "font_varian", "hidden": true,
    "cells": { "dasar": { "on": false, "n": null }, "lengkap": { "on": true, "n": null }, "istimewa": { "on": true, "n": null } } },
  { "id": "paletcustom", "label": "Palet warna custom sesuai acara", "kind": "check", "unit": "", "key": "palet_custom", "hidden": true,
    "cells": { "dasar": { "on": false, "n": null }, "lengkap": { "on": false, "n": null }, "istimewa": { "on": true, "n": null } } },
  { "id": "fontcustom", "label": "Font custom dari Google Fonts", "kind": "check", "unit": "", "key": "font_custom", "hidden": true,
    "cells": { "dasar": { "on": false, "n": null }, "lengkap": { "on": false, "n": null }, "istimewa": { "on": true, "n": null } } }
]$rows$::jsonb) with ordinality as t(r, n)
    where not exists (
      select 1 from jsonb_array_elements(s.data -> 'matrix') m
      where m ->> 'key' = r ->> 'key' or m ->> 'id' = r ->> 'id'
    )
  ), '[]'::jsonb)
)
where s.id = 1 and jsonb_typeof(s.data -> 'matrix') = 'array';

update public.settings s
set data = jsonb_set(
  s.data,
  '{addons}',
  (
    select jsonb_agg(
      case
        -- Add-on gaya yang sudah dibuat admin dicocokkan lewat nama, dari tabel add-on di Daftar Perubahan.
        when e ->> 'name' = 'Pilih 1 dari 4 varian palet' then jsonb_set(e, '{unlock}', '"palet_varian"')
        when e ->> 'name' = 'Pilih varian font' then jsonb_set(e, '{unlock}', '"font_varian"')
        when e ->> 'name' = 'Palet warna custom' then jsonb_set(e, '{unlock}', '"palet_custom"')
        when e ->> 'name' = 'Font custom dari Google Fonts' then jsonb_set(e, '{unlock}', '"font_custom"')
        when e ->> 'unlock' = 'warna_tema' then jsonb_set(e, '{unlock}', '"palet_varian"')
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
  (s.data -> 'addons') || coalesce((
    select jsonb_agg(a order by n)
    from jsonb_array_elements($addons$[
  { "id": "palet", "on": false, "name": "Pilih 1 dari 4 varian palet", "price": 25000, "scope": "Dasar", "unlock": "palet_varian", "amount": 0 },
  { "id": "font", "on": false, "name": "Pilih varian font", "price": 25000, "scope": "Dasar", "unlock": "font_varian", "amount": 0 },
  { "id": "paletcustom", "on": false, "name": "Palet warna custom", "price": 25000, "scope": "Lengkap", "unlock": "palet_custom", "amount": 0 },
  { "id": "fontcustom", "on": false, "name": "Font custom dari Google Fonts", "price": 25000, "scope": "Lengkap", "unlock": "font_custom", "amount": 0 }
]$addons$::jsonb) with ordinality as t(a, n)
    -- Hanya ditambahkan kalau belum ada add-on yang membuka kunci yang sama.
    where not exists (select 1 from jsonb_array_elements(s.data -> 'addons') x where x ->> 'id' = a ->> 'id' or x ->> 'unlock' = a ->> 'unlock')
  ), '[]'::jsonb)
)
where s.id = 1 and jsonb_typeof(s.data -> 'addons') = 'array';
