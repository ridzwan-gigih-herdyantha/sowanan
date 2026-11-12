// Peta taman pernikahan di tebing pantai. Gambarnya lukisan pixel art satu lembar (pantai-map.webp, 1024 x 1536),
// jadi semua titik di bawah diukur dari gambar itu dalam piksel gambar. Buka undangan dengan ?gdebug untuk melihat
// lantai (biru), rintangan (merah), kotak benda terpisah (ungu), dan jangkauan tiap pos (kuning).
export const MAP = { w: 1024, h: 1536, src: "/img/dimas-salsa/pantai-map.webp" };

// Lantai yang boleh dilalui: rumput di dalam pagar, celah gerbang, dan jalan batu di luar pagar sampai tepi bawah.
// Gazebo, hutan di kiri, tebing di kanan, dan pagar di atas berada di luar garis ini.
export const WALK: [number, number][][] = [
  [
    [335, 215], [800, 215], [830, 330], [875, 470], [880, 770], [960, 790], [965, 1150], [935, 1175], [935, 1295],
    [660, 1295], [640, 1345], [640, 1530], [430, 1530], [430, 1345], [405, 1295], [190, 1295], [190, 1170], [60, 1150],
    [55, 560], [130, 530], [130, 400],
  ],
];

// Rintangan tetap [x0, y0, x1, y1], meliputi kaki dan badan bawah benda yang ada di lukisan peta.
export const BLOCKS: number[][] = [
  // Lengkung bunga dan panggung batunya.
  [440, 200, 640, 300],
  // Kursi tamu akad, tiang bunga di sisi lorong, dan kuda-kuda foto mempelai.
  [330, 320, 458, 498], [627, 320, 755, 498],
  [465, 330, 503, 390], [465, 410, 503, 472], [592, 330, 630, 390], [592, 410, 630, 472],
  [470, 500, 532, 550], [562, 500, 624, 550],
  // Gazebo.
  [95, 280, 345, 388],
  // Tiang lampu, speaker, dan panggung pergola.
  [298, 610, 318, 668], [772, 610, 792, 668],
  [340, 675, 392, 718], [696, 675, 750, 718],
  [405, 610, 680, 748],
  // Tenda dessert.
  [60, 700, 290, 828],
  // Meja bundar.
  [278, 900, 442, 1005], [272, 1015, 448, 1138], [636, 900, 798, 1005], [636, 1015, 806, 1138],
  // Lentera di kanan kiri jalan batu.
  [455, 940, 497, 988], [583, 940, 625, 988], [455, 1055, 497, 1103], [583, 1055, 625, 1103], [453, 1170, 497, 1218], [585, 1170, 628, 1218],
  // Tiang gerbang dan lentera di sampingnya.
  [405, 1300, 445, 1430], [628, 1300, 665, 1430], [372, 1380, 428, 1440], [652, 1380, 708, 1440],
];

// Pos: obj titik benda (tengah bawah), stand titik berdiri tamu di depannya, tag tinggi label nama pos.
export const SPOTS = {
  pembuka: { obj: { x: 535, y: 1300 }, stand: { x: 535, y: 1380 }, tag: 1250 },
  pelaminan: { obj: { x: 540, y: 262 }, stand: { x: 543, y: 335 }, tag: 112 },
  mempelai: { obj: { x: 548, y: 548 }, stand: { x: 548, y: 568 }, tag: 455 },
  cerita: { obj: { x: 218, y: 330 }, stand: { x: 222, y: 425 }, tag: 112 },
  acara: { obj: { x: 543, y: 690 }, stand: { x: 553, y: 795 }, tag: 556 },
  galeri: { obj: { x: 835, y: 860 }, stand: { x: 835, y: 892 }, tag: 712 },
  pasca: { obj: { x: 300, y: 1240 }, stand: { x: 300, y: 1274 }, tag: 1150 },
  rsvp: { obj: { x: 755, y: 1245 }, stand: { x: 650, y: 1240 }, tag: 1150 },
  angpao: { obj: { x: 880, y: 1250 }, stand: { x: 880, y: 1160 }, tag: 1188 },
  // Papan bagian tambahan, di bekas tempat meja panjang: kiri atas, kanan atas, kiri bawah, kanan bawah.
  slot1: { obj: { x: 150, y: 975 }, stand: { x: 235, y: 950 }, tag: 852 },
  slot2: { obj: { x: 900, y: 975 }, stand: { x: 820, y: 950 }, tag: 852 },
  slot3: { obj: { x: 150, y: 1125 }, stand: { x: 235, y: 1100 }, tag: 1002 },
  slot4: { obj: { x: 900, y: 1125 }, stand: { x: 820, y: 1100 }, tag: 1002 },
} as const;
export type SpotId = keyof typeof SPOTS;

const PAPAN = "/img/dimas-salsa/pantai-papan.png";

// Benda yang hanya tampil bila sectionnya dipakai, digambar dari berkas terpisah berlatar transparan dan diurutkan
// bersama karakter menurut kakinya. w dan h ukuran tampil dalam piksel peta, kakinya di obj pos tersebut. block
// rintangan relatif terhadap kaki: [kiri, atas, kanan, bawah]. src kosong berarti gambarnya belum ada: posnya
// tetap jalan, hanya bendanya belum tampil.
export type Piece = { w: number; h: number; block: number[]; src?: string };
export const PIECES: Partial<Record<SpotId, Piece>> = {
  galeri: { w: 196, h: 133, block: [-90, -40, 90, 0], src: "/img/dimas-salsa/pantai-galeri.png" },
  pasca: { w: 210, h: 73, block: [-100, -12, 100, 0], src: "/img/dimas-salsa/pantai-pasca.png" },
  rsvp: { w: 150, h: 104, block: [-72, -45, 72, 0], src: "/img/dimas-salsa/pantai-rsvp.png" },
  angpao: { w: 72, h: 96, block: [-34, -40, 34, 0], src: "/img/dimas-salsa/pantai-angpao.png" },
  slot1: { w: 80, h: 114, block: [-34, -20, 34, 0], src: PAPAN },
  slot2: { w: 80, h: 114, block: [-34, -20, 34, 0], src: PAPAN },
  slot3: { w: 80, h: 114, block: [-34, -20, 34, 0], src: PAPAN },
  slot4: { w: 80, h: 114, block: [-34, -20, 34, 0], src: PAPAN },
};

// Tamu muncul di jalan batu di luar gerbang.
export const SPAWN = { x: 535, y: 1495 };

// Pengantin berdiri di panggung batu di bawah lengkung bunga: titik kaki dan ukuran tampil.
export const COUPLE = { x: 540, y: 300, w: 108, h: 74 };
