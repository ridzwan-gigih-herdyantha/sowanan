// Fase bulan dari tanggal. Cukup teliti untuk undangan: meleset paling jauh beberapa jam dari tabel astronomi.
const SYNODIC = 29.530588853;
// Bulan baru acuan, 6 Januari 2000 pukul 18.14 UTC, dalam hari sejak epoch.
const NEW_MOON = Date.UTC(2000, 0, 6, 18, 14) / 864e5;

// 0 bulan baru, 0,5 purnama, kembali ke 1 di bulan baru berikutnya.
export function moonAge(at: Date | number): number {
  const days = (typeof at === "number" ? at : at.getTime()) / 864e5 - NEW_MOON;
  return (((days % SYNODIC) + SYNODIC) % SYNODIC) / SYNODIC;
}

export const illumination = (age: number) => (1 - Math.cos(2 * Math.PI * age)) / 2;

const NAMES: [number, string][] = [
  [0.034, "Bulan baru"],
  [0.216, "Bulan sabit muda"],
  [0.284, "Bulan separuh awal"],
  [0.466, "Bulan cembung"],
  [0.534, "Purnama"],
  [0.716, "Bulan cembung"],
  [0.784, "Bulan separuh akhir"],
  [0.966, "Bulan sabit tua"],
  [1, "Bulan baru"],
];

export const phaseName = (age: number) => NAMES.find(([end]) => age < end)![1];

export function moonOf(at: Date | number) {
  const age = moonAge(at);
  const lit = illumination(age);
  return { age, lit, percent: Math.round(lit * 100), name: phaseName(age) };
}

// Bagian bulan yang terang sebagai path SVG pada lingkaran berjari-jari r di titik (0, 0).
// Terang mulai dari kanan saat membesar dan tersisa di kiri saat mengecil, seperti dilihat dari belahan utara.
export function litPath(age: number, r: number): string {
  const a = ((age % 1) + 1) % 1;
  if (a < 0.0005 || a > 0.9995) return "";
  const rx = Math.abs(Math.cos(2 * Math.PI * a)) * r;
  const waxing = a < 0.5;
  const crescent = a < 0.25 || a > 0.75;
  const f = (n: number) => n.toFixed(2);
  // Busur tepi di sisi terang, lalu garis batas terang gelap berbentuk setengah elips kembali ke atas.
  const edge = `M0 ${f(-r)}A${f(r)} ${f(r)} 0 0 ${waxing ? 1 : 0} 0 ${f(r)}`;
  const sweep = waxing === crescent ? 0 : 1;
  return `${edge}A${f(rx)} ${f(r)} 0 0 ${sweep} 0 ${f(-r)}Z`;
}

// "09.11.2019" atau "9/11/2019" menjadi tanggal. Tanggal cerita boleh teks bebas, jadi yang tidak terbaca diabaikan.
export function parseDay(text: string): Date | null {
  const m = /(\d{1,2})[./-](\d{1,2})[./-](\d{4})/.exec(text);
  if (!m) return null;
  const [day, month, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return new Date(Date.UTC(year, month - 1, day, 13));
}
