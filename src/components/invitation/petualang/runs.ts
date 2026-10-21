// Baris piksel yang warnanya sama dan bersebelahan digabung menjadi satu kotak.
export function runs(rows: readonly string[]) {
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

// Kotak-kotak yang warnanya sama digabung menjadi satu path. Satu sprite cukup beberapa elemen, bukan ratusan, jadi
// hitung ulang gaya dan gambar ulang tiap frame jauh lebih ringan.
export function shapes(rows: readonly string[]) {
  const byColor = new Map<string, string>();
  for (const r of runs(rows)) byColor.set(r.c, `${byColor.get(r.c) ?? ""}M${r.x} ${r.y}h${r.w}v1h-${r.w}z`);
  return [...byColor].map(([c, d]) => ({ c, d }));
}
