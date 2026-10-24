// Bagi isi ke baris sesedikit mungkin dengan jumlah rata, sisanya ke baris atas supaya tidak ada yang sendirian.
// Kapasitas 4: 5 jadi 3 + 2, 7 jadi 4 + 3. Kapasitas 3: 4 jadi 2 + 2, 8 jadi 3 + 3 + 2.
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
