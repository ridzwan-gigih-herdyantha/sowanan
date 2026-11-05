import { hallAt } from "./interior-world";
import type { Point } from "./world";

// Tamu lain di aula supaya suasananya hidup. Tiap lembar sprite orang yang berbeda: anak-anak, kakek berkacamata,
// ibu bersanggul, tamu berhijab, bapak berpeci, dan seterusnya. Ada yang berjalan bolak-balik, ada yang
// berdiri mengobrol dengan gelembung percakapan bergantian. Semua tamu bisa ditembus pemain.
export type Npc = {
  id: string;
  sheet: NpcSheet;
  // Titik-titik yang dilalui berulang. Satu titik berarti diam di tempat.
  path: Point[];
  // Arah hadap saat diam: 0 bawah, 1 samping, 2 atas. flip menghadap ke kiri.
  face?: 0 | 1 | 2;
  flip?: boolean;
  // Kelompok obrolan dan kalimatnya. Anggota satu kelompok bicara bergantian.
  chat?: string;
  lines?: string[];
};

const sheet = (name: string) => `/img/rafi-kayla/npc-${name}.png`;
export const NPC_SHEETS = { pria: sheet("pria"), hijau: sheet("pria-hijau"), bapak: sheet("bapak"), kakek: sheet("kakek"), anak: sheet("anak"), foto: sheet("foto"), pelayan: sheet("pelayan"), wanita: sheet("wanita"), gadis: sheet("gadis"), ibu: sheet("ibu"), kebaya: sheet("kebaya") };
export type NpcSheet = keyof typeof NPC_SHEETS;

export const NPC_SPEED = 55;
// Lama berhenti di tiap titik jalan, dalam detik.
export const NPC_PAUSE = 1.6;

export const NPCS: Npc[] = [
  // Berjalan pelan di karpet merah, dari dekat pintu ke tangga pelaminan dan kembali.
  { id: "w1", sheet: "kebaya", path: [hallAt(150, 12), hallAt(1180, 12)] },
  // Anak yang berlarian kecil di lantai kanan bawah, dan ibunya yang berjalan di sisi kiri.
  { id: "w2", sheet: "anak", path: [hallAt(130, 250), hallAt(1160, 250)] },
  { id: "w3", sheet: "ibu", path: [hallAt(450, -252), hallAt(1040, -252)] },
  // Pelayan mondar-mandir di depan meja prasmanan, fotografer memotret ke arah sudut foto.
  { id: "w4", sheet: "pelayan", path: [hallAt(1060, -278), hallAt(1210, -278)] },
  { id: "f1", sheet: "foto", path: [hallAt(214, 214)], face: 1, chat: "f", lines: ["Senyum dulu, ya!", "Satu, dua, tiga...", "Bagus, sekali lagi."] },
  // Dua tamu mengobrol di lantai kanan.
  { id: "a1", sheet: "gadis", path: [hallAt(745, 250)], face: 1, chat: "a", lines: ["Dekorasinya cantik ya!", "Sudah foto di galeri?", "Pengantinnya serasi sekali."] },
  { id: "a2", sheet: "pria", path: [hallAt(797, 250)], face: 1, flip: true, chat: "a", lines: ["Iya, hangat sekali suasananya.", "Nanti, habis ini.", "Betul, ikut bahagia."] },
  // Dua tamu mengobrol dekat pintu masuk.
  { id: "b1", sheet: "bapak", path: [hallAt(150, -280)], face: 1, chat: "b", lines: ["Sudah isi buku tamu?", "Ayo ke pelaminan!", "Jangan lupa amplopnya."] },
  { id: "b2", sheet: "wanita", path: [hallAt(202, -280)], face: 1, flip: true, chat: "b", lines: ["Sudah, barusan.", "Yuk, foto bareng.", "Aman, sudah siap."] },
  // Melihat-lihat dinding foto dari tepi karpet.
  { id: "v1", sheet: "kakek", path: [hallAt(745, -100)], face: 1, flip: true, chat: "v", lines: ["Fotonya bagus-bagus...", "Ini waktu lamaran ya?"] },
  // Berdiri sendiri di samping panggung.
  { id: "v2", sheet: "hijau", path: [hallAt(1208, -236)], face: 0 },
];

export type NpcState = { p: Point; next: number; wait: number; walked: number };

export const npcStart = (n: Npc): NpcState => ({ p: { ...n.path[0] }, next: n.path.length > 1 ? 1 : 0, wait: 0, walked: 0 });

// Satu langkah gerak tamu yang berjalan. Mengembalikan arah gerak (dx, dy) atau null bila sedang diam.
export function stepNpc(n: Npc, s: NpcState, dt: number): Point | null {
  if (n.path.length < 2) return null;
  if (s.wait > 0) {
    s.wait -= dt;
    return null;
  }
  const to = n.path[s.next];
  const dx = to.x - s.p.x;
  const dy = to.y - s.p.y;
  const d = Math.hypot(dx, dy);
  const step = NPC_SPEED * dt;
  if (d <= step) {
    s.p = { ...to };
    s.next = (s.next + 1) % n.path.length;
    s.wait = NPC_PAUSE;
    return null;
  }
  s.p.x += (dx / d) * step;
  s.p.y += (dy / d) * step;
  return { x: dx, y: dy };
}
