// Dunia cover: koordinat dalam piksel gambar peta (1672 x 941), jadi tetap pas di ukuran layar apa pun.
export const MAP_W = 1672;
export const MAP_H = 941;

export type Point = { x: number; y: number };

// Titik muncul di parkiran dan titik tujuan di ujung karpet merah, tepat di depan pintu gedung. Tombol masuk
// muncul bila karakter berada dalam NEAR_RADIUS dari titik tujuan.
export const SPAWN: Point = { x: 680, y: 680 };
export const DOOR_TARGET: Point = { x: 985, y: 492 };
export const NEAR_RADIUS = 80;

// Area yang boleh dilalui, digambar mengikuti peta: aspal parkiran (di luar pohon dan tiang lampu), lantai di
// antara dua tiang gapura sampai karpet, dan lorong paving di antara bedeng bunga dan semak di sebelah kanan.
// Tiang kanan gapura, tiang lampu, dan spanduknya (blok x 898-1002, y 548-655) serta semua yang di luar area ini dianggap rintangan.
const AREAS: [number, number][][] = [
  [[230, 705], [300, 642], [487, 545], [500, 535], [610, 578], [700, 622], [790, 672], [867, 714], [960, 765], [1067, 832], [1170, 900], [570, 900], [548, 830], [485, 790], [410, 778], [330, 790], [255, 765]],
  [[790, 712], [790, 615], [790, 560], [795, 527], [840, 507], [900, 495], [960, 482], [1020, 484], [1042, 505], [1100, 562], [1210, 615], [1290, 656], [1303, 672], [1250, 684], [1200, 693], [1150, 674], [1100, 656], [1050, 638], [1002, 622], [1002, 548], [898, 548], [898, 655], [888, 690], [886, 722], [850, 738]],
  [[756, 644], [792, 626], [815, 640], [815, 700], [780, 690], [756, 664]],
];

function inside(p: Point, poly: [number, number][]) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > p.y !== yj > p.y && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

export const walkable = (p: Point) => AREAS.some((a) => inside(p, a));

// Badan karakter selebar dua kali BODY_R, jadi titik di kiri dan kanan kakinya juga harus berada di area.
const BODY_R = 11;
export const canStand = (p: Point) => walkable(p) && walkable({ x: p.x - BODY_R, y: p.y }) && walkable({ x: p.x + BODY_R, y: p.y });

// Kecepatan jalan dalam piksel gambar per detik.
export const SPEED = 300;

// Arah yang dicoba berurutan saat terhalang: lurus, lalu membelok makin tajam ke dua sisi supaya karakter
// meluncur di sepanjang dinding (gapura, semak) dan tidak macet di sudut.
const SLIDES = [0, 0.4, -0.4, 0.8, -0.8, 1.2, -1.2, Math.PI / 2, -Math.PI / 2];

// Menggeser p sejauh (dx, dy) dalam langkah kecil supaya tidak melompati rintangan tipis. Mengembalikan true
// bila bergerak.
export function move(p: Point, dx: number, dy: number) {
  const len = Math.hypot(dx, dy);
  if (!len) return false;
  const n = Math.ceil(len / 3);
  const base = Math.atan2(dy, dx);
  const step = len / n;
  let moved = false;
  for (let i = 0; i < n; i++) {
    let ok = false;
    for (const turn of SLIDES) {
      const a = base + turn;
      const next = { x: p.x + Math.cos(a) * step * Math.cos(turn), y: p.y + Math.sin(a) * step * Math.cos(turn) };
      if (!canStand(next)) continue;
      p.x = next.x;
      p.y = next.y;
      ok = moved = true;
      break;
    }
    if (!ok) break;
  }
  return moved;
}

// Titik tujuan yang bisa dicapai: kalau yang diketuk rintangan, ambil titik berjalan terdekat di garis dari
// karakter ke titik itu.
export function reachable(from: Point, to: Point): Point {
  if (canStand(to)) return to;
  for (let t = 0.02; t <= 1; t += 0.02) {
    const p = { x: to.x + (from.x - to.x) * t, y: to.y + (from.y - to.y) * t };
    if (canStand(p)) return p;
  }
  return from;
}

// Garis dasar gapura: menghubungkan tengah alas dua tiangnya. Karakter yang kakinya di atas garis ini berada di
// belakang bidang gapura, jadi balok dan papannya harus menutupi dia. Di bawah garis dia berada di depan gapura.
const ARCH_BASE = { x: 768, y: 625, slope: 0.48 };
export const behindArch = (p: Point) => p.y < ARCH_BASE.y + ARCH_BASE.slope * (p.x - ARCH_BASE.x);

// Siluet balok gapura (termasuk daun merambat di atasnya) dalam piksel gambar. Salinan peta yang dipotong
// sepanjang garis ini dipasang di atas karakter ketika dia berada di belakang gapura.
export const ARCH_BEAM: [number, number][] = [[738, 405], [775, 418], [815, 430], [865, 455], [915, 480], [950, 494], [961, 510], [961, 543], [940, 543], [925, 540], [905, 530], [865, 510], [830, 493], [795, 475], [765, 458], [738, 444]];
