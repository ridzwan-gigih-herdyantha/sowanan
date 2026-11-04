-- Add-on Palet warna custom dan Font custom dinyalakan untuk paket Lengkap, dan teks Ketentuan menyebut keduanya.
-- Harga yang sudah diatur admin tidak diubah. Kalimat Ketentuan yang sudah disunting admin dibiarkan, jadi periksa
-- halaman /ketentuan setelah dijalankan.
-- Deploy kode dulu sebelum menjalankan ini, supaya add-on yang tampil sudah membuka editor yang baru.
-- Aman dijalankan ulang. Setelah dijalankan, simpan sekali dari admin Pengaturan atau deploy ulang.

update public.settings s
set data = jsonb_set(
  s.data,
  '{addons}',
  (
    select jsonb_agg(case when e ->> 'unlock' in ('palet_custom', 'font_custom') then jsonb_set(e, '{on}', 'true') else e end order by n)
    from jsonb_array_elements(s.data -> 'addons') with ordinality as t(e, n)
  )
)
where s.id = 1 and jsonb_typeof(s.data -> 'addons') = 'array' and jsonb_array_length(s.data -> 'addons') > 0;

update public.settings s
set data = replace(
  s.data::text,
  'dan nama tamu yang muncul di undangan.',
  'dan nama tamu yang muncul di undangan. Palet warna custom dan font custom dari Google Fonts tersedia sebagai add-on.'
)::jsonb
where s.id = 1 and s.data::text not like '%font custom dari Google Fonts tersedia sebagai add-on%';

update public.settings s
set data = replace(
  s.data::text,
  'ditambah daftar tamu yang bisa diunduh ke Excel',
  'ditambah palet warna custom, font custom dari Google Fonts, daftar tamu yang bisa diunduh ke Excel'
)::jsonb
where s.id = 1;
