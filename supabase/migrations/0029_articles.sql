-- Artikel situs: dikelola di /admin/artikel, tayang di /artikel. Hanya dibaca lewat service role, seperti pengaturan.
-- Artikel yang tayang wajib lengkap, supaya halaman publik tidak perlu menangani thumbnail atau isi yang kosong.
-- Aman dijalankan ulang. Artikel contoh di bawah hanya ditambahkan kalau slug-nya belum ada.

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 80),
  title text not null check (char_length(title) between 1 and 160),
  category text not null default '',
  thumbnail text not null default '',
  content text not null default '',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint articles_published_complete check (not published or (thumbnail <> '' and content <> '' and category <> ''))
);
create index if not exists articles_published_idx on public.articles (published, created_at desc);

alter table public.articles enable row level security;

-- Slug yang dipakai halaman sistem. Disamakan dengan RESERVED_SLUGS di src/lib/reserved-slugs.ts.
alter table public.invitations drop constraint if exists invitations_slug_not_reserved;
alter table public.invitations add constraint invitations_slug_not_reserved check (
  slug not in ('tema','harga','order','ketentuan','masuk','kelola','blog',
               'reseller','admin','api','demo','panduan','kontak','img','undangan',
               'absen','dashboard','login','artikel')
);

insert into public.articles (slug, title, category, thumbnail, published, content)
values (
  'menyusun-daftar-tamu-tanpa-drama',
  'Menyusun Daftar Tamu Pernikahan Tanpa Drama',
  'Persiapan',
  '/img/hendrawan-larasati/g-2.jpg',
  true,
  $article$<p>Daftar tamu sering jadi bagian persiapan yang paling lama selesai. Bukan karena sulit ditulis, tapi karena setiap nama membawa pertimbangan: kapasitas gedung, anggaran katering, dan perasaan keluarga. Tiga langkah ini membantu Anda menyusunnya dengan lebih tenang.</p>
<h2>Mulai dari angka, bukan dari nama</h2>
<p>Tentukan dulu jumlah tamu yang sanggup ditampung gedung dan anggaran. Dari situ, bagi jatahnya dengan <strong>kesepakatan bersama</strong> antara kedua keluarga dan pasangan.</p>
<blockquote><p>Hitung satu undangan untuk rata-rata dua orang, karena banyak tamu datang bersama pasangan atau anak.</p></blockquote>
<h2>Bagi tamu ke dalam tiga kelompok</h2>
<ul>
<li><strong>Wajib hadir:</strong> keluarga inti, kerabat dekat, dan sahabat.</li>
<li><strong>Sebaiknya diundang:</strong> rekan kerja dan tetangga dekat.</li>
<li><strong>Kalau masih ada tempat:</strong> kenalan yang sudah lama tidak bertemu.</li>
</ul>
<h2>Catat di satu tempat</h2>
<p>Satu daftar bersama mencegah nama tertulis dua kali atau justru terlewat. Kolom berikut biasanya sudah cukup:</p>
<table><thead><tr><th>Nama</th><th>Pihak</th><th>Jumlah</th><th>Status</th></tr></thead>
<tbody><tr><td>Keluarga Bapak Hadi</td><td>Mempelai pria</td><td>4</td><td>Sudah diundang</td></tr>
<tr><td>Rina dan pasangan</td><td>Mempelai wanita</td><td>2</td><td>Hadir</td></tr></tbody></table>
<h3>Pantau jawaban tamu</h3>
<p>Beri batas waktu RSVP sekitar dua minggu sebelum acara, supaya jumlah final bisa diteruskan ke katering. Hubungi tamu yang belum menjawab beberapa hari sebelum batas itu.</p>
<p>Daftar yang rapi membuat hari-hari menjelang acara jauh lebih ringan. Sisanya tinggal menikmati momen bersama orang-orang yang Anda pilih.</p>$article$
)
on conflict (slug) do nothing;
