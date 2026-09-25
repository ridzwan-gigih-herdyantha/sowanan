const img = (name: string) => `/img/bagas-sekar/${name}.jpg`;

export const invitation = {
  slug: "bagas-sekar",
  monogram: "B / S",
  groom: { name: "Bagas", full: "Bagas Wicaksono", parents: "Bapak Arif Wicaksono & Ibu Ratna Dewi", role: "Putra dari" },
  bride: { name: "Sekar", full: "Sekar Ayuningtyas", parents: "Bapak Budi Hartono & Ibu Sri Wahyuni", role: "Putri dari" },
  date: "2027-02-14T09:00:00+07:00",
  end: "2027-02-14T14:00:00+07:00",
  dayLabel: "Minggu",
  dateShort: "14 . 02 . 2027",
  dateLong: "Minggu, 14 Februari 2027",
  city: "Yogyakarta, Indonesia",
  tagline: "Dua hati, satu arah.",
  heroQuote: "Kami tidak mencari yang sempurna. Kami memilih untuk terus tumbuh, bersama.",
  rsvpQuote: "Kehadiranmu adalah hadiah terindah bagi kami.",
  events: [
    { time: "09.00", name: "Akad Nikah" },
    { time: "11.00", name: "Resepsi", until: "14.00" },
  ],
  venue: {
    name: "Galeri Lantai Tiga",
    address: "Jl. Prawirotaman No. 7, Yogyakarta",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Prawirotaman+Yogyakarta",
  },
  rsvpDeadline: "1 Februari 2027",
  honor:
    "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.",
  images: {
    hero: img("hero"),
    heroWide: img("hero-wide"),
    detail: img("detail"),
    venue: img("venue"),
    rsvp: img("rsvp"),
    grain: "/img/bagas-sekar/grain.webp",
    qris: "/img/bagas-sekar/qris.png",
    og: "/img/bagas-sekar/og.jpg",
  },
  music: "/img/bagas-sekar/music.mp3",
  couplePhotos: [
    { src: img("couple-1"), alt: "Sekar tersenyum memegang buket, Bagas di sampingnya" },
    { src: img("couple-2"), alt: "Bagas dan Sekar berdiri berdampingan di depan rumah" },
    { src: img("couple-3"), alt: "Bagas dan Sekar duduk berdua di taman" },
  ],
  story: [
    {
      title: "Pertama Bertemu",
      date: "05.06.2019",
      image: img("story-1"),
      short: "Dua ayunan, satu taman, dan percakapan yang tidak ingin kami akhiri.",
      long: "Kami duduk di dua ayunan yang bersebelahan, menunggu hujan reda di taman kampus. Obrolan tentang buku berubah jadi obrolan tentang mimpi. Hujan reda, tapi tidak ada yang beranjak.",
    },
    {
      title: "Tumbuh Bersama",
      date: "18.09.2021",
      image: img("story-2"),
      short: "Belajar saling menunggu, saling mendorong, dan saling pulang.",
      long: "Dua tahun jarak jauh mengajari kami hal yang sederhana: yang penting bukan seberapa sering bertemu, tapi seberapa yakin untuk kembali.",
    },
    {
      title: "Lamaran",
      date: "20.10.2025",
      image: img("story-4"),
      video: { src: "/img/bagas-sekar/rings.mp4", poster: "/img/bagas-sekar/rings-poster.jpg" },
      short: "Satu cincin, dua keluarga, dan janji yang diucapkan dengan tenang.",
      long: "Di ruang tamu yang sederhana, dua keluarga duduk bersama. Bagas memasangkan cincin dengan tangan yang sedikit gemetar. Semua orang tersenyum, termasuk kami.",
    },
    {
      title: "Hari Pernikahan",
      date: "14.02.2027",
      image: img("couple-2"),
      short: "Ruang yang kami bangun, kini terbuka untuk kalian.",
      long: "Kami ingin hari ini sederhana dan jujur, dikelilingi orang-orang yang menemani perjalanan kami sejauh ini. Terima kasih sudah menjadi bagian darinya.",
    },
  ],
  gallery: [
    { src: img("g-2"), w: 2200, h: 1467, alt: "Sekar menyentuh wajah Bagas dengan buket di tangan", caption: "Buket dan sentuhan, 2026" },
    { src: img("g-1"), w: 1800, h: 2295, alt: "Sekar mencubit pipi Bagas sambil tertawa", caption: "Tawa di taman, 2026" },
    { src: img("g-5"), w: 1800, h: 2700, alt: "Bagas dan Sekar duduk di tangga", caption: "Tangga roster, 2026" },
    { src: img("g-3"), w: 1800, h: 1462, alt: "Bagas dan Sekar di bawah pepohonan", caption: "Di bawah pepohonan, 2026" },
    { src: img("g-4"), w: 1800, h: 1457, alt: "Bagas dan Sekar di dua ayunan", caption: "Dua ayunan, 2019 dan 2026" },
    { src: img("g-6"), w: 1800, h: 1519, alt: "Sekar tertawa menatap Bagas", caption: "Tatapan pertama, 2026" },
  ],
  gifts: [
    { bank: "Bank Contoh", number: "0000 2222 4444", holder: "Bagas Wicaksono" },
    { bank: "Bank Contoh", number: "1111 3333 5555", holder: "Sekar Ayuningtyas" },
  ],
  sampleWishes: [
    { id: "bs-sample-1", name: "Keluarga Besar Hartono", message: "Selamat menempuh hidup baru. Semoga menjadi keluarga yang sakinah, mawaddah, warahmah." },
    { id: "bs-sample-2", name: "Dimas", message: "Dari ayunan kampus sampai pelaminan. Bangga sama kalian berdua." },
    { id: "bs-sample-3", name: "Bu Lestari", message: "Semoga rumah tangga kalian selalu dilimpahi keberkahan dan ketenangan." },
    { id: "bs-sample-4", name: "Rekan Studio Sekar", message: "Selamat, Sekar dan Bagas. Semoga bahagia selalu dan terus saling menguatkan." },
  ],
} as const;

export type Invitation = typeof invitation;
