// Peta taman pernikahan di tebing pantai. Gambarnya lukisan pixel art satu lembar (pantai-map.webp, 1024 x 1536),
// jadi semua titik di bawah diukur dari gambar itu dalam piksel gambar. Buka undangan dengan ?gdebug untuk melihat
// lantai (biru), rintangan (merah), dan jangkauan tiap pos (kuning) saat menyetel ulang angka-angkanya.
export const MAP = { w: 1024, h: 1536, src: "/img/dimas-salsa/pantai-map.webp" };

// Lantai yang boleh dilalui: rumput di dalam pagar, celah gerbang, dan jalan batu di luar pagar sampai tepi bawah.
// Gazebo, hutan di kiri, tebing di kanan, dan pagar di atas berada di luar garis ini.
export const WALK: [number, number][][] = [
  [
    [330, 220], [790, 220], [805, 500], [840, 630], [960, 640], [1005, 800], [1010, 1140], [930, 1160], [920, 1320],
    [650, 1320], [615, 1345], [615, 1530], [445, 1530], [445, 1345], [410, 1320], [70, 1320], [60, 1150], [55, 880],
    [55, 520], [90, 390],
  ],
];

// Rintangan [x0, y0, x1, y1], meliputi kaki dan badan bawah tiap benda.
export const BLOCKS: number[][] = [
  // Lengkung bunga dan panggung batunya.
  [440, 215, 650, 300],
  // Kursi tamu akad, tiang bunga di sisi lorong, dan kuda-kuda foto mempelai.
  [325, 315, 455, 488], [632, 315, 762, 488],
  [470, 320, 500, 350], [470, 400, 500, 445], [592, 320, 622, 350], [592, 400, 622, 445],
  [462, 495, 522, 530], [565, 495, 622, 530],
  // Gazebo.
  [95, 290, 340, 382],
  // Tiang lampu, speaker, dan panggung pergola.
  [298, 600, 316, 645], [768, 600, 786, 645],
  [328, 670, 388, 708], [692, 670, 752, 708],
  [412, 600, 672, 745],
  // Tenda dessert dan papan di depannya.
  [55, 690, 292, 795], [270, 820, 362, 858],
  // Photo booth, kamera, dan tiang tali polaroid.
  [780, 730, 965, 800], [855, 790, 895, 815], [795, 880, 815, 918], [980, 880, 1000, 918],
  // Meja bundar dan meja panjang.
  [272, 905, 445, 1008], [268, 1035, 448, 1135], [636, 900, 795, 1005], [636, 1035, 803, 1138],
  [58, 900, 238, 1135], [826, 900, 1008, 1135],
  // Lentera di kanan kiri jalan batu.
  [455, 935, 492, 975], [585, 935, 625, 975], [455, 1050, 492, 1092], [585, 1050, 625, 1092], [452, 1170, 492, 1212], [588, 1170, 628, 1212],
  // Papan di kiri bawah, meja buku tamu, dan kotak amplop.
  [180, 1240, 272, 1292], [298, 1230, 388, 1278],
  [678, 1215, 815, 1272], [832, 1215, 910, 1278],
  // Tiang gerbang dan lentera di sampingnya.
  [405, 1300, 450, 1430], [612, 1300, 655, 1430], [370, 1380, 430, 1430], [648, 1380, 710, 1430],
];

// Pos: obj titik benda yang didekati kamera, stand titik berdiri tamu di depannya.
export const SPOTS = {
  pembuka: { obj: { x: 530, y: 1300 }, stand: { x: 530, y: 1380 } },
  rsvp: { obj: { x: 745, y: 1250 }, stand: { x: 650, y: 1245 } },
  angpao: { obj: { x: 870, y: 1255 }, stand: { x: 870, y: 1152 } },
  slot1: { obj: { x: 342, y: 1275 }, stand: { x: 342, y: 1306 } },
  slot2: { obj: { x: 315, y: 855 }, stand: { x: 315, y: 882 } },
  galeri: { obj: { x: 870, y: 770 }, stand: { x: 830, y: 838 } },
  pasca: { obj: { x: 895, y: 900 }, stand: { x: 900, y: 862 } },
  acara: { obj: { x: 545, y: 690 }, stand: { x: 545, y: 785 } },
  cerita: { obj: { x: 215, y: 330 }, stand: { x: 215, y: 420 } },
  mempelai: { obj: { x: 545, y: 515 }, stand: { x: 545, y: 556 } },
  pelaminan: { obj: { x: 545, y: 262 }, stand: { x: 545, y: 335 } },
} as const;
export type SpotId = keyof typeof SPOTS;

// Tamu muncul di jalan batu di luar gerbang.
export const SPAWN = { x: 530, y: 1495 };

// Pengantin berdiri di panggung batu di bawah lengkung bunga: titik kaki dan ukuran tampil.
export const COUPLE = { x: 545, y: 284, w: 108, h: 74 };
