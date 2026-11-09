// Penghindar rintangan untuk peta yang bisa dijelajahi (gedung, piksel). Lantai dibagi jadi grid kasar, rute dicari
// dengan A* lalu diluruskan, jadi karakter berbelok seperlunya saja di sudut rintangan.
type Point = { x: number; y: number };

// Sisi sel grid. Harus lebih kecil dari rintangan tertipis supaya tidak ada rintangan yang lolos di antara dua titik sel.
const CELL = 12;
// Jarak antartitik saat memeriksa garis lurus, sama rapat dengan langkah move supaya garis yang bebas benar-benar bisa dilalui.
const RAY = 3;
const OPEN = 1;
const RIGHT = 2;
const DOWN = 4;
// Sejauh ini ke depan jalan diperiksa saat tombol atau joystick ditekan, jadi karakter sudah berbelok sebelum menabrak.
const LOOK = 36;
// Sejauh ini titik bebas di balik rintangan dicari. Cukup untuk melintasi kios terlebar dari sisi mana pun.
const REACH = 300;
// Rute memutar yang lebih panjang dari ini tidak diambil: karakter tidak boleh tiba-tiba berlari jauh dari arah yang
// ditekan, misalnya saat tamu mendorong dinding luar yang di baliknya kebetulan ada lantai lain.
const DETOUR = 380;
// Kosinus sudut antara arah tekan sekarang dan arah saat rute memutar dibuat. Selama masih di atas ini (sekitar 50
// derajat) rutenya diteruskan, supaya goyangan kecil joystick tidak mengganti sisi memutar di tengah jalan.
const KEEP = 0.64;
// Jumlah frame menunggu sebelum mencari rute lagi setelah gagal, supaya A* tidak berjalan tiap frame saat mendorong dinding.
const RETRY = 15;

// Rute memutar yang sedang dijalani saat tombol atau joystick ditekan.
export type Dodge = { path: Point[]; dir: Point; at: Point | null; wait: number };
export const newDodge = (): Dodge => ({ path: [], dir: { x: 0, y: 0 }, at: null, wait: 0 });

// Antrean prioritas f terkecil untuk A*.
function makeHeap() {
  const fs: number[] = [];
  const ids: number[] = [];
  const swap = (a: number, b: number) => {
    [fs[a], fs[b]] = [fs[b], fs[a]];
    [ids[a], ids[b]] = [ids[b], ids[a]];
  };
  return {
    size: () => ids.length,
    push(f: number, id: number) {
      fs.push(f);
      ids.push(id);
      for (let i = ids.length - 1; i > 0; ) {
        const up = (i - 1) >> 1;
        if (fs[up] <= fs[i]) break;
        swap(up, i);
        i = up;
      }
    },
    pop() {
      const top = ids[0];
      const f = fs.pop()!;
      const id = ids.pop()!;
      if (ids.length) {
        fs[0] = f;
        ids[0] = id;
        for (let i = 0; ; ) {
          const l = 2 * i + 1;
          const r = l + 1;
          let m = i;
          if (l < ids.length && fs[l] < fs[m]) m = l;
          if (r < ids.length && fs[r] < fs[m]) m = r;
          if (m === i) break;
          swap(m, i);
          i = m;
        }
      }
      return top;
    },
  };
}

const NEIGHBORS = [
  [1, 0, 1],
  [-1, 0, 1],
  [0, 1, 1],
  [0, -1, 1],
  [1, 1, Math.SQRT2],
  [1, -1, Math.SQRT2],
  [-1, 1, Math.SQRT2],
  [-1, -1, Math.SQRT2],
];

// canStand memeriksa apakah karakter muat berdiri di suatu titik, move menggeser karakter dan meluncur di dinding.
// areas hanya dipakai untuk menentukan luas grid.
export function makePathing(canStand: (p: Point) => boolean, move: (p: Point, dx: number, dy: number) => boolean, areas: [number, number][][]) {
  const pts = areas.flat();
  const x0 = Math.min(...pts.map((a) => a[0]));
  const y0 = Math.min(...pts.map((a) => a[1]));
  const cols = Math.ceil((Math.max(...pts.map((a) => a[0])) - x0) / CELL) + 1;
  const rows = Math.ceil((Math.max(...pts.map((a) => a[1])) - y0) / CELL) + 1;
  const total = cols * rows;
  const centre = (i: number): Point => ({ x: x0 + (i % cols) * CELL, y: y0 + Math.floor(i / cols) * CELL });

  function clear(a: Point, b: Point) {
    const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / RAY);
    for (let i = 1; i <= n; i++) if (!canStand({ x: a.x + ((b.x - a.x) * i) / n, y: a.y + ((b.y - a.y) * i) / n })) return false;
    return true;
  }

  // Tiap sel menyimpan OPEN, ditambah RIGHT dan DOWN bila jalan lurus ke sel kanan dan bawahnya bebas. Memeriksa tengah
  // sel saja belum cukup: baris grid yang menyerempet tepi miring punya tengah sel bebas tapi terhalang di antaranya.
  // Grid dihitung sekali, biasanya sudah siap di waktu senggang browser supaya tidak ada patah sesaat di rintangan pertama.
  let cached: Uint8Array | null = null;
  function grid() {
    if (cached) return cached;
    const g = new Uint8Array(total);
    for (let i = 0; i < total; i++) g[i] = canStand(centre(i)) ? OPEN : 0;
    for (let i = 0; i < total; i++) {
      if (!g[i]) continue;
      if ((i + 1) % cols && g[i + 1] && clear(centre(i), centre(i + 1))) g[i] |= RIGHT;
      if (i + cols < total && g[i + cols] && clear(centre(i), centre(i + cols))) g[i] |= DOWN;
    }
    cached = g;
    return g;
  }
  if (typeof requestIdleCallback === "function") requestIdleCallback(() => grid());
  // Apakah dua sel bersebelahan tersambung.
  const linked = (g: Uint8Array, a: number, b: number) => (g[Math.min(a, b)] & (Math.abs(a - b) === 1 ? RIGHT : DOWN)) !== 0;

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

  // Sel terbuka terdekat yang bisa dicapai lurus dari p. Karakter yang menempel dinding sering tepat di sel tertutup.
  function snap(p: Point) {
    const open = grid();
    const cx = Math.round((p.x - x0) / CELL);
    const cy = Math.round((p.y - y0) / CELL);
    let best = -1;
    let bestD = Infinity;
    for (let y = cy - 3; y <= cy + 3; y++) {
      for (let x = cx - 3; x <= cx + 3; x++) {
        if (x < 0 || y < 0 || x >= cols || y >= rows || !open[y * cols + x]) continue;
        const c = centre(y * cols + x);
        const d = Math.hypot(c.x - p.x, c.y - p.y);
        if (d < bestD && clear(p, c)) {
          best = y * cols + x;
          bestD = d;
        }
      }
    }
    return best;
  }

  function search(start: number, goal: number): number[] | null {
    const open = grid();
    const gx = goal % cols;
    const gy = Math.floor(goal / cols);
    const cost = new Float32Array(total).fill(Infinity);
    const prev = new Int32Array(total).fill(-1);
    const done = new Uint8Array(total);
    const heap = makeHeap();
    cost[start] = 0;
    heap.push(0, start);
    while (heap.size()) {
      const i = heap.pop();
      if (done[i]) continue;
      done[i] = 1;
      if (i === goal) {
        const cells: number[] = [];
        for (let c = goal; c !== -1; c = prev[c]) cells.push(c);
        return cells.reverse();
      }
      const x = i % cols;
      const y = Math.floor(i / cols);
      for (const [dx, dy, step] of NEIGHBORS) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        const n = ny * cols + nx;
        if (done[n] || !open[n]) continue;
        if (dx && dy) {
          // Gerak diagonal tidak boleh memotong sudut rintangan: kedua jalan siku-sikunya harus bebas.
          const a = y * cols + nx;
          const b = ny * cols + x;
          if (!linked(open, i, a) || !linked(open, a, n) || !linked(open, i, b) || !linked(open, b, n)) continue;
        } else if (!linked(open, i, n)) continue;
        const g = cost[i] + step;
        if (g >= cost[n]) continue;
        cost[n] = g;
        prev[n] = i;
        const hx = Math.abs(nx - gx);
        const hy = Math.abs(ny - gy);
        heap.push(g + Math.max(hx, hy) + (Math.SQRT2 - 1) * Math.min(hx, hy), n);
      }
    }
    return null;
  }

  // Titik jalan dari from ke end (from tidak ikut), atau null bila memang tidak tersambung.
  function find(from: Point, end: Point): Point[] | null {
    if (clear(from, end)) return [end];
    const s = snap(from);
    const e = snap(end);
    if (s < 0 || e < 0) return null;
    const cells = search(s, e);
    if (!cells) return null;
    const line = [from, ...cells.map(centre), end];
    // Meluruskan rute: lompat ke titik terjauh yang masih terlihat lurus dari titik terakhir.
    const out: Point[] = [];
    let a = from;
    for (let i = 1; i < line.length; i++) {
      if (clear(a, line[i])) continue;
      a = line[i - 1];
      out.push(a);
    }
    out.push(end);
    return out;
  }

  // Menggerakkan p sejauh dist menyusuri path, titik yang tercapai dibuang. Tiap ruas rute sudah terbukti lurus dan
  // bebas, jadi karakter harus tepat melewati titik beloknya: memotong sedikit saja bisa menabrak sudut rintangan.
  // Mengembalikan arah gerak terakhir, atau null bila tidak bergerak.
  function walk(path: Point[], p: Point, dist: number): Point | null {
    let dir: Point | null = null;
    let retried = false;
    for (let left = dist; left > 0 && path.length; ) {
      const dx = path[0].x - p.x;
      const dy = path[0].y - p.y;
      const d = Math.hypot(dx, dy);
      if (d > 0) {
        const s = Math.min(d, left);
        const u = { x: dx / d, y: dy / d };
        if (!move(p, u.x * s, u.y * s)) {
          // Tersangkut di tepi yang bergerigi: cari rute baru dari posisi sekarang, paling banyak sekali per frame.
          const end = path[path.length - 1];
          const again = retried || !canStand(end) ? null : find(p, end);
          if (!again) break;
          retried = true;
          path.splice(0, path.length, ...again);
          continue;
        }
        dir = u;
        left -= s;
        if (s < d) break;
      }
      path.shift();
    }
    return dir;
  }

  // Rute untuk ketukan peta. Selalu berisi minimal titik akhirnya; kalau tidak tersambung, karakter berjalan lurus
  // dan meluncur di dinding seperti biasa.
  const route = (from: Point, to: Point): Point[] => {
    const end = reachable(from, to);
    return find(from, end) ?? [end];
  };

  // Titik bebas pertama di balik rintangan, searah (ux, uy).
  function beyond(p: Point, ux: number, uy: number): Point | null {
    let blocked = false;
    for (let d = RAY; d <= REACH; d += RAY) {
      const q = { x: p.x + ux * d, y: p.y + uy * d };
      if (!canStand(q)) blocked = true;
      else if (blocked) return q;
    }
    return null;
  }

  // Rute satu frame untuk tombol dan joystick, dijalankan dengan walk. Bila ada rintangan di depan, karakter
  // memutarinya menuju titik di baliknya, lalu lanjut lurus. Bila di balik rintangan tidak ada lantai (dinding luar),
  // karakter maju lurus dan meluncur di dinding seperti biasa. Panggil dengan (0, 0) saat tidak ditekan, untuk
  // melupakan rutenya.
  function steer(s: Dodge, p: Point, vx: number, vy: number, step: number): Point[] {
    const len = Math.hypot(vx, vy);
    if (!len) {
      s.path = [];
      s.wait = 0;
      return [];
    }
    const u = { x: vx / len, y: vy / len };
    const same = u.x * s.dir.x + u.y * s.dir.y > KEEP;
    const straight = [{ x: p.x + u.x * step, y: p.y + u.y * step }];
    if (s.path.length) {
      const stuck = s.at !== null && s.at.x === p.x && s.at.y === p.y;
      if (same && !stuck) {
        s.at = { x: p.x, y: p.y };
        return s.path;
      }
      s.path = [];
      if (stuck) s.wait = RETRY;
    }
    if (s.wait > 0 && same) {
      s.wait--;
      return straight;
    }
    s.wait = 0;
    if (clear(p, { x: p.x + u.x * LOOK, y: p.y + u.y * LOOK })) return straight;
    s.dir = u;
    const q = beyond(p, u.x, u.y);
    const path = q && find(p, q);
    if (path) {
      let long = 0;
      let a = p;
      for (const b of path) {
        long += Math.hypot(b.x - a.x, b.y - a.y);
        a = b;
      }
      if (long <= DETOUR) {
        s.path = path;
        s.at = null;
        return path;
      }
    }
    s.wait = RETRY;
    return straight;
  }

  return { route, steer, walk };
}
