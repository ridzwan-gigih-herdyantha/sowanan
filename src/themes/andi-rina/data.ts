const img = (name: string) => `/img/andi-rina/${name}.jpg`;

export const invitation = {
  slug: "andi-rina",
  monogram: "A&R",
  groom: { name: "Andi", full: "Andi Pratama", parents: "Bapak Hadi Susanto & Ibu Wulan Sari", role: "Putra dari" },
  bride: { name: "Rina", full: "Rina Maharani", parents: "Bapak Joko Santoso & Ibu Endah Lestari", role: "Putri dari" },
  date: "2026-12-12T08:00:00+07:00",
  end: "2026-12-12T14:00:00+07:00",
  dayLabel: "Sabtu",
  dateShort: "12 . 12 . 2026",
  dateLong: "Sabtu, 12 Desember 2026",
  filmStamp: "'26 12 12",
  city: "Semarang, Indonesia",
  tagline: "Dua hati, satu perjalanan panjang.",
  events: [
    { time: "08.00", name: "Akad Nikah" },
    { time: "11.00", name: "Resepsi", until: "14.00" },
  ],
  venue: {
    name: "Pendopo Kembang Sore",
    address: "Jl. Kembang Sore No. 12, Kota Lama, Semarang",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Kota+Lama+Semarang",
  },
  rsvpDeadline: "1 Desember 2026",
  honor:
    "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.",
  quote:
    "Bukan tentang siapa yang paling sempurna, tapi tentang dua orang yang selalu memilih untuk terus berjalan bersama.",
  images: {
    hero: img("hero"),
    heroWide: img("hero-wide"),
    couple: img("couple"),
    venue: img("venue"),
    closing: img("closing"),
    seal: "/img/andi-rina/seal.webp",
    grain: "/img/andi-rina/grain.webp",
    qris: "/img/andi-rina/qris.png",
    og: "/img/andi-rina/og.jpg",
  },
  music: "/img/andi-rina/music.mp3",
  story: [
    {
      title: "Pertama Bertemu",
      date: "12.03.2021",
      image: img("story-1"),
      short: "Dua arah, satu penyeberangan, dan satu senyum yang kebetulan.",
      long: "Sore itu kami menyeberang jalan yang sama dari arah berlawanan. Andi menjatuhkan buku, Rina memungutnya. Obrolan singkat di trotoar ternyata berlanjut sampai lampu jalan menyala.",
    },
    {
      title: "Tumbuh Bersama",
      date: "20.08.2022",
      image: img("story-2"),
      short: "Dari teman duduk di pinggir jalan, jadi tempat pulang.",
      long: "Kami mulai menghabiskan sore di tempat yang sama, duduk di depan tembok oranye dekat kantor Rina. Tidak banyak rencana, hanya banyak cerita. Pelan-pelan, pulang berarti bertemu satu sama lain.",
    },
    {
      title: "Lamaran",
      date: "14.07.2025",
      image: img("story-3"),
      video: { src: "/img/andi-rina/rings.mp4", poster: "/img/andi-rina/rings-poster.jpg" },
      short: "Satu pertanyaan, dua cincin, dan jawaban yang sudah lama kami tahu.",
      long: "Di depan kedua keluarga, Andi akhirnya bertanya. Rina menjawab sebelum pertanyaannya selesai. Cincinnya sempat jatuh, tapi semua orang pura-pura tidak melihat.",
    },
    {
      title: "Hari Pernikahan",
      date: "12.12.2026",
      image: img("story-4"),
      short: "Bukan akhir cerita, tapi awal perjalanan yang lebih panjang.",
      long: "Sepatu sudah disiapkan, bunga sudah dipilih. Yang kurang hanya kehadiran kalian, orang-orang yang membuat cerita ini jadi mungkin.",
    },
  ],
  polaroids: [
    { src: "/img/andi-rina/polaroid-1.jpg", caption: "sore pertama", rotate: -4 },
    { src: "/img/andi-rina/polaroid-2.jpg", caption: "setelah hujan", rotate: 3 },
    { src: "/img/andi-rina/polaroid-3.jpg", caption: "jalan pulang", rotate: -2 },
  ],
  gallery: [
    { src: img("g-1"), w: 1000, h: 666, alt: "Andi dan Rina duduk di depan tembok oranye" },
    { src: img("g-3"), w: 900, h: 1350, alt: "Tangan bercincin di balik kaca berembun" },
    { src: img("g-2"), w: 1400, h: 933, alt: "Andi dan Rina menyeberang jalan" },
    { src: img("g-5"), w: 1000, h: 994, alt: "Andi dan Rina menatap cahaya sore" },
    { src: img("g-7"), w: 900, h: 873, alt: "Sepatu pengantin dan buket bunga" },
    { src: img("g-8"), w: 900, h: 878, alt: "Langkah kaki di aspal saat senja" },
  ],
  gifts: [
    { bank: "Bank Contoh", number: "0000 1111 2222", holder: "Andi Pratama" },
    { bank: "Bank Contoh", number: "3333 4444 5555", holder: "Rina Maharani" },
  ],
  sampleWishes: [
    { name: "Mbak Dewi", message: "Akhirnya! Semoga jadi keluarga yang sakinah, mawaddah, warahmah. Jangan lupa undang kami ke rumah baru." },
    { name: "Raka", message: "Stay weird together. Selamat, kalian berdua." },
    { name: "Tim Kantor Rina", message: "Selamat menempuh hidup baru. Kami siap jadi saksi drama cuti bersama." },
    { name: "Om Hendra", message: "Semoga langgeng sampai kakek nenek. Doa kami menyertai." },
  ],
} as const;

export type Invitation = typeof invitation;
