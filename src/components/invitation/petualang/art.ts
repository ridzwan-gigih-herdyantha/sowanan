// Aset piksel dunia game Co-op Adventure: karakter dengan bingkai animasi, ubin tanah, peti, dan hiasan latar.
// Karakter ditulis tangan, satu huruf satu piksel. Pohon, semak, awan, dan gapura dibentuk dari gabungan
// lingkaran dengan bayangan dari kiri atas dan tepi bergaris, jadi detailnya konsisten tanpa digambar satu per satu.

export type Art = readonly string[];
export type Palette = Record<string, string>;

// Angka acak tetap dari posisi, jadi hasilnya sama di server dan di peramban.
const hash = (x: number, y: number, s = 0) => {
  const n = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
  return n - Math.floor(n);
};

// Kepala dan kerah mempelai pria, sama di semua bingkai. Menghadap kanan.
const GROOM_HEAD = [
  "....oooooo......",
  "...oHHHHHHoo....",
  "..oHHhhHHHHHo...",
  "..oHhHHHHHHHHo..",
  "..oHHHHHHHHHHo..",
  "..oHHHHSSSSSSo..",
  "..oHHHSSSSESSo..",
  "..oHHsSSSSESSo..",
  "..oHHsSSSSSSSSo.",
  "...oHSSSSSRSSo..",
  "....oSSSSSSSo...",
  ".....ossSSoo....",
  "....oCCCTCo.....",
];

// Badan dan kaki dibuat tebal, dengan sol sepatu di baris terbawah supaya kaki menapak tanah.
export const GROOM_IDLE: Art = [
  ...GROOM_HEAD,
  "...oKKCTCKKo....",
  "..oKKjCTCKKKo...",
  ".oKKjKKTKKKKKo..",
  ".oKjKKKTKKKKKo..",
  ".oKKoKKKKKKoKKo.",
  ".oSSoKKKKKKoSSo.",
  "..oo.okKKKko.oo.",
  "....oPPPoPPPo...",
  "....oPPPoPPPo...",
  "...oBBBBoBBBBo..",
  "...oooooooooo...",
];

export const GROOM_RUN_A: Art = [
  ...GROOM_HEAD,
  "...oKKCTCKKo....",
  "..oKKjCTCKKKo...",
  ".oKKjKKTKKKKKo..",
  "oSoKKKKTKKKKoSo.",
  "...oKKKKKKKKo...",
  "...okKKKKKKko...",
  "...oPPPooPPPo...",
  "..oPPPo..oPPPo..",
  ".oPPPo....oPPPo.",
  "oBBBo.....oBBBBo",
  "ooooo.....oooooo",
];

export const GROOM_RUN_B: Art = [
  ...GROOM_HEAD,
  "...oKKCTCKKo....",
  "..oKKjCTCKKKo...",
  ".oKKjKKTKKKKKo..",
  "..oKjKKTKKKKKo..",
  "..oKKSKKKKKKo...",
  "...okKKKKKKko...",
  "....oPPPPPPo....",
  "....oPPPoPPPo...",
  "...oBBBoPPPo....",
  "...ooooBBBBo....",
  ".......ooooo....",
];

export const GROOM_RUN_C: Art = [
  ...GROOM_HEAD,
  "...oKKCTCKKo....",
  "..oKKjCTCKKKo...",
  ".oKKjKKTKKKKKo..",
  "oSoKKKKTKKKKoSo.",
  "...oKKKKKKKKo...",
  "...okKKKKKKko...",
  "...oPPPPPPPo....",
  "..oPPPooPPPPo...",
  ".oPPPo..oBBBBo..",
  "oBBBo...oooooo..",
  "ooooo...........",
];

export const GROOM_JUMP: Art = [
  ...GROOM_HEAD.slice(0, 12),
  "....oCCCTCooSo..",
  "...oKKCTCKKoKo..",
  "..oKKjCTCKKoKo..",
  ".oKKjKKTKKKKKo..",
  "oSoKjKKTKKKKo...",
  ".o.oKKKKKKKKo...",
  "...okKKKKKKko...",
  "...oPPPPoPPPPo..",
  "..oPPPo..oPPPo..",
  ".oBBBo....oBBBBo",
  ".oooo.....ooooo.",
  "................",
];

// Mempelai wanita menghadap kiri, menunggu di gapura dengan buket bunga dan kerudung panjang.
export const BRIDE_IDLE: Art = [
  "......oooooo....",
  ".....oHHHHHHo...",
  "....oHHHHhhHHo..",
  "...oHHHHHHHHFo..",
  "..oSSSSHHHHHHVo.",
  "..oSSSSSSHHHHVo.",
  "..oSESSSSHHHHVVo",
  "..oSESSSSsHHHVVo",
  ".oSSSSSSSsHHHVVo",
  "..oSSRSSSSHHVVVo",
  "...oSSSSSSoHVVVo",
  "....ooSSoo.oVVVo",
  "....oDDDDDo.oVVo",
  "...oDDDDDDDo.oVo",
  "..oSFFDDDDDDo.Vo",
  "..oFGFFDDDDDDoVo",
  "...oGGDDDDDDDovo",
  "...oDDDDDDDDDo..",
  "..oDDDDDDDDDDDo.",
  "..oDdDDDDDdDDDo.",
  ".oDDDDdDDDDDDDDo",
  ".oDdDDDDDdDDDDDo",
  "oDDDDDDdDDDDDDdo",
  "oooooooooooooooo",
];

// Dua bingkai langkah: ujung gaun bergeser ke kiri dan ke kanan, sol tetap di baris terbawah.
export const BRIDE_STEP_A: Art = [...BRIDE_IDLE.slice(0, 21), "oDDDDDDdDDDDDDo.", "ooooooooooooooo."];
export const BRIDE_STEP_B: Art = [...BRIDE_IDLE.slice(0, 21), ".oDDDDDdDDDDDDdo", "..oooooooooooooo"];

export const BRIDE_WAVE: Art = [
  ...BRIDE_IDLE.slice(0, 12),
  "..ooDDDDDo.oVVo.",
  ".oSoDDDDDDo.oVo.",
  ".oSFDDDDDDDo.Vo.",
  "..oFGFDDDDDDoVo.",
  "...oGGDDDDDDDovo",
  ...BRIDE_IDLE.slice(17),
];

export const CHARACTER_COLORS: Palette = {
  o: "#1E1830",
  B: "#3A2418",
  H: "#2E2019",
  h: "#4A3528",
  S: "#F2C49B",
  s: "#D49A72",
  E: "#1E1830",
  R: "#EE8E7A",
  C: "#F4F1EA",
  T: "var(--inv-accent)",
  K: "#2F3E66",
  k: "#222D4D",
  j: "#44578A",
  P: "#2A2F45",
  V: "#FFFFFF",
  v: "#E2DDF0",
  D: "#FFF9F0",
  d: "#E8DAC6",
  F: "#F48FB1",
  G: "#5DA352",
};

// Ubin tanah: rumput di atas, tanah berbatu di bawahnya.
export const GRASS_TILE: Art = [
  "LLGLLGGLLGLLGGLL",
  "GLGGGLGGGGLGGLGG",
  "GGgGGGGgGGGGgGGG",
  "gGgggGggGgGggGgg",
  "dgDgdDgdDgDdgDdg",
  "DDDDdDDDDDDDdDDD",
  "DDsSDDDDDdDDDDDD",
  "DDSSDDDDDDDDsSDD",
  "DDDDDDdDDDDDSSDD",
  "DdDDDDDDDDDDDDDD",
  "DDDDDDDDsSDDDDdD",
  "DDDDdDDDSSDDDDDD",
  "DDDDDDDDDDDDDDDD",
  "DsSDDDDDDDDdDDDD",
  "DSSDDDDdDDDDDDDD",
  "DDDDDDDDDDDDDDDD",
];

export const DIRT_TILE: Art = [
  "DDDDDDDDDDdDDDDD",
  "DDsSDDDDDDDDDDDD",
  "DDSSDDDDDDDDDsSD",
  "DDDDDDdDDDDDDSSD",
  "DdDDDDDDDDDDDDDD",
  "DDDDDDDDDsSDDDDD",
  "DDDDDdDDDSSDDDdD",
  "DDDDDDDDDDDDDDDD",
  "DsSDDDDDDDDDdDDD",
  "DSSDDDDdDDDDDDDD",
  "DDDDDDDDDDDDDDDD",
  "DDDdDDDDDDsSDDDD",
  "DDDDDDDDDDSSDDDD",
  "DDDDDDDDDDDDDDdD",
  "DdDDDDsSDDDDDDDD",
  "DDDDDDSSDDDDDDDD",
];

export const GROUND_COLORS: Palette = { L: "#9BE06A", G: "#6CC04A", g: "#4C9A3D", D: "#A86F45", d: "#7E4F30", s: "#C9A27E", S: "#8E6B4E" };

export const CRATE: Art = [
  "oooooooooooooooo",
  "oLLLLLLLLLLLLLLo",
  "oLnnnnnnnnnnnnNo",
  "oLnLNNNNNNNNLnNo",
  "oLnNLNNNNNNLNnNo",
  "oLnNNLNNNNLNNnNo",
  "oLnNNNLNNLNNNnNo",
  "oLnNNNNLLNNNNnNo",
  "oLnNNNNLLNNNNnNo",
  "oLnNNNLNNLNNNnNo",
  "oLnNNLNNNNLNNnNo",
  "oLnNLNNNNNNLNnNo",
  "oLnLNNNNNNNNLnNo",
  "oLnnnnnnnnnnnnNo",
  "oNNNNNNNNNNNNNNo",
  "oooooooooooooooo",
];
export const CRATE_COLORS: Palette = { o: "#3B2414", L: "#E0A866", N: "#B9773F", n: "#8A5328" };

// Balok batu untuk tangga di ujung level: sisi atas dan kiri terang, sisi bawah dan kanan gelap.
export const STONE: Art = (() => {
  const rows: string[] = [];
  for (let y = 0; y < 16; y++) {
    let row = "";
    for (let x = 0; x < 16; x++) {
      if (x === 0 || y === 0 || x === 15 || y === 15) row += "o";
      else if (y === 1 || x === 1) row += "h";
      else if (y === 14 || x === 14) row += "d";
      else row += hash(x, y, 9) > 0.86 ? "d" : hash(x, y, 2) > 0.9 ? "h" : "b";
    }
    rows.push(row);
  }
  return rows;
})();
export const STONE_COLORS: Palette = { o: "#3A3550", h: "#D9D4E6", b: "#ABA4C0", d: "#7F7896" };

// Bata merah untuk lantai dua dan anak tangga melayang. Polanya menyambung bila dipasang berderet.
export const BRICK: Art = Array.from({ length: 16 }, (_, y) =>
  Array.from({ length: 16 }, (_, x) => {
    const row = y % 8;
    if (row === 7) return "m";
    if ((x + (Math.floor(y / 8) % 2) * 4) % 8 === 7) return "m";
    return row === 0 ? "h" : row === 6 ? "b" : "B";
  }).join(""),
);
export const BRICK_COLORS: Palette = { m: "#3B1F14", h: "#E8935F", B: "#C2603A", b: "#8E3E22" };

export const COIN: Art = ["...oooo...", "..oYYYYo..", ".oYWWYYyo.", "oYWYYYYyyo", "oYWYyyYYyo", "oYWYyyYYyo", "oYYYYYYyyo", "oYYYYYYyyo", ".oYYYYyyo.", "..oyyyyo..", "...oooo..."];
export const COIN_COLORS: Palette = { o: "#6B4210", Y: "#F6C945", y: "#D69A23", W: "#FFF3B0" };

// Bendera checkpoint. Kainnya putih sebelum dilewati dan berganti warna aksen sesudahnya.
export const FLAG: Art = [
  "..oo..........",
  ".oYYo.........",
  ".oYyo.........",
  "..oo..........",
  "..WooooooooO..",
  "..WoFFFFFFFFo.",
  "..WoFFFFFFFFFo",
  "..WoFFFFFFFFo.",
  "..WoFFFFFFFo..",
  "..WoooooooO...",
  ...Array.from({ length: 34 }, () => "..Wo.........."),
  ".oooo.........",
  "oNNNNo........",
  "oooooo........",
];
export const FLAG_COLORS: Palette = { o: "#1E1830", O: "#1E1830", Y: "#F6C945", y: "#D69A23", W: "#E8E8F0", F: "var(--pt-flag, #FFFFFF)", N: "#8A5328" };

export const SUN: Art = [
  "......YYYY......",
  "....YYYYYYYY....",
  "...YYWWYYYYYY...",
  "..YYWWYYYYYYYY..",
  ".YYWYYYYYYYYYYY.",
  ".YYYYYYYYYYYYYY.",
  "YYYYYYYYYYYYYYYY",
  "YYYYYYYYYYYYYYYy",
  "YYYYYYYYYYYYYYYy",
  "YYYYYYYYYYYYYYyy",
  ".YYYYYYYYYYYyyy.",
  ".YYYYYYYYYYYyyy.",
  "..YYYYYYYYyyyy..",
  "...YYYYyyyyyy...",
  "....Yyyyyyyy....",
  "......yyyy......",
];

// Bentuk dari gabungan lingkaran. o tepi, d bayangan, b warna dasar, h sorot cahaya dari kiri atas.
// Bayangan dan dasar bercampur pola selang-seling di batasnya, seperti dithering di game lama.
export function blob(w: number, h: number, circles: [number, number, number][]): Art {
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && circles.some(([cx, cy, r]) => (x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r);
  const rows: string[] = [];
  for (let y = 0; y < h; y++) {
    let row = "";
    for (let x = 0; x < w; x++) {
      if (!inside(x, y)) {
        row += ".";
        continue;
      }
      if (!inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1)) {
        row += "o";
        continue;
      }
      let light = -1;
      for (const [cx, cy, r] of circles) {
        if ((x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 > r * r) continue;
        light = Math.max(light, -((x + 0.5 - cx) * 0.6 + (y + 0.5 - cy) * 0.9) / r);
      }
      row += light > 0.42 ? "h" : light < -0.38 ? "d" : light < -0.12 ? ((x + y) % 2 ? "d" : "b") : "b";
    }
    rows.push(row);
  }
  return rows;
}

export const TREE_COLORS: Palette = { o: "#24452A", d: "#3A7A2E", b: "#4E9A3D", h: "#7CC65A", N: "#8A5A36", n: "#6A4227", O: "#3B2414" };
export const TREE: Art = (() => {
  const top = blob(24, 20, [
    [8, 11, 7.5],
    [16, 11, 7.5],
    [12, 7, 7.5],
    [12, 13, 7],
  ]);
  const trunk = Array.from({ length: 10 }, (_, i) => (i === 9 ? "........OONNnOO........." : "..........ONnO.........."));
  return [...top, ...trunk];
})();

export const BUSH: Art = blob(22, 11, [
  [5, 8, 5.5],
  [11, 6, 6.5],
  [17, 8, 5],
]);

export const CLOUD: Art = blob(34, 14, [
  [8, 9, 6],
  [16, 7, 7],
  [25, 9, 6],
  [12, 10, 5],
  [21, 10, 5],
]);
export const CLOUD_COLORS: Palette = { o: "#DCE6F4", d: "#E6EEF8", b: "#FFFFFF", h: "#FFFFFF" };

// Istana di ujung level: dinding bata, dua menara beratap runcing dengan bendera, bangunan tengah dengan jalan di
// atasnya tempat kedua mempelai muncul di akhir, jendela, dan pintu lengkung. Ukuran 96 x 112 piksel gambar,
// sama dengan 6 x 7 ubin.
export const CASTLE_W = 6;
// Tinggi jalan di atas bangunan tengah dari tanah, dalam ubin.
export const CASTLE_TOP = 4.9;
export const CASTLE: Art = (() => {
  const w = 96;
  const h = 112;
  const grid: string[][] = Array.from({ length: h }, () => Array(w).fill("."));
  const put = (x0: number, y0: number, x1: number, y1: number, c: (x: number, y: number) => string) => {
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (x >= 0 && y >= 0 && x < w && y < h) grid[y][x] = c(x, y);
  };
  const brick = (x: number, y: number) => (y % 5 === 4 ? "m" : (x + (Math.floor(y / 5) % 2) * 4) % 8 === 0 ? "m" : x % 9 === 3 && y % 5 === 1 ? "h" : "b");
  // Gigi benteng selebar 4 berjarak 2, diatur di tengah supaya kedua ujungnya sama.
  const battlement = (x0: number, x1: number, y: number) => {
    const count = Math.floor((x1 - x0 + 2) / 6);
    const start = x0 + Math.floor((x1 - x0 - (count * 6 - 2)) / 2);
    for (let k = 0; k < count; k++) put(start + k * 6, y, start + k * 6 + 4, y + 6, brick);
  };
  // Dinding depan.
  put(10, 64, 86, 112, brick);
  battlement(10, 86, 58);
  // Bangunan tengah dengan jalan di atasnya.
  put(32, 34, 64, 64, brick);
  battlement(32, 64, 28);
  // Menara kiri dan kanan dengan atap runcing dan bendera.
  for (const tx of [0, 70]) {
    put(tx, 40, tx + 26, 112, brick);
    for (let y = 6; y < 40; y++) {
      const half = Math.round(((y - 6) / 34) * 14);
      put(tx + 13 - half, y, tx + 13 + half, y + 1, (x) => (x < tx + 13 ? "R" : "r"));
    }
    put(tx + 12, 0, tx + 13, 8, () => "p");
    put(tx + 13, 0, tx + 20, 4, () => "F");
    put(tx + 10, 50, tx + 16, 62, () => "k");
  }
  // Jendela bangunan tengah.
  put(38, 42, 44, 52, () => "k");
  put(52, 42, 58, 52, () => "k");
  // Pintu lengkung.
  for (let y = 80; y < 112; y++) {
    const inset = y < 88 ? 88 - y : 0;
    put(38 + inset, y, 58 - inset, y + 1, (x) => (x === 48 ? "n" : "N"));
  }
  // Tepi bergaris di setiap batas dengan ruang kosong.
  return grid.map((row, y) =>
    row
      .map((c, x) => {
        if (c === "." || c === "F" || c === "p") return c;
        const edge = [grid[y - 1]?.[x], grid[y + 1]?.[x], row[x - 1], row[x + 1]].some((n) => n === undefined || n === ".");
        return edge ? "o" : c;
      })
      .join(""),
  );
})();
export const CASTLE_COLORS: Palette = { o: "#3A3550", b: "#C9C3DA", m: "#9C95B4", h: "#E4E0EE", R: "#E05A5A", r: "#B03E46", k: "#2B2640", N: "#8A5328", n: "#5E3519", p: "#5E3519", F: "#F48FB1" };

const FLOWERS = ["F", "W", "Y"];
// Gapura bunga di garis akhir: lengkung daun dengan bunga berselang, berdiri di dua tiang.
export const ARCH: Art = (() => {
  const w = 48;
  const h = 60;
  const cx = 24;
  const cy = 24;
  const R = 22;
  const leaf = (x: number, y: number) => {
    const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
    if (y < cy) return d <= R && d >= R - 6;
    return (x >= 2 && x <= 7) || (x >= 40 && x <= 45);
  };
  const rows: string[] = [];
  for (let y = 0; y < h; y++) {
    let row = "";
    for (let x = 0; x < w; x++) {
      if (!leaf(x, y)) {
        row += ".";
        continue;
      }
      if (!leaf(x - 1, y) || !leaf(x + 1, y) || !leaf(x, y - 1) || (y + 1 < h && !leaf(x, y + 1))) {
        row += "o";
        continue;
      }
      const r = hash(x, y, 3);
      row += r > 0.82 ? FLOWERS[Math.floor(hash(y, x, 5) * 3)] : r > 0.5 ? "g" : r > 0.2 ? "G" : "L";
    }
    rows.push(row);
  }
  return rows;
})();
export const ARCH_COLORS: Palette = { o: "#24452A", g: "#3A7A2E", G: "#4E9A3D", L: "#7CC65A", F: "#F48FB1", W: "#FFFFFF", Y: "#F6C945" };

// Baris piksel yang warnanya sama dan bersebelahan digabung menjadi satu kotak.
export function runs(rows: Art) {
  const out: { x: number; y: number; w: number; c: string }[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      let w = 1;
      while (row[x + w] === c) w++;
      if (c !== ".") out.push({ x, y, w, c });
      x += w;
    }
  });
  return out;
}

const cache = new Map<string, string>();
// Gambar sebagai data URI SVG, dipakai untuk aset yang berulang supaya tidak menambah elemen di halaman.
// Warnanya harus nilai jadi, karena variabel CSS tidak terbaca di dalam gambar.
export function artUri(rows: Art, colors: Palette) {
  const key = rows.join("|") + JSON.stringify(colors);
  const hit = cache.get(key);
  if (hit) return hit;
  const w = Math.max(...rows.map((r) => r.length));
  const rects = runs(rows)
    .map((r) => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="1" fill="${colors[r.c] ?? r.c}"/>`)
    .join("");
  const uri = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${rows.length}" width="${w}" height="${rows.length}" shape-rendering="crispEdges">${rects}</svg>`)}")`;
  cache.set(key, uri);
  return uri;
}

export const artSize = (rows: Art) => ({ w: Math.max(...rows.map((r) => r.length)), h: rows.length });
