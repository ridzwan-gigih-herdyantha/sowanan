-- Melengkapi daftar tema di pengaturan dengan semua tema yang sudah ada di kode. Pengaturan yang tersimpan sebelum
-- tema-tema ini dibuat hanya berisi lima tema, jadi tema lain tidak muncul di homepage, halaman tema, dan pilihan admin.
-- Tema dicocokkan per slug: entri yang sudah ada tidak diubah, hanya yang belum ada yang ditambahkan di akhir daftar.
-- Pengaturan yang belum pernah disimpan (tanpa kunci themes) tidak disentuh karena aplikasi memakai daftar bawaan.
-- Setelah dijalankan, simpan sekali dari admin Pengaturan atau deploy ulang supaya cache pengaturan diperbarui.

update public.settings s
set data = jsonb_set(
  s.data,
  '{themes}',
  (s.data -> 'themes') || coalesce((
    select jsonb_agg(t order by n)
    from jsonb_array_elements($themes$[
  {
    "id": "sutra",
    "on": true,
    "name": "Sutra",
    "slug": "arya-kirana",
    "demo": "/arya-kirana",
    "tier": "lengkap",
    "category": "elegan",
    "style": "gading / pita emas",
    "image": "/img/tema-arya-kirana-buka.webp",
    "screen": ""
  },
  {
    "id": "rembulan",
    "on": true,
    "name": "Rembulan",
    "slug": "bima-nadia",
    "demo": "/bima-nadia",
    "tier": "lengkap",
    "category": "gelap",
    "style": "langit malam / bulan",
    "image": "/img/tema-bima-nadia-buka.webp",
    "screen": ""
  },
  {
    "id": "lensa",
    "on": true,
    "name": "Lensa",
    "slug": "toni-layla",
    "demo": "/toni-layla",
    "tier": "lengkap",
    "category": "minimalis",
    "style": "foto penuh / editorial",
    "image": "/img/tema-toni-layla-buka.webp",
    "screen": ""
  },
  {
    "id": "petualang",
    "on": true,
    "name": "Co-op Adventure",
    "slug": "arkasa-mentari",
    "demo": "/arkasa-mentari",
    "tier": "lengkap",
    "category": "game",
    "style": "piksel / game 16-bit",
    "image": "/img/tema-arkasa-mentari-buka.webp",
    "screen": ""
  },
  {
    "id": "mekar-mawar",
    "on": true,
    "name": "Mekar Mawar",
    "slug": "ivan-mawar",
    "demo": "/ivan-mawar",
    "tier": "lengkap",
    "category": "floral",
    "style": "cat air / mawar",
    "image": "/img/tema-ivan-mawar-buka.webp",
    "screen": ""
  },
  {
    "id": "kabar-retro",
    "on": true,
    "name": "Kabar Retro No. 27",
    "slug": "galih-ardila",
    "demo": "/galih-ardila",
    "tier": "lengkap",
    "category": "vintage",
    "style": "tabloid / retro pop",
    "image": "/img/tema-galih-ardila-buka.webp",
    "screen": ""
  },
  {
    "id": "horas",
    "on": true,
    "name": "Horas",
    "slug": "bonar-anggi",
    "demo": "/bonar-anggi",
    "tier": "lengkap",
    "category": "adat",
    "style": "batak toba / ulos",
    "image": "/img/tema-bonar-anggi-buka.webp",
    "screen": ""
  }
]$themes$::jsonb) with ordinality as x(t, n)
    where not exists (
      select 1 from jsonb_array_elements(s.data -> 'themes') e where e ->> 'slug' = t ->> 'slug'
    )
    and not exists (
      select 1 from jsonb_array_elements(s.data -> 'themes') e where e ->> 'id' = t ->> 'id'
    )
  ), '[]'::jsonb)
)
where s.id = 1
  and jsonb_typeof(s.data -> 'themes') = 'array';
