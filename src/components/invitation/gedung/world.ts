// Dunia cover: koordinat dalam piksel peta (1672 x 941), jadi tetap pas di ukuran layar apa pun. Gambarnya town.png,
// digambar scripts/isometrik-assets.ts dengan geometri yang sama. l sejajar jalan menuju pintu, s melintang jalan.
export const MAP_W = 1672;
export const MAP_H = 941;

export type Point = { x: number; y: number };
export type Area = [number, number][];

const TOWN = { x0: 480, y0: 740, gateL: 270, doorL: 520 };
export const townAt = (l: number, s: number, z = 0): Point => ({ x: TOWN.x0 + l + s, y: TOWN.y0 + (s - l) / 2 - z });
const rect = (l0: number, l1: number, s0: number, s1: number): Area => [townAt(l0, s0), townAt(l1, s0), townAt(l1, s1), townAt(l0, s1)].map((p) => [p.x, p.y]);

// Titik muncul di halaman dan titik tujuan tepat di depan tangga pintu gedung. Tombol masuk muncul bila karakter
// berada dalam NEAR_RADIUS dari titik tujuan.
export const SPAWN: Point = townAt(40, 0);
export const DOOR_TARGET: Point = townAt(474, 0);
export const NEAR_RADIUS = 80;
// Titik tengah daun pintu dan muka balok gapura, dalam piksel peta.
export const DOOR_AT: Point = townAt(TOWN.doorL, 0, 66);
export const SIGN_AT: Point = townAt(TOWN.gateL - 14, 0, 153);

// Area yang boleh dilalui: halaman paving, jalan di antara dua tiang gapura sampai depan pintu, dan pelataran di depan
// pilar kanopi. Di antara pilar hanya bagian tengah, jadi pilar tidak bisa ditembus.
const AREAS: Area[] = [rect(-100, 250, -245, 245), rect(240, 490, -62, 62), rect(440, 452, -100, 100)];
export function inside(p: Point, poly: [number, number][]) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > p.y !== yj > p.y && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

// Arah yang dicoba berurutan saat terhalang: lurus, lalu membelok makin tajam ke dua sisi supaya karakter
// meluncur di sepanjang dinding (gapura, semak) dan tidak macet di sudut.
const SLIDES = [0.4, -0.4, 0.8, -0.8, 1.2, -1.2];
// Ukuran kisi pencarian jalan, dalam piksel peta.
const CELL = 14;

// Dunia berisi himpunan area yang boleh dilalui. bodyR adalah setengah lebar badan karakter: titik di kiri dan
// kanan kakinya juga harus berada di area. holes adalah rintangan di dalam area, misalnya kios.
export function makeWorld(areas: Area[], bodyR = 11, holes: Area[] = []) {
  const bounded = (list: Area[]) =>
    list.map((poly) => {
      const xs = poly.map(([x]) => x);
      const ys = poly.map(([, y]) => y);
      return { poly, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
    });
  const areaBoxes = bounded(areas);
  const holeBoxes = bounded(holes);
  // Kotak pembatas diperiksa dulu, karena pencarian jalan memanggil ini ribuan kali.
  const hit = (p: Point, b: (typeof areaBoxes)[number]) => p.x >= b.x0 && p.x <= b.x1 && p.y >= b.y0 && p.y <= b.y1 && inside(p, b.poly);
  const walkable = (p: Point) => areaBoxes.some((b) => hit(p, b)) && !holeBoxes.some((b) => hit(p, b));
  const canStand = (p: Point) => walkable(p) && walkable({ x: p.x - bodyR, y: p.y }) && walkable({ x: p.x + bodyR, y: p.y });

  // Menggeser p sejauh (dx, dy) dalam langkah kecil supaya tidak melompati rintangan tipis. Mengembalikan true
  // bila bergerak.
  function move(p: Point, dx: number, dy: number) {
    const len = Math.hypot(dx, dy);
    if (!len) return false;
    const n = Math.ceil(len / 3);
    const base = Math.atan2(dy, dx);
    const step = len / n;
    let moved = false;
    for (let i = 0; i < n; i++) {
      let ok = false;
      // Dinding peta sejajar sumbu isometrik: lurus dulu, lalu meluncur sepanjang sumbu yang paling searah.
      const sx = (dx / len) * step;
      const sy = (dy / len) * step;
      // Sumbu l dan s tidak tegak lurus di layar, jadi gerak diuraikan di koordinat dunia, bukan dengan proyeksi layar.
      const glide = [
        { x: 1, y: -0.5, d: (sx - 2 * sy) / 2 },
        { x: 1, y: 0.5, d: (sx + 2 * sy) / 2 },
      ]
        .sort((a, b) => Math.abs(b.d) - Math.abs(a.d))
        .map((a) => {
          const k = (Math.sign(a.d) * step) / Math.hypot(a.x, a.y);
          return { x: a.x * k, y: a.y * k, d: Math.abs(a.d) };
        });
      if (canStand({ x: p.x + sx, y: p.y + sy })) {
        p.x += sx;
        p.y += sy;
        moved = true;
        continue;
      }
      for (const g of glide) {
        if (g.d < step * 0.05 || !canStand({ x: p.x + g.x, y: p.y + g.y })) continue;
        p.x += g.x;
        p.y += g.y;
        ok = moved = true;
        break;
      }
      if (ok) continue;
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
  function reachable(from: Point, to: Point): Point {
    if (canStand(to)) return to;
    for (let t = 0.02; t <= 1; t += 0.02) {
      const p = { x: to.x + (from.x - to.x) * t, y: to.y + (from.y - to.y) * t };
      if (canStand(p)) return p;
    }
    return from;
  }

  // Rute berjalan ke titik tujuan, memutari rintangan bila garis lurusnya terhalang: A* di kisi peta, lalu titik yang bisa
  // ditarik lurus dibuang. Kisi menjauhi tepi rintangan sedikit, supaya karakter tidak berjalan menempel.
  const xs = areas.flat().map(([x]) => x);
  const ys = areas.flat().map(([, y]) => y);
  const [gridX, gridY] = [Math.min(...xs), Math.min(...ys)];
  const cols = Math.ceil((Math.max(...xs) - gridX) / CELL) + 1;
  const rows = Math.ceil((Math.max(...ys) - gridY) / CELL) + 1;
  const known = new Int8Array(cols * rows);
  const cellAt = (i: number): Point => ({ x: gridX + (i % cols) * CELL, y: gridY + Math.floor(i / cols) * CELL });
  const cellFree = (i: number) => {
    if (!known[i]) {
      const p = cellAt(i);
      known[i] = canStand(p) && canStand({ x: p.x, y: p.y - 6 }) && canStand({ x: p.x, y: p.y + 6 }) ? 1 : 2;
    }
    return known[i] === 1;
  };
  const clear = (a: Point, b: Point) => {
    const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 5);
    for (let k = 1; k <= n; k++) if (!canStand({ x: a.x + ((b.x - a.x) * k) / n, y: a.y + ((b.y - a.y) * k) / n })) return false;
    return true;
  };

  function route(from: Point, to: Point): Point[] {
    const goal = reachable(from, to);
    if (clear(from, goal)) return [goal];
    const total = cols * rows;
    const cost = new Float32Array(total).fill(Infinity);
    const came = new Int32Array(total).fill(-1);
    const done = new Uint8Array(total);
    const heap: [number, number][] = [];
    const push = (f: number, i: number) => {
      heap.push([f, i]);
      for (let k = heap.length - 1; k > 0; ) {
        const up = (k - 1) >> 1;
        if (heap[up][0] <= heap[k][0]) break;
        [heap[up], heap[k]] = [heap[k], heap[up]];
        k = up;
      }
    };
    const pop = () => {
      const top = heap[0];
      const last = heap.pop() as [number, number];
      if (heap.length) {
        heap[0] = last;
        for (let k = 0; ; ) {
          const [a, b] = [k * 2 + 1, k * 2 + 2];
          let m = k;
          if (a < heap.length && heap[a][0] < heap[m][0]) m = a;
          if (b < heap.length && heap[b][0] < heap[m][0]) m = b;
          if (m === k) break;
          [heap[m], heap[k]] = [heap[k], heap[m]];
          k = m;
        }
      }
      return top;
    };
    const guess = (p: Point) => Math.hypot(goal.x - p.x, goal.y - p.y);
    // Masuk ke kisi lewat sel di sekitar karakter yang bisa dicapai lurus.
    const near = (p: Point, each: (i: number) => void) => {
      const cx = Math.round((p.x - gridX) / CELL);
      const cy = Math.round((p.y - gridY) / CELL);
      for (let dy = -3; dy <= 3; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          const [x, y] = [cx + dx, cy + dy];
          if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
          const i = y * cols + x;
          if (cellFree(i) && clear(p, cellAt(i))) each(i);
        }
      }
    };
    near(from, (i) => {
      const p = cellAt(i);
      cost[i] = Math.hypot(p.x - from.x, p.y - from.y);
      push(cost[i] + guess(p), i);
    });
    const ends = new Set<number>();
    near(goal, (i) => ends.add(i));
    let end = -1;
    while (heap.length) {
      const [, i] = pop();
      if (done[i]) continue;
      done[i] = 1;
      if (ends.has(i)) {
        end = i;
        break;
      }
      const [x, y] = [i % cols, Math.floor(i / cols)];
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const [nx, ny] = [x + dx, y + dy];
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
          const n = ny * cols + nx;
          if (done[n] || !cellFree(n)) continue;
          // Diagonal tidak boleh memotong sudut rintangan.
          if (dx && dy && (!cellFree(y * cols + nx) || !cellFree(ny * cols + x))) continue;
          const next = cost[i] + (dx && dy ? CELL * Math.SQRT2 : CELL);
          if (next >= cost[n]) continue;
          cost[n] = next;
          came[n] = i;
          push(next + guess(cellAt(n)), n);
        }
      }
    }
    // Tidak ada rute: berjalan lurus sejauh mungkin, seperti ketukan biasa.
    if (end < 0) return [goal];
    const cells: Point[] = [goal];
    for (let i = end; i >= 0; i = came[i]) cells.unshift(cellAt(i));
    cells.unshift(from);
    const out: Point[] = [];
    for (let a = 0; a < cells.length - 1; ) {
      let b = a + 1;
      while (b + 1 < cells.length && clear(cells[a], cells[b + 1])) b++;
      out.push(cells[b]);
      a = b;
    }
    return out;
  }

  return { walkable, canStand, move, reachable, route };
}

// Kecepatan jalan dalam piksel gambar per detik.
export const SPEED = 300;

// Tiang janur di kanan kiri gerbang.
const HOLES: Area[] = [rect(236, 256, 140, 160), rect(236, 256, -160, -140)];
const cover = makeWorld(AREAS, 11, HOLES);
export const { walkable, canStand, move, reachable, route } = cover;

// Karakter yang sudah melewati garis gapura berada di belakangnya, jadi tiang dan baloknya harus menutupi dia.
export const behindArch = (p: Point) => (p.x - TOWN.x0 - 2 * (p.y - TOWN.y0)) / 2 > TOWN.gateL;
