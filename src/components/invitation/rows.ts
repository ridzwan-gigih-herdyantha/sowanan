// Bagi isi ke baris sesedikit mungkin dengan jumlah yang sama rata. Sisa pembagian masuk ke baris atas,
// jadi baris bawah tidak pernah lebih banyak dan tidak ada satu isi yang tertinggal sendiri.
// Contoh kapasitas 4: 5 isi jadi 3 + 2, 7 isi jadi 4 + 3. Kapasitas 3: 4 isi jadi 2 + 2, 8 isi jadi 3 + 3 + 2.
export function rows<T>(list: T[], cap: number): T[][] {
  if (!list.length) return [];
  const count = Math.ceil(list.length / cap);
  const base = Math.floor(list.length / count);
  const extra = list.length % count;
  const out: T[][] = [];
  let at = 0;
  for (let r = 0; r < count; r++) {
    const size = base + (r < extra ? 1 : 0);
    out.push(list.slice(at, at + size));
    at += size;
  }
  return out;
}
